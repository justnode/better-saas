import { locales } from '@/i18n/routing';
import { getDocsPages } from '@/lib/fumadocs/docs';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider';
import { getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';
import { i18nConfig } from '@/config/i18n.config';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();

  // Get pages in the correct order using our custom function
  const pages = getDocsPages(locale);

  // Helper function to generate correct URL based on locale prefix setting
  const getLocalizedUrl = (path: string) => {
    if (locale === i18nConfig.defaultLocale && i18nConfig.routing.localePrefix === 'as-needed') {
      // For default locale with 'as-needed', don't include locale prefix
      return path;
    }
    // For non-default locales, include locale prefix
    return `/${locale}${path}`;
  };

  const tree = {
    name: 'Documentation',
    children: pages.map((page) => {
      // For index pages, use the base docs URL
      if (page.file.name === 'index') {
        const url = getLocalizedUrl('/docs');
        return {
          type: 'page' as const,
          name: page.data.title,
          url,
        };
      }
      
      // For other pages, use the full URL
      const pageSlug = page.slugs[page.slugs.length - 1];
      const url = getLocalizedUrl(`/docs/${pageSlug}`);
      return {
        type: 'page' as const,
        name: page.data.title,
        url,
      };
    }),
  };

  const navUrl = getLocalizedUrl('/docs');

  return (
    <RootProvider
      i18n={{
        locale,
        locales,
        translations: messages.Docs,
      }}
      theme={{
        enabled: false,
      }}
    >
      <DocsLayout
        tree={tree}
        nav={{
          title: 'Better SaaS Docs',
          url: navUrl,
        }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
