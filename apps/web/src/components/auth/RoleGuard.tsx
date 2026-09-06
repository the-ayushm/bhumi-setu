'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { isRouteAllowed, UserRole } from '@sih/shared';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

interface RoleGuardProps {
  routePath: string;
  children: React.ReactNode;
}

export function RoleGuard({ routePath, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gov-navy"></div>
      </div>
    );
  }

  const currentRole = user?.role || UserRole.CITIZEN_VIEWER;
  const isAllowed = isRouteAllowed(currentRole, routePath);

  if (!isAllowed) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-xl shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
          <Lock className="w-3.5 h-3.5" /> 403 Access Forbidden
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Statutory Access Restriction (RBAC Gatekeeper)
        </h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Your active persona (<span className="font-semibold text-slate-900">{user?.name || currentRole}</span> - <span className="font-mono text-xs">{currentRole}</span>) does not hold statutory clearance to access route{' '}
          <code className="bg-slate-100 px-2 py-0.5 rounded text-red-700 font-mono text-xs">{routePath}</code> under the RFCTLARR Act, 2013 delegation matrix.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-700">Role-Based Access Rules:</p>
          <p>• Citizens and Field Surveyors are restricted to public transparency and field-level survey data.</p>
          <p>• Financial DBT and administrative awards are strictly restricted to District Collectors, CALA, and National MoRD authorities.</p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gov-navy text-white text-xs font-semibold rounded-lg hover:bg-gov-navy-light transition-colors"
          >
            <Home className="w-4 h-4" /> Return to Authorized Dashboard
          </Link>
          <Link
            href="/parcels"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> View Public Cadastral GIS
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
