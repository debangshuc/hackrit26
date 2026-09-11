'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?role=guardian');
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
            <span className="text-xl">👨‍👩‍👧</span>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Scam Shield — Guardian
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-secondary)]">{user.name}</span>
            <div className="flex gap-1">
              <button
                onClick={() => router.push('/guardian/dashboard')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-all"
              >
                🔔 Alerts
              </button>
              <button
                onClick={() => router.push('/guardian/family')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/5 transition-all"
              >
                👨‍👩‍👧 Family
              </button>
            </div>
            <button
              onClick={logout}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {children}
      </div>
    </div>
  );
}
