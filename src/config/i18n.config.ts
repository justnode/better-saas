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

export const i18nConfig: I18nConfig = {
  // Supported languages
  locales: ['en', 'zh'] as const,
  
  // Default language
  defaultLocale: 'en',
  
  // Fallback language
  fallbackLocale: 'en',
  
  // Language configurations
  languages: {
    en: {
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      dir: 'ltr',
      enabled: true,
    },
    zh: {
      name: 'Chinese',
      nativeName: '中文',
      flag: '🇨🇳',
      dir: 'ltr',
      enabled: true,
    },
  },

  // Routing configuration
  routing: {
    localePrefix: 'as-needed',
    localeDetection: false,
    // Optional: domain-based routing
    // domains: {
    //   en: 'example.com',
    //   zh: 'example.com/zh',
    // },
  },

  // Translation namespaces
  namespaces: [
    'common',
    'auth',
    'dashboard',
    'toast',
    'sidebar',
    'userMenu',
    'settings',
    'profile',
    'security',
    'faq',
    'blog',
    'blocks',
    'legal'
  ],

  // Date and time formats for each locale
  dateTimeFormats: {
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      medium: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short',
      },
    },
    zh: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      medium: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short',
      },
    },
  },

  // Number formats for each locale
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      },
    },
    zh: {
      currency: {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 2,
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      },
    },
  },
}; 