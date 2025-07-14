import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import type { InferMetaType, InferPageType } from 'fumadocs-core/source';

export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

export type DocsMeta = InferMetaType<typeof docsSource>;
export type DocsPage = InferPageType<typeof docsSource>;

interface DocsFrontmatter {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
}

export function getDocsPages(locale = 'en'): DocsPage[] {
  const allPages = docsSource.getPages();

  const filteredPages = allPages.filter((page) => {
    const urlParts = page.url.split('/');
    const pageLocale = urlParts[2];
    return pageLocale === locale;
  });

  return filteredPages.sort((a, b) => {
    const frontmatterA = a.data as DocsFrontmatter;
    const frontmatterB = b.data as DocsFrontmatter;
    return frontmatterA.title.localeCompare(frontmatterB.title);
  });
}

export function getDocsPage(slug: string[], locale = 'en'): DocsPage | undefined {
  const fullSlug = [locale, ...slug];
  return docsSource.getPage(fullSlug);
}

export function getDocsPageTree(locale = 'en') {
  const pages = getDocsPages(locale);
  return pages;
}
