import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, getBlogPosts } from '@/lib/fumadocs/blog';
import { CalendarIcon, ClockIcon, UserIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface BlogFrontmatter {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('blog');
  const posts = getBlogPosts(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl">{t('title')}</h1>
          <p className="text-muted-foreground text-xl">{t('description')}</p>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => {
            const frontmatter = post.data as BlogFrontmatter;

            return (
              <Card key={post.url} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-2xl">
                        <Link
                          href={`/${locale}/blog/${post.slugs.slice(1).join('/')}`}
                          className="transition-colors hover:text-primary"
                        >
                          {frontmatter.title}
                        </Link>
                      </CardTitle>
                      {frontmatter.description && (
                        <CardDescription className="text-base">
                          {frontmatter.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
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
                </CardHeader>

                {frontmatter.tags && frontmatter.tags.length > 0 && (
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {frontmatter.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">{t('noArticles')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
