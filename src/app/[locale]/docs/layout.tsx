import { locales } from '@/i18n/routing';
import { getDocsPages } from '@/lib/fumadocs/docs';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider';
import { getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();

  const pages = getDocsPages(locale);

  const tree = {
    name: 'Documentation',
    children: pages.map((page) => ({
      type: 'page' as const,
      name: page.data.title,
      url: `/${locale}/docs/${page.slugs.slice(1).join('/')}`,
      external: false,
    })),
  };

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
          url: `/${locale}/docs`,
        }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
