/**
 * Auth context — manages user state, token, and persistence.
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User, Language } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  register: (phone: string, name: string, role: string, lang: string) => Promise<void>;
  logout: () => void;
  setLang: (lang: Language) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('scam_shield_token');
    const savedUser = localStorage.getItem('scam_shield_user');
    if (savedToken && savedUser) {
      api.setToken(savedToken);
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, otp: string) => {
    const res = await api.login(phone, otp);
    api.setToken(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('scam_shield_user', JSON.stringify(res.user));
  };

  const register = async (phone: string, name: string, role: string, lang: string) => {
    const res = await api.register({ phone, name, role, lang });
    api.setToken(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('scam_shield_user', JSON.stringify(res.user));
  };

  const logout = () => {
    api.clearToken();
    setToken(null);
    setUser(null);
  };

  const setLang = (lang: Language) => {
    if (user) {
      const updated = { ...user, lang };
      setUser(updated);
      localStorage.setItem('scam_shield_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, setLang }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
