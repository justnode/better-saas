import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { ProtectedLayoutClient } from '@/components/dashboard/protected-layout-client';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import PermissionWrapper from '@/components/auth/permission-wrapper';
import { Suspense } from 'react';

// Force dynamic rendering for settings routes
// This is necessary because settings pages now check admin permissions
export const dynamic = 'force-dynamic';

type Props = {
  children: ReactNode;
};

/**
 * Credits layout - Handles authentication and layout for credits pages
 * Credits pages require:
 * 1. User authentication (AuthGuard)
 * 2. Permission context with admin check (PermissionWrapper)
 * 3. Standard layout (ProtectedLayoutClient)
 * 
 * Admin users will see both Dashboard and Settings menus
 * Regular users will only see Settings menu
 */
export default function CreditsLayout({ children }: Props) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AuthGuard useSkeletonFallback>
        <PermissionWrapper>
          <ProtectedLayoutClient>{children}</ProtectedLayoutClient>
        </PermissionWrapper>
      </AuthGuard>
    </Suspense>
  );
}