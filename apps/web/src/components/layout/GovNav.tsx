'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderGit2,
  MapPin,
  Scroll,
  Calculator,
  Users,
  CreditCard,
  AlertTriangle,
  FileSpreadsheet,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isRouteAllowed } from '@sih/shared';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderGit2 },
  { href: '/parcels', label: 'Cadastral GIS', icon: MapPin },
  { href: '/notifications', label: 'Gazette Notices', icon: Scroll },
  { href: '/awards', label: 'Valuation & Award', icon: Calculator },
  { href: '/rr-monitoring', label: 'R&R Families', icon: Users },
  { href: '/disbursements', label: 'PFMS DBT', icon: CreditCard },
  { href: '/risk-engine', label: 'Risk Intelligence', icon: AlertTriangle },
  { href: '/mis-reports', label: 'MIS & Audit', icon: FileSpreadsheet },
  { href: '/field-survey', label: 'Field Survey', icon: Smartphone },
];

export function GovNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // AuthGuard ensures user is always non-null on protected pages
  if (!user) return null;

  const currentRole = user.role;
  const visibleNavItems = NAV_ITEMS.filter((item) => isRouteAllowed(currentRole, item.href));

  return (
    <nav className="bg-gov-navy border-b border-gov-navy-light text-white text-xs font-medium px-4 overflow-x-auto shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 py-1 min-w-max">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-gov-saffron text-white font-semibold shadow-inner'
                  : 'text-slate-200 hover:bg-gov-navy-light hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
