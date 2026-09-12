'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { SEVERITY_CONFIG } from '@/lib/types';
import type { Incident, IncidentEvent } from '@/lib/types';

export default function GuardianIncidentPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const incidentId = searchParams.get('id');

  const [incident, setIncident] = useState<Incident | null>(null);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!incidentId) return;
    const load = async () => {
      try {
        const [inc, evts] = await Promise.all([
          api.getIncident(incidentId),
          api.getIncidentEvents(incidentId),
        ]);
        setIncident(inc);
        setEvents(evts);
      } catch {
        // ignore
      }
      setIsLoading(false);
    };
    load();

    // Poll for updates
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [incidentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-shimmer w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="glass-card p-12 text-center">
        <span className="text-4xl mb-4 block">🔍</span>
        <p className="text-[var(--text-secondary)]">Incident not found or access denied.</p>
      </div>
    );
  }

  const severityConfig = SEVERITY_CONFIG[incident.severity];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Incident Details</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Reported: {new Date(incident.created_at).toLocaleString()}
          </p>
        </div>
        <span className={`severity-chip severity-${incident.severity}`}>
          {incident.severity.toUpperCase()}
        </span>
      </div>

      {/* Recorded Incident Facts */}
      {incident.facts && (
        <div className="glass-card-strong p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📋</span> Recorded Incident Facts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-muted)] block uppercase">Incident Type:</span>
              <span className="text-white font-bold">{incident.facts.incident_type || incident.facts.category || 'Scam Incident'}</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-muted)] block uppercase">Amount Lost:</span>
              <span className="text-[#00e5a3] font-bold">{incident.facts.amount || 'Not provided'}</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-muted)] block uppercase">Payment Method:</span>
              <span className="text-gray-200">{incident.facts.payment_method || 'Not provided'}</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-muted)] block uppercase">Transaction ID / UTR:</span>
              <span className="text-white font-bold">{incident.facts.transaction_id || 'Not provided'}</span>
            </div>
          </div>

          {(incident.facts.scammer_contact || incident.facts.what_happened) && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3 font-mono text-xs">
              {incident.facts.scammer_contact && (
                <div>
                  <span className="text-[var(--text-muted)] uppercase">Scammer Contact: </span>
                  <span className="text-red-300 font-bold">{incident.facts.scammer_contact}</span>
                </div>
              )}
              {incident.facts.what_happened && (
                <div>
                  <span className="text-[var(--text-muted)] uppercase block mb-1">Victim Statement:</span>
                  <p className="p-3 rounded bg-black/40 text-gray-300 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {incident.facts.what_happened}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {incident.plan && (
        <div className="glass-card-strong p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Action Plan Progress</h2>
          <div className="space-y-3">
            {incident.plan.plan_steps.map(step => {
              // Check events for step completion
              const isCompleted = events.some(
                e => e.event_type === 'step_completed' && e.payload?.step_number === step.step_number
              );
              const isStarted = events.some(
                e => e.event_type === 'step_started' && e.payload?.step_number === step.step_number
              );

              return (
                <div
                  key={step.step_number}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCompleted
                      ? 'bg-green-500/10 border border-green-500/20'
                      : isStarted
                      ? 'bg-blue-500/10 border border-blue-500/20'
                      : 'bg-white/3 border border-[var(--border)]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isStarted
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-[var(--text-muted)]'
                    }`}
                  >
                    {isCompleted ? '✓' : step.step_number}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isCompleted ? 'line-through opacity-60' : ''}`}>
                      {step.title}
                    </p>
                    {step.is_urgent && !isCompleted && (
                      <span className="text-xs text-red-400">⚡ Urgent</span>
                    )}
                  </div>
                  {isCompleted && <span className="text-green-400 text-xs">Completed</span>}
                  {isStarted && !isCompleted && <span className="text-blue-400 text-xs">In progress</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Event Timeline</h2>
        {events.length > 0 ? (
          <div>
            {events.map(event => (
              <div key={event.id} className="timeline-item">
                <div className="text-sm">
                  <span className="font-medium">{event.event_type.replace(/_/g, ' ')}</span>
                  <span className="text-[var(--text-muted)] ml-2">
                    {new Date(event.server_ts).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-sm">No events yet.</p>
        )}
      </div>
    </div>
  );
}
