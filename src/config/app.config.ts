import type { AppConfig } from "@/types";

export const appConfig: AppConfig = {
  // Application basic information
  app: {
    name: 'Better-SaaS',
    version: '0.1.0',
    description: 'A better SaaS application template',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    domain: 'better-saas.com',
  },

  // SEO and metadata
  metadata: {
    title: {
      default: 'Better-SaaS',
      template: '%s | Better-SaaS',
    },
    description: 'A modern, full-stack SaaS application built with Next.js 15, featuring authentication, payments, file management, and internationalization.',
    keywords: ['SaaS', 'Next.js', 'React', 'TypeScript', 'Authentication', 'Payments', 'Stripe'],
    authors: [{ name: 'Better-SaaS Team' }],
    creator: 'Better-SaaS Team',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      siteName: 'Better-SaaS',
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@better_saas',
    },
  },

  // Administrator configuration
  admin: {
    emails: process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()).filter(Boolean) || [],
  },

  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxFiles: 10,
  },

  // Pagination configuration
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
}; 