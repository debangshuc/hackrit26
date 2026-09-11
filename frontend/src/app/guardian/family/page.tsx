'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { FamilyStatus } from '@/lib/types';

export default function FamilyPage() {
  const { user } = useAuth();
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFamily();
  }, []);

  const loadFamily = async () => {
    try {
      const data = await api.familyStatus();
      setFamilyStatus(data);
    } catch {
      // No family yet
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.createFamily();
      setCreatedCode(res.join_code);
      setSuccess(`Family created! Share code: ${res.join_code}`);
      loadFamily();
    } catch (err: any) {
      setError(err.message || 'Failed to create family');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      await api.joinFamily(joinCode);
      setSuccess('Joined family successfully!');
      loadFamily();
    } catch (err: any) {
      setError(err.message || 'Failed to join family');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Family Group</h1>
        <p className="text-[var(--text-secondary)]">
          Link family members for safety monitoring
        </p>
      </div>

      {/* Current family */}
      {familyStatus ? (
        <div className="glass-card-strong p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Family</h2>
          <div className="space-y-3">
            {familyStatus.members.map(member => (
              <div key={member.id} className="flex items-center justify-between glass-card p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {member.role === 'guardian' ? '👨‍👩‍👧' : '🛡️'}
                  </span>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{member.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-300">
                    {member.role}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-300">
                    {member.lang === 'bn' ? 'বাংলা' : member.lang === 'hi' ? 'हिन्दी' : 'English'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Join code */}
          <div className="mt-6 glass-card p-4 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-2">Share this code with family members:</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-blue-300">
              {familyStatus.join_code}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create */}
          {user?.role === 'guardian' && (
            <div className="glass-card-strong p-6">
              <h2 className="text-lg font-semibold mb-4">Create Family Group</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Create a family group and share the 6-digit code with your parent.
              </p>

              {createdCode ? (
                <div className="text-center">
                  <p className="text-sm text-[var(--text-secondary)] mb-3">Your family code:</p>
                  <p className="text-4xl font-mono font-bold tracking-widest text-blue-300 mb-4">
                    {createdCode}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Share this code with your parent. They&apos;ll enter it to join.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleCreate}
                  className="btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : '➕ Create Family Group'}
                </button>
              )}
            </div>
          )}

          {/* Join */}
          <div className="glass-card-strong p-6">
            <h2 className="text-lg font-semibold mb-4">Join Family Group</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Enter the 6-digit code from your family member.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                className="input text-center text-2xl font-mono tracking-widest"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
              <button
                onClick={handleJoin}
                className="btn-primary w-full"
                disabled={isLoading || joinCode.length < 6}
              >
                {isLoading ? 'Joining...' : 'Join Family'}
              </button>
            </div>

            {/* Consent info */}
            <div className="mt-6 glass-card p-4">
              <h3 className="text-sm font-semibold mb-2">What your guardian can see:</h3>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>✓ Risk level and scam category</li>
                <li>✓ General indicators (e.g., &quot;urgent payment demand&quot;)</li>
                <li>✓ Emergency plan progress</li>
              </ul>
              <h3 className="text-sm font-semibold mt-3 mb-2">What they CANNOT see:</h3>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>✗ Your actual messages or SMS content</li>
                <li>✗ Your personal conversations</li>
                <li>✗ Your browsing or location</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}
    </div>
  );
}
