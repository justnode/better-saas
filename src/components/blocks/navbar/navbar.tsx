'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSwitcher } from '@/components/widget/language-switcher';
import { ThemeToggle } from '@/components/widget/theme-toggle';
import { UserAvatarMenu } from '@/components/widget/user-avatar-menu';
import { Book, Menu, Sunset, Trees, Zap } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import type { NavbarProps, MenuItem } from '@/types/navbar';

function DesktopAuthDisplay({
  loginText,
  loginUrl,
  signupText,
  signupUrl,
  isAuthenticated,
  isLoading,
  isInitialized,
}: {
  loginText: string;
  loginUrl: string;
  signupText: string;
  signupUrl: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}) {
  // Zustand ensure state remains consistent on both server side and client side.
  if (!isInitialized || isLoading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (isAuthenticated) {
    return <UserAvatarMenu />;
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost">
        <Link href={loginUrl}>{loginText}</Link>
      </Button>
      <Button asChild>
        <Link href={signupUrl}>{signupText}</Link>
      </Button>
    </div>
  );
}

function MobileAuthDisplay({
  loginText,
  loginUrl,
  signupText,
  signupUrl,
  isAuthenticated,
  isLoading,
  isInitialized,
}: {
  loginText: string;
  loginUrl: string;
  signupText: string;
  signupUrl: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}) {
  // Keep the same loading state as the desktop side.
  if (!isInitialized || isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <UserAvatarMenu />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button asChild variant="ghost" className="w-full justify-start">
        <Link href={loginUrl}>{loginText}</Link>
      </Button>
      <Button asChild className="w-full justify-start">
        <Link href={signupUrl}>{signupText}</Link>
      </Button>
    </div>
  );
}

const Navbar = ({
  logo,
  menu,
  auth,
  locale,
  isAuthenticated,
  isLoading,
  isInitialized,
  onPricingClick,
}: NavbarProps) => {
  // Menu items are already processed with icons in useNavbar hook
  const menuWithIcons: MenuItem[] = menu;

  const menuItems = menuWithIcons;

      // Render desktop menu items
  const renderMenuItem = (item: MenuItem) => {
    if (item.items && item.items.length > 0) {
      return (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {item.items.map((subItem) => (
                <li key={subItem.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={subItem.url}
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="flex items-center gap-2 font-medium text-sm leading-none">
                        {subItem.icon}
                        {subItem.title}
                      </div>
                      <p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
                        {subItem.description}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }

    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuLink asChild>
          <Link
            href={item.url}
            onClick={(e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              } else if (item.url === '#pricing') {
                e.preventDefault();
                onPricingClick();
              }
            }}
            className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
          >
            {item.title}
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  };

  // 渲染移动端菜单项
  const renderMobileMenuItem = (item: MenuItem) => {
    if (item.items && item.items.length > 0) {
      return (
        <AccordionItem key={item.title} value={item.title} className="border-b-0">
          <AccordionTrigger className="py-2 text-left">{item.title}</AccordionTrigger>
          <AccordionContent className="pb-2">
            <div className="grid gap-2">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.title}
                  href={subItem.url}
                  className="flex items-start gap-2 rounded-md p-2 hover:bg-accent"
                >
                  {subItem.icon}
                  <div>
                    <div className="font-medium text-sm">{subItem.title}</div>
                    {subItem.description && (
                      <div className="text-muted-foreground text-xs">{subItem.description}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <div key={item.title}>
        <Link
          href={item.url}
          onClick={(e) => {
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            } else if (item.url === '#pricing') {
              e.preventDefault();
              onPricingClick();
            }
          }}
          className="flex items-center rounded-md p-2 hover:bg-accent"
        >
          {item.title}
        </Link>
      </div>
    );
  };

  return (
    <section className="py-2">
      <div className="container">
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            <Link href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="w-8" alt={logo.alt} />
              <span className="font-semibold text-lg">{logo.title}</span>
            </Link>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menuItems.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <DesktopAuthDisplay
              loginText={auth.login.text}
              loginUrl={auth.login.url}
              signupText={auth.signup.text}
              signupUrl={auth.signup.url}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              isInitialized={isInitialized}
            />
          </div>
        </nav>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <Link href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="w-8" alt={logo.alt} />
              <span className="font-semibold text-lg">{logo.title}</span>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <Link href={logo.url} className="flex items-center gap-2">
                      <img src={logo.src} className="w-8" alt={logo.alt} />
                      <span className="font-semibold text-lg">{logo.title}</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-6">
                  <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
                    {menuItems.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <LanguageSwitcher />
                  </div>
                  <MobileAuthDisplay
                    loginText={auth.login.text}
                    loginUrl={auth.login.url}
                    signupText={auth.signup.text}
                    signupUrl={auth.signup.url}
                    isAuthenticated={isAuthenticated}
                    isLoading={isLoading}
                    isInitialized={isInitialized}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Navbar };
