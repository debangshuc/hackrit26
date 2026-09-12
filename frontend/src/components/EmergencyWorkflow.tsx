'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_CHECKLIST_ITEMS, type IncidentDetails } from '@/lib/scam-types';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { GuardianEmergencyAlertResponse } from '@/lib/types';

interface EmergencyWorkflowProps {
  initialIncidentType?: string;
  initialMessageSnippet?: string;
  onBackToScanner?: () => void;
}

const CHECKLIST_STORAGE_KEY = 'ai_scam_shield_emergency_checklist';
const INCIDENT_STORAGE_KEY = 'ai_scam_shield_incident_details';

export default function EmergencyWorkflow({
  initialIncidentType = 'Financial Scam',
  initialMessageSnippet = '',
  onBackToScanner,
}: EmergencyWorkflowProps) {
  const { user, login } = useAuth();

  // Checklist State backed by localStorage
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  // Incident Form State
  const [incidentType, setIncidentType] = useState(initialIncidentType);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('₹ INR');
  const [paymentMethod, setPaymentMethod] = useState('UPI (GPay / PhonePe / Paytm)');
  const [transactionId, setTransactionId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [scammerContact, setScammerContact] = useState('');
  const [whatHappened, setWhatHappened] = useState(initialMessageSnippet);

  // Guardian Alert State
  const [alertStatus, setAlertStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [alertResponse, setAlertResponse] = useState<GuardianEmergencyAlertResponse | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectPhone, setConnectPhone] = useState('+919000000001');
  const [connectOtp, setConnectOtp] = useState('123456');
  const [connectJoinCode, setConnectJoinCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Load persisted checklist and incident details
  useEffect(() => {
    try {
      const savedChecklist = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (savedChecklist) {
        setCheckedItems(JSON.parse(savedChecklist));
      }
      const savedIncident = localStorage.getItem(INCIDENT_STORAGE_KEY);
      if (savedIncident) {
        const parsed = JSON.parse(savedIncident);
        if (parsed.incidentType) setIncidentType(parsed.incidentType);
        if (parsed.amount) setAmount(parsed.amount);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        if (parsed.transactionId) setTransactionId(parsed.transactionId);
        if (parsed.dateTime) setDateTime(parsed.dateTime);
        if (parsed.scammerContact) setScammerContact(parsed.scammerContact);
        if (parsed.whatHappened && !initialMessageSnippet) setWhatHappened(parsed.whatHappened);
      } else if (!dateTime) {
        const now = new Date();
        const formatted = now.toISOString().slice(0, 16);
        setDateTime(formatted);
      }
    } catch {
      // LocalStorage access issues gracefully ignored
    }
  }, [initialMessageSnippet]);

  // Sync checklist changes
  const toggleChecklist = (id: string) => {
    setCheckedItems(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignored
      }
      return updated;
    });
  };

  // Sync form inputs to localStorage
  const saveIncidentState = () => {
    try {
      localStorage.setItem(
        INCIDENT_STORAGE_KEY,
        JSON.stringify({
          incidentType,
          amount,
          currency,
          paymentMethod,
          transactionId,
          dateTime,
          scammerContact,
          whatHappened,
        })
      );
    } catch {
      // Ignored
    }
  };

  const handleGenerateSummary = () => {
    saveIncidentState();

    const completedActions: string[] = [];
    const evidenceList: string[] = [];

    if (checkedItems['tx_id']) evidenceList.push('Transaction ID / Bank Reference saved');
    if (checkedItems['screenshot']) evidenceList.push('Screenshots of chats, payment confirmations, and sender ID saved');
    if (checkedItems['scammer_phone']) evidenceList.push(`Scammer contact info recorded (${scammerContact.trim() || 'Recorded'})`);
    if (checkedItems['scam_link']) evidenceList.push('Suspicious URL/Domain links documented');

    if (checkedItems['bank_contacted']) completedActions.push('Contacted bank/payment provider to request emergency freeze/stop payment');
    if (checkedItems['account_secured']) completedActions.push('Changed net banking credentials, UPI PIN, and revoked suspicious app permissions');
    if (checkedItems['incident_reported']) completedActions.push('Reported incident to National Cybercrime Helpline (1930 / cybercrime.gov.in)');

    const summaryText = `INCIDENT SUMMARY

Incident type: ${incidentType.trim() || 'Financial Scam'}
Amount: ${amount.trim() ? `${amount.trim()} ${currency}` : 'Not provided'}
Payment method: ${paymentMethod.trim() || 'Not provided'}
Transaction ID: ${transactionId.trim() || 'Not provided'}
Date/time: ${dateTime.trim() || 'Not provided'}
Scammer contact: ${scammerContact.trim() || 'Not provided'}

What happened:
${whatHappened.trim() || 'Not provided'}

Immediate actions taken:
${completedActions.length > 0 ? completedActions.map((act, i) => `${i + 1}. ${act}`).join('\n') : 'None recorded yet. Proceed with bank freeze and 1930 cybercrime reporting immediately.'}

Evidence available:
${evidenceList.length > 0 ? evidenceList.map((ev, i) => `${i + 1}. ${ev}`).join('\n') : 'Evidence collection in progress.'}

--------------------------------------------------
DISCLAIMER: This incident summary is organized from victim-provided facts to assist in filing complaints with financial institutions and law enforcement agencies (e.g. National Cybercrime Reporting Portal 1930). This summary does not constitute an official complaint submission or guarantee of fund recovery.`;

    setGeneratedSummary(summaryText);
  };

  const handleCopySummary = async () => {
    if (!generatedSummary) return;
    try {
      await navigator.clipboard.writeText(generatedSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy
      const el = document.createElement('textarea');
      el.value = generatedSummary;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadTxt = () => {
    if (!generatedSummary) return;
    const blob = new Blob([generatedSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Scam_Incident_Summary_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAlertGuardian = async () => {
    if (!user || !user.family_id) {
      setShowConnectModal(true);
      return;
    }

    setAlertStatus('sending');
    setAlertError(null);

    try {
      saveIncidentState();
      const completedCount = DEFAULT_CHECKLIST_ITEMS.filter(it => checkedItems[it.id]).length;
      const progressStr = `${completedCount}/${DEFAULT_CHECKLIST_ITEMS.length} evidence checklist items verified`;

      const res: GuardianEmergencyAlertResponse = await api.createEmergencyAlert({
        incident_type: incidentType.trim() || 'Financial Scam',
        category: incidentType.includes('UPI') ? 'UPI / Payment' : incidentType.split('/')[0].trim() || 'Financial Scam',
        severity: 'critical',
        amount: amount.trim() ? `${amount.trim()} ${currency}` : undefined,
        currency: currency,
        payment_method: paymentMethod.trim() || undefined,
        transaction_id: transactionId.trim() || undefined,
        scammer_contact: scammerContact.trim() || undefined,
        what_happened: whatHappened.trim() || undefined,
        checklist_progress: progressStr,
      });

      setAlertResponse(res);
      setAlertStatus('sent');
    } catch (err: any) {
      console.error('Guardian alert error:', err);
      setAlertError(err.message || 'Guardian alert could not be sent.');
      setAlertStatus('error');
    }
  };

  const handleQuickDemoConnect = async () => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      // Setup demo users and family on backend
      await api.demoSetup().catch(() => {});
      // Login as protected user Maa
      await login('+919000000001', '123456');
      setShowConnectModal(false);
    } catch (err: any) {
      setConnectError(err.message || 'Could not connect demo account.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCustomJoinFamily = async () => {
    if (!connectJoinCode.trim() || connectJoinCode.trim().length !== 6) {
      setConnectError('Please enter a valid 6-digit family invite code.');
      return;
    }
    setIsConnecting(true);
    setConnectError(null);
    try {
      if (!user) {
        await login(connectPhone, connectOtp);
      }
      await api.joinFamily(connectJoinCode.trim());
      setShowConnectModal(false);
    } catch (err: any) {
      setConnectError(err.message || 'Failed to join family group.');
    } finally {
      setIsConnecting(false);
    }
  };

  const totalChecklist = DEFAULT_CHECKLIST_ITEMS.length;
  const completedCount = DEFAULT_CHECKLIST_ITEMS.filter(it => checkedItems[it.id]).length;
  const progressPercent = Math.round((completedCount / totalChecklist) * 100);

  return (
    <div className="w-full space-y-12 sm:space-y-16 animate-fade-in font-sans py-2 sm:py-4">
      {/* 1. Emergency Sub-Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          {onBackToScanner ? (
            <button
              onClick={onBackToScanner}
              className="text-xs sm:text-sm font-bold text-[#00e5a3] hover:underline flex items-center gap-2 cursor-pointer uppercase tracking-wider transition-colors"
            >
              ← BACK TO THREAT SCANNER
            </button>
          ) : (
            <div className="text-xs text-[var(--text-muted)] uppercase">
              AI SCAM SHIELD EMERGENCY CONSOLE
            </div>
          )}

          <a
            href="#family-safety"
            className="px-3 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5"
          >
            <span>👨‍👩‍👧</span> ALERT GUARDIAN ↓
          </a>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] hidden sm:inline-block">
            STATUS:
          </span>
          <div className="text-xs px-3.5 py-1.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            INCIDENT_RESPONSE_ACTIVE
          </div>
        </div>
      </div>

      {/* 2. Emergency Warning Banner (Section 12 — Spacious) */}
      <div className="cyber-card-danger p-8 sm:p-10 lg:p-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-500/20 text-red-300 text-xs font-mono font-bold uppercase">
              ⚡ IMMEDIATE VICTIM GUIDANCE
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight leading-tight">
              I&apos;ve already sent money. What should I do?
            </h1>
            <p className="text-red-200/90 text-sm sm:text-base font-medium leading-relaxed max-w-2xl">
              Act quickly. Don&apos;t send the scammer anything else.
            </p>
          </div>

          <a
            href="#family-safety"
            className="btn-cyber-danger text-xs sm:text-sm py-3 px-6 whitespace-nowrap self-start sm:self-auto font-mono font-bold uppercase shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          >
            <span>👨‍👩‍👧</span> JUMP TO GUARDIAN ALERT ↓
          </a>
        </div>

        <div className="p-5 sm:p-6 rounded-lg bg-[#0e1320] border border-red-500/35 text-xs sm:text-sm text-red-200 flex flex-col md:flex-row md:flex-row md:items-center justify-between gap-4 font-mono shadow-inner">
          <div>
            <span className="font-bold text-white uppercase">INDIA CYBERCRIME HOTLINE: </span>
            <span className="text-[#00e5a3] font-extrabold text-base sm:text-lg">DIAL 1930</span> or visit{' '}
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-white hover:text-[#00e5a3] transition-colors"
            >
              cybercrime.gov.in
            </a>
          </div>
          <div className="text-[11px] sm:text-xs text-red-300/85 uppercase tracking-wider font-semibold">
            GOLDEN HOUR: REPORT WITHIN 2 HOURS FOR HIGHEST RECOVERY CHANCE
          </div>
        </div>
      </div>

      {/* 3. Section 12: 8 Prioritized Actions (Spacious 2-Column Grid) */}
      <div className="cyber-card p-8 sm:p-10 lg:p-12 space-y-8">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00e5a3]">
            SEQUENTIAL PROTOCOL
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1.5 tracking-tight">
            8 Immediate Steps You Must Take
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Execute these chronological actions right now to minimize loss and preserve evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Step 1 */}
          <div className="cyber-card-inner p-6 sm:p-7 flex items-start gap-5 h-full min-h-[125px]">
            <span className="flex-shrink-0 w-8 h-8 rounded-md bg-red-500/20 text-red-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-red-500/40 mt-0.5">
              1
            </span>
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-white leading-snug">
                Contact Bank / Payment Provider Immediately
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Call the official fraud support number on your debit/credit card or UPI app to request an urgent freeze on the transaction.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="cyber-card-inner p-6 sm:p-7 flex items-start gap-5 h-full min-h-[125px]">
            <span className="flex-shrink-0 w-8 h-8 rounded-md bg-red-500/20 text-red-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-red-500/40 mt-0.5">
              2
            </span>
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-white leading-snug">
                Report the Fraudulent Transaction
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Ask the bank support agent to register a formal chargeback / cyber fraud complaint and obtain a Complaint Reference Number.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="cyber-card-inner p-6 sm:p-7 flex items-start gap-5 h-full min-h-[125px]">
            <span className="flex-shrink-0 w-8 h-8 rounded-md bg-[#00e5a3]/20 text-[#00e5a3] font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-[#00e5a3]/40 mt-0.5">
              3
            </span>
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-white leading-snug">
                Save Screenshots &amp; Transaction Details
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Capture clear screenshots of transaction receipts showing the UTR, UPI reference number, receiver UPI ID, timestamp, and amount.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="cyber-card-inner p-6 sm:p-7 flex items-start gap-5 h-full min-h-[125px]">
            <span className="flex-shrink-0 w-8 h-8 rounded-md bg-[#00e5a3]/20 text-[#00e5a3] font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-[#00e5a3]/40 mt-0.5">
              4
            </span>
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-white leading-snug">
                Preserve the Scam Conversation
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Do NOT delete chats, SMS, or call logs. Export the WhatsApp chat or take high-resolution screenshots as legal proof.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="cyber-card-inner p-6 sm:p-7 flex items-start gap-5 h-full min-h-[125px]">
            <span className="flex-shrink-0 w-8 h-8 rounded-md bg-yellow-500/20 text-yellow-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-yellow-500/40 mt-0.5">
              5
            </span>
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-white leading-snug">
                Save Scammer Contact Info
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Note down the scammer&apos;s caller phone number, UPI ID, email address, website URLs, and social profile links.
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="cyber-card-inner p-6 sm:p-7 flex items-start gap-5 h-full min-h-[125px]">
            <span className="flex-shrink-0 w-8 h-8 rounded-md bg-red-500/20 text-red-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-red-500/40 mt-0.5">
              6
            </span>
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-white leading-snug">
                Do NOT Send More Money to &quot;Recover&quot; Funds
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Scammers often promise refunds if you pay a &quot;tax&quot;, &quot;activation fee&quot;, or &quot;cancellation fee&quot;. This is always a secondary trap.
              </p>
            </div>
          </div>

          {/* Step 7 */}
          <div className="cyber-card-inner p-6 sm:p-7 flex items-start gap-5 h-full min-h-[125px]">
            <span className="flex-shrink-0 w-8 h-8 rounded-md bg-purple-500/20 text-purple-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-purple-500/40 mt-0.5">
              7
            </span>
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-white leading-snug">
                Secure Compromised Accounts
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Change your UPI PIN, banking password, and email password immediately. Uninstall AnyDesk or TeamViewer if installed.
              </p>
            </div>
          </div>

          {/* Step 8 */}
          <div className="cyber-card-inner p-6 sm:p-7 flex items-start gap-5 h-full min-h-[125px]">
            <span className="flex-shrink-0 w-8 h-8 rounded-md bg-[#00e5a3]/20 text-[#00e5a3] font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-[#00e5a3]/40 mt-0.5">
              8
            </span>
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-white leading-snug">
                File Official Cybercrime Complaint
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Call 1930 or submit an official incident report on cybercrime.gov.in. Provide your transaction UTR and evidence summary.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3.5. Family Safety — Alert My Guardian */}
      <div id="family-safety" className="cyber-card p-8 sm:p-10 lg:p-12 space-y-8 border-2 border-amber-500/30 bg-gradient-to-b from-[#141a29] to-[#0a0e17] relative overflow-hidden shadow-2xl scroll-mt-24">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span>👨‍👩‍👧</span> FAMILY SAFETY PROTOCOL
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1.5 tracking-tight">
              Alert My Guardian
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
              Have a trusted family member connected? Dispatch this emergency incident to their Guardian Dashboard so they can help you coordinate with authorities.
            </p>
          </div>

          {/* Guardian Connection State Badge */}
          <div className="font-mono text-xs flex-shrink-0">
            {user?.family_id ? (
              <div className="px-3.5 py-1.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                GUARDIAN CONNECTED ({user.name})
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded bg-white/5 border border-white/15 text-[var(--text-muted)] font-semibold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                NO GUARDIAN CONNECTED
              </div>
            )}
          </div>
        </div>

        {/* STATE 3: Alert Already Sent */}
        {alertStatus === 'sent' && alertResponse && (
          <div className="p-6 sm:p-8 rounded-xl border border-[#00e5a3]/50 bg-[#071915] space-y-5 animate-slide-up shadow-[0_0_30px_rgba(0,229,163,0.15)]">
            <div className="flex items-start gap-4">
              <span className="text-3xl sm:text-4xl">🚨</span>
              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#00e5a3]/20 border border-[#00e5a3]/40 text-[#00e5a3] text-xs font-mono font-bold uppercase">
                  ✓ GUARDIAN ALERT SENT
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase text-white font-mono">
                  Emergency Alert Dispatched Successfully
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  Your family guardian has received this incident alert in real-time. They have access to the recorded transaction facts and can monitor action plan progress.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#00e5a3]/20 font-mono text-xs">
              <div>
                <span className="text-[var(--text-muted)] uppercase block">ALERT ID:</span>
                <span className="text-white font-bold">{alertResponse.alert_id.slice(0, 13)}...</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] uppercase block">SEVERITY LEVEL:</span>
                <span className="text-red-400 font-bold uppercase">{alertResponse.severity}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] uppercase block">DISPATCH TIME:</span>
                <span className="text-gray-200">{new Date(alertResponse.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="/guardian/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyber-primary-sm text-xs font-bold"
              >
                <span>👁️</span> OPEN GUARDIAN DASHBOARD (DEMO VIEW) →
              </a>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                Duplicate submissions locked to prevent alert flooding.
              </span>
            </div>
          </div>
        )}

        {/* STATE 4: Backend Unavailable / Error Notification */}
        {alertStatus === 'error' && (
          <div className="p-6 rounded-xl border border-red-500/50 bg-red-950/25 text-red-200 space-y-3 animate-fade-in font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-red-400 font-bold uppercase">
              <span>⚠️</span> Guardian alert could not be sent.
            </div>
            <p className="font-sans text-xs sm:text-sm text-red-200/90 leading-relaxed">
              {alertError || 'Unable to establish connection with the family notification server.'}
            </p>
            <div className="p-3.5 rounded bg-black/50 border border-red-500/30 text-white font-bold leading-relaxed">
              📢 <span className="underline">IMPORTANT</span>: Continue the emergency steps below. Call <span className="text-[#00e5a3]">1930</span> immediately if funds were transferred.
            </div>
            <div className="pt-2">
              <button
                onClick={handleAlertGuardian}
                className="btn-cyber-outline-sm text-xs text-red-300 border-red-500/40 hover:bg-red-500/20"
              >
                🔄 RETRY GUARDIAN DISPATCH
              </button>
            </div>
          </div>
        )}

        {/* Main Action & Status Container (When alert not yet sent) */}
        {alertStatus !== 'sent' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-center relative z-10">
            <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
              <p className="leading-relaxed">
                Alerting your guardian sends a concise, sanitized incident report containing the transaction details and emergency status you recorded above without exposing your private conversations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs text-gray-300 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#00e5a3]">✓</span> Real-time Dashboard alert
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00e5a3]">✓</span> Recorded UTR &amp; amount sent
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00e5a3]">✓</span> Live timeline &amp; step sync
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00e5a3]">✓</span> Zero raw chat exposure
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {user?.family_id ? (
                /* STATE 1: Guardian Connected */
                <button
                  onClick={handleAlertGuardian}
                  disabled={alertStatus === 'sending'}
                  className="btn-cyber-danger w-full h-[60px] text-sm sm:text-base font-black shadow-[0_0_24px_rgba(239,68,68,0.35)] tracking-wider"
                >
                  {alertStatus === 'sending' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>DISPATCHING ALERT...</span>
                    </>
                  ) : (
                    <>
                      <span>🚨</span> ALERT MY GUARDIAN
                    </>
                  )}
                </button>
              ) : (
                /* STATE 2: No Guardian Connected */
                <div className="space-y-2.5">
                  <button
                    onClick={() => setShowConnectModal(!showConnectModal)}
                    className="btn-cyber-primary w-full h-[56px] text-xs sm:text-sm font-bold uppercase tracking-wider"
                  >
                    <span>👨‍👩‍👧</span> CONNECT A GUARDIAN
                  </button>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono text-center">
                    Optional family escalation • Emergency response remains 100% active
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inline Guardian Pairing / Demo Connection Drawer */}
        {showConnectModal && !user?.family_id && alertStatus !== 'sent' && (
          <div className="p-6 sm:p-8 rounded-xl border border-amber-500/40 bg-[#060810] space-y-6 animate-slide-up relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-amber-400 uppercase">
                <span>🔗</span> Connect Family Guardian
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-xs text-[var(--text-muted)] hover:text-white font-mono uppercase"
              >
                [ CLOSE ✕ ]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: Instant Hackathon Demo Setup */}
              <div className="p-5 rounded-lg border border-blue-500/30 bg-blue-950/20 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-xs font-mono font-bold text-blue-300 uppercase flex items-center gap-2">
                    <span>⚡</span> 1-Click Demo Setup
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Instantly connects as protected user <strong className="text-white">মা (Maa)</strong> linked to demo guardian <strong className="text-white">Rina</strong>.
                  </p>
                </div>

                <button
                  onClick={handleQuickDemoConnect}
                  disabled={isConnecting}
                  className="btn-cyber-primary w-full text-xs font-bold py-3 mt-2"
                >
                  {isConnecting ? 'CONNECTING DEMO GUARDIAN...' : '⚡ ACTIVATE DEMO FAMILY LINK'}
                </button>
              </div>

              {/* Option B: Enter 6-Digit Join Code */}
              <div className="p-5 rounded-lg border border-white/10 bg-white/[0.02] space-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-gray-200 uppercase">
                    Enter 6-Digit Family Code
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Ask your family member for their 6-digit Guardian invite code.
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={connectJoinCode}
                    onChange={e => setConnectJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 123456"
                    maxLength={6}
                    className="cyber-input text-center font-mono text-lg tracking-widest uppercase"
                  />
                  <button
                    onClick={handleCustomJoinFamily}
                    disabled={isConnecting || connectJoinCode.length < 6}
                    className="btn-cyber-outline w-full text-xs font-bold py-2.5"
                  >
                    {isConnecting ? 'LINKING FAMILY...' : 'PAIR WITH FAMILY CODE'}
                  </button>
                </div>
              </div>
            </div>

            {connectError && (
              <div className="p-3 rounded bg-red-950/30 border border-red-500/30 text-xs text-red-300 font-mono">
                ⚠️ {connectError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Section 13: Emergency Checklist (Spacious & Clean) */}
      <div className="cyber-card p-8 sm:p-10 lg:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00e5a3]">
              EVIDENCE PRESERVATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1.5 tracking-tight">
              Emergency Evidence Checklist
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Check off items as you complete them. Progress is automatically persisted in your local browser storage.
            </p>
          </div>

          <div className="font-mono text-sm sm:text-base font-bold text-[#00e5a3] sm:text-right">
            {completedCount} / {totalChecklist} VERIFIED ({progressPercent}%)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-[#00e5a3] transition-all duration-300 shadow-[0_0_10px_#00e5a3]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist Rows */}
        <div className="space-y-4">
          {DEFAULT_CHECKLIST_ITEMS.map(item => {
            const isChecked = !!checkedItems[item.id];
            return (
              <label
                key={item.id}
                className={`flex items-start gap-5 p-5 sm:p-6 rounded-lg border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-[#00e5a3]/[0.06] border-[#00e5a3]/40 text-white'
                    : 'cyber-card-inner text-[var(--text-secondary)] hover:border-white/25'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleChecklist(item.id)}
                  className="mt-1 w-4.5 h-4.5 rounded border border-white/30 bg-black text-[#00e5a3] focus:ring-0 flex-shrink-0 cursor-pointer accent-[#00e5a3]"
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm sm:text-base font-bold leading-tight ${isChecked ? 'text-white line-through opacity-85' : 'text-white'}`}>
                    {item.label}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    {item.hint}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Section 14: Incident Details Form (Structured 3/2-Column Grid — Spacious) */}
      <div className="cyber-card p-8 sm:p-10 lg:p-12 space-y-8">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00e5a3]">
            COMPLAINT BUILDER
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1.5 tracking-tight">
            Record Incident Facts
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Provide available incident details. Missing fields are automatically formatted as &quot;Not provided&quot; without fabricating data.
          </p>
        </div>

        <div className="space-y-6">
          {/* Row 1: 3 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                Incident Type
              </label>
              <select
                value={incidentType}
                onChange={e => { setIncidentType(e.target.value); saveIncidentState(); }}
                className="cyber-select"
              >
                <option value="Financial Scam / UPI Fraud">Financial Scam / UPI Fraud</option>
                <option value="Electricity Disconnection Fraud">Electricity Disconnection Fraud</option>
                <option value="Bank KYC Deactivation Scam">Bank KYC Deactivation Scam</option>
                <option value="Courier / Customs Package Scam">Courier / Customs Package Scam</option>
                <option value="Police / Digital Arrest Extortion">Police / Digital Arrest Extortion</option>
                <option value="Task-Based / Part-Time Job Scam">Task-Based / Part-Time Job Scam</option>
                <option value="Investment / Crypto Scheme">Investment / Crypto Scheme</option>
                <option value="Fake Customer Support / Remote Access">Fake Customer Support / Remote Access</option>
                <option value="Other Scam">Other Scam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                Amount Lost
              </label>
              <input
                type="text"
                value={amount}
                onChange={e => { setAmount(e.target.value); saveIncidentState(); }}
                placeholder="e.g. 10,000"
                className="cyber-input"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={e => { setCurrency(e.target.value); saveIncidentState(); }}
                className="cyber-select"
              >
                <option value="₹ INR">₹ INR</option>
                <option value="$ USD">$ USD</option>
                <option value="€ EUR">€ EUR</option>
                <option value="£ GBP">£ GBP</option>
              </select>
            </div>
          </div>

          {/* Row 2: 2 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                Payment Method
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={e => { setPaymentMethod(e.target.value); saveIncidentState(); }}
                placeholder="e.g. Google Pay (SBI UPI), IMPS, Credit Card"
                className="cyber-input"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                Transaction ID / UTR
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={e => { setTransactionId(e.target.value); saveIncidentState(); }}
                placeholder="e.g. UPI Ref / UTR 428938174921"
                className="cyber-input"
              />
            </div>
          </div>

          {/* Row 3: 2 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                Date &amp; Time
              </label>
              <input
                type="text"
                value={dateTime}
                onChange={e => { setDateTime(e.target.value); saveIncidentState(); }}
                placeholder="e.g. 11-SEP-2026 21:30 IST"
                className="cyber-input"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                Scammer Contact (Phone, UPI ID, Email, URL)
              </label>
              <input
                type="text"
                value={scammerContact}
                onChange={e => { setScammerContact(e.target.value); saveIncidentState(); }}
                placeholder="e.g. +91 9876543210, fraud@okhdfc"
                className="cyber-input"
              />
            </div>
          </div>

          {/* Row 4: Full-Width Narrative Textarea */}
          <div>
            <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
              What Happened (Narrative of the deceit)
            </label>
            <textarea
              value={whatHappened}
              onChange={e => { setWhatHappened(e.target.value); saveIncidentState(); }}
              rows={5}
              placeholder="Explain what the scammer told you, how they pressured you, and what steps you were told to take..."
              className="cyber-textarea"
            />
          </div>

          {/* Row 5: Action Button */}
          <div className="pt-3">
            <button
              onClick={handleGenerateSummary}
              className="btn-cyber-primary w-full h-[52px] text-sm sm:text-base font-bold"
            >
              <span>📑</span> GENERATE INCIDENT SUMMARY
            </button>
          </div>
        </div>
      </div>

      {/* 6. Section 15: Incident Summary Output (Spacious & Clean) */}
      {generatedSummary && (
        <div className="cyber-card p-8 sm:p-10 lg:p-12 space-y-6 border border-[#00e5a3]/30 animate-slide-up shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00e5a3]">
                EVIDENCE DOSSIER READY
              </div>
              <h2 className="text-2xl font-black uppercase text-white mt-1 tracking-tight">
                Formatted Incident Summary
              </h2>
            </div>

            <div className="flex items-center gap-3.5">
              <button
                onClick={handleCopySummary}
                className="btn-cyber-primary-sm text-xs"
              >
                <span>{copied ? '✅' : '📋'}</span>
                {copied ? 'COPIED TO CLIPBOARD!' : 'COPY SUMMARY'}
              </button>
              <button
                onClick={handleDownloadTxt}
                className="btn-cyber-outline-sm text-xs"
              >
                <span>💾</span> DOWNLOAD .TXT
              </button>
            </div>
          </div>

          <pre className="p-6 sm:p-8 rounded-lg bg-[#030406] border border-white/10 text-xs sm:text-sm text-gray-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto select-all">
            {generatedSummary}
          </pre>
        </div>
      )}
    </div>
  );
}
