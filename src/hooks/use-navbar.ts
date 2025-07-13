
import { useParams, useRouter } from 'next/navigation';
import { useAuthInitialized, useAuthLoading, useIsAuthenticated } from '@/store/auth-store';
import { useNavbarConfig } from '@/hooks/use-config';
import { Book, Sunset, Trees, Zap } from 'lucide-react';
import { createElement } from 'react';
import { useTranslations } from 'next-intl';
import type { UseNavbarReturn, LogoConfig, AuthConfig, MenuItem } from '@/types/navbar';
import type { NavbarMenuItem } from '@/types';
import type { JSX } from 'react';

// Icon mapping function
const getIconComponent = (iconName?: string): JSX.Element | undefined => {
  if (!iconName) return undefined;

  const iconProps = { className: "size-5 shrink-0" };

  switch (iconName) {
    case 'Book':
      return createElement(Book, iconProps);
    case 'Sunset':
      return createElement(Sunset, iconProps);
    case 'Trees':
      return createElement(Trees, iconProps);
    case 'Zap':
      return createElement(Zap, iconProps);
    default:
      return undefined;
  }
};

// Translation helper function
const translateMenuItem = (item: NavbarMenuItem, t: (key: string) => string, locale: string): MenuItem => {
  return {
    title: t(item.title),
    url: item.url.startsWith('#') ? item.url : `/${locale}${item.url}`,
    description: item.description ? t(item.description) : undefined,
    icon: getIconComponent(item.icon),
    items: item.items?.map(subItem => translateMenuItem(subItem, t, locale)),
    onClick: item.onClick ? () => {} : undefined, // Will be handled in component
  };
};



export function useNavbar(): UseNavbarReturn {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';
  const t = useTranslations('navbar');

  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const isInitialized = useAuthInitialized();

  // Get navbar configuration
  const config = useNavbarConfig();

  // Logo configuration with i18n
  const logo: LogoConfig = {
    url: config.logo.url,
    src: config.logo.src,
    alt: t(config.logo.alt),
    title: t(config.logo.title),
  };

  // Auth configuration with i18n and locale prefix
  const auth: AuthConfig = {
    login: {
      text: t(config.auth.login.text),
      url: `/${locale}${config.auth.login.url}`
    },
    signup: {
      text: t(config.auth.signup.text),
      url: `/${locale}${config.auth.signup.url}`
    },
  };

  // Function to smooth scroll to specified element
  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Handle pricing click event
  const handlePricingClick = () => {
    const currentPath = window.location.pathname;
    const homePath = `/${locale}`;

    if (currentPath === homePath || currentPath === `${homePath}/`) {
      scrollToElement('pricing');
    } else {
      router.push(`${homePath}#pricing`);
      setTimeout(() => {
        scrollToElement('pricing');
      }, 100);
    }
  };

  // Menu configuration with i18n
  const menu: MenuItem[] = config.menu.items.map(item => {
    const translatedItem = translateMenuItem(item, t, locale);

    // Handle special onClick handlers
    if (item.onClick === 'handlePricingClick') {
      translatedItem.onClick = handlePricingClick;
    }

    return translatedItem;
  });

  return {
    logo,
    menu,
    auth,
    locale,
    isAuthenticated,
    isLoading,
    isInitialized,
    handlePricingClick,
  };
} 