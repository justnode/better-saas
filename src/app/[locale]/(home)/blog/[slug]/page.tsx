import { getMDXComponents } from '@/components/mdx-components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDate, getBlogPost, getBlogPosts } from '@/lib/fumadocs/blog';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BlogFrontmatter {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const locales = ['en', 'zh'];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const posts = getBlogPosts(locale);
    for (const post of posts) {
      const slug = post.slugs.slice(1).join('/');
      params.push({
        locale,
        slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const post = getBlogPost([slug], locale);

  if (!post) {
    return {
      title: 'Not Found',
    };
  }

  const frontmatter = post.data as BlogFrontmatter;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations('blog');
  const post = getBlogPost([slug], locale);

  if (!post) {
    notFound();
  }

  const frontmatter = post.data as BlogFrontmatter;
  const MDXContent = post.data.body;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/blog`} className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              {t('backToList')}
            </Link>
          </Button>
        </div>

        {/* 文章头部 */}
        <header className="mb-8">
          <h1 className="mb-4 font-bold text-4xl">{frontmatter.title}</h1>

          {frontmatter.description && (
            <p className="mb-6 text-muted-foreground text-xl">{frontmatter.description}</p>
          )}

          <div className="mb-6 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
            {frontmatter.author && (
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span>{frontmatter.author}</span>
              </div>
            )}

            {frontmatter.date && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(frontmatter.date, locale)}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>{t('aboutReadingTime', { time: 5 })}</span>
            </div>
          </div>

          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />
        </header>

        {/* 文章内容 */}
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <MDXContent components={getMDXComponents()} />
        </article>

        {/* 文章底部 */}
        <footer className="mt-12 border-t pt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t('shareArticle')}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/blog`}>{t('backToBlog')}</Link>
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
