import { locales } from '@/i18n/routing';
import { buildDocsTree } from '@/lib/fumadocs/docs';
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

  // Get the nested tree structure
  const treeItems = buildDocsTree(locale);

  // Helper function to generate correct URL based on locale prefix setting
  const getLocalizedUrl = (path: string) => {
    if (locale === i18nConfig.defaultLocale && i18nConfig.routing.localePrefix === 'as-needed') {
      // For default locale with 'as-needed', don't include locale prefix
      return path;
    }
    // For non-default locales, include locale prefix
    return `/${locale}${path}`;
  };

  // Convert tree items to fumadocs format recursively
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertTreeItems = (items: typeof treeItems): any[] => {
    return items.map((item) => {
      if (item.type === 'folder') {
        return {
          type: 'folder',
          name: item.name,
          defaultOpen: item.defaultOpen,
          children: item.children ? convertTreeItems(item.children) : []
        };
      }
      return {
        type: 'page',
        name: item.name,
        url: getLocalizedUrl(item.url || '')
      };
    });
  };

  const tree = {
    name: 'Documentation',
    children: convertTreeItems(treeItems)
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
