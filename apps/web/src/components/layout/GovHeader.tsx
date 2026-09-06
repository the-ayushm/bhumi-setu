'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth, PRESET_DEMO_ACCOUNTS } from '@/lib/auth-context';
import { UserRole } from '@sih/shared';
import { ShieldCheck, UserCheck, RefreshCw, LogOut, Globe, AlertTriangle } from 'lucide-react';

export function GovHeader() {
  const { user, quickSwitchRole, logout, isSwitching } = useAuth();

  return (
    <header className="w-full border-b border-gov-navy-light/20 bg-white sticky top-0 z-50">
      {/* Top National Ribbon */}
      <div className="bg-gov-navy text-white text-xs px-4 py-1.5 flex flex-wrap justify-between items-center tracking-wide">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-gov-saffron">भारत सरकार</span>
          <span className="text-slate-400">|</span>
          <span>GOVERNMENT OF INDIA</span>
          <span className="hidden sm:inline-block text-slate-400">|</span>
          <span className="hidden sm:inline-block text-slate-300">MINISTRY OF RURAL DEVELOPMENT (MoRD)</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-gov-saffron-dark text-white px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase tracking-wider">
            SIH PS 26016
          </span>
          <span className="text-slate-300 hidden md:inline">RFCTLARR Act, 2013</span>
          <div className="flex items-center space-x-1 text-slate-300">
            <Globe className="w-3.5 h-3.5" />
            <span>English / हिन्दी</span>
          </div>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="px-4 py-3 sm:px-6 flex flex-wrap justify-between items-center gap-3 bg-white border-b border-slate-100">
        <div className="flex items-center space-x-3">
          {/* Ashoka Stambh Emblem SVG */}
          <div className="w-10 h-14 flex-shrink-0 flex flex-col items-center justify-center text-gov-navy">
            <svg viewBox="0 0 100 140" className="w-full h-full fill-current">
              <path d="M50 5 C55 5, 60 10, 60 18 C60 25, 55 30, 50 30 C45 30, 40 25, 40 18 C40 10, 45 5, 50 5 Z" />
              <rect x="35" y="32" width="30" height="4" rx="1" />
              <rect x="25" y="38" width="50" height="6" rx="2" fill="#FF6F00" />
              <circle cx="50" cy="55" r="10" stroke="#0B2545" strokeWidth="2" fill="none" />
              <line x1="50" y1="45" x2="50" y2="65" stroke="#0B2545" strokeWidth="1.5" />
              <line x1="40" y1="55" x2="60" y2="55" stroke="#0B2545" strokeWidth="1.5" />
              <path d="M20 70 L80 70 L75 95 L25 95 Z" opacity="0.8" />
              <rect x="15" y="98" width="70" height="6" rx="2" fill="#137547" />
              <text x="50" y="118" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0B2545">
                सत्यमेव जयते
              </text>
            </svg>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Department of Land Resources (DoLR)
            </div>
            <Link href="/" className="hover:opacity-90">
              <h1 className="text-base sm:text-xl font-bold text-gov-navy tracking-tight leading-tight">
                Real-Time National Land Acquisition & Management System
              </h1>
            </Link>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              End-to-End Digital Monitoring, Statutory Gatekeeper & Decision Support Engine (RFCTLARR 2013)
            </p>
          </div>
        </div>

        {/* Demo Persona Switcher & User Status */}
        <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-gov-navy flex items-center justify-end gap-1">
              <UserCheck className="w-3.5 h-3.5 text-gov-green" />
              {user?.name || 'Authorized Official'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {user?.designation || 'MoRD Portal Session'}
              {user?.state && <span className="ml-1 text-gov-saffron-dark font-semibold">({user.state}{user.district ? ` • ${user.district}` : ''})</span>}
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Quick Role Switcher Dropdown */}
            {isSwitching && (
              <RefreshCw className="w-3.5 h-3.5 text-gov-saffron animate-spin" />
            )}
            <select
              aria-label="Select demonstration persona role"
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-gov-navy disabled:opacity-50"
              value={user?.role || UserRole.NATIONAL_ADMIN}
              disabled={isSwitching}
              onChange={(e) => quickSwitchRole(e.target.value as UserRole)}
            >
              {Object.entries(PRESET_DEMO_ACCOUNTS).map(([roleKey, acc]) => (
                <option key={roleKey} value={roleKey}>
                  Persona: {acc.label}
                </option>
              ))}
            </select>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
