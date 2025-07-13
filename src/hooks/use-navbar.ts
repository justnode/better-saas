
import { useParams, useRouter } from 'next/navigation';
import { useAuthInitialized, useAuthLoading, useIsAuthenticated } from '@/store/auth-store';
import { useNavbarConfig } from '@/hooks/use-config';
import { Book, Sunset, Trees, Zap } from 'lucide-react';
import { createElement } from 'react';
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

// Convert config menu item to component menu item
const convertMenuItem = (item: NavbarMenuItem, locale: string, handlePricingClick: () => void): MenuItem => {
  const baseItem: MenuItem = {
    title: item.title,
    url: item.url.startsWith('/') ? `/${locale}${item.url}` : item.url,
    description: item.description,
    icon: getIconComponent(item.icon),
  };

  // Handle special onClick handlers
  if (item.onClick === 'handlePricingClick') {
    baseItem.onClick = handlePricingClick;
  }

  // Convert sub-items recursively
  if (item.items) {
    baseItem.items = item.items.map(subItem => convertMenuItem(subItem, locale, handlePricingClick));
  }

  return baseItem;
};

export function useNavbar(): UseNavbarReturn {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';

  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const isInitialized = useAuthInitialized();

  // Get navbar configuration
  const config = useNavbarConfig();

  // Logo configuration from config
  const logo: LogoConfig = config.logo;

  // Auth configuration from config with locale prefix
  const auth: AuthConfig = {
    login: {
      text: config.auth.login.text,
      url: `/${locale}${config.auth.login.url}`
    },
    signup: {
      text: config.auth.signup.text,
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

  // Menu configuration from config
  const menu: MenuItem[] = config.menu.items.map(item =>
    convertMenuItem(item, locale, handlePricingClick)
  );

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