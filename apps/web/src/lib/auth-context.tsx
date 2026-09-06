'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserSession } from '@sih/shared';
import { fetchApi } from './api';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
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

  useEffect(() => {
    const savedToken = localStorage.getItem('sih_auth_token');
    const savedUser = localStorage.getItem('sih_auth_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('sih_auth_user');
      }
    } else {
      // Default to National Admin for seamless SIH jury demonstration
      quickSwitchRole(UserRole.NATIONAL_ADMIN).catch(() => {});
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await fetchApi<{ token: string; user: UserSession }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('sih_auth_token', res.token);
      localStorage.setItem('sih_auth_user', JSON.stringify(res.user));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sih_auth_token');
    localStorage.removeItem('sih_auth_user');
  };

  const quickSwitchRole = async (role: UserRole) => {
    const preset = PRESET_DEMO_ACCOUNTS[role];
    if (preset) {
      try {
        await login(preset.email, preset.pass);
      } catch (err) {
        // Fallback local session if API is temporarily booting
        const mockUser: UserSession = {
          id: 'demo-user-id',
          email: preset.email,
          name: preset.label,
          role,
          designation: preset.designation,
          state: 'Maharashtra',
          district: 'Pune',
          department: 'Government of India',
        };
        setUser(mockUser);
        setToken('demo-jwt-token');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
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
