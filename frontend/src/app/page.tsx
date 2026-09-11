'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(user.role === 'guardian' ? '/guardian/dashboard' : '/protected/emergency');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-shimmer w-12 h-12 rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center animate-fade-in">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/20">
            <span className="text-4xl">🛡️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Scam Shield
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Not &quot;is this a scam?&quot; —<br />
            <span className="text-[var(--text-primary)] font-medium">
              &quot;Here&apos;s exactly what to do in the next 5 minutes.&quot;
            </span>
          </p>
        </div>

        {/* Safety banner */}
        <div className="safety-banner mb-8">
          <span>🔒</span>
          Scam Shield will NEVER ask for your OTP, PIN, or password.
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/login?role=protected')}
            className="btn-danger w-full text-lg py-4"
          >
            🚨 I need help NOW
          </button>

          <button
            onClick={() => router.push('/login?role=protected&view=scan')}
            className="btn-primary w-full"
          >
            🔍 Check a suspicious message
          </button>

          <button
            onClick={() => router.push('/login?role=guardian')}
            className="btn-secondary w-full"
          >
            👨‍👩‍👧 I&apos;m a guardian / family member
          </button>
        </div>

        {/* Demo note */}
        <div className="mt-8 glass-card p-4 text-sm text-[var(--text-muted)]">
          <p className="font-medium text-[var(--text-secondary)] mb-1">🎯 Hackathon Demo</p>
          <p>Use phone <code className="text-blue-400">+919000000001</code> with OTP <code className="text-blue-400">123456</code></p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <div className="text-2xl font-bold text-blue-400">$442B</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Global scam losses</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-2xl font-bold text-purple-400">1930</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Cybercrime helpline</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-2xl font-bold text-green-400">5 min</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Action plan time</div>
          </div>
        </div>
      </div>
    </main>
  );
}
