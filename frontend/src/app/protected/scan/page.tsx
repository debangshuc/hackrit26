'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import { SEVERITY_CONFIG } from '@/lib/types';
import type { DetectionResult, Language } from '@/lib/types';

export default function ScanPage() {
  const { user } = useAuth();
  const lang = (user?.lang || 'en') as Language;
  const fileRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTextCheck = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.detectText(text, lang);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenshotCheck = async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.detectScreenshot(file, lang);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Screenshot analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('scan.title', lang)}</h1>
        <p className="text-[var(--text-secondary)]">
          {lang === 'bn' ? 'একটি সন্দেহজনক বার্তা বা স্ক্রিনশট পরীক্ষা করুন' :
           lang === 'hi' ? 'एक संदिग्ध संदेश या स्क्रीनशॉट जांचें' :
           'Paste a suspicious message or upload a screenshot to check'}
        </p>
      </div>

      {/* Text input */}
      <div className="glass-card p-6 mb-4">
        <textarea
          className="textarea"
          placeholder={t('scan.paste', lang)}
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
        />
        <button
          className="btn-primary w-full mt-4"
          onClick={handleTextCheck}
          disabled={!text.trim() || isLoading}
        >
          {isLoading ? t('common.loading', lang) : `🔍 ${t('scan.check', lang)}`}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-sm text-[var(--text-muted)]">{t('scan.or', lang)}</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Screenshot upload */}
      <div className="glass-card p-6 mb-8">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/30 transition-all"
        >
          {file ? (
            <div>
              <span className="text-3xl mb-3 block">📷</span>
              <p className="text-[var(--text-primary)] font-medium">{file.name}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <span className="text-3xl mb-3 block">📤</span>
              <p className="text-[var(--text-secondary)]">
                {lang === 'bn' ? 'স্ক্রিনশট আপলোড করতে ক্লিক করুন' :
                 lang === 'hi' ? 'स्क्रीनशॉट अपलोड करने के लिए क्लिक करें' :
                 'Click to upload a screenshot'}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">JPEG, PNG, WebP — max 5MB</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        {file && (
          <button
            className="btn-primary w-full mt-4"
            onClick={handleScreenshotCheck}
            disabled={isLoading}
          >
            {isLoading ? t('common.loading', lang) : `📷 Analyze Screenshot`}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300 mb-6">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-card-strong p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t('scan.result', lang)}</h2>
            <div className={`severity-chip severity-${result.risk}`}>
              {result.risk === 'critical' && '🔴'}
              {result.risk === 'high' && '🟠'}
              {result.risk === 'medium' && '🟡'}
              {result.risk === 'low' && '🟢'}
              {' '}{result.risk.toUpperCase()}
            </div>
          </div>

          {/* Confidence */}
          <div className="text-sm text-[var(--text-muted)] mb-4">
            Confidence: <span className="text-[var(--text-secondary)] font-medium">{result.confidence}</span>
            {result.matched_known_indicator && (
              <span className="ml-2 text-red-400 font-medium">⚠️ Known scam indicator matched</span>
            )}
          </div>

          {/* Explanation */}
          <div className="glass-card p-4 mb-4">
            <p className="text-[var(--text-primary)]">{result.explanation}</p>
          </div>

          {/* Indicators */}
          {result.indicators.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Indicators Found:</h3>
              <div className="flex flex-wrap gap-2">
                {result.indicators.map((indicator, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-300"
                  >
                    ✓ {indicator}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-blue-300">
            <span className="font-medium">Recommended action:</span> {result.action}
          </div>
        </div>
      )}
    </div>
  );
}
