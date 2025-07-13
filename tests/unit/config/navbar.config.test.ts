import { navbarConfig } from '@/config/navbar.config';
import { useNavbarConfig } from '@/hooks/use-config';
import { renderHook } from '@testing-library/react';

describe('Navbar Configuration', () => {
  describe('navbarConfig', () => {
    it('should have valid logo configuration', () => {
      expect(navbarConfig.logo).toBeDefined();
      expect(navbarConfig.logo.url).toBe('/');
      expect(navbarConfig.logo.src).toBe('/icons/apple-touch-icon.png');
      expect(navbarConfig.logo.alt).toBe('logo');
      expect(navbarConfig.logo.title).toBe('Better SaaS');
    });

    it('should have valid auth configuration', () => {
      expect(navbarConfig.auth).toBeDefined();
      expect(navbarConfig.auth.login.text).toBe('Log in');
      expect(navbarConfig.auth.login.url).toBe('/login');
      expect(navbarConfig.auth.signup.text).toBe('Sign up');
      expect(navbarConfig.auth.signup.url).toBe('/signup');
    });

    it('should have valid menu configuration', () => {
      expect(navbarConfig.menu).toBeDefined();
      expect(navbarConfig.menu.items).toBeInstanceOf(Array);
      expect(navbarConfig.menu.items.length).toBeGreaterThan(0);
    });

    it('should have menu items with required properties', () => {
      navbarConfig.menu.items.forEach(item => {
        expect(item.title).toBeDefined();
        expect(item.url).toBeDefined();
        expect(typeof item.title).toBe('string');
        expect(typeof item.url).toBe('string');
      });
    });

    it('should have Resources menu with sub-items', () => {
      const resourcesMenu = navbarConfig.menu.items.find(item => item.title === 'Resources');
      expect(resourcesMenu).toBeDefined();
      expect(resourcesMenu?.items).toBeDefined();
      expect(resourcesMenu?.items?.length).toBeGreaterThan(0);
    });

    it('should have sub-items with icons', () => {
      const resourcesMenu = navbarConfig.menu.items.find(item => item.title === 'Resources');
      resourcesMenu?.items?.forEach(subItem => {
        expect(subItem.icon).toBeDefined();
        expect(typeof subItem.icon).toBe('string');
      });
    });

    it('should have Pricing menu with special onClick handler', () => {
      const pricingMenu = navbarConfig.menu.items.find(item => item.title === 'Pricing');
      expect(pricingMenu).toBeDefined();
      expect(pricingMenu?.onClick).toBe('handlePricingClick');
    });
  });

  describe('useNavbarConfig hook', () => {
    it('should return navbar configuration', () => {
      const { result } = renderHook(() => useNavbarConfig());
      
      expect(result.current).toBeDefined();
      expect(result.current.logo).toEqual(navbarConfig.logo);
      expect(result.current.auth).toEqual(navbarConfig.auth);
      expect(result.current.menu).toEqual(navbarConfig.menu);
    });

    it('should return memoized configuration', () => {
      const { result, rerender } = renderHook(() => useNavbarConfig());
      const firstResult = result.current;
      
      rerender();
      
      expect(result.current).toBe(firstResult);
    });
  });
});
