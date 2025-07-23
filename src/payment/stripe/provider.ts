import { stripe, stripeConfig } from './client';
import type {
  PaymentProvider,
  CreatePaymentParams,
  CreateSubscriptionParams,
  CreateSubscriptionCheckoutParams,
  UpdateSubscriptionParams,
  PaymentResult,
  SubscriptionResult,
  PaymentStatus,
} from '@/payment/types';
import type { Stripe as StripeTypes } from 'stripe';
import type { SubscriptionWithPeriod } from '@/types/stripe-extended';
import { ErrorLogger } from '@/lib/logger/logger-utils';

const stripeErrorLogger = new ErrorLogger('stripe-provider');

export class StripeProvider implements PaymentProvider {
  /**
   * Create customer
   */
  async createCustomer(userId: string, email: string, name?: string): Promise<string> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });
      return customer.id;
    } catch (error) {
      stripeErrorLogger.logError(error as Error, {
        operation: 'createCustomer',
        userId,
        email,
      });
      throw new Error('create customer failed');
    }
  }

  /**
   * Create one-time payment
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const { userId, priceId, customerId, successUrl, cancelUrl, metadata } = params;

      if (!customerId) {
        throw new Error('customer id is required');
      }

          // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
        metadata: {
          userId,
          ...metadata,
        },
      });

      return {
        id: session.id,
        status: 'incomplete' as PaymentStatus,
        url: session.url || undefined,
        customerId,
        clientSecret: session.client_secret || undefined,
      };
    } catch (error) {
      stripeErrorLogger.logError(error as Error, {
        operation: 'createPayment',
        userId: params.userId,
        priceId: params.priceId,
        customerId: params.customerId,
      });
      throw new Error('create payment failed');
    }
  }

  /**
   * Create subscription payment session
   */
  async createSubscriptionCheckout(params: CreateSubscriptionCheckoutParams): Promise<PaymentResult> {
    try {
      const { userId, priceId, customerId, successUrl, cancelUrl, trialPeriodDays, metadata } = params;

      if (!customerId) {
        throw new Error('customer id is required');
      }

          // Create subscription Checkout Session
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
        subscription_data: {
          trial_period_days: trialPeriodDays,
          metadata: {
            userId,
            ...metadata,
          },
        },
        metadata: {
          userId,
          ...metadata,
        },
      });

      return {
        id: session.id,
        status: 'incomplete' as PaymentStatus,
        url: session.url || undefined,
        customerId,
        clientSecret: session.client_secret || undefined,
      };
    } catch (error) {
      stripeErrorLogger.logError(error as Error, {
        operation: 'createSubscriptionCheckout',
        userId: params.userId,
        priceId: params.priceId,
        customerId: params.customerId,
      });
      throw new Error('create subscription checkout failed');
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    try {
      const { userId, priceId, customerId, trialPeriodDays, metadata } = params;

      if (!customerId) {
        throw new Error('customer id is required');
      }

      // 获取价格信息
      const price = await stripe.prices.retrieve(priceId);

      // 创建订阅
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialPeriodDays,
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          ...metadata,
        },
      });

      const subscriptionWithPeriod = subscription as unknown as SubscriptionWithPeriod;
      
      return {
        id: subscription.id,
        status: subscription.status as PaymentStatus,
        customerId,
        priceId,
        interval: (price.recurring?.interval as 'month' | 'year') || null,
        periodStart: subscriptionWithPeriod.current_period_start ? new Date(subscriptionWithPeriod.current_period_start * 1000) : undefined,
        periodEnd: subscriptionWithPeriod.current_period_end ? new Date(subscriptionWithPeriod.current_period_end * 1000) : undefined,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodStart: subscriptionWithPeriod.current_period_start ? new Date(subscriptionWithPeriod.current_period_start * 1000) : new Date(),
        currentPeriodEnd: subscriptionWithPeriod.current_period_end ? new Date(subscriptionWithPeriod.current_period_end * 1000) : new Date(),
        clientSecret: (subscription.latest_invoice as StripeTypes.Invoice & { payment_intent?: StripeTypes.PaymentIntent })?.payment_intent?.client_secret || undefined,
      };
    } catch (error) {
      stripeErrorLogger.logError(error as Error, {
        operation: 'createSubscription',
        userId: params.userId,
        priceId: params.priceId,
        customerId: params.customerId,
      });
      throw new Error('create subscription failed');
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, params: UpdateSubscriptionParams): Promise<SubscriptionResult> {
    try {
      const { priceId, cancelAtPeriodEnd, metadata } = params;

      const updateData: StripeTypes.SubscriptionUpdateParams = {};

      if (priceId) {
        const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const currentItem = currentSubscription.items.data[0];
        
        if (!currentItem) {
          throw new Error('subscription item not found');
        }

        updateData.items = [
          {
            id: currentItem.id,
            price: priceId,
          },
        ];
      }

      if (cancelAtPeriodEnd !== undefined) {
        updateData.cancel_at_period_end = cancelAtPeriodEnd;
      }

      if (metadata) {
        updateData.metadata = metadata;
      }

      const subscription = await stripe.subscriptions.update(subscriptionId, updateData);
      const priceItem = subscription.items.data[0];
      
      if (!priceItem) {
        throw new Error('subscription price item not found');
      }
      
      const price = await stripe.prices.retrieve(priceItem.price.id);

      const subscriptionWithPeriod = subscription as unknown as SubscriptionWithPeriod;

      return {
        id: subscription.id,
        status: subscription.status as PaymentStatus,
        customerId: subscription.customer as string,
        priceId: priceItem.price.id,
        interval: (price.recurring?.interval as 'month' | 'year') || null,
        periodStart: subscriptionWithPeriod.current_period_start ? new Date(subscriptionWithPeriod.current_period_start * 1000) : undefined,
        periodEnd: subscriptionWithPeriod.current_period_end ? new Date(subscriptionWithPeriod.current_period_end * 1000) : undefined,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodStart: subscriptionWithPeriod.current_period_start ? new Date(subscriptionWithPeriod.current_period_start * 1000) : new Date(),
        currentPeriodEnd: subscriptionWithPeriod.current_period_end ? new Date(subscriptionWithPeriod.current_period_end * 1000) : new Date(),
      };
    } catch (error) {
      stripeErrorLogger.logError(error as Error, {
        operation: 'updateSubscription',
        subscriptionId,
        priceId: params.priceId,
      });
      throw new Error('update subscription failed');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return true;
    } catch (error) {
      stripeErrorLogger.logError(error as Error, {
        operation: 'cancelSubscription',
        subscriptionId,
      });
      return false;
    }
  }

  /**
   * Get subscription information
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionResult | null> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceItem = subscription.items.data[0];
      
      if (!priceItem) {
        return null;
      }
      
      const price = await stripe.prices.retrieve(priceItem.price.id);

      const subscriptionWithPeriod = subscription as unknown as SubscriptionWithPeriod;

      return {
        id: subscription.id,
        status: subscription.status as PaymentStatus,
        customerId: subscription.customer as string,
        priceId: priceItem.price.id,
        interval: (price.recurring?.interval as 'month' | 'year') || null,
        periodStart: subscriptionWithPeriod.current_period_start ? new Date(subscriptionWithPeriod.current_period_start * 1000) : undefined,
        periodEnd: subscriptionWithPeriod.current_period_end ? new Date(subscriptionWithPeriod.current_period_end * 1000) : undefined,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodStart: subscriptionWithPeriod.current_period_start ? new Date(subscriptionWithPeriod.current_period_start * 1000) : new Date(),
        currentPeriodEnd: subscriptionWithPeriod.current_period_end ? new Date(subscriptionWithPeriod.current_period_end * 1000) : new Date(),
      };
    } catch (error) {
      stripeErrorLogger.logError(error as Error, {
        operation: 'getSubscription',
        subscriptionId,
      });
      return null;
    }
  }

  
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        return paymentIntent.status as PaymentStatus;
      } catch {
        const session = await stripe.checkout.sessions.retrieve(paymentId);
        return (session.payment_status || 'incomplete') as PaymentStatus;
      }
    } catch (error) {
      stripeErrorLogger.logError(error as Error, {
        operation: 'getPaymentStatus',
        paymentId,
      });
        throw new Error('get payment status failed');
    }
  }

  
  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    try {
      stripe.webhooks.constructEvent(payload, signature, stripeConfig.webhookSecret);
      return true;
    } catch (error) {
      stripeErrorLogger.logError(error as Error, {
        operation: 'verifyWebhook',
      });
      return false;
    }
  }

  
  constructWebhookEvent(payload: string, signature: string) {
    return stripe.webhooks.constructEvent(payload, signature, stripeConfig.webhookSecret);
  }
} 