import type { Stripe as StripeTypes } from 'stripe';

// 扩展 Stripe 订阅类型，添加缺失的属性
export interface SubscriptionWithPeriod extends StripeTypes.Subscription {
  current_period_start: number;
  current_period_end: number;
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