import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Stripe as StripeTypes } from 'stripe';
import { paymentConfig } from '@/config/payment.config';
import { creditService } from '@/lib/credits';
import { StripeProvider } from '@/payment/stripe/provider';
import type { PaymentStatus } from '@/payment/types';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import {
  getSubscriptionPeriod,
  type InvoiceWithSubscription,
  type SubscriptionWithPeriod,
} from '@/types/stripe-extended';

const stripeProvider = new StripeProvider();

/**
 * Helper function to find payment plan by price ID
 */
function findPlanByPriceId(priceId: string) {
  return paymentConfig.plans.find(
    (plan) => plan.stripePriceIds?.monthly === priceId || plan.stripePriceIds?.yearly === priceId
  );
}

/**
 * Grant credits for subscription
 */
async function grantSubscriptionCredits(
  userId: string,
  priceId: string,
  subscriptionId: string,
  isYearly: boolean
) {
  try {
    const plan = findPlanByPriceId(priceId);
    if (!plan?.credits) {
      console.log(`[stripe-webhook] No credits configuration found for plan: ${plan?.id || 'unknown'}`);
      return;
    }

    // Calculate credits to grant
    const creditsToGrant =
      plan.credits.onSubscribe || (isYearly ? plan.credits.yearly : plan.credits.monthly);

    if (!creditsToGrant || creditsToGrant <= 0) {
      console.log(`[stripe-webhook] No credits to grant for plan: ${plan.id}`);
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

    console.log(`[stripe-webhook] Granted ${creditsToGrant} credits to user ${userId} for ${plan.name} subscription`);
  } catch (error) {
    console.error('[stripe-webhook] grantSubscriptionCredits error:', error);
    // Don't throw error to avoid webhook failure
  }
}

/**
 * Grant monthly credits for recurring subscription payments
 */
async function grantMonthlyCredits(
  userId: string,
  priceId: string,
  subscriptionId: string,
  invoiceId: string
) {
  try {
    const plan = findPlanByPriceId(priceId);
    if (!plan?.credits?.monthly) {
      console.log(`[stripe-webhook] No monthly credits configuration found for plan: ${plan?.id || 'unknown'}`);
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

    console.log(`[stripe-webhook] Granted monthly ${plan.credits.monthly} credits to user ${userId} for ${plan.name} subscription`);
  } catch (error) {
    console.error('[stripe-webhook] grantMonthlyCredits error:', error);
    // Don't throw error to avoid webhook failure
  }
}

/**
 * Handle plan upgrade and grant appropriate credits
 */
async function handlePlanUpgrade(
  userId: string,
  oldPriceId: string,
  newPriceId: string,
  subscriptionId: string
) {
  try {
    const oldPlan = findPlanByPriceId(oldPriceId);
    const newPlan = findPlanByPriceId(newPriceId);

    if (!oldPlan || !newPlan) {
      console.warn(`[stripe-webhook] Plan not found for upgrade: old=${oldPlan?.id}, new=${newPlan?.id}`);
      return;
    }

    // Check if this is actually an upgrade (higher tier)
    const planHierarchy = ['free', 'pro', 'enterprise'];
    const oldPlanIndex = planHierarchy.indexOf(oldPlan.id);
    const newPlanIndex = planHierarchy.indexOf(newPlan.id);

    if (newPlanIndex <= oldPlanIndex) {
      console.log(`[stripe-webhook] Not an upgrade: ${oldPlan.id} -> ${newPlan.id}`);
      return;
    }

    // Calculate credit difference for upgrade
    const isYearly = newPriceId === newPlan.stripePriceIds?.yearly;
    const oldCredits = isYearly ? oldPlan.credits?.yearly || 0 : oldPlan.credits?.monthly || 0;
    const newCredits = isYearly ? newPlan.credits?.yearly || 0 : newPlan.credits?.monthly || 0;
    const creditDifference = newCredits - oldCredits;

    if (creditDifference > 0) {
      // Grant upgrade bonus credits
      await creditService.earnCredits({
        userId,
        amount: creditDifference,
        source: 'subscription',
        description: `Upgrade bonus from ${oldPlan.name} to ${newPlan.name}`,
        referenceId: `upgrade_${subscriptionId}_${oldPriceId}_${newPriceId}`,
        metadata: {
          oldPlanId: oldPlan.id,
          newPlanId: newPlan.id,
          subscriptionId,
          creditType: 'upgrade_bonus',
          interval: isYearly ? 'yearly' : 'monthly',
        },
      });

      console.log(`[stripe-webhook] Upgrade bonus credits granted: ${creditDifference} for ${oldPlan.name} -> ${newPlan.name}`);
    }

    // Grant immediate subscription credits for the new plan
    const immediateCredits = newPlan.credits?.onSubscribe || 0;
    if (immediateCredits > 0) {
      await creditService.earnCredits({
        userId,
        amount: immediateCredits,
        source: 'subscription',
        description: `Immediate credits for upgrading to ${newPlan.name}`,
        referenceId: `upgrade_immediate_${subscriptionId}_${oldPriceId}_${newPriceId}`,
        metadata: {
          planId: newPlan.id,
          subscriptionId,
          creditType: 'upgrade_immediate',
        },
      });

      console.log(`[stripe-webhook] Immediate upgrade credits granted: ${immediateCredits} for ${newPlan.name}`);
    }
  } catch (error) {
    console.error('[stripe-webhook] handlePlanUpgrade error:', error);
    // Don't throw error to avoid webhook failure
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[stripe-webhook] Security: Missing stripe-signature header', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
      });
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // verify webhook signature
    const isValid = await stripeProvider.verifyWebhook(body, signature);
    if (!isValid) {
      console.error('[stripe-webhook] Security: Invalid webhook signature', {
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
      console.log(`[stripe-webhook] Event ${event.id} already processed`);
      return NextResponse.json({ received: true });
    }

    console.log(`[stripe-webhook] Processing Stripe event: ${event.type}`);

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
        console.log(`[stripe-webhook] Payment method attached: ${event.data.object.id}`);
        break;

      default:
        console.warn(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe-webhook] webhook_handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(event: StripeTypes.Event) {
  const session = event.data.object as StripeTypes.Checkout.Session;

  try {
    console.log(`[stripe-webhook] Checkout session completed: ${session.id}`);

    // if it's a subscription mode
    if (session.mode === 'subscription' && session.subscription) {
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
      const userId = session.metadata?.userId;

      if (!userId) {
        console.error('[stripe-webhook] No userId found in session metadata', { sessionId: session.id, subscriptionId });
        return;
      }

      // get Stripe subscription details
      const { stripe } = await import('@/payment/stripe/client');
      const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price'],
      });

      // type assertion to extended type
      const subscription = subscriptionResponse as unknown as SubscriptionWithPeriod;
      const period = getSubscriptionPeriod(subscription);

      // get price ID from subscription
      const subscriptionItem = subscription.items.data[0];
      if (!subscriptionItem) {
        console.error('[stripe-webhook] No subscription items found', { sessionId: session.id, subscriptionId, userId });
        return;
      }

      const priceId = subscriptionItem.price.id;
      const price = subscriptionItem.price;

      // check if the payment record already exists
      const existingRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
      if (existingRecord) {
        console.log(`[stripe-webhook] Payment record already exists for subscription: ${subscriptionId}`);
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
        periodStart: period.start ? new Date(period.start * 1000) : undefined,
        periodEnd: period.end ? new Date(period.end * 1000) : undefined,
        trialStart: subscription.trial_start
          ? new Date(subscription.trial_start * 1000)
          : undefined,
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

      console.log(`[stripe-webhook] Subscription created from checkout: ${subscriptionId}`);
    }

    // if it's a one-time payment mode
    else if (session.mode === 'payment') {
      const paymentIntentId = session.payment_intent;
      const userId = session.metadata?.userId;

      if (!userId) {
        console.error('[stripe-webhook] No userId found in session metadata', { sessionId: session.id, paymentIntentId });
        return;
      }

      // get price information from line_items
      const { stripe } = await import('@/payment/stripe/client');
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'line_items.data.price'],
      });

      const lineItem = sessionWithLineItems.line_items?.data[0];
      if (!lineItem || !lineItem.price) {
        console.error('[stripe-webhook] No line items or price found in session', { sessionId: session.id, paymentIntentId, userId });
        return;
      }

      const priceId = lineItem.price.id;

      // check if the payment record already exists
      const existingRecord = await paymentRepository.findById(paymentIntentId as string);
      if (existingRecord) {
        console.log(`[stripe-webhook] Payment record already exists for payment: ${paymentIntentId}`);
        return;
      }

      // create payment record
      await paymentRepository.create({
        id: paymentIntentId as string,
        priceId: priceId,
        type: 'one_time',
        userId: userId,
        customerId: session.customer as string,
        status: 'active' as
          | 'active'
          | 'canceled'
          | 'past_due'
          | 'trialing'
          | 'incomplete'
          | 'incomplete_expired'
          | 'unpaid',
      });

      // record event
      await paymentRepository.createEvent({
        paymentId: paymentIntentId as string,
        eventType: 'checkout.session.completed',
        stripeEventId: event.id,
        eventData: JSON.stringify(session),
      });

      console.log(`[stripe-webhook] One-time payment completed: ${paymentIntentId}`);
    }
  } catch (error) {
    console.error('[stripe-webhook] handleCheckoutSessionCompleted error:', error);
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
      console.warn(`[stripe-webhook] No payment record found for subscription ${subscription.id}`);
      return;
    }

    // safely handle timestamp conversion
    const { start: currentPeriodStart, end: currentPeriodEnd } = getSubscriptionPeriod(subscription);

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

    console.log(`[stripe-webhook] Subscription created: ${subscription.id}`);
  } catch (error) {
    console.error('[stripe-webhook] handleSubscriptionCreated error:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(event: StripeTypes.Event) {
  const subscription = event.data.object as SubscriptionWithPeriod;

  try {
    const paymentRecord = await paymentRepository.findBySubscriptionId(subscription.id);
    if (!paymentRecord) {
      console.warn(`[stripe-webhook] No payment record found for subscription ${subscription.id}`);
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
    const { start: currentPeriodStart, end: currentPeriodEnd } = getSubscriptionPeriod(subscription);

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

    console.log(`[stripe-webhook] Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error('[stripe-webhook] handleSubscriptionUpdated error:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(event: StripeTypes.Event) {
  const subscription = event.data.object as StripeTypes.Subscription;

  try {
    const paymentRecord = await paymentRepository.findBySubscriptionId(subscription.id);
    if (!paymentRecord) {
      console.warn(`[stripe-webhook] No payment record found for subscription ${subscription.id}`);
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

    console.log(`[stripe-webhook] Subscription deleted: ${subscription.id}`);
  } catch (error) {
    console.error('[stripe-webhook] handleSubscriptionDeleted error:', error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(event: StripeTypes.Event) {
  const invoice = event.data.object as InvoiceWithSubscription;

  try {
    if (invoice.subscription) {
      const subscriptionId =
        typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
      const paymentRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
      if (paymentRecord) {
        // record payment success event
        await paymentRepository.createEvent({
          paymentId: paymentRecord.id,
          eventType: 'invoice.payment_succeeded',
          stripeEventId: event.id,
          eventData: JSON.stringify(invoice),
        });

        console.log(`[stripe-webhook] Invoice payment succeeded for subscription: ${subscriptionId}`);
      }
    }
  } catch (error) {
    console.error('[stripe-webhook] handleInvoicePaymentSucceeded error:', error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(event: StripeTypes.Event) {
  const invoice = event.data.object as InvoiceWithSubscription;

  try {
    if (invoice.subscription) {
      const subscriptionId =
        typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
      const paymentRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
      if (paymentRecord) {
        // record payment failed event
        await paymentRepository.createEvent({
          paymentId: paymentRecord.id,
          eventType: 'invoice.payment_failed',
          stripeEventId: event.id,
          eventData: JSON.stringify(invoice),
        });

        console.log(`[stripe-webhook] Invoice payment failed for subscription: ${subscriptionId}`);
      }
    }
  } catch (error) {
    console.error('[stripe-webhook] handleInvoicePaymentFailed error:', error);
    throw error;
  }
}

async function handleInvoicePaid(event: StripeTypes.Event) {
  const invoice = event.data.object as InvoiceWithSubscription;

  try {
    if (invoice.subscription) {
      const subscriptionId =
        typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
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

        console.log(`[stripe-webhook] Invoice paid for subscription: ${subscriptionId}`);
      }
    }
  } catch (error) {
    console.error('[stripe-webhook] handleInvoicePaid error:', error);
    throw error;
  }
}
