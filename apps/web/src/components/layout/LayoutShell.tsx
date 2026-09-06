'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { GovHeader } from '@/components/layout/GovHeader';
import { GovNav } from '@/components/layout/GovNav';
import { GovFooter } from '@/components/layout/GovFooter';
import { useAuth } from '@/lib/auth-context';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const isLoginPage = pathname === '/login';

  // On login page: show minimal chrome (no header/nav)
  // On all other pages: show full government chrome with auth guard
  return (
    <AuthGuard>
      {!isLoginPage && isAuthenticated && !isLoading && (
        <>
          <GovHeader />
          <GovNav />
        </>
      )}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {children}
      </main>
      {!isLoginPage && isAuthenticated && !isLoading && <GovFooter />}
    </AuthGuard>
  );
}
