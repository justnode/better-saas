import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { appConfig, featuresConfig, i18nConfig, themeConfig, paymentConfig, navbarConfig } from '@/config';
import type {
  AppConfig,
  FeaturesConfig,
  I18nConfig,
  ThemeConfig,
  PaymentConfig,
  PaymentPlan,
  NavbarConfig,
} from '@/types';

/**
 * Hook to access application configuration
 */
export function useAppConfig(): AppConfig {
  return useMemo(() => appConfig, []);
}

/**
 * Hook to access features configuration
 */
export function useFeaturesConfig(): FeaturesConfig {
  return useMemo(() => featuresConfig, []);
}

/**
 * Hook to access internationalization configuration
 */
export function useI18nConfig(): I18nConfig {
  return useMemo(() => i18nConfig, []);
}

/**
 * Hook to access theme configuration
 */
export function useThemeConfig(): ThemeConfig {
  return useMemo(() => themeConfig, []);
}

/**
 * Hook to access payment configuration
 */
export function usePaymentConfig(): PaymentConfig {
  return useMemo(() => paymentConfig, []);
}

/**
 * Hook to access navbar configuration
 */
export function useNavbarConfig(): NavbarConfig {
  return useMemo(() => navbarConfig, []);
}

/**
 * Hook to get current locale configuration
 */
export function useCurrentLocaleConfig() {
  const locale = useLocale();
  const config = useI18nConfig();

  return useMemo(() => {
    const language = config.languages[locale];
    const dateTimeFormat = config.dateTimeFormats[locale];
    const numberFormat = config.numberFormats[locale];

    return {
      locale,
      language,
      dateTimeFormat,
      numberFormat,
      isRTL: language?.dir === 'rtl',
      isDefault: locale === config.defaultLocale,
    };
  }, [locale, config]);
}

/**
 * Hook to check if a feature is enabled
 */
export function useFeatureFlag(feature: string): boolean {
  const config = useFeaturesConfig();

  return useMemo(() => {
    const keys = feature.split('.');
    let current: unknown = config;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return false;
      }
    }

    return Boolean(current);
  }, [feature, config]);
}

/**
 * Hook to get enabled payment plans
 */
export function usePaymentPlans() {
  const config = usePaymentConfig();

  return useMemo(() => {
    return config.plans.filter((plan: PaymentPlan) => {
      // Always include free plan
      if (plan.id === 'free') return true;

      // Check if payment features are enabled
      return config.features.subscriptions || config.features.oneTimePayments;
    });
  }, [config]);
}

/**
 * Hook to get a specific payment plan
 */
export function usePaymentPlan(planId: string) {
  const config = usePaymentConfig();

  return useMemo(() => {
    return config.plans.find((plan: PaymentPlan) => plan.id === planId);
  }, [planId, config]);
}

/**
 * Hook to get theme colors
 */
export function useThemeColors() {
  const config = useThemeConfig();

  return useMemo(() => config.colors, [config]);
}

/**
 * Hook to get responsive breakpoints
 */
export function useBreakpoints() {
  const config = useThemeConfig();

  return useMemo(() => config.breakpoints, [config]);
}

/**
 * Hook to get admin configuration
 */
export function useAdminConfig() {
  const appConf = useAppConfig();
  const featuresConf = useFeaturesConfig();

  return useMemo(
    () => ({
      emails: appConf.admin.emails,
      features: featuresConf.admin,
    }),
    [appConf, featuresConf]
  );
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(userEmail?: string | null): boolean {
  const { emails } = useAdminConfig();

  return useMemo(() => {
    if (!userEmail || emails.length === 0) return false;
    return emails.includes(userEmail);
  }, [userEmail, emails]);
}

/**
 * Hook to get upload configuration
 */
export function useUploadConfig() {
  const appConf = useAppConfig();
  const featuresConf = useFeaturesConfig();

  return useMemo(
    () => ({
      ...appConf.upload,
      ...featuresConf.fileManager,
    }),
    [appConf, featuresConf]
  );
}

/**
 * Hook to get pagination configuration
 */
export function usePaginationConfig() {
  const config = useAppConfig();

  return useMemo(() => config.pagination, [config]);
}

/**
 * Hook to get metadata configuration for SEO
 */
export function useMetadataConfig() {
  const config = useAppConfig();

  return useMemo(() => config.metadata, [config]);
}

/**
 * Hook to get all enabled languages
 */
export function useEnabledLanguages() {
  const config = useI18nConfig();

  return useMemo(() => {
    return config.locales
      .filter((locale: string) => config.languages[locale]?.enabled)
      .map((locale: string) => ({
        locale,
        ...config.languages[locale],
      }));
  }, [config]);
}

/**
 * Hook to format currency based on locale
 */
export function useCurrencyFormatter() {
  const { locale, numberFormat } = useCurrentLocaleConfig();

  return useMemo(() => {
    return (amount: number, currency?: string) => {
      const formatOptions = {
        ...numberFormat?.currency,
        ...(currency && { currency }),
      };

      return new Intl.NumberFormat(locale, formatOptions).format(amount);
    };
  }, [locale, numberFormat]);
}

/**
 * Hook to format date based on locale
 */
export function useDateFormatter() {
  const { locale, dateTimeFormat } = useCurrentLocaleConfig();

  return useMemo(() => {
    return {
      short: (date: Date) => new Intl.DateTimeFormat(locale, dateTimeFormat?.short).format(date),
      medium: (date: Date) => new Intl.DateTimeFormat(locale, dateTimeFormat?.medium).format(date),
      long: (date: Date) => new Intl.DateTimeFormat(locale, dateTimeFormat?.long).format(date),
    };
  }, [locale, dateTimeFormat]);
}
