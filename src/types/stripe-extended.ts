import type { Stripe as StripeTypes } from 'stripe';

// 扩展 Stripe 订阅类型，添加缺失的属性
export interface SubscriptionWithPeriod extends StripeTypes.Subscription {
  // removed from the subscription in newer API versions, now on the subscription items
  current_period_start?: number;
  current_period_end?: number;
}

// Read the period from the first subscription item, falling back to the legacy subscription fields
export function getSubscriptionPeriod(subscription: SubscriptionWithPeriod): {
  start: number | undefined;
  end: number | undefined;
} {
  const item = subscription.items?.data?.[0] as
    | { current_period_start?: number; current_period_end?: number }
    | undefined;
  return {
    start: item?.current_period_start ?? subscription.current_period_start,
    end: item?.current_period_end ?? subscription.current_period_end,
  };
}

// 扩展 Stripe 发票类型，添加缺失的属性
export interface InvoiceWithSubscription extends StripeTypes.Invoice {
  subscription?: string | StripeTypes.Subscription;
}

// 扩展支付状态类型，包含 Stripe 可能的所有状态
export type ExtendedPaymentStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';
