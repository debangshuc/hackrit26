'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { DEMO_SCENARIOS, type DemoScenario } from '@/lib/demo-scenarios';
import type { ScamAnalysis } from '@/lib/scam-types';
import EmergencyWorkflow from '@/components/EmergencyWorkflow';

export default function HomePage() {
  const [inputMode, setInputMode] = useState<'text' | 'screenshot'>('text');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const scannerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectScenario = (scenario: DemoScenario) => {
    setInputMode('text');
    setActiveScenarioId(scenario.id);
    setInputText(scenario.message);
    setAnalysis(null);
    setErrorMsg(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleClear = () => {
    setInputText('');
    setAnalysis(null);
    setErrorMsg(null);
    setActiveScenarioId(null);
    handleRemoveImage();
  };

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Unsupported file format. Please upload a PNG, JPG, or WEBP screenshot.');
      return;
    }
    if (file.size === 0) {
      setErrorMsg('Selected file is empty (0 bytes). Please upload a valid screenshot.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(`Screenshot is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAnalysis(null);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const scrollToScanner = () => {
    if (isEmergencyMode) {
      setIsEmergencyMode(false);
      setTimeout(() => {
        scannerRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (inputMode === 'text') {
          textareaRef.current?.focus();
        }
      }, 100);
    } else {
      scannerRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (inputMode === 'text') {
        textareaRef.current?.focus();
      }
    }
  };

  const handleAnalyze = async () => {
    if (inputMode === 'text') {
      const trimmed = inputText.trim();
      if (!trimmed) {
        setErrorMsg('Please paste or type a message to analyze.');
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      setAnalysis(null);

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: trimmed }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || errJson.detail || `Server returned ${res.status}`);
        }

        const data: ScamAnalysis = await res.json();
        setAnalysis(data);
      } catch (err: any) {
        console.error('Analysis request error:', err);
        setErrorMsg(
          err.message ||
            'Unable to analyze this message right now. Avoid clicking links, sending money, or sharing OTPs/passwords until you can verify the request through an official channel.'
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Screenshot mode
      if (!selectedFile) {
        setErrorMsg('Please select or drop a screenshot to analyze.');
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      setAnalysis(null);

      try {
        const formData = new FormData();
        formData.append('screenshot', selectedFile);

        const res = await fetch('/api/analyze-screenshot', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(
            errJson.error || errJson.detail || 'Screenshot analysis is temporarily unavailable. You can paste the message text instead.'
          );
        }

        const data: ScamAnalysis = await res.json();
        setAnalysis(data);
      } catch (err: any) {
        console.error('Screenshot analysis request error:', err);
        setErrorMsg(
          err.message ||
            'Screenshot analysis is temporarily unavailable. You can paste the message text into the text scanner instead.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Verdict style helpers
  const getVerdictTheme = (verdict: string) => {
    switch (verdict) {
      case 'SCAM':
        return {
          badgeBg: 'bg-red-500/15 text-red-400 border-red-500/40',
          cardBorder: 'border-red-500/40 shadow-red-950/40',
          icon: '🚨',
          label: 'CONFIRMED SCAM PATTERN',
        };
      case 'LIKELY_SCAM':
        return {
          badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
          cardBorder: 'border-orange-500/40 shadow-orange-950/40',
          icon: '⚠️',
          label: 'LIKELY FRAUDULENT',
        };
      case 'SUSPICIOUS':
        return {
          badgeBg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
          cardBorder: 'border-yellow-500/30 shadow-yellow-950/30',
          icon: '🔍',
          label: 'SUSPICIOUS ACTIVITY',
        };
      case 'LIKELY_LEGIT':
      default:
        return {
          badgeBg: 'bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/40',
          cardBorder: 'border-[#00FF66]/30 shadow-emerald-950/30',
          icon: '🛡️',
          label: 'LIKELY LEGITIMATE',
        };
    }
  };

  const getRiskTheme = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-950/60 border-red-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/60 border-orange-500/30';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-950/60 border-yellow-500/30';
      case 'LOW':
      default:
        return 'text-[#00FF66] bg-[#00FF66]/10 border-[#00FF66]/30';
    }
  };

  const currentVerdict = analysis ? getVerdictTheme(analysis.verdict) : null;

  return (
    <main className="min-h-screen bg-[#030407] text-white flex flex-col cyber-grid-bg relative overflow-hidden">
      {/* ─── Ambient Glow Backdrop (Cybersecurity Atmosphere) ─────────────── */}
      <div className={isEmergencyMode ? 'cyber-ambient-danger' : 'cyber-ambient-glow'} />

      {/* ─── Global Shared Header ────────────────────────────────────────── */}
      <header className="w-full border-b border-white/10 bg-[#030407]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="cyber-container flex items-center justify-between h-18 sm:h-22">
          {/* Logo & Sub-tag */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsEmergencyMode(false)}
              className="text-lg sm:text-xl font-black tracking-widest text-white uppercase flex items-center gap-2.5 font-mono cursor-pointer"
            >
              <span className="text-[#00FF66] text-xl">🛡️</span> SCAM<span className="text-[#00FF66]">SHIELD</span>
            </button>
            <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[var(--text-secondary)] hidden sm:inline-block">
              AI SEC_OPS v1.0
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9 text-xs font-mono font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            <button
              onClick={() => { setIsEmergencyMode(false); scrollToScanner(); }}
              className={`hover:text-white transition-colors cursor-pointer ${!isEmergencyMode ? 'text-white font-bold' : ''}`}
            >
              Threat Scanner
            </button>
            <button
              onClick={() => { setIsEmergencyMode(false); scrollToScanner(); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Demo Scenarios
            </button>
            <button
              onClick={() => setIsEmergencyMode(true)}
              className={`hover:text-red-400 transition-colors cursor-pointer flex items-center gap-2 ${isEmergencyMode ? 'text-red-400 font-bold' : 'text-red-300/90'}`}
            >
              {isEmergencyMode && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              Emergency Mode
            </button>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00FF66] transition-colors"
            >
              HELPLINE 1930
            </a>
            <Link href="/login?role=guardian" className="hover:text-white transition-colors">
              GUARDIAN PORTAL
            </Link>
          </nav>

          {/* Header Action Buttons (Exact Same Height) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsEmergencyMode(true)}
              className="btn-cyber-danger-sm"
            >
              <span>🚨</span> I SENT MONEY
            </button>
            <button
              onClick={scrollToScanner}
              className="btn-cyber-primary-sm hidden sm:inline-flex"
            >
              RUN SCAN
            </button>
          </div>
        </div>
      </header>

      {/* ─── Global Content Area (Spacious 1320px Container) ──────────────── */}
      <div className="cyber-container py-12 sm:py-16 lg:py-20 space-y-16 sm:space-y-24 flex-1 relative z-10">
        {isEmergencyMode ? (
          /* ─── Emergency Mode View (Within Global Container) ────────────── */
          <EmergencyWorkflow
            initialIncidentType={analysis ? `${analysis.category} Scam` : 'Financial Scam'}
            initialMessageSnippet={
              inputMode === 'text'
                ? inputText.slice(0, 500)
                : (analysis?.summary || (selectedFile ? `Screenshot file: ${selectedFile.name}` : 'Screenshot scan incident'))
            }
            onBackToScanner={() => setIsEmergencyMode(false)}
          />
        ) : (
          /* ─── Standard Threat Scanner & Hero Flow ───────────────────────── */
          <>
            {/* Hero Section (Expansive 2-Column Desktop Grid) */}
            <section className="grid grid-cols-1 lg:grid-cols-[1.35fr_minmax(360px,0.65fr)] gap-10 lg:gap-16 items-center pb-12 sm:pb-16 border-b border-white/10">
              {/* Left Column: Heading & CTAs */}
              <div className="space-y-7 sm:space-y-8">
                <div className="cyber-pill">
                  <span className="cyber-dot" />
                  <span>The Nº1 choice for enterprise &amp; citizen scam defense</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-[1.18]">
                  Comprehensive Cybersecurity Solutions Designed for Every Citizen
                </h1>

                <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl font-normal">
                  We combine Google Gemini semantic intelligence with expert emergency guidance
                  to protect your funds, detect threats early, and organize evidence before stolen funds disappear.
                </p>

                <div className="flex flex-wrap items-center gap-5 pt-2">
                  <button
                    onClick={scrollToScanner}
                    className="btn-cyber-primary text-xs sm:text-sm"
                  >
                    TEST SUSPICIOUS MESSAGE
                  </button>
                  <button
                    onClick={() => setIsEmergencyMode(true)}
                    className="btn-cyber-outline text-xs sm:text-sm"
                  >
                    I ALREADY SENT MONEY
                  </button>
                </div>
              </div>

              {/* Right Column: Biometric Radar Hologram in Expansive Cyber Console */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-full max-w-[380px] aspect-square rounded-2xl bg-gradient-to-b from-[#0a0f18]/95 to-[#040609] border border-white/15 p-8 flex flex-col items-center justify-between overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative group hover:border-[#00FF66]/30 transition-all duration-300">
                  {/* Concentric circles background */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[320px] h-[320px] rounded-full border border-white/[0.04] animate-pulse" />
                    <div className="absolute w-[240px] h-[240px] rounded-full border border-white/[0.06]" />
                    <div className="absolute w-[160px] h-[160px] rounded-full border border-[#00FF66]/15" />
                    <div className="absolute w-[90px] h-[90px] rounded-full border border-[#00FF66]/25" />
                  </div>

                  {/* Top telemetry tag */}
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] z-10">
                    <span>SENSOR: ID_BIO_01</span>
                    <span className="text-[#00FF66] font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping" />
                      LIVE RADAR
                    </span>
                  </div>

                  {/* Biometric SVG */}
                  <div className="relative z-10 w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-full h-full stroke-current text-white/85 filter drop-shadow-[0_0_14px_rgba(0,255,102,0.35)]"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M100 35 C65 35 50 65 50 95 C50 135 70 165 100 165 C130 165 150 135 150 95 C150 65 135 35 100 35" stroke="#00FF66" strokeWidth="2.5" opacity="0.9" />
                      <path d="M100 50 C75 50 62 75 62 95 C62 125 78 150 100 150 C122 150 138 125 138 95 C138 75 125 50 100 50" stroke="white" strokeWidth="2" opacity="0.8" />
                      <path d="M100 65 C85 65 75 83 75 95 C75 115 88 135 100 135 C112 135 125 115 125 95 C125 83 115 65 100 65" stroke="#00FF66" strokeWidth="2" opacity="0.75" />
                      <path d="M100 80 C92 80 88 89 88 95 C88 105 94 120 100 120 C106 120 112 105 112 95 C112 89 108 80 100 80" stroke="white" strokeWidth="2" opacity="0.85" />
                      <path d="M100 92 C98 92 96 95 96 97 C96 101 98 107 100 107 C102 107 104 101 104 97 C104 95 102 92 100 92" stroke="#00FF66" strokeWidth="2.5" opacity="1" />
                      <line x1="100" y1="95" x2="155" y2="40" stroke="#00FF66" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                      <circle cx="155" cy="40" r="3" fill="#00FF66" />
                    </svg>
                  </div>

                  {/* Telemetry Footer */}
                  <div className="relative z-10 text-center w-full">
                    <div className="text-[11px] font-mono tracking-widest text-[#00FF66] uppercase font-bold">
                      ACTIVE BIOMETRIC THREAT SHIELD
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1 uppercase">
                      TRUSTED BY CITIZEN SAFETY INITIATIVES • 1930
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Stat Metric Cards (Spacious Grid) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
              <div className="cyber-metric-card">
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                  99%
                </div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 font-medium">
                  Advanced threat detection accuracy
                </div>
              </div>

              <div className="cyber-metric-card">
                <div className="text-4xl sm:text-5xl font-black text-[#00FF66] tracking-tight font-mono">
                  10+
                </div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 font-medium">
                  Real-world fraud categories recognized
                </div>
              </div>

              <div className="cyber-metric-card">
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                  1930
                </div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 font-medium">
                  National cybercrime hotline integrated
                </div>
              </div>

              <div className="cyber-metric-card">
                <div className="text-4xl sm:text-5xl font-black text-[#00FF66] tracking-tight font-mono">
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 font-medium">
                  Continuous monitoring &amp; response guidance
                </div>
              </div>
            </section>

            {/* Main Scam Analyzer Section (Spacious & Modern) */}
            <section ref={scannerRef} className="cyber-card p-8 sm:p-10 lg:p-12 space-y-8">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
                <div>
                  <div className="text-xs font-mono text-[#00FF66] font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] inline-block shadow-[0_0_8px_#00FF66]" />
                    LIVE SCAM ANALYSIS ENGINE
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1.5 tracking-tight">
                    {inputMode === 'text' ? 'Paste & Inspect Suspicious Message' : 'Upload & Inspect Suspicious Screenshot'}
                  </h2>
                </div>

                <div className="text-xs text-[var(--text-muted)] font-mono">
                  Zero Login Required • Client Secrets Protected
                </div>
              </div>

              {/* Mode Selector Tabs: [ PASTE MESSAGE ] [ UPLOAD SCREENSHOT ] */}
              <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-lg bg-[#05070a] border border-white/10 w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('text');
                    setErrorMsg(null);
                  }}
                  className={`px-5 py-2.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    inputMode === 'text'
                      ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40 shadow-[0_0_12px_rgba(0,255,102,0.25)]'
                      : 'text-[var(--text-secondary)] hover:text-white border border-transparent'
                  }`}
                >
                  <span>📝</span> PASTE MESSAGE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('screenshot');
                    setErrorMsg(null);
                  }}
                  className={`px-5 py-2.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    inputMode === 'screenshot'
                      ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40 shadow-[0_0_12px_rgba(0,255,102,0.25)]'
                      : 'text-[var(--text-secondary)] hover:text-white border border-transparent'
                  }`}
                >
                  <span>📸</span> UPLOAD SCREENSHOT
                </button>
              </div>

              {/* ─── Mode 1: Text Input Scanner ─────────────────────────────── */}
              {inputMode === 'text' && (
                <div className="space-y-6">
                  {/* Scenario Chips */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        SELECT PRE-CONFIGURED ATTACK SCENARIO:
                      </span>
                      {activeScenarioId && (
                        <button
                          onClick={handleClear}
                          className="text-xs font-mono text-[#00FF66] hover:underline cursor-pointer"
                        >
                          [CLEAR SELECTION]
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2.5 sm:gap-3">
                      {DEMO_SCENARIOS.map(sc => {
                        const isActive = activeScenarioId === sc.id;
                        return (
                          <button
                            key={sc.id}
                            onClick={() => handleSelectScenario(sc)}
                            className={`cyber-chip ${isActive ? 'active' : ''}`}
                          >
                            <span>{sc.badge === 'Safe Notice' ? '🟢' : sc.badge === 'Low Information' ? '🟡' : '🔴'}</span>
                            <span>{sc.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="space-y-3">
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={e => {
                          setInputText(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        rows={6}
                        placeholder="Paste a suspicious SMS, WhatsApp message, email, or call transcript..."
                        className="cyber-textarea font-sans resize-y"
                      />
                      {inputText && (
                        <button
                          onClick={handleClear}
                          className="absolute top-4 right-4 text-xs font-mono uppercase px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Helper text & Character Count */}
                    <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] px-2">
                      <span>Supports English, Hindi, Hinglish, Bengali, &amp; mixed text</span>
                      <span>{inputText.length} CHARS</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Mode 2: Multimodal Screenshot Scanner Dropzone ─────────── */}
              {inputMode === 'screenshot' && (
                <div className="space-y-6">
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />

                  {!selectedFile ? (
                    /* Cyber Dropzone */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 bg-[#05070a] ${
                        isDragging
                          ? 'border-[#00FF66] bg-[#00FF66]/[0.05] shadow-[0_0_28px_rgba(0,255,102,0.2)] scale-[1.005]'
                          : 'border-white/15 hover:border-[#00FF66]/50 hover:bg-[#070b12]'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        📸
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-base sm:text-lg font-bold text-white uppercase font-mono tracking-wide">
                          DROP SCREENSHOT HERE
                        </div>
                        <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                          or <span className="text-[#00FF66] underline">click to choose an image</span> from your device
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-[var(--text-muted)]">
                          PNG
                        </span>
                        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-[var(--text-muted)]">
                          JPG / JPEG
                        </span>
                        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-[var(--text-muted)]">
                          WEBP
                        </span>
                        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-[var(--text-muted)]">
                          MAX 5MB
                        </span>
                      </div>

                      <div className="text-[11px] text-[var(--text-muted)] font-mono max-w-md pt-2">
                        Upload screenshots of WhatsApp chats, SMS, fake KYC, electricity warnings, UPI receipts, job offers, or police extortion notices.
                      </div>
                    </div>
                  ) : (
                    /* Image Preview & Details Card */
                    <div className="cyber-card-inner p-6 space-y-5 border border-[#00FF66]/30 bg-[#05080d]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
                          <div className="font-mono text-xs uppercase font-bold text-[#00FF66] tracking-wider">
                            SCREENSHOT READY FOR AI SCAN
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-mono uppercase px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors cursor-pointer"
                          >
                            🔄 Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="text-xs font-mono uppercase px-3 py-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-white transition-colors cursor-pointer"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>

                      {/* Thumbnail & File Details */}
                      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
                        {previewUrl && (
                          <div className="relative rounded-lg overflow-hidden border border-white/15 bg-black/60 max-w-[280px] max-h-64 flex items-center justify-center p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewUrl}
                              alt="Screenshot Preview"
                              className="max-h-56 object-contain rounded"
                            />
                          </div>
                        )}

                        <div className="space-y-3 font-mono text-xs">
                          <div>
                            <div className="text-[var(--text-muted)] uppercase">FILE NAME:</div>
                            <div className="text-white font-bold text-sm break-all">{selectedFile.name}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-[var(--text-muted)] uppercase">FILE SIZE:</div>
                              <div className="text-gray-200">
                                {(selectedFile.size / 1024).toFixed(1)} KB ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                              </div>
                            </div>
                            <div>
                              <div className="text-[var(--text-muted)] uppercase">FORMAT:</div>
                              <div className="text-gray-200 uppercase">{selectedFile.type.replace('image/', '') || 'IMAGE'}</div>
                            </div>
                          </div>

                          <div className="p-3 rounded bg-white/[0.03] border border-white/5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                            💡 Multimodal Vision AI will read all visible sender IDs, numbers, links, and extortion language directly from the screenshot pixels.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: Desktop [Analyze 1fr][Emergency auto], Mobile stacked */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 sm:gap-6 items-stretch pt-3">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || (inputMode === 'text' ? !inputText.trim() : !selectedFile)}
                  className="btn-cyber-primary w-full text-sm font-bold"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>{inputMode === 'screenshot' ? 'ANALYZING SCREENSHOT...' : 'ANALYZING FRAUD SIGNALS...'}</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>ANALYZE FOR SCAM</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsEmergencyMode(true)}
                  className="btn-cyber-danger w-full sm:w-auto sm:min-w-[250px] text-sm font-bold"
                >
                  <span>🚨</span> I ALREADY SENT MONEY
                </button>
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div className="p-5 rounded-lg border border-red-500/40 bg-red-950/20 text-red-300 text-sm space-y-2.5">
                  <div className="font-bold flex items-center gap-2">
                    <span>⚠️</span> SYSTEM ADVISORY
                  </div>
                  <p className="leading-relaxed">{errorMsg}</p>
                  <div className="pt-2.5 flex items-center justify-between text-xs border-t border-red-500/20">
                    <span>Suspect financial compromise?</span>
                    <button
                      onClick={() => setIsEmergencyMode(true)}
                      className="underline font-bold text-red-300 hover:text-white cursor-pointer uppercase"
                    >
                      Trigger Emergency Response Protocol →
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Analysis Result Card (Continuity with Scanner — Spacious Layout) */}
            {analysis && (
              <section
                className={`cyber-card p-8 sm:p-10 lg:p-12 space-y-8 border ${
                  currentVerdict?.cardBorder || 'border-white/10'
                } shadow-2xl animate-slide-up`}
              >
                {/* Header: Verdict & Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-7 border-b border-white/10">
                  <div className="space-y-1.5">
                    <div className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--text-secondary)]">
                      SEMANTIC FRAUD VERDICT
                    </div>
                    <div className="flex items-center gap-3.5">
                      <span className="text-4xl">{currentVerdict?.icon}</span>
                      <div>
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white font-mono">
                          {analysis.risk_level} RISK — {analysis.verdict.replace('_', ' ')}
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[#00FF66] font-mono mt-0.5">
                          Category: {analysis.category}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5 font-mono">
                    <div
                      className={`px-3.5 py-1.5 rounded text-xs font-bold border uppercase tracking-wider ${
                        currentVerdict?.badgeBg
                      }`}
                    >
                      {analysis.verdict}
                    </div>
                    <div
                      className={`px-3.5 py-1 rounded text-xs font-semibold border ${getRiskTheme(
                        analysis.risk_level
                      )}`}
                    >
                      SEVERITY: {analysis.risk_level}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      Certainty: <span className="text-white font-bold">{analysis.assessment_strength >= 8 ? 'High' : analysis.assessment_strength >= 5 ? 'Medium' : 'Low'} ({analysis.assessment_strength}/10)</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    ANALYSIS SUMMARY
                  </div>
                  <p className="text-base sm:text-lg text-gray-100 leading-relaxed font-normal">
                    {analysis.summary}
                  </p>
                </div>

                {/* Red Flag Indicators */}
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                    <span>🚩</span> DETECTED RED FLAGS ({analysis.indicators.length})
                  </div>

                  {analysis.indicators.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {analysis.indicators.map((ind, idx) => (
                        <div
                          key={idx}
                          className="cyber-card-inner p-5 space-y-2"
                        >
                          <div className="text-xs font-mono font-bold text-red-400 flex items-center gap-2 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                            {ind.type}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                            {ind.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="cyber-card-inner p-5 text-xs text-[var(--text-secondary)]">
                      No explicit scam indicators detected.
                    </div>
                  )}
                </div>

                {/* Prioritized Actions */}
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                    <span>🛡️</span> WHAT YOU MUST DO RIGHT NOW
                  </div>

                  <div className="space-y-3">
                    {analysis.recommended_actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-lg border border-[#00FF66]/20 bg-[#00FF66]/[0.03] text-xs sm:text-sm text-gray-200 flex items-start gap-3.5"
                      >
                        <span className="font-mono font-bold text-[#00FF66] mt-0.5">{idx + 1}.</span>
                        <span className="leading-relaxed">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Banner inside Result */}
                <div className="mt-10 p-8 sm:p-10 rounded-xl border border-red-500/50 bg-[#0c0608] space-y-5 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                      <div className="text-xs font-mono uppercase font-bold tracking-wider text-red-400 flex items-center gap-2">
                        <span>⚡ POST-SCAM INCIDENT PROTOCOL</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-white mt-1.5">
                        Did you already interact or send money?
                      </h3>
                      <p className="text-xs sm:text-sm text-red-200/80 mt-1.5 max-w-xl leading-relaxed">
                        Do not panic. We provide immediate bank freeze instructions, an evidence checklist, and generate an official complaint summary for cybercrime authorities.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsEmergencyMode(true)}
                      className="btn-cyber-danger text-sm py-4 px-7 whitespace-nowrap self-start sm:self-auto"
                    >
                      <span>🚨</span> I ALREADY SENT MONEY
                    </button>
                  </div>

                  {/* Secondary triggers */}
                  <div className="pt-4 border-t border-red-500/20 flex flex-wrap gap-2.5 text-xs font-mono">
                    <span className="text-red-300/70 py-1.5 uppercase">Specific situation:</span>
                    <button
                      onClick={() => setIsEmergencyMode(true)}
                      className="px-3.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-red-200 border border-red-500/20 transition-colors cursor-pointer uppercase"
                    >
                      Shared sensitive OTP / info
                    </button>
                    <button
                      onClick={() => setIsEmergencyMode(true)}
                      className="px-3.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-red-200 border border-red-500/20 transition-colors cursor-pointer uppercase"
                    >
                      Clicked link / installed APK
                    </button>
                    <button
                      onClick={() => setIsEmergencyMode(true)}
                      className="px-3.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-red-200 border border-red-500/20 transition-colors cursor-pointer uppercase"
                    >
                      Suspect account takeover
                    </button>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ─── Global Shared Footer (Spacious & Clean) ──────────────────────── */}
      <footer className="w-full border-t border-white/10 py-14 sm:py-18 font-mono text-center mt-auto relative z-10 bg-[#020306]">
        <div className="cyber-container space-y-4">
          <div className="inline-flex items-center gap-3.5 px-5 py-2.5 rounded-lg border border-white/10 bg-[#080a0f] text-xs text-gray-400">
            <span>📞</span>
            <span>NATIONAL CYBERCRIME HELPLINE:</span>
            <strong className="text-[#00FF66] text-sm">1930</strong>
            <span className="text-gray-600">|</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#00FF66] underline transition-colors font-medium"
            >
              cybercrime.gov.in
            </a>
          </div>
          <p className="text-[12px] text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
            AI Scam Shield is an emergency cybersecurity response utility. Always report incidents directly to your financial institution and official law enforcement.
          </p>
        </div>
      </footer>
    </main>
  );
}
