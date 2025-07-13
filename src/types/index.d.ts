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

export interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }> | string;
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

