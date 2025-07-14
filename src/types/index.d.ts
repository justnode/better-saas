import type { PaymentInterval } from '@/payment/types';

export interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
    url: string;
    domain: string;
  };
  metadata: {
    title: {
      default: string;
      template: string;
    };
    description: string;
    keywords: string[];
    authors: Array<{ name: string; url?: string }>;
    creator: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
    openGraph: {
      type: string;
      locale: string;
      url: string;
      siteName: string;
    };
    twitter: {
      card: string;
      creator: string;
    };
  };
  admin: {
    emails: string[];
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    maxFiles: number;
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
}

export interface I18nConfig {
  locales: readonly string[];
  defaultLocale: string;
  languages: Record<string, {
    name: string;
    nativeName: string;
    flag: string;
    dir: 'ltr' | 'rtl';
    enabled: boolean;
  }>;
  routing: {
    localePrefix: 'always' | 'as-needed' | 'never';
    localeDetection: boolean;
    domains?: Record<string, string>;
  };
  namespaces: string[];
  fallbackLocale: string;
  dateTimeFormats: Record<string, {
    short: Intl.DateTimeFormatOptions;
    medium: Intl.DateTimeFormatOptions;
    long: Intl.DateTimeFormatOptions;
  }>;
  numberFormats: Record<string, {
    currency: Intl.NumberFormatOptions;
    decimal: Intl.NumberFormatOptions;
    percent: Intl.NumberFormatOptions;
  }>;
}

export interface FeaturesConfig {
  auth: {
    enabled: boolean;
    providers: {
      email: boolean;
      github: boolean;
      google: boolean;
    };
    session: {
      maxAge: number;
    };
    passwordReset: boolean;
    emailVerification: boolean;
  };
  payment: {
    enabled: boolean;
    provider: 'stripe';
    currency: string;
    trial: {
      enabled: boolean;
      days: number;
    };
  };
  fileManager: {
    enabled: boolean;
    storage: 'r2' | 's3';
    thumbnails: boolean;
    imageProcessing: boolean;
    maxFileSize: number;
    allowedTypes: string[];
  };
  blog: {
    enabled: boolean;
    commentsEnabled: boolean;
    tagsEnabled: boolean;
    authorsEnabled: boolean;
    searchEnabled: boolean;
  };
  docs: {
    enabled: boolean;
    searchEnabled: boolean;
    editOnGithub: boolean;
    tableOfContents: boolean;
    breadcrumbs: boolean;
  };
  analytics: {
    enabled: boolean;
    provider: 'vercel' | 'google' | 'plausible';
    trackingId?: string;
  };
  notifications: {
    enabled: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean;
  };
  dashboard: {
    enabled: boolean;
    widgets: {
      analytics: boolean;
      recentActivity: boolean;
      quickActions: boolean;
      notifications: boolean;
    };
  };
  admin: {
    enabled: boolean;
    userManagement: boolean;
    systemSettings: boolean;
    analytics: boolean;
  };
}

export interface ThemeConfig {
  defaultTheme: 'light' | 'dark' | 'system';
  themes: readonly string[];
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    accent: Record<string, string>;
    neutral: Record<string, string>;
    success: Record<string, string>;
    warning: Record<string, string>;
    error: Record<string, string>;
    info: Record<string, string>;
  };
  fonts: {
    sans: string[];
    mono: string[];
    serif: string[];
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  zIndex: {
    dropdown: number;
    modal: number;
    popover: number;
    tooltip: number;
    toast: number;
  };
}

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: PaymentInterval;
  stripePriceId?: string;
  stripePriceIds?: {
    monthly?: string;
    yearly?: string;
  };
  // Add yearly price for plans that support both monthly and yearly billing
  yearlyPrice?: number;
  features: string[];
  popular?: boolean;
  metadata?: Record<string, string>;
  limits?: {
    storage?: number; // in GB
    users?: number;
    projects?: number;
    apiCalls?: number;
  };
}

export interface PaymentConfig {
  provider: 'stripe';
  currency: string;
  stripe: {
    secretKey: string;
    webhookSecret: string;
    apiVersion: string;
  };
  plans: PaymentPlan[];
  trial: {
    enabled: boolean;
    days: number;
    plans: string[]; // plan IDs that support trial
  };
  invoice: {
    footer: string;
    logo?: string;
    supportEmail: string;
  };
  billing: {
    collectTaxId: boolean;
    allowPromotionCodes: boolean;
    automaticTax: boolean;
  };
  features: {
    subscriptions: boolean;
    oneTimePayments: boolean;
    invoices: boolean;
    customerPortal: boolean;
    webhooks: boolean;
  };
}


export interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }> | string;
}

// Navbar configuration types
export interface NavbarConfig {
  logo: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  auth: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
  menu: {
    items: NavbarMenuItem[];
  };
}

export interface NavbarMenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: string; // Icon name for config, will be resolved to JSX.Element in component
  items?: NavbarMenuItem[];
  onClick?: string; // Function name for special handlers like 'handlePricingClick'
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
}

export interface ProtectedSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  sidebarGroups: SidebarGroup[];
}

export interface ProtectedContainerProps {
  children: React.ReactNode;
  sidebarGroups: SidebarGroup[];
}

// Better Auth type extensions
declare module 'better-auth/types' {
  interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    role?: string | null;
    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: Date | null;
  }
}

