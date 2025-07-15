import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import type { InferMetaType, InferPageType } from 'fumadocs-core/source';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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

interface MetaConfig {
  title?: string;
  pages?: string[];
}

function getMetaConfig(locale: string): MetaConfig | null {
  try {
    const metaPath = join(process.cwd(), 'src/content/docs', locale, 'meta.json');
    const metaContent = readFileSync(metaPath, 'utf-8');
    const config = JSON.parse(metaContent) as MetaConfig;
    return config;
  } catch (error) {
    return null;
  }
}

export function getDocsPages(locale = 'en'): DocsPage[] {
  const allPages = docsSource.getPages();
  
  const filteredPages = allPages.filter((page) => {
    const urlParts = page.url.split('/');
    const pageLocale = urlParts[2];
    return pageLocale === locale && page.file.name !== 'meta';
  });

  // Get meta configuration for ordering
  const metaConfig = getMetaConfig(locale);
  
  if (metaConfig?.pages) {
    // Create a map for quick lookup
    const pageMap = new Map<string, DocsPage>();
    for (const page of filteredPages) {
      // For index pages, the slug array is ['en'] or ['zh'], we need to map this to 'index'
      if (page.slugs.length === 1 && page.file.name === 'index') {
        pageMap.set('index', page);
      } else {
        const pageSlug = page.slugs[page.slugs.length - 1];
        if (pageSlug) {
          pageMap.set(pageSlug, page);
        }
      }
    }
    
    // Order pages according to meta.json
    const orderedPages: DocsPage[] = [];
    for (const pageSlug of metaConfig.pages) {
      const page = pageMap.get(pageSlug);
      if (page) {
        orderedPages.push(page);
        pageMap.delete(pageSlug);
      }
    }
    
    // Add any remaining pages that weren't in meta.json
    for (const remainingPage of pageMap.values()) {
      orderedPages.push(remainingPage);
    }
    
    return orderedPages;
  }

  // Default sorting if no meta.json
  return filteredPages.sort((a, b) => {
    // Put index page first
    if (a.slugs.includes('index')) return -1;
    if (b.slugs.includes('index')) return 1;
    
    // Then sort by title
    const titleA = a.data.title || '';
    const titleB = b.data.title || '';
    return titleA.localeCompare(titleB);
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

