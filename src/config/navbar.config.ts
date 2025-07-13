import type { NavbarConfig } from '@/types';

export const navbarConfig: NavbarConfig = {
  // Logo configuration
  logo: {
    url: '/',
    src: '/icons/apple-touch-icon.png',
    alt: 'logo',
    title: 'Better SaaS',
  },

  // Authentication configuration
  auth: {
    login: { 
      text: 'Log in', 
      url: '/login' 
    },
    signup: { 
      text: 'Sign up', 
      url: '/signup' 
    },
  },

  // Menu configuration
  menu: {
    items: [
      { 
        title: 'Blog', 
        url: '/blog' // Will be prefixed with locale in hook
      },
      {
        title: 'Document',
        url: '/docs',
      },
      {
        title: 'Components',
        url: '/blocks',
      },
      {
        title: 'Pricing',
        url: '#pricing',
        onClick: 'handlePricingClick', // Special handler
      },
      {
        title: 'Resources',
        url: '#',
        items: [
          {
            title: 'Help Center',
            description: 'Get all the answers you need right here',
            url: '#',
            icon: 'Zap',
          },
          {
            title: 'Contact Us',
            description: 'We are here to help you with any questions you have',
            url: '#',
            icon: 'Sunset',
          },
          {
            title: 'Status',
            description: 'Check the current status of our services and APIs',
            url: '#',
            icon: 'Trees',
          },
          {
            title: 'Terms of Service',
            description: 'Our terms and conditions for using our services',
            url: '#',
            icon: 'Book',
          },
        ],
      },
    ],
  },
};
