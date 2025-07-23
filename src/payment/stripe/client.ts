import { Stripe } from 'stripe';
import { env } from '@/env';
import { paymentConfig } from '../../config/payment.config';

// Stripe configuration
export const stripeConfig = {
  secretKey: paymentConfig.stripe.secretKey,
  webhookSecret: paymentConfig.stripe.webhookSecret,
  apiVersion: paymentConfig.stripe.apiVersion as '2025-06-30.basil',
};

// Server-side Stripe instance
export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion,
  typescript: true,
}); 