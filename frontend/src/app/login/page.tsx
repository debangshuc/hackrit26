'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import type { Language, UserRole } from '@/lib/types';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>((searchParams.get('role') as UserRole) || 'protected');
  const [lang, setLang] = useState<Language>('en');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoReady, setDemoReady] = useState(false);

  const view = searchParams.get('view');

  useEffect(() => {
    if (user) {
      if (view === 'scan') {
        router.push('/protected/scan');
      } else {
        router.push(user.role === 'guardian' ? '/guardian/dashboard' : '/protected/emergency');
      }
    }
  }, [user, router, view]);

  const handleDemoSetup = async () => {
    try {
      await api.demoSetup();
      setDemoReady(true);
      setPhone(role === 'guardian' ? '+919000000002' : '+919000000001');
      setOtp('123456');
    } catch {
      // Demo setup might fail if users already exist, that's fine
      setDemoReady(true);
      setPhone(role === 'guardian' ? '+919000000002' : '+919000000001');
      setOtp('123456');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        await register(phone, name, role, lang);
      } else {
        await login(phone, otp);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="glass-card-strong p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
              <span className="text-2xl">{role === 'guardian' ? '👨‍👩‍👧' : '🛡️'}</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {mode === 'register' ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-2">
              {role === 'guardian' ? 'Guardian / Family Member' : 'Protected User'}
            </p>
          </div>

          {/* Demo quick login */}
          <button
            onClick={handleDemoSetup}
            className="w-full mb-6 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-sm text-blue-300 hover:from-blue-500/20 hover:to-purple-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>⚡</span> Quick Demo Login
            {demoReady && <span className="text-green-400">✓ Ready — click Sign In</span>}
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode toggle */}
            <div className="flex rounded-xl overflow-hidden border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  mode === 'register'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Register
              </button>
            </div>

            {/* Name (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Name</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Phone Number</label>
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 90000 00001"
                required
              />
            </div>

            {/* OTP */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                OTP Code
                <span className="ml-2 text-xs text-blue-400">(Demo: 123456)</span>
              </label>
              <input
                type="text"
                className="input"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required={mode === 'login'}
              />
            </div>

            {/* Role + Language (register only) */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('protected')}
                      className={`tile ${role === 'protected' ? 'selected' : ''}`}
                    >
                      <span className="text-2xl">🛡️</span>
                      <span className="tile-label">Protected</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('guardian')}
                      className={`tile ${role === 'guardian' ? 'selected' : ''}`}
                    >
                      <span className="text-2xl">👨‍👩‍👧</span>
                      <span className="tile-label">Guardian</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Language</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['en', 'bn', 'hi'] as Language[]).map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLang(l)}
                        className={`tile ${lang === l ? 'selected' : ''}`}
                      >
                        <span className="tile-label">
                          {l === 'en' ? 'English' : l === 'bn' ? 'বাংলা' : 'हिन्दी'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-shimmer w-5 h-5 rounded-full inline-block" />
                  <span>Please wait...</span>
                </>
              ) : (
                mode === 'register' ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Safety banner */}
          <div className="safety-banner mt-6 text-xs">
            <span>🔒</span>
            Scam Shield will NEVER ask for your OTP, PIN, or password.
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-shimmer w-12 h-12 rounded-full" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
