'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const PUBLIC_ROUTES = ['/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-navy mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">
            Establishing Secure Government Session...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on a public route, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    // Use a useEffect-based redirect to avoid React rendering issues
    // but for immediate SSR/CSR, return a redirect component
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-navy mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">
            Redirecting to Authentication Portal...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
