
import { useParams, useRouter } from 'next/navigation';
import { useAuthInitialized, useAuthLoading, useIsAuthenticated } from '@/store/auth-store';
import type { UseNavbarReturn, LogoConfig, AuthConfig, MenuItem } from '@/types/navbar';

export function useNavbar(): UseNavbarReturn {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';
  
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const isInitialized = useAuthInitialized();

  // Logo configuration
  const logo: LogoConfig = {
    url: '/',
    src: '/icons/apple-touch-icon.png',
    alt: 'logo',
    title: 'Better SaaS',
  };

  // Auth configuration
  const auth: AuthConfig = {
    login: { text: 'Log in', url: '/login' },
    signup: { text: 'Sign up', url: '/signup' },
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

  // Menu configuration (icons will be created in components)
  const menu: MenuItem[] = [
    { title: 'Blog', url: `/${locale}/blog` },
    {
      title: 'Document',
      url: `/${locale}/docs`,
    },
    {
      title: 'Components',
      url: `/${locale}/blocks`,
    },
    {
      title: 'Pricing',
      url: `/${locale}#pricing`,
      onClick: handlePricingClick,
    },
    {
      title: 'Resources',
      url: '#',
      items: [
        {
          title: 'Help Center',
          description: 'Get all the answers you need right here',
          url: '#',
        },
        {
          title: 'Contact Us',
          description: 'We are here to help you with any questions you have',
          url: '#',
        },
        {
          title: 'Status',
          description: 'Check the current status of our services and APIs',
          url: '#',
        },
        {
          title: 'Terms of Service',
          description: 'Our terms and conditions for using our services',
          url: '#',
        },
      ],
    }
    
  ];

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