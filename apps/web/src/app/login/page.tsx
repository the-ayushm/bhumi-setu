'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, PRESET_DEMO_ACCOUNTS } from '@/lib/auth-context';
import { UserRole } from '@sih/shared';
import {
  ShieldCheck,
  Lock,
  Mail,
  UserCheck,
  Building,
  KeyRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickSwitchRole, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setLoading(true);
    await quickSwitchRole(role);
    router.push('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-gov-navy text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-gov-saffron" />
          <span>National Single Sign-On (SSO) Portal</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gov-navy tracking-tight">
          Ministry of Rural Development Official Gateway
        </h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Authorized personnel authentication for Central Ministries, State Revenue Departments, and
          District Collectorates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Login Form (5 cols) */}
        <div className="md:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-xs space-y-4">
          <h3 className="text-sm font-bold text-gov-navy flex items-center gap-2 border-b border-slate-100 pb-2">
            <KeyRound className="w-4 h-4 text-gov-saffron" />
            Official Account Credentials
          </h3>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Official Email Address (e.g. *.nic.in)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin.mord@nic.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gov-navy hover:bg-gov-navy-light text-white font-bold rounded shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with Government SSO'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-[11px] text-slate-400 text-center pt-2">
            Protected by NIC e-Pramaan Security Guidelines
          </div>
        </div>

        {/* Quick Demo Personas (6 cols) */}
        <div className="md:col-span-6 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-gov-navy flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gov-saffron" />
              Evaluation & Jury Quick Role Switcher
            </h3>
            <span className="text-[10px] bg-gov-saffron/10 text-gov-saffron-dark font-bold px-2 py-0.5 rounded">
              1-Click Auth
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Click any official role below to instantly load their session, security credentials, and
            domain capabilities:
          </p>

          <div className="space-y-2">
            {Object.entries(PRESET_DEMO_ACCOUNTS).map(([roleKey, acc]) => (
              <button
                key={roleKey}
                onClick={() => handleQuickDemo(roleKey as UserRole)}
                className="w-full p-2.5 bg-white hover:bg-amber-50/60 rounded border border-slate-200 hover:border-gov-saffron text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-gov-navy group-hover:text-gov-saffron-dark">
                    {acc.label}
                  </div>
                  <div className="text-[11px] text-slate-500">{acc.designation}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{acc.email}</div>
                </div>
                <div className="text-gov-saffron font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <span>Switch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
