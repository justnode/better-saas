import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { StripeProvider } from '@/payment/stripe/provider';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import type { Stripe as StripeTypes } from 'stripe';
import type { SubscriptionWithPeriod, InvoiceWithSubscription } from '@/types/stripe-extended';
import type { PaymentStatus } from '@/payment/types';
import { ErrorLogger, logUtils } from '@/lib/logger/logger-utils';
import { createChildLogger } from '@/lib/logger/logger';

const webhookErrorLogger = new ErrorLogger('stripe-webhook');
const webhookLogger = createChildLogger('stripe-webhook');

const stripeProvider = new StripeProvider();

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
      eventType: 'customer.subscription.updated',
      stripeEventId: event.id,
      eventData: JSON.stringify(subscription),
    });

    webhookLogger.info({
      eventId: event.id,
      subscriptionId: subscription.id,
      paymentId: paymentRecord.id,
      status: subscription.status,
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

        webhookLogger.info({
          eventId: event.id,
          subscriptionId,
          paymentId: paymentRecord.id,
          invoiceId: invoice.id,
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