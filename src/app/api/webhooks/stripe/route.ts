import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { StripeProvider } from '@/payment/stripe/provider';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import type { Stripe as StripeTypes } from 'stripe';
import type { SubscriptionWithPeriod, InvoiceWithSubscription } from '@/types/stripe-extended';
import type { PaymentStatus } from '@/payment/types';
import { ErrorLogger, logUtils } from '@/lib/logger/logger-utils';
import { createChildLogger } from '@/lib/logger/logger';
import { creditService } from '@/lib/credits';
import { paymentConfig } from '@/config/payment.config';

const webhookErrorLogger = new ErrorLogger('stripe-webhook');
const webhookLogger = createChildLogger('stripe-webhook');

const stripeProvider = new StripeProvider();

/**
 * Helper function to find payment plan by price ID
 */
function findPlanByPriceId(priceId: string) {
  return paymentConfig.plans.find(plan => 
    plan.stripePriceIds?.monthly === priceId || 
    plan.stripePriceIds?.yearly === priceId
  );
}

/**
 * Grant credits for subscription
 */
async function grantSubscriptionCredits(userId: string, priceId: string, subscriptionId: string, isYearly: boolean) {
  try {
    const plan = findPlanByPriceId(priceId);
    if (!plan?.credits) {
      webhookLogger.info({
        userId,
        priceId,
        planId: plan?.id,
        status: 'no_credits_config',
      }, `No credits configuration found for plan: ${plan?.id || 'unknown'}`);
      return;
    }

    // Calculate credits to grant
    const creditsToGrant = plan.credits.onSubscribe || 
      (isYearly ? plan.credits.yearly : plan.credits.monthly);

    if (!creditsToGrant || creditsToGrant <= 0) {
      webhookLogger.info({
        userId,
        priceId,
        planId: plan.id,
        isYearly,
        status: 'no_credits_to_grant',
      }, `No credits to grant for plan: ${plan.id}`);
      return;
    }

    // Grant credits
    await creditService.earnCredits({
      userId,
      amount: creditsToGrant,
      source: 'subscription',
      description: `${plan.name} subscription credits`,
      referenceId: subscriptionId,
      metadata: {
        planId: plan.id,
        priceId,
        isYearly,
        subscriptionId,
      },
    });

    webhookLogger.info({
      userId,
      priceId,
      planId: plan.id,
      creditsGranted: creditsToGrant,
      subscriptionId,
      status: 'credits_granted',
    }, `Granted ${creditsToGrant} credits to user ${userId} for ${plan.name} subscription`);
  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'grantSubscriptionCredits',
      userId,
      priceId,
      subscriptionId,
      isYearly,
    });
    // Don't throw error to avoid webhook failure
  }
}

/**
 * Grant monthly credits for recurring subscription payments
 */
async function grantMonthlyCredits(userId: string, priceId: string, subscriptionId: string, invoiceId: string) {
  try {
    const plan = findPlanByPriceId(priceId);
    if (!plan?.credits?.monthly) {
      webhookLogger.info({
        userId,
        priceId,
        planId: plan?.id,
        status: 'no_monthly_credits_config',
      }, `No monthly credits configuration found for plan: ${plan?.id || 'unknown'}`);
      return;
    }

    // Grant monthly credits
    await creditService.earnCredits({
      userId,
      amount: plan.credits.monthly,
      source: 'subscription',
      description: `Monthly ${plan.name} credits`,
      referenceId: `${subscriptionId}_${invoiceId}`,
      metadata: {
        planId: plan.id,
        priceId,
        subscriptionId,
        invoiceId,
        type: 'monthly_renewal',
      },
    });

    webhookLogger.info({
      userId,
      priceId,
      planId: plan.id,
      creditsGranted: plan.credits.monthly,
      subscriptionId,
      invoiceId,
      status: 'monthly_credits_granted',
    }, `Granted monthly ${plan.credits.monthly} credits to user ${userId} for ${plan.name} subscription`);
  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'grantMonthlyCredits',
      userId,
      priceId,
      subscriptionId,
      invoiceId,
    });
    // Don't throw error to avoid webhook failure
  }
}

/**
 * Handle plan upgrade and grant appropriate credits
 */
async function handlePlanUpgrade(userId: string, oldPriceId: string, newPriceId: string, subscriptionId: string) {
  try {
    const oldPlan = findPlanByPriceId(oldPriceId);
    const newPlan = findPlanByPriceId(newPriceId);

    if (!oldPlan || !newPlan) {
      webhookLogger.warn({
        userId,
        oldPriceId,
        newPriceId,
        subscriptionId,
      }, `Plan not found for upgrade: old=${oldPlan?.id}, new=${newPlan?.id}`);
      return;
    }

    // Check if this is actually an upgrade (higher tier)
    const planHierarchy = ['free', 'pro', 'enterprise'];
    const oldPlanIndex = planHierarchy.indexOf(oldPlan.id);
    const newPlanIndex = planHierarchy.indexOf(newPlan.id);

    if (newPlanIndex <= oldPlanIndex) {
      webhookLogger.info({
        userId,
        oldPlanId: oldPlan.id,
        newPlanId: newPlan.id,
        subscriptionId,
      }, `Not an upgrade: ${oldPlan.id} -> ${newPlan.id}`);
      return;
    }

    // Calculate credit difference for upgrade
    const isYearly = newPriceId === newPlan.stripePriceIds?.yearly;
    const oldCredits = isYearly ? (oldPlan.credits?.yearly || 0) : (oldPlan.credits?.monthly || 0);
    const newCredits = isYearly ? (newPlan.credits?.yearly || 0) : (newPlan.credits?.monthly || 0);
    const creditDifference = newCredits - oldCredits;

    if (creditDifference > 0) {
      // Grant upgrade bonus credits
      await creditService.earnCredits({
        userId,
        amount: creditDifference,
        source: 'subscription',
        description: `Upgrade bonus from ${oldPlan.name} to ${newPlan.name}`,
        referenceId: `upgrade_${subscriptionId}_${Date.now()}`,
        metadata: {
          oldPlanId: oldPlan.id,
          newPlanId: newPlan.id,
          subscriptionId,
          creditType: 'upgrade_bonus',
          interval: isYearly ? 'yearly' : 'monthly',
        },
      });

      webhookLogger.info({
        userId,
        oldPlanId: oldPlan.id,
        newPlanId: newPlan.id,
        subscriptionId,
        creditDifference,
      }, `Upgrade bonus credits granted: ${creditDifference} for ${oldPlan.name} -> ${newPlan.name}`);
    }

    // Grant immediate subscription credits for the new plan
    const immediateCredits = newPlan.credits?.onSubscribe || 0;
    if (immediateCredits > 0) {
      await creditService.earnCredits({
        userId,
        amount: immediateCredits,
        source: 'subscription',
        description: `Immediate credits for upgrading to ${newPlan.name}`,
        referenceId: `upgrade_immediate_${subscriptionId}_${Date.now()}`,
        metadata: {
          planId: newPlan.id,
          subscriptionId,
          creditType: 'upgrade_immediate',
        },
      });

      webhookLogger.info({
        userId,
        newPlanId: newPlan.id,
        subscriptionId,
        immediateCredits,
      }, `Immediate upgrade credits granted: ${immediateCredits} for ${newPlan.name}`);
    }
  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'handlePlanUpgrade',
      userId,
      oldPriceId,
      newPriceId,
      subscriptionId,
    });
    // Don't throw error to avoid webhook failure
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logUtils.logSecurityEvent('Missing stripe-signature header', 'high', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
      });
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // verify webhook signature
    const isValid = await stripeProvider.verifyWebhook(body, signature);
    if (!isValid) {
      logUtils.logSecurityEvent('Invalid webhook signature', 'critical', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        signature: `${signature.substring(0, 20)}...`,
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // construct event object
    const event = stripeProvider.constructWebhookEvent(body, signature);

    // check if the event has been processed (avoid duplicate processing)
    const isProcessed = await paymentRepository.isStripeEventProcessed(event.id);
    if (isProcessed) {
      webhookLogger.info({
        eventId: event.id,
        eventType: event.type,
        status: 'already_processed',
      }, `Event ${event.id} already processed`);
      return NextResponse.json({ received: true });
    }

    webhookLogger.info({
      eventId: event.id,
      eventType: event.type,
      status: 'processing',
    }, `Processing Stripe event: ${event.type}`);

    // handle different types of events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event);
        break;

      case 'payment_method.attached':
        // payment method attached event, usually no special processing is needed
        webhookLogger.info({
          eventId: event.id,
          eventType: event.type,
          paymentMethodId: event.data.object.id,
        }, `Payment method attached: ${event.data.object.id}`);
        break;

      default:
        webhookLogger.warn({
          eventId: event.id,
          eventType: event.type,
        }, `Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'webhook_handler',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(event: StripeTypes.Event) {
  const session = event.data.object as StripeTypes.Checkout.Session;
  
  try {
    webhookLogger.info({
      eventId: event.id,
      sessionId: session.id,
      mode: session.mode,
      customerId: session.customer,
      userId: session.metadata?.userId,
    }, `Checkout session completed: ${session.id}`);
    
    // if it's a subscription mode
    if (session.mode === 'subscription' && session.subscription) {
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
      const userId = session.metadata?.userId;
      
      if (!userId) {
        webhookErrorLogger.logError(new Error('No userId found in session metadata'), {
          operation: 'handleCheckoutSessionCompleted',
          sessionId: session.id,
          mode: session.mode,
          subscriptionId,
        });
        return;
      }

      // get Stripe subscription details
      const { stripe } = await import('@/payment/stripe/client');
      const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price']
      });
      
      // type assertion to extended type
      const subscription = subscriptionResponse as unknown as SubscriptionWithPeriod;
      
      // get price ID from subscription
      const subscriptionItem = subscription.items.data[0];
      if (!subscriptionItem) {
        webhookErrorLogger.logError(new Error('No subscription items found'), {
          operation: 'handleCheckoutSessionCompleted',
          sessionId: session.id,
          subscriptionId,
          userId,
        });
        return;
      }
      
      const priceId = subscriptionItem.price.id;
      const price = subscriptionItem.price;
      
      // check if the payment record already exists
      const existingRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
      if (existingRecord) {
        webhookLogger.info({
          eventId: event.id,
          sessionId: session.id,
          subscriptionId,
          userId,
          status: 'duplicate_record',
        }, `Payment record already exists for subscription: ${subscriptionId}`);
        return;
      }
      
      // create payment record
      await paymentRepository.create({
        id: subscriptionId,
        priceId: priceId,
        type: 'subscription',
        interval: (price.recurring?.interval as 'month' | 'year') || null,
        userId: userId,
        customerId: session.customer as string,
        subscriptionId: subscriptionId,
        status: subscription.status as PaymentStatus,
        periodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : undefined,
        periodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      // record event
      await paymentRepository.createEvent({
        paymentId: subscriptionId,
        eventType: 'checkout.session.completed',
        stripeEventId: event.id,
        eventData: JSON.stringify(session),
      });

      // Grant subscription credits
      const isYearly = price.recurring?.interval === 'year';
      await grantSubscriptionCredits(userId, priceId, subscriptionId, isYearly);

      webhookLogger.info({
        eventId: event.id,
        sessionId: session.id,
        subscriptionId,
        userId,
        priceId,
        status: 'created',
      }, `Subscription created from checkout: ${subscriptionId}`);
    }
    
      // if it's a one-time payment mode
    else if (session.mode === 'payment') {
      const paymentIntentId = session.payment_intent;
      const userId = session.metadata?.userId;
      
      if (!userId) {
        webhookErrorLogger.logError(new Error('No userId found in session metadata'), {
          operation: 'handleCheckoutSessionCompleted',
          sessionId: session.id,
          mode: session.mode,
          paymentIntentId,
        });
        return;
      }

      // get price information from line_items
      const { stripe } = await import('@/payment/stripe/client');
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'line_items.data.price']
      });
      
      const lineItem = sessionWithLineItems.line_items?.data[0];
      if (!lineItem || !lineItem.price) {
        webhookErrorLogger.logError(new Error('No line items or price found in session'), {
          operation: 'handleCheckoutSessionCompleted',
          sessionId: session.id,
          paymentIntentId,
          userId,
        });
        return;
      }
      
      const priceId = lineItem.price.id;

      // check if the payment record already exists
      const existingRecord = await paymentRepository.findById(paymentIntentId as string);
      if (existingRecord) {
        webhookLogger.info({
          eventId: event.id,
          sessionId: session.id,
          paymentIntentId,
          userId,
          status: 'duplicate_record',
        }, `Payment record already exists for payment: ${paymentIntentId}`);
        return;
      }

      // create payment record
      await paymentRepository.create({
        id: paymentIntentId as string,
        priceId: priceId,
        type: 'one_time',
        userId: userId,
        customerId: session.customer as string,
        status: 'active' as 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid',
      });

      // record event
      await paymentRepository.createEvent({
        paymentId: paymentIntentId as string,
        eventType: 'checkout.session.completed',
        stripeEventId: event.id,
        eventData: JSON.stringify(session),
      });

      webhookLogger.info({
        eventId: event.id,
        sessionId: session.id,
        paymentIntentId,
        userId,
        priceId,
        status: 'completed',
      }, `One-time payment completed: ${paymentIntentId}`);
    }
  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'handleCheckoutSessionCompleted',
      sessionId: session.id,
      mode: session.mode,
    });
    throw error;
  }
}

async function handleSubscriptionCreated(event: StripeTypes.Event) {
  const subscription = event.data.object as SubscriptionWithPeriod;
  
  try {
    // find the corresponding payment record
    const paymentRecord = await paymentRepository.findBySubscriptionId(subscription.id);
    
    if (!paymentRecord) {
      // if no record is found, it may be created through Stripe Dashboard
      webhookLogger.warn({
        eventId: event.id,
        subscriptionId: subscription.id,
        status: 'no_payment_record',
      }, `No payment record found for subscription ${subscription.id}`);
      return;
    }

    // safely handle timestamp conversion
    const currentPeriodStart = subscription.current_period_start;
    const currentPeriodEnd = subscription.current_period_end;
    
    // update payment record status
    await paymentRepository.update(paymentRecord.id, {
      status: subscription.status as PaymentStatus,
      periodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : undefined,
      periodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined,
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    // record event
    await paymentRepository.createEvent({
      paymentId: paymentRecord.id,
      eventType: 'customer.subscription.created',
      stripeEventId: event.id,
      eventData: JSON.stringify(subscription),
    });

    webhookLogger.info({
      eventId: event.id,
      subscriptionId: subscription.id,
      paymentId: paymentRecord.id,
      status: subscription.status,
    }, `Subscription created: ${subscription.id}`);
  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'handleSubscriptionCreated',
      subscriptionId: subscription.id,
    });
    throw error;
  }
}

async function handleSubscriptionUpdated(event: StripeTypes.Event) {
  const subscription = event.data.object as SubscriptionWithPeriod;
  
  try {
    const paymentRecord = await paymentRepository.findBySubscriptionId(subscription.id);
    if (!paymentRecord) {
      webhookLogger.warn({
        eventId: event.id,
        subscriptionId: subscription.id,
        status: 'no_payment_record',
      }, `No payment record found for subscription ${subscription.id}`);
      return;
    }

    // Get new price ID from subscription
    const subscriptionItem = subscription.items?.data?.[0];
    const newPriceId = subscriptionItem?.price?.id;
    const oldPriceId = paymentRecord.priceId;

    // Check if this is a plan upgrade (price change)
    if (newPriceId && oldPriceId && newPriceId !== oldPriceId) {
      await handlePlanUpgrade(paymentRecord.userId, oldPriceId, newPriceId, subscription.id);
    }

    // safely handle timestamp conversion
    const currentPeriodStart = subscription.current_period_start;
    const currentPeriodEnd = subscription.current_period_end;
    
    // update payment record status and price ID
    await paymentRepository.update(paymentRecord.id, {
      priceId: newPriceId || paymentRecord.priceId,
      status: subscription.status as PaymentStatus,
      periodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : undefined,
      periodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined,
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    // record event
    await paymentRepository.createEvent({
      paymentId: paymentRecord.id,
      eventType: 'customer.subscription.updated',
      stripeEventId: event.id,
      eventData: JSON.stringify(subscription),
    });

    webhookLogger.info({
      eventId: event.id,
      subscriptionId: subscription.id,
      paymentId: paymentRecord.id,
      status: subscription.status,
      oldPriceId,
      newPriceId,
    }, `Subscription updated: ${subscription.id}`);
  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'handleSubscriptionUpdated',
      subscriptionId: subscription.id,
    });
    throw error;
  }
}

async function handleSubscriptionDeleted(event: StripeTypes.Event) {
  const subscription = event.data.object as StripeTypes.Subscription;
  
  try {
    const paymentRecord = await paymentRepository.findBySubscriptionId(subscription.id);
    if (!paymentRecord) {
      webhookLogger.warn({
        eventId: event.id,
        subscriptionId: subscription.id,
        status: 'no_payment_record',
      }, `No payment record found for subscription ${subscription.id}`);
      return;
    }

    // update payment record status to canceled
    await paymentRepository.update(paymentRecord.id, {
      status: 'canceled',
    });

    // record event
    await paymentRepository.createEvent({
      paymentId: paymentRecord.id,
      eventType: 'customer.subscription.deleted',
      stripeEventId: event.id,
      eventData: JSON.stringify(subscription),
    });

    webhookLogger.info({
      eventId: event.id,
      subscriptionId: subscription.id,
      paymentId: paymentRecord.id,
      status: 'deleted',
    }, `Subscription deleted: ${subscription.id}`);
  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'handleSubscriptionDeleted',
      subscriptionId: subscription.id,
    });
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(event: StripeTypes.Event) {
  const invoice = event.data.object as InvoiceWithSubscription;
  
  try {
    if (invoice.subscription) {
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
      const paymentRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
      if (paymentRecord) {
        // record payment success event
        await paymentRepository.createEvent({
          paymentId: paymentRecord.id,
          eventType: 'invoice.payment_succeeded',
          stripeEventId: event.id,
          eventData: JSON.stringify(invoice),
        });

        webhookLogger.info({
          eventId: event.id,
          subscriptionId,
          paymentId: paymentRecord.id,
          invoiceId: invoice.id,
          status: 'payment_succeeded',
        }, `Invoice payment succeeded for subscription: ${subscriptionId}`);
      }
    }
  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'handleInvoicePaymentSucceeded',
      invoiceId: invoice.id,
    });
    throw error;
  }
}

async function handleInvoicePaymentFailed(event: StripeTypes.Event) {
  const invoice = event.data.object as InvoiceWithSubscription;
  
  try {
    if (invoice.subscription) {
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
      const paymentRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
      if (paymentRecord) {
        // record payment failed event
        await paymentRepository.createEvent({
          paymentId: paymentRecord.id,
          eventType: 'invoice.payment_failed',
          stripeEventId: event.id,
          eventData: JSON.stringify(invoice),
        });

        webhookLogger.info({
          eventId: event.id,
          subscriptionId,
          paymentId: paymentRecord.id,
          invoiceId: invoice.id,
          status: 'payment_failed',
        }, `Invoice payment failed for subscription: ${subscriptionId}`);
      }
    }
  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'handleInvoicePaymentFailed',
      invoiceId: invoice.id,
    });
    throw error;
  }
}

async function handleInvoicePaid(event: StripeTypes.Event) {
  const invoice = event.data.object as InvoiceWithSubscription;
  
  try {
    if (invoice.subscription) {
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
      const paymentRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
      if (paymentRecord) {
        // record payment success event
        await paymentRepository.createEvent({
          paymentId: paymentRecord.id,
          eventType: 'invoice.paid',
          stripeEventId: event.id,
          eventData: JSON.stringify(invoice),
        });

        // Grant monthly credits (skip first payment as it's handled in checkout.session.completed)
        const isFirstPayment = invoice.billing_reason === 'subscription_create';
        if (!isFirstPayment && paymentRecord.userId) {
          await grantMonthlyCredits(
            paymentRecord.userId, 
            paymentRecord.priceId, 
            subscriptionId, 
            invoice.id || 'unknown'
          );
        }

        webhookLogger.info({
          eventId: event.id,
          subscriptionId,
          paymentId: paymentRecord.id,
          invoiceId: invoice.id,
          billingReason: invoice.billing_reason,
          isFirstPayment,
          status: 'paid',
        }, `Invoice paid for subscription: ${subscriptionId}`);
      }
    }
  } catch (error) {
    webhookErrorLogger.logError(error as Error, {
      operation: 'handleInvoicePaid',
      invoiceId: invoice.id,
    });
    throw error;
  }
}