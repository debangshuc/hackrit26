'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/types';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const lang = (user?.lang || 'en') as Language;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?role=protected');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-shimmer w-12 h-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="glass-card-strong border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛡️</span>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t('app.name', lang)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-secondary)]">{user.name}</span>
            <div className="flex gap-1">
              <button
                onClick={() => router.push('/protected/emergency')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-all"
              >
                🚨 Emergency
              </button>
              <button
                onClick={() => router.push('/protected/scan')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-all"
              >
                🔍 Scan
              </button>
              <button
                onClick={() => router.push('/protected/timeline')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-all"
              >
                📋 Timeline
              </button>
            </div>
            <button
              onClick={logout}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all"
            >
              {t('common.logout', lang)}
            </button>
          </div>
        </div>
      </nav>

      {/* Safety banner */}
      <div className="max-w-4xl mx-auto px-4 pt-3 w-full">
        <div className="safety-banner text-xs">
          <span>🔒</span>
          {t('app.anti_impersonation', lang)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {children}
      </div>
    </div>
  );
}
