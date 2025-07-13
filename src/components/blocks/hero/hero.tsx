import { Star } from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface HeroProps {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
  reviews?: {
    count: number;
    avatars: {
      src: string;
      alt: string;
    }[];
  };
}

const Hero = ({
  heading,
  description,
  button,
  reviews,
}: HeroProps) => {
  const t = useTranslations('hero');

  // 使用i18n翻译或传入的props
  const finalHeading = heading || t('heading');
  const finalDescription = description || t('description');
  const finalButton = button || {
    text: t('buttonText'),
    url: t('buttonUrl'),
  };
  const finalReviews = reviews || {
    count: 200,
    avatars: [
      {
        src: '/avatar/1.png',
        alt: t('avatarAlt', { index: 1 }),
      },
      {
        src: '/avatar/2.png',
        alt: t('avatarAlt', { index: 2 }),
      },
      {
        src: '/avatar/3.png',
        alt: t('avatarAlt', { index: 3 }),
      },
      {
        src: '/avatar/4.png',
        alt: t('avatarAlt', { index: 4 }),
      },
      {
        src: '/avatar/5.png',
        alt: t('avatarAlt', { index: 5 }),
      },
    ],
  };
  return (
    <section className="pt-24">
      <div className="container text-center">
        <div className="mx-auto flex max-w-screen-lg flex-col gap-6">
          <h1 className="font-extrabold text-3xl lg:text-6xl">{finalHeading}</h1>
          <p className="text-balance text-muted-foreground lg:text-lg">{finalDescription}</p>
        </div>
        <Button asChild size="lg" className="mt-10">
          <a href={finalButton.url}>{finalButton.text}</a>
        </Button>
        <div className="mx-auto mt-10 flex w-fit flex-col items-center gap-4 sm:flex-row">
          <span className="-space-x-3 mx-4 inline-flex items-center">
            {finalReviews.avatars.map((avatar) => (
              <Avatar key={avatar.src} className="size-14 border bg-white">
                <AvatarImage src={avatar.src} alt={avatar.alt} />
              </Avatar>
            ))}
          </span>
          <div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <Star key={index} className="size-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-left font-medium text-muted-foreground">
              {t('reviewsText', { count: finalReviews.count })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
