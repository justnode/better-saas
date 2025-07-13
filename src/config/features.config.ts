import type { FeaturesConfig } from "@/types";


export const featuresConfig: FeaturesConfig = {
  // Authentication features
  auth: {
    enabled: true,
    providers: {
      email: true,
      github: true,
      google: true,
    },
    session: {
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    passwordReset: true,
    emailVerification: true,
  },

  // Payment features
  payment: {
    enabled: true,
    provider: 'stripe',
    currency: 'usd',
    trial: {
      enabled: true,
      days: 14,
    },
  },

  // File management features
  fileManager: {
    enabled: true,
    storage: 'r2',
    thumbnails: true,
    imageProcessing: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  },

  // Blog features
  blog: {
    enabled: true,
    commentsEnabled: false,
    tagsEnabled: true,
    authorsEnabled: true,
    searchEnabled: true,
  },

  // Documentation features
  docs: {
    enabled: true,
    searchEnabled: true,
    editOnGithub: true,
    tableOfContents: true,
    breadcrumbs: true,
  },

  // Analytics features
  analytics: {
    enabled: true,
    provider: 'vercel',
    trackingId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  },

  // Notification features
  notifications: {
    enabled: true,
    emailNotifications: true,
    pushNotifications: false,
    inAppNotifications: true,
  },

  // Dashboard features
  dashboard: {
    enabled: true,
    widgets: {
      analytics: true,
      recentActivity: true,
      quickActions: true,
      notifications: true,
    },
  },

  // Admin features
  admin: {
    enabled: true,
    userManagement: true,
    systemSettings: true,
    analytics: true,
  },
}; 