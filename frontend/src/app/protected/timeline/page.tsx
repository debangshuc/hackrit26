'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import type { IncidentEvent, Incident, Language } from '@/lib/types';

export default function TimelinePage() {
  const { user } = useAuth();
  const lang = (user?.lang || 'en') as Language;
  const searchParams = useSearchParams();
  const incidentId = searchParams.get('incident');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(incidentId);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load incidents
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await api.listIncidents();
        setIncidents(data);
        if (!selectedIncident && data.length > 0) {
          setSelectedIncident(data[0].id);
        }
      } catch {
        // ignore
      }
      setIsLoading(false);
    };
    loadIncidents();
  }, []);

  // Load events when incident selected
  useEffect(() => {
    if (!selectedIncident) return;
    const loadEvents = async () => {
      try {
        const data = await api.getIncidentEvents(selectedIncident);
        setEvents(data);
      } catch {
        // ignore
      }
    };
    loadEvents();
    // Poll for new events
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, [selectedIncident]);

  const eventTypeLabels: Record<string, { icon: string; label: string }> = {
    created: { icon: '📝', label: 'Incident Created' },
    severity_assessed: { icon: '⚡', label: 'Severity Assessed' },
    plan_generated: { icon: '📋', label: 'Action Plan Generated' },
    step_started: { icon: '▶️', label: 'Step Started' },
    step_completed: { icon: '✅', label: 'Step Completed' },
    evidence_added: { icon: '📎', label: 'Evidence Added' },
    alert_sent: { icon: '🔔', label: 'Alert Sent to Guardian' },
    note_added: { icon: '📝', label: 'Note Added' },
    status_changed: { icon: '🔄', label: 'Status Changed' },
  };

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-shimmer w-12 h-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('timeline.title', lang)}</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {lang === 'bn' ? 'রিয়েল-টাইমে স্বয়ংক্রিয়ভাবে তৈরি' :
             lang === 'hi' ? 'रियल-टाइम में स्वचालित रूप से निर्मित' :
             'Auto-built in real-time as events happen'}
          </p>
        </div>
        {selectedIncident && (
          <button
            onClick={async () => {
              try {
                const blob = await api.exportPdf(selectedIncident);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `scam_shield_report.pdf`;
                a.click();
              } catch {
                alert('PDF export failed');
              }
            }}
            className="btn-primary"
          >
            📄 {t('timeline.export', lang)}
          </button>
        )}
      </div>

      {/* Incident selector */}
      {incidents.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {incidents.map(inc => (
            <button
              key={inc.id}
              onClick={() => setSelectedIncident(inc.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all ${
                selectedIncident === inc.id
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
              }`}
            >
              <span className={`severity-chip severity-${inc.severity} mr-2`}>
                {inc.severity.toUpperCase()}
              </span>
              {new Date(inc.created_at).toLocaleDateString()}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      {events.length > 0 ? (
        <div className="glass-card p-6">
          {events.map((event, idx) => {
            const typeInfo = eventTypeLabels[event.event_type] || { icon: '📌', label: event.event_type };
            return (
              <div key={event.id} className="timeline-item" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{typeInfo.icon}</span>
                    <span className="font-semibold text-sm">{typeInfo.label}</span>
                    <span className="text-xs text-[var(--text-muted)]">{formatTime(event.server_ts)}</span>
                  </div>
                  {/* Event details */}
                  {event.payload && Object.keys(event.payload).length > 0 && (
                    <div className="ml-7 text-sm text-[var(--text-secondary)]">
                      {event.event_type === 'severity_assessed' && (
                        <span className={`severity-chip severity-${event.payload.severity}`}>
                          {event.payload.severity?.toUpperCase()}
                        </span>
                      )}
                      {event.event_type === 'plan_generated' && (
                        <span>{event.payload.steps_count} steps generated • Language: {event.payload.language}</span>
                      )}
                      {event.event_type === 'step_completed' && (
                        <span>Step {event.payload.step_number} completed ✓</span>
                      )}
                      {event.event_type === 'step_started' && (
                        <span>Step {event.payload.step_number} started</span>
                      )}
                      {event.event_type === 'created' && (
                        <span>Types: {event.payload.scam_types}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <span className="text-4xl mb-4 block">📋</span>
          <p className="text-[var(--text-secondary)]">
            {lang === 'bn' ? 'কোনো ঘটনা নেই। জরুরি প্রবাহ থেকে শুরু করুন।' :
             lang === 'hi' ? 'कोई घटना नहीं। आपातकालीन प्रवाह से शुरू करें।' :
             'No incidents yet. Start from the Emergency flow.'}
          </p>
        </div>
      )}
    </div>
  );
}
