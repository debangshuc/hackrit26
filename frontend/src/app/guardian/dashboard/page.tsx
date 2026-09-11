'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';
import type { Alert } from '@/lib/types';

export default function GuardianDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  const fetcher = useCallback(() => api.pollAlerts(!showAll), [showAll]);
  const { data: alerts, isLoading, refetch } = usePolling<Alert[]>(fetcher, 5000, !!user);

  const handleAck = async (alertId: string) => {
    try {
      await api.ackAlert(alertId);
      refetch();
    } catch {
      // ignore
    }
  };

  const handleFalseAlarm = async (alertId: string) => {
    try {
      await api.markFalseAlarm(alertId);
      refetch();
    } catch {
      // ignore
    }
  };

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Check for critical alerts (show banner)
  const criticalAlerts = alerts?.filter(a => a.severity === 'critical' && !a.acked_at) || [];

  return (
    <div className="animate-fade-in">
      {/* Critical banner */}
      {criticalAlerts.length > 0 && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-pulse-glow">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-bold text-red-300">CRITICAL ALERT</p>
              <p className="text-sm text-red-200">{criticalAlerts[0].summary}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Guardian Dashboard</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Monitoring family safety • Auto-refreshing every 5 seconds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400">Live</span>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowAll(false)}
          className={`px-4 py-2 rounded-xl text-sm transition-all ${
            !showAll
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
          }`}
        >
          Active Alerts
        </button>
        <button
          onClick={() => setShowAll(true)}
          className={`px-4 py-2 rounded-xl text-sm transition-all ${
            showAll
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
          }`}
        >
          All Alerts
        </button>
      </div>

      {/* Alerts */}
      {isLoading && !alerts ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="loading-shimmer h-24 rounded-xl" />
          ))}
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert, idx) => (
            <div
              key={alert.id}
              className={`alert-card ${alert.severity} animate-fade-in`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`severity-chip severity-${alert.severity}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatTime(alert.created_at)}
                    </span>
                    {alert.is_false_alarm && (
                      <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">
                        False Alarm
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--text-primary)] font-medium mb-1">{alert.summary}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{alert.why}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    From: {alert.member_name}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {!alert.acked_at && !alert.is_false_alarm && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleAck(alert.id)}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    ✓ Acknowledge
                  </button>
                  <button
                    onClick={() => {
                      // Try to find related incident
                      const payload = alert as any;
                      if (payload.payload_json) {
                        try {
                          const p = JSON.parse(payload.payload_json);
                          if (p.incident_id) {
                            router.push(`/guardian/incident?id=${p.incident_id}`);
                            return;
                          }
                        } catch {}
                      }
                    }}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    👁️ View Advice
                  </button>
                  <button
                    onClick={() => handleFalseAlarm(alert.id)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all px-3"
                  >
                    Mark False Alarm
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <span className="text-5xl mb-4 block">✅</span>
          <h3 className="text-xl font-semibold mb-2">No alerts — your family is safe</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            We&apos;re monitoring in real-time. You&apos;ll be notified immediately if anything comes up.
          </p>
        </div>
      )}

      {/* Family link CTA */}
      {!user?.family_id && (
        <div className="glass-card p-6 mt-8 text-center">
          <span className="text-3xl mb-3 block">👨‍👩‍👧</span>
          <h3 className="font-semibold mb-2">Link your family</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Create a family group and share the code with your parent to start monitoring.
          </p>
          <button
            onClick={() => router.push('/guardian/family')}
            className="btn-primary"
          >
            Create Family Group
          </button>
        </div>
      )}
    </div>
  );
}
