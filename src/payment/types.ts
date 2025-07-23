import type { Stripe as StripeTypes } from 'stripe';

// Payment type
export type PaymentType = 'one_time' | 'subscription';

// Payment status
export type PaymentStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'trialing' 
  | 'incomplete' 
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

// Payment interval
export type PaymentInterval = 'month' | 'year' | null;

// Payment event type
export type PaymentEventType = 
  | 'created' 
  | 'succeeded' 
  | 'failed' 
  | 'canceled' 
  | 'updated'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted';

// 创建支付参数
export interface CreatePaymentParams {
  userId: string;
  priceId: string;
  customerId?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

// 创建订阅参数
export interface CreateSubscriptionParams {
  userId: string;
  priceId: string;
  customerId?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

// 创建订阅支付会话参数
export interface CreateSubscriptionCheckoutParams {
  userId: string;
  priceId: string;
  customerId?: string;
  successUrl?: string;
  cancelUrl?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

// 更新订阅参数
export interface UpdateSubscriptionParams {
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, string>;
}

// 支付结果
export interface PaymentResult {
  id: string;
  status: PaymentStatus;
  clientSecret?: string;
  url?: string;
  customerId: string;
  amount?: number;
  currency?: string;
}

// 订阅结果
export interface SubscriptionResult {
  id: string;
  status: PaymentStatus;
  customerId: string;
  priceId: string;
  interval: PaymentInterval;
  periodStart?: Date;
  periodEnd?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  clientSecret?: string;
  url?: string;
}

// 支付记录
export interface PaymentRecord {
  id: string;
  priceId: string;
  type: PaymentType;
  interval: PaymentInterval;
  userId: string;
  customerId: string;
  subscriptionId?: string;
  status: PaymentStatus;
  periodStart?: Date;
  periodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 支付提供商接口
export interface PaymentProvider {
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult>;
  updateSubscription(subscriptionId: string, params: UpdateSubscriptionParams): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  getSubscription(subscriptionId: string): Promise<SubscriptionResult | null>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  verifyWebhook(payload: string, signature: string): Promise<boolean>;
  createCustomer(userId: string, email: string, name?: string): Promise<string>;
}

// Webhook 事件
export interface WebhookEvent {
  id: string;
  type: PaymentEventType;
  data: StripeTypes.Event.Data;
  created: number;
}

// 价格信息
export interface PriceInfo {
  id: string;
  amount: number;
  currency: string;
  interval?: PaymentInterval;
  intervalCount?: number;
  nickname?: string;
  metadata?: Record<string, string>;
}

// 计费信息
export interface BillingInfo {
  customerId?: string;
  subscription?: SubscriptionResult;
  paymentMethods: StripeTypes.PaymentMethod[];
  invoices: StripeTypes.Invoice[];
  upcomingInvoice?: StripeTypes.Invoice;
}

// Server Action 返回类型
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 支付配置
export interface PaymentConfig {
  stripe: {
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
    apiVersion: string;
  };
}

// 套餐配置
export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  stripePriceId: string;
  amount: number;
  currency: string;
  interval: PaymentInterval;
  features: string[];
  popular?: boolean;
  metadata?: Record<string, string>;
} 