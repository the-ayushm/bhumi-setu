'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { UserRole, UserSession } from '@sih/shared';
import { fetchApi } from './api';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSwitching: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  quickSwitchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const PRESET_DEMO_ACCOUNTS: Record<
  UserRole,
  { email: string; pass: string; label: string; designation: string }
> = {
  [UserRole.NATIONAL_ADMIN]: {
    email: 'admin.mord@nic.in',
    pass: 'Admin@123',
    label: 'National Admin (MoRD)',
    designation: 'Joint Secretary (Land Resources)',
  },
  [UserRole.STATE_NODAL_OFFICER]: {
    email: 'nodal.maharashtra@nic.in',
    pass: 'Admin@123',
    label: 'State Nodal Officer',
    designation: 'Principal Secretary (Revenue)',
  },
  [UserRole.DISTRICT_COLLECTOR]: {
    email: 'collector.pune@nic.in',
    pass: 'Collector@123',
    label: 'District Collector',
    designation: 'Collector & District Magistrate, Pune',
  },
  [UserRole.LAND_ACQUISITION_OFFICER]: {
    email: 'cala.nh66@nic.in',
    pass: 'Cala@123',
    label: 'Competent Authority (CALA)',
    designation: 'Sub-Divisional Officer (SDO)',
  },
  [UserRole.REQUISITIONING_AGENCY]: {
    email: 'nhai.projects@nic.in',
    pass: 'Nhai@123',
    label: 'Requisitioning Agency (NHAI)',
    designation: 'Project Director (PIU Pune)',
  },
  [UserRole.FIELD_SURVEYOR]: {
    email: 'surveyor.amin@nic.in',
    pass: 'Survey@123',
    label: 'Field Surveyor',
    designation: 'Revenue Inspector / Amin',
  },
  [UserRole.CITIZEN_VIEWER]: {
    email: 'citizen@gov.in',
    pass: 'Citizen@123',
    label: 'Citizen Viewer',
    designation: 'Public Transparency Access',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginInternal = useCallback(async (email: string, pass: string) => {
    const res = await fetchApi<{ token: string; user: UserSession }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('sih_auth_token', res.token);
      localStorage.setItem('sih_auth_user', JSON.stringify(res.user));
      // Invalidate and reset all queries so old persona data is never shown
      queryClient.clear();
    }
  }, [queryClient]);

  // On mount: restore saved session or auto-login as National Admin for demo
  useEffect(() => {
    let cancelled = false;

    async function restoreOrAutoLogin() {
      const savedToken = localStorage.getItem('sih_auth_token');
      const savedUser = localStorage.getItem('sih_auth_user');

      if (savedToken && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          // Validate saved token is not the old fake mock token
          if (savedToken === 'demo-jwt-token' || !parsed.id || parsed.id === 'demo-user-id') {
            // Invalid stale session — clear and re-login
            localStorage.removeItem('sih_auth_token');
            localStorage.removeItem('sih_auth_user');
          } else {
            if (!cancelled) {
              setToken(savedToken);
              setUser(parsed);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          localStorage.removeItem('sih_auth_user');
          localStorage.removeItem('sih_auth_token');
        }
      }

      // Auto-login as National Admin for seamless SIH demo on first visit
      try {
        const preset = PRESET_DEMO_ACCOUNTS[UserRole.NATIONAL_ADMIN];
        const res = await fetchApi<{ token: string; user: UserSession }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: preset.email, password: preset.pass }),
        });
        if (!cancelled && res.token && res.user) {
          setToken(res.token);
          setUser(res.user);
          localStorage.setItem('sih_auth_token', res.token);
          localStorage.setItem('sih_auth_user', JSON.stringify(res.user));
        }
      } catch {
        // Backend not ready — leave user as null (unauthenticated)
        // The AuthGuard will redirect to /login
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    }

    restoreOrAutoLogin();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, pass: string) => {
    await loginInternal(email, pass);
  }, [loginInternal]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sih_auth_token');
    localStorage.removeItem('sih_auth_user');
    queryClient.clear();
    router.push('/login');
  }, [queryClient, router]);

  const quickSwitchRole = useCallback(async (role: UserRole) => {
    const preset = PRESET_DEMO_ACCOUNTS[role];
    if (!preset) return;

    setIsSwitching(true);
    try {
      // Perform a REAL backend login — no mock fallback
      await loginInternal(preset.email, preset.pass);
    } catch (err) {
      console.error(`[AUTH] Failed to switch to role ${role}:`, err);
      // Do NOT create a fake mock user. The switch simply fails.
      // User stays on their current session.
      throw err;
    } finally {
      setIsSwitching(false);
    }
  }, [loginInternal]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        isSwitching,
        login,
        logout,
        quickSwitchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
