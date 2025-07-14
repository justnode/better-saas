import type { PaymentConfig } from '@/types';

export const paymentConfig: PaymentConfig = {
  // Payment provider
  provider: 'stripe',
  
  // Base currency
  currency: 'usd',
  
  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: '2025-06-30.basil',
  },

  // Subscription plans
  plans: [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      interval: null,
      features: [
        'Up to 3 projects',
        '5GB storage',
        'Basic support',
        'Community access',
        'Basic analytics',
      ],
      popular: false,
      limits: {
        storage: 5,
        users: 1,
        projects: 3,
        apiCalls: 1000,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Best for professionals',
      price: 49,
      yearlyPrice: 499, // $49 * 10 months (2 months free)
      interval: 'month',
      stripePriceIds: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
      },
      features: [
        'Unlimited projects',
        '100GB storage',
        'Priority support',
        'Advanced analytics',
        'Custom integrations',
        'Team collaboration',
        'API access',
      ],
      popular: true,
      limits: {
        storage: 100,
        users: 5,
        projects: -1, // unlimited
        apiCalls: 50000,
      },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 99,
      yearlyPrice: 999, // $99 * 10 months (2 months free)
      interval: 'month',
      stripePriceIds: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
      },
      features: [
        'Unlimited everything',
        '1TB storage',
        '24/7 dedicated support',
        'Custom integrations',
        'Advanced security',
        'SLA guarantee',
        'On-premise deployment',
        'Custom training',
      ],
      popular: false,
      limits: {
        storage: 1000,
        users: -1, // unlimited
        projects: -1, // unlimited
        apiCalls: -1, // unlimited
      },
    },
  ],

  // Trial configuration
  trial: {
    enabled: true,
    days: 14,
    plans: ['pro', 'enterprise'], // Only these plans support trial
  },

  // Invoice configuration
  invoice: {
    footer: 'Thank you for your business! If you have any questions, please contact our support team.',
    logo: '/logo.png',
    supportEmail: 'support@better-saas.com',
  },

  // Billing configuration
  billing: {
    collectTaxId: true,
    allowPromotionCodes: true,
    automaticTax: true,
  },

  // Feature flags
  features: {
    subscriptions: true,
    oneTimePayments: true,
    invoices: true,
    customerPortal: true,
    webhooks: true,
  },
}; 