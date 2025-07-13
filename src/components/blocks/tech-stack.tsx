import { useTranslations } from "next-intl";

interface TechStackProps {
  heading?: string;
  description?: string;
  badge?: string;
}

const TechStack = ({
  heading = 'Build With Modern Stack',
}: TechStackProps) => {
  const t = useTranslations('techstack');
  const techLogos = [
    {
      name: 'Next.js',
      icon: (
        <svg
          width="100%"
          height="100%"
          className="h-8 w-auto stroke-1 md:h-10"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Next.js</title>
          <path
            d="M22.4282 0.012917C22.3249 0.0222998 21.9965 0.0551395 21.7009 0.0785965C14.8833 0.693169 8.49736 4.37122 4.45279 10.0243C2.20059 13.1676 0.760117 16.733 0.215836 20.5096C0.0234604 21.8279 0 22.2173 0 24.0047C0 25.7921 0.0234604 26.1815 0.215836 27.4998C1.52023 36.512 7.93431 44.0839 16.6334 46.8893C18.1912 47.3913 19.8334 47.7338 21.7009 47.9402C22.4282 48.0199 25.5718 48.0199 26.2991 47.9402C29.5226 47.5836 32.2534 46.7861 34.9466 45.4115C35.3595 45.2004 35.4393 45.1441 35.383 45.0972C35.3455 45.0691 33.5859 42.7093 31.4745 39.8569L27.6364 34.6729L22.827 27.5561C20.1806 23.6435 18.0035 20.4439 17.9848 20.4439C17.966 20.4392 17.9472 23.6012 17.9378 27.4623C17.9238 34.2226 17.9191 34.4947 17.8346 34.6542C17.7126 34.884 17.6188 34.9779 17.4217 35.0811C17.2716 35.1561 17.1402 35.1702 16.4317 35.1702H15.6199L15.4041 35.0342C15.2633 34.945 15.1601 34.8277 15.0897 34.6917L14.9912 34.4806L15.0006 25.0743L15.0147 15.6634L15.1601 15.4804C15.2352 15.3819 15.3947 15.2553 15.5073 15.1943C15.6997 15.1004 15.7748 15.0911 16.5865 15.0911C17.5437 15.0911 17.7032 15.1286 17.9519 15.4007C18.0223 15.4757 20.6264 19.3978 23.7419 24.122C26.8575 28.8462 31.1179 35.2969 33.2106 38.4636L37.0111 44.2199L37.2035 44.0932C38.9067 42.9861 40.7085 41.4098 42.1349 39.7678C45.1707 36.2821 47.1273 32.0317 47.7842 27.4998C47.9765 26.1815 48 25.7921 48 24.0047C48 22.2173 47.9765 21.8279 47.7842 20.5096C46.4798 11.4974 40.0657 3.92554 31.3666 1.12009C29.8323 0.622798 28.1994 0.280326 26.3695 0.0739051C25.9191 0.0269912 22.8176 -0.0246142 22.4282 0.012917ZM32.2534 14.5281C32.4786 14.6407 32.6616 14.8565 32.7273 15.0817C32.7648 15.2036 32.7742 17.8121 32.7648 23.6904L32.7507 32.1255L31.2633 29.8455L29.7713 27.5655V21.4338C29.7713 17.4696 29.79 15.2412 29.8182 15.1333C29.8933 14.8706 30.0575 14.6641 30.2827 14.5422C30.4751 14.4436 30.5455 14.4343 31.2821 14.4343C31.9765 14.4343 32.0985 14.4436 32.2534 14.5281Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: 'Shadcn UI',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className="h-8 w-auto stroke-1 md:h-10"
        >
          <title>Radix UI</title>
          <rect width="256" height="256" fill="none" />
          <line
            x1="208"
            y1="128"
            x2="128"
            y2="208"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="32"
          />
          <line
            x1="192"
            y1="40"
            x2="40"
            y2="192"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="32"
          />
        </svg>
      ),
    },
    {
      name: 'TypeScript',
      icon: (
        <svg
          className="h-8 w-auto stroke-1 md:h-10"
          width="100%"
          height="100%"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>TypeScript</title>
          <rect fill="#3178c6" height="512" rx="50" width="512" />
          <rect fill="#3178c6" height="512" rx="50" width="512" />
          <path
            clipRule="evenodd"
            d="m316.939 407.424v50.061c8.138 4.172 17.763 7.3 28.875 9.386s22.823 3.129 35.135 3.129c11.999 0 23.397-1.147 34.196-3.442 10.799-2.294 20.268-6.075 28.406-11.342 8.138-5.266 14.581-12.15 19.328-20.65s7.121-19.007 7.121-31.522c0-9.074-1.356-17.026-4.069-23.857s-6.625-12.906-11.738-18.225c-5.112-5.319-11.242-10.091-18.389-14.315s-15.207-8.213-24.18-11.967c-6.573-2.712-12.468-5.345-17.685-7.9-5.217-2.556-9.651-5.163-13.303-7.822-3.652-2.66-6.469-5.476-8.451-8.448-1.982-2.973-2.974-6.336-2.974-10.091 0-3.441.887-6.544 2.661-9.308s4.278-5.136 7.512-7.118c3.235-1.981 7.199-3.52 11.894-4.615 4.696-1.095 9.912-1.642 15.651-1.642 4.173 0 8.581.313 13.224.938 4.643.626 9.312 1.591 14.008 2.894 4.695 1.304 9.259 2.947 13.694 4.928 4.434 1.982 8.529 4.276 12.285 6.884v-46.776c-7.616-2.92-15.937-5.084-24.962-6.492s-19.381-2.112-31.066-2.112c-11.895 0-23.163 1.278-33.805 3.833s-20.006 6.544-28.093 11.967c-8.086 5.424-14.476 12.333-19.171 20.729-4.695 8.395-7.043 18.433-7.043 30.114 0 14.914 4.304 27.638 12.912 38.172 8.607 10.533 21.675 19.45 39.204 26.751 6.886 2.816 13.303 5.579 19.25 8.291s11.086 5.528 15.415 8.448c4.33 2.92 7.747 6.101 10.252 9.543 2.504 3.441 3.756 7.352 3.756 11.733 0 3.233-.783 6.231-2.348 8.995s-3.939 5.162-7.121 7.196-7.147 3.624-11.894 4.771c-4.748 1.148-10.303 1.721-16.668 1.721-10.851 0-21.597-1.903-32.24-5.71-10.642-3.806-20.502-9.516-29.579-17.13zm-84.159-123.342h64.22v-41.082h-179v41.082h63.906v182.918h50.874z"
            fill="#fff"
            fillRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Tailwind CSS',
      icon: (
        <svg
          width="100%"
          height="100%"
          className="h-8 w-auto fill-foreground stroke-1 md:h-10"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Tailwind CSS</title>
          <path
            d="M23.9988 10C17.5991 10 13.5994 13.1999 11.9997 19.6001C14.3997 16.3997 17.1998 15.1997 20.3997 16C22.2254 16.456 23.5302 17.7812 24.9747 19.2471C27.3276 21.6353 30.0511 24.3997 35.9994 24.3997C42.3991 24.3997 46.3989 21.1998 47.999 14.7996C45.599 17.9999 42.7988 19.1999 39.599 18.3996C37.7733 17.9437 36.4685 16.6184 35.024 15.1526C32.6707 12.7643 29.9476 10 23.9988 10ZM11.9997 24.3997C5.5999 24.3997 1.60017 27.5995 0 33.9997C2.40002 30.7994 5.19975 29.5994 8.39962 30.3997C10.2257 30.8566 11.5301 32.1809 12.9746 33.6468C15.3275 36.035 18.0514 38.7993 23.9993 38.7993C30.3995 38.7993 34.3992 35.5994 35.9994 29.1992C33.5994 32.3996 30.7992 33.5996 27.5993 32.7993C25.7737 32.3433 24.4689 31.0181 23.0243 29.5527C20.6715 27.164 17.948 24.3997 11.9997 24.3997Z"
            fill="#38BDF8"
          />
        </svg>
      ),
    },
    {
      name: 'Fumadoc',
      icon: (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 180 180"
          className="h-8 w-auto stroke-1 md:h-10"
          fill="currentColor"
        >
          <title>Fumadoc</title>
          <circle
            cx="90"
            cy="90"
            r="89"
            fill="url(#«r4»-iconGradient)"
            stroke="var(--color-fd-primary)"
            strokeWidth="1"
          />
          <defs>
            <linearGradient id="«r4»-iconGradient" gradientTransform="rotate(45)">
              <stop offset="45%" stopColor="var(--color-fd-background)" />
              <stop offset="100%" stopColor="var(--color-fd-primary)" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      name: 'Better Auth',
      icon: (
        <svg
          width="100%"
          height="100%"
          className="h-8 w-auto stroke-1 md:h-10"
          viewBox="0 0 60 45"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Better Auth</title>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            fill="currentColor"
            d="M0 0H15V15H30V30H15V45H0V30V15V0ZM45 30V15H30V0H45H60V15V30V45H45H30V30H45Z"
          />
        </svg>
      ),
    },
    {
      name: 'Drizzle',
      icon: (
        <svg
          width="100%"
          height="100%"
          className="h-8 w-12 stroke-1 md:h-10"
          viewBox="0 0 100 53"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Drizzle</title>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M50.7023 0.926339C52.7965 2.09615 53.5273 4.73165 52.3346 6.8129L38.3341 31.2437C37.1414 33.3249 34.4768 34.0638 32.3826 32.894C30.2884 31.7242 29.5576 29.0887 30.7503 27.0074L44.7509 2.57665C45.9436 0.495397 48.6081 -0.243471 50.7023 0.926339ZM20.5246 19.6607C22.6188 20.8305 23.3496 23.466 22.1569 25.5473L8.15636 49.9781C6.96366 52.0593 4.2991 52.7982 2.2049 51.6284C0.110706 50.4585 -0.620101 47.823 0.572601 45.7418L14.5731 21.311C15.7658 19.2298 18.4304 18.4909 20.5246 19.6607ZM98.7692 6.8129C99.9619 4.73165 99.2311 2.09615 97.1369 0.926339C95.0427 -0.243471 92.3782 0.495397 91.1854 2.57665L77.1849 27.0074C75.9922 29.0887 76.723 31.7242 78.8172 32.894C80.9114 34.0638 83.576 33.3249 84.7687 31.2437L98.7692 6.8129ZM66.9494 19.6607C69.0436 20.8305 69.7744 23.466 68.5817 25.5473L54.5812 49.9781C53.3885 52.0593 50.7239 52.7982 48.6297 51.6284C46.5355 50.4585 45.8047 47.823 46.9974 45.7418L60.9979 21.311C62.1906 19.2298 64.8552 18.4909 66.9494 19.6607Z"
            fill="url(#paint0_linear_1913_43)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_1913_43"
              x1="0.146485"
              y1="51.918"
              x2="106.646"
              y2="-0.0820361"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#C14239" />
              <stop offset="1" stopColor="#CC54C1" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-gradient-to-b from-background to-muted/20 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="mb-4">{t('heading')}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 transition-opacity duration-500 md:gap-12 lg:gap-16">
          {techLogos.map((tech, index) => (
            <div
              key={tech.name}
              className="group flex cursor-pointer flex-col items-center"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="rounded-2xl border border-border/50 bg-background/50 p-4 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-primary/20 group-hover:bg-background/80 group-hover:shadow-lg">
                <div className="text-foreground transition-colors duration-300 group-hover:text-foreground/80">
                  {tech.icon}
                </div>
              </div>
              <span className="mt-3 font-medium text-foreground text-sm transition-colors duration-300 group-hover:text-muted-foreground">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { TechStack };
