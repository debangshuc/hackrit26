'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import {
  SCAM_TYPE_LABELS,
  TIME_BAND_LABELS,
  SEVERITY_CONFIG,
} from '@/lib/types';
import type {
  ScamType, TimeBand, AmountBand, PaymentMethod,
  EmergencyPlan, PlanStep, Language,
} from '@/lib/types';

type Screen = 'what' | 'when' | 'details' | 'loading' | 'plan';

const AMOUNT_BANDS: { value: AmountBand; label: Record<string, string> }[] = [
  { value: 'under_1k', label: { en: 'Under ₹1,000', bn: '₹১,০০০-র কম', hi: '₹1,000 से कम' } },
  { value: '1k_to_10k', label: { en: '₹1,000 – ₹10,000', bn: '₹১,০০০ – ₹১০,০০০', hi: '₹1,000 – ₹10,000' } },
  { value: '10k_to_50k', label: { en: '₹10,000 – ₹50,000', bn: '₹১০,০০০ – ₹৫০,০০০', hi: '₹10,000 – ₹50,000' } },
  { value: '50k_to_1l', label: { en: '₹50,000 – ₹1,00,000', bn: '₹৫০,০০০ – ₹১,০০,০০০', hi: '₹50,000 – ₹1,00,000' } },
  { value: 'over_1l', label: { en: 'Over ₹1,00,000', bn: '₹১,০০,০০০-র বেশি', hi: '₹1,00,000 से ज़्यादा' } },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: Record<string, string>; icon: string }[] = [
  { value: 'upi', label: { en: 'UPI (GPay, PhonePe, Paytm)', bn: 'UPI (GPay, PhonePe, Paytm)', hi: 'UPI (GPay, PhonePe, Paytm)' }, icon: '📱' },
  { value: 'bank_transfer', label: { en: 'Bank Transfer / NEFT', bn: 'ব্যাংক ট্রান্সফার / NEFT', hi: 'बैंक ट्रांसफर / NEFT' }, icon: '🏦' },
  { value: 'card', label: { en: 'Credit / Debit Card', bn: 'ক্রেডিট / ডেবিট কার্ড', hi: 'क्रेडिट / डेबिट कार्ड' }, icon: '💳' },
  { value: 'wallet', label: { en: 'Digital Wallet', bn: 'ডিজিটাল ওয়ালেট', hi: 'डिजिटल वॉलेट' }, icon: '👛' },
  { value: 'other', label: { en: 'Other / Not Sure', bn: 'অন্যান্য / নিশ্চিত নই', hi: 'अन्य / पता नहीं' }, icon: '❓' },
];

export default function EmergencyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const lang = (user?.lang || 'en') as Language;

  const [screen, setScreen] = useState<Screen>('what');
  const [selectedTypes, setSelectedTypes] = useState<ScamType[]>([]);
  const [timeBand, setTimeBand] = useState<TimeBand | null>(null);
  const [amountBand, setAmountBand] = useState<AmountBand | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [remoteConnected, setRemoteConnected] = useState<boolean | null>(null);
  const [plan, setPlan] = useState<EmergencyPlan | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  const needsDetails = () => {
    if (selectedTypes.includes('money_sent')) return true;
    if (selectedTypes.includes('remote_access')) return true;
    return false;
  };

  const toggleType = (type: ScamType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async () => {
    setScreen('loading');
    setError('');

    try {
      const facts = {
        scam_types: selectedTypes,
        time_band: timeBand,
        amount_band: amountBand,
        payment_method: paymentMethod,
        remote_still_connected: remoteConnected,
      };

      const result = await api.createEmergency(facts, lang);
      setPlan(result);
      setScreen('plan');
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan');
      setScreen('details');
    }
  };

  const toggleStepComplete = async (stepNumber: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber);
    } else {
      newCompleted.add(stepNumber);
    }
    setCompletedSteps(newCompleted);

    // Report to backend
    if (plan) {
      try {
        await api.updateStep(plan.incident_id, stepNumber, !completedSteps.has(stepNumber));
      } catch {
        // Non-critical, don't block UI
      }
    }
  };

  // ─── Screen 1: What happened? ──────────────────────────────────────────
  if (screen === 'what') {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('emergency.title', lang)}</h1>
          <p className="text-[var(--text-secondary)]">{t('emergency.subtitle', lang)}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {(Object.keys(SCAM_TYPE_LABELS) as ScamType[]).map(type => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`tile ${selectedTypes.includes(type) ? 'selected' : ''}`}
            >
              <span className="tile-icon">{SCAM_TYPE_LABELS[type].icon}</span>
              <span className="tile-label">{SCAM_TYPE_LABELS[type][lang]}</span>
            </button>
          ))}
        </div>

        <button
          className="btn-primary w-full"
          disabled={selectedTypes.length === 0}
          onClick={() => setScreen('when')}
        >
          {t('common.next', lang)} →
        </button>
      </div>
    );
  }

  // ─── Screen 2: When? ────────────────────────────────────────────────────
  if (screen === 'when') {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setScreen('what')} className="text-sm text-blue-400 mb-6 hover:underline">
          ← {t('common.back', lang)}
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('emergency.when', lang)}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {(Object.keys(TIME_BAND_LABELS) as TimeBand[]).map(tb => (
            <button
              key={tb}
              onClick={() => setTimeBand(tb)}
              className={`tile ${timeBand === tb ? 'selected' : ''}`}
            >
              <span className="tile-label text-base">{TIME_BAND_LABELS[tb][lang]}</span>
            </button>
          ))}
        </div>

        <button
          className="btn-primary w-full"
          disabled={!timeBand}
          onClick={() => {
            if (needsDetails()) {
              setScreen('details');
            } else {
              handleSubmit();
            }
          }}
        >
          {needsDetails() ? `${t('common.next', lang)} →` : t('common.submit', lang)}
        </button>
      </div>
    );
  }

  // ─── Screen 3: Details ──────────────────────────────────────────────────
  if (screen === 'details') {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setScreen('when')} className="text-sm text-blue-400 mb-6 hover:underline">
          ← {t('common.back', lang)}
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('emergency.details', lang)}</h1>
        </div>

        <div className="space-y-8">
          {/* Money sent follow-up */}
          {selectedTypes.includes('money_sent') && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('emergency.amount', lang)}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AMOUNT_BANDS.map(ab => (
                    <button
                      key={ab.value}
                      onClick={() => setAmountBand(ab.value)}
                      className={`tile ${amountBand === ab.value ? 'selected' : ''}`}
                    >
                      <span className="tile-label">{ab.label[lang]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">{t('emergency.payment_method', lang)}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.value}
                      onClick={() => setPaymentMethod(pm.value)}
                      className={`tile ${paymentMethod === pm.value ? 'selected' : ''}`}
                    >
                      <span className="text-xl">{pm.icon}</span>
                      <span className="tile-label">{pm.label[lang]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Remote access follow-up */}
          {selectedTypes.includes('remote_access') && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('emergency.remote_connected', lang)}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRemoteConnected(true)}
                  className={`tile ${remoteConnected === true ? 'selected' : ''}`}
                  style={remoteConnected === true ? { borderColor: 'var(--severity-critical)' } : {}}
                >
                  <span className="text-3xl">🚨</span>
                  <span className="tile-label font-bold">{t('common.yes', lang)}</span>
                </button>
                <button
                  onClick={() => setRemoteConnected(false)}
                  className={`tile ${remoteConnected === false ? 'selected' : ''}`}
                >
                  <span className="text-3xl">✅</span>
                  <span className="tile-label">{t('common.no', lang)}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          className="btn-danger w-full mt-8"
          onClick={handleSubmit}
        >
          🚨 {t('common.submit', lang)} — Get My Plan
        </button>
      </div>
    );
  }

  // ─── Loading ────────────────────────────────────────────────────────────
  if (screen === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 animate-pulse-glow">
          <span className="text-3xl">🛡️</span>
        </div>
        <h2 className="text-xl font-bold mb-2">{t('emergency.generating', lang)}</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          {lang === 'bn' ? 'এটি ৬০ সেকেন্ডেরও কম সময় নেবে' :
           lang === 'hi' ? 'इसमें 60 सेकंड से कम समय लगेगा' :
           'This will take less than 60 seconds'}
        </p>
        <div className="mt-8 w-64 h-2 rounded-full overflow-hidden bg-white/5">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" style={{ width: '70%' }} />
        </div>
      </div>
    );
  }

  // ─── Plan Display ──────────────────────────────────────────────────────
  if (screen === 'plan' && plan) {
    const severityConfig = SEVERITY_CONFIG[plan.severity];
    return (
      <div className="animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('emergency.your_plan', lang)}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {plan.plan_steps.length} steps • {completedSteps.size} completed
            </p>
          </div>
          <div className={`severity-chip severity-${plan.severity}`}>
            {plan.severity === 'critical' && '🔴'}
            {plan.severity === 'high' && '🟠'}
            {plan.severity === 'medium' && '🟡'}
            {plan.severity === 'low' && '⚪'}
            {' '}{severityConfig.label}
          </div>
        </div>

        {/* Fallback notice */}
        {plan.is_fallback && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-300">
            ⚠️ Plan shown in English (translation temporarily unavailable). All steps and resources are accurate.
          </div>
        )}

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {plan.plan_steps.map((step, idx) => (
            <div
              key={step.step_number}
              className={`plan-step ${step.is_urgent ? 'urgent' : ''} ${completedSteps.has(step.step_number) ? 'completed' : ''}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleStepComplete(step.step_number)}
                  className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    completedSteps.has(step.step_number)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {completedSteps.has(step.step_number) && '✓'}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {step.is_urgent && (
                      <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                        URGENT
                      </span>
                    )}
                    <h3 className="font-semibold text-base">{step.title}</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    <span className="font-medium text-[var(--text-primary)]">Why: </span>
                    {step.why}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-primary)]">How: </span>
                    {step.how}
                  </p>
                  {step.official_resource && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-blue-300">
                      <span>📞</span>
                      <span className="font-mono font-medium">{step.official_resource}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/protected/timeline?incident=${plan.incident_id}`)}
            className="btn-secondary"
          >
            📋 View Timeline
          </button>
          <button
            onClick={async () => {
              try {
                const blob = await api.exportPdf(plan.incident_id);
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
            📄 Export Evidence PDF
          </button>
        </div>

        {/* Disclaimer */}
        <div className="safety-banner mt-6 text-xs">
          <span>🔒</span>
          {plan.disclaimer}
        </div>
      </div>
    );
  }

  return null;
}


