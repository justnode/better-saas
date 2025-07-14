import { z } from 'zod';

// App configuration schema
export const appConfigSchema = z.object({
  app: z.object({
    name: z.string().min(1, 'App name is required'),
    version: z.string().min(1, 'App version is required'),
    description: z.string().min(1, 'App description is required'),
    url: z.string().url('App URL must be a valid URL'),
    domain: z.string().min(1, 'App domain is required'),
  }),
  metadata: z.object({
    title: z.object({
      default: z.string().min(1, 'Default title is required'),
      template: z.string().min(1, 'Title template is required'),
    }),
    description: z.string().min(1, 'Metadata description is required'),
    keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
    authors: z.array(z.object({
      name: z.string().min(1, 'Author name is required'),
      url: z.string().url().optional(),
    })),
    creator: z.string().min(1, 'Creator is required'),
    robots: z.object({
      index: z.boolean(),
      follow: z.boolean(),
    }),
    openGraph: z.object({
      type: z.string().min(1, 'OpenGraph type is required'),
      locale: z.string().min(1, 'OpenGraph locale is required'),
      url: z.string().url('OpenGraph URL must be valid'),
      siteName: z.string().min(1, 'OpenGraph site name is required'),
    }),
    twitter: z.object({
      card: z.string().min(1, 'Twitter card type is required'),
      creator: z.string().min(1, 'Twitter creator is required'),
    }),
  }),
  admin: z.object({
    emails: z.array(z.string().email('Invalid admin email')),
  }),
  upload: z.object({
    maxFileSize: z.number().positive('Max file size must be positive'),
    allowedTypes: z.array(z.string().min(1, 'File type cannot be empty')),
    maxFiles: z.number().positive('Max files must be positive'),
  }),
  pagination: z.object({
    defaultPageSize: z.number().positive('Default page size must be positive'),
    maxPageSize: z.number().positive('Max page size must be positive'),
  }),
});

// Features configuration schema
export const featuresConfigSchema = z.object({
  auth: z.object({
    enabled: z.boolean(),
    providers: z.object({
      email: z.boolean(),
      github: z.boolean(),
      google: z.boolean(),
    }),
    session: z.object({
      maxAge: z.number().positive('Session max age must be positive'),
    }),
    passwordReset: z.boolean(),
    emailVerification: z.boolean(),
  }),
  payment: z.object({
    enabled: z.boolean(),
    provider: z.literal('stripe'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    trial: z.object({
      enabled: z.boolean(),
      days: z.number().positive('Trial days must be positive'),
    }),
  }),
  fileManager: z.object({
    enabled: z.boolean(),
    storage: z.enum(['r2', 's3']),
    thumbnails: z.boolean(),
    imageProcessing: z.boolean(),
    maxFileSize: z.number().positive('Max file size must be positive'),
    allowedTypes: z.array(z.string().min(1, 'File type cannot be empty')),
  }),
  blog: z.object({
    enabled: z.boolean(),
    commentsEnabled: z.boolean(),
    tagsEnabled: z.boolean(),
    authorsEnabled: z.boolean(),
    searchEnabled: z.boolean(),
  }),
  docs: z.object({
    enabled: z.boolean(),
    searchEnabled: z.boolean(),
    editOnGithub: z.boolean(),
    tableOfContents: z.boolean(),
    breadcrumbs: z.boolean(),
  }),
  analytics: z.object({
    enabled: z.boolean(),
    provider: z.enum(['vercel', 'google', 'plausible']),
    trackingId: z.string().optional(),
  }),
  notifications: z.object({
    enabled: z.boolean(),
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    inAppNotifications: z.boolean(),
  }),
  dashboard: z.object({
    enabled: z.boolean(),
    widgets: z.object({
      analytics: z.boolean(),
      recentActivity: z.boolean(),
      quickActions: z.boolean(),
      notifications: z.boolean(),
    }),
  }),
  admin: z.object({
    enabled: z.boolean(),
    userManagement: z.boolean(),
    systemSettings: z.boolean(),
    analytics: z.boolean(),
  }),
});

// I18n configuration schema
export const i18nConfigSchema = z.object({
  locales: z.array(z.string().min(1, 'Locale cannot be empty')).min(1, 'At least one locale is required'),
  defaultLocale: z.string().min(1, 'Default locale is required'),
  fallbackLocale: z.string().min(1, 'Fallback locale is required'),
  languages: z.record(z.string(), z.object({
    name: z.string().min(1, 'Language name is required'),
    nativeName: z.string().min(1, 'Native name is required'),
    flag: z.string().min(1, 'Flag is required'),
    dir: z.enum(['ltr', 'rtl']),
    enabled: z.boolean(),
  })),
  routing: z.object({
    localePrefix: z.enum(['always', 'as-needed', 'never']),
    localeDetection: z.boolean(),
    domains: z.record(z.string(), z.string()).optional(),
  }),
  namespaces: z.array(z.string().min(1, 'Namespace cannot be empty')),
  dateTimeFormats: z.record(z.string(), z.object({
    short: z.record(z.string(), z.union([z.string(), z.number()])),
    medium: z.record(z.string(), z.union([z.string(), z.number()])),
    long: z.record(z.string(), z.union([z.string(), z.number()])),
  })),
  numberFormats: z.record(z.string(), z.object({
    currency: z.record(z.string(), z.union([z.string(), z.number()])),
    decimal: z.record(z.string(), z.union([z.string(), z.number()])),
    percent: z.record(z.string(), z.union([z.string(), z.number()])),
  })),
});

// Theme configuration schema
export const themeConfigSchema = z.object({
  defaultTheme: z.enum(['light', 'dark', 'system']),
  themes: z.array(z.string().min(1, 'Theme name cannot be empty')),
  colors: z.record(z.string(), z.record(z.string(), z.string())),
  fonts: z.object({
    sans: z.array(z.string().min(1, 'Font name cannot be empty')),
    mono: z.array(z.string().min(1, 'Font name cannot be empty')),
    serif: z.array(z.string().min(1, 'Font name cannot be empty')),
  }),
  borderRadius: z.record(z.string(), z.string()),
  spacing: z.record(z.string(), z.string()),
  animations: z.object({
    duration: z.record(z.string(), z.string()),
    easing: z.record(z.string(), z.string()),
  }),
  breakpoints: z.record(z.string(), z.string()),
  shadows: z.record(z.string(), z.string()),
  zIndex: z.record(z.string(), z.number()),
});

// Payment configuration schema
export const paymentConfigSchema = z.object({
  provider: z.literal('stripe'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  stripe: z.object({
    secretKey: z.string().min(1, 'Stripe secret key is required'),
    webhookSecret: z.string().min(1, 'Stripe webhook secret is required'),
    apiVersion: z.string().min(1, 'Stripe API version is required'),
  }),
  plans: z.array(z.object({
    id: z.string().min(1, 'Plan ID is required'),
    name: z.string().min(1, 'Plan name is required'),
    description: z.string().min(1, 'Plan description is required'),
    price: z.number().nonnegative('Plan price must be non-negative'),
    interval: z.enum(['month', 'year']).nullable(),
    stripePriceId: z.string().optional(),
    features: z.array(z.string().min(1, 'Feature cannot be empty')),
    popular: z.boolean().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    limits: z.object({
      storage: z.number().optional(),
      users: z.number().optional(),
      projects: z.number().optional(),
      apiCalls: z.number().optional(),
    }).optional(),
  })),
  trial: z.object({
    enabled: z.boolean(),
    days: z.number().positive('Trial days must be positive'),
    plans: z.array(z.string().min(1, 'Plan ID cannot be empty')),
  }),
  invoice: z.object({
    footer: z.string().min(1, 'Invoice footer is required'),
    logo: z.string().optional(),
    supportEmail: z.string().email('Support email must be valid'),
  }),
  billing: z.object({
    collectTaxId: z.boolean(),
    allowPromotionCodes: z.boolean(),
    automaticTax: z.boolean(),
  }),
  features: z.object({
    subscriptions: z.boolean(),
    oneTimePayments: z.boolean(),
    invoices: z.boolean(),
    customerPortal: z.boolean(),
    webhooks: z.boolean(),
  }),
});

// Configuration validation function
export function validateConfig<T>(config: T, schema: z.ZodSchema<T>, configName: string): T {
  try {
    return schema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(`Configuration validation failed for ${configName}:\n${errorMessages}`);
    }
    throw error;
  }
}

// Validate all configurations
export function validateAllConfigs(configs: {
  app: unknown;
  features: unknown;
  i18n: unknown;
  theme: unknown;
  payment: unknown;
}) {
  const validatedConfigs = {
    app: validateConfig(configs.app, appConfigSchema, 'app'),
    features: validateConfig(configs.features, featuresConfigSchema, 'features'),
    i18n: validateConfig(configs.i18n, i18nConfigSchema, 'i18n'),
    theme: validateConfig(configs.theme, themeConfigSchema, 'theme'),
    payment: validateConfig(configs.payment, paymentConfigSchema, 'payment'),
  } as {
    app: z.infer<typeof appConfigSchema>;
    features: z.infer<typeof featuresConfigSchema>;
    i18n: z.infer<typeof i18nConfigSchema>;
    theme: z.infer<typeof themeConfigSchema>;
    payment: z.infer<typeof paymentConfigSchema>;
  };

  // Cross-validation checks
  validateCrossReferences(validatedConfigs);

  return validatedConfigs;
}

// Cross-reference validation
function validateCrossReferences(configs: {
  app: z.infer<typeof appConfigSchema>;
  features: z.infer<typeof featuresConfigSchema>;
  i18n: z.infer<typeof i18nConfigSchema>;
  theme: z.infer<typeof themeConfigSchema>;
  payment: z.infer<typeof paymentConfigSchema>;
}) {
  // Check if default locale exists in languages
  if (!configs.i18n.languages[configs.i18n.defaultLocale]) {
    throw new Error(`Default locale '${configs.i18n.defaultLocale}' not found in languages configuration`);
  }

  // Check if fallback locale exists in languages
  if (!configs.i18n.languages[configs.i18n.fallbackLocale]) {
    throw new Error(`Fallback locale '${configs.i18n.fallbackLocale}' not found in languages configuration`);
  }

  // Check if default theme exists in themes
  if (!configs.theme.themes.includes(configs.theme.defaultTheme)) {
    throw new Error(`Default theme '${configs.theme.defaultTheme}' not found in themes list`);
  }

  // Check if payment trial plans exist
  if (configs.payment.trial.enabled) {
    const planIds = configs.payment.plans.map(plan => plan.id);
    for (const trialPlanId of configs.payment.trial.plans) {
      if (!planIds.includes(trialPlanId)) {
        throw new Error(`Trial plan '${trialPlanId}' not found in payment plans`);
      }
    }
  }

  // Check if payment is enabled but no plans have stripe price IDs
  if (configs.features.payment.enabled) {
    const paidPlans = configs.payment.plans.filter(plan => plan.price > 0);
    if (paidPlans.length > 0) {
      const missingPriceIds = paidPlans.filter(plan => !plan.stripePriceId);
      if (missingPriceIds.length > 0) {
        console.warn(`Warning: Paid plans missing Stripe price IDs: ${missingPriceIds.map(p => p.id).join(', ')}`);
      }
    }
  }
}

// Environment-specific validation
export function validateEnvironmentConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_APP_URL',
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate payment-specific env vars if payment is enabled
  if (process.env.STRIPE_SECRET_KEY) {
    const stripeVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ];
    
    const missingStripeVars = stripeVars.filter(varName => !process.env[varName]);
    
    if (missingStripeVars.length > 0) {
      throw new Error(`Missing Stripe environment variables: ${missingStripeVars.join(', ')}`);
    }
  }
}

// Configuration health check
export function configHealthCheck() {
  try {
    validateEnvironmentConfig();
    console.log('✅ Environment configuration is valid');
  } catch (error) {
    console.error('❌ Environment configuration error:', error);
    throw error;
  }
}

// Development helper to check configuration
export function devConfigCheck() {
  if (process.env.NODE_ENV === 'development') {
    configHealthCheck();
  }
} 