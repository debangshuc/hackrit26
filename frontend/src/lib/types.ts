/**
 * Shared TypeScript types — mirrors backend Pydantic schemas.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'protected' | 'guardian';
export type Language = 'en' | 'bn' | 'hi';

export type ScamType =
  | 'money_sent'
  | 'otp_shared'
  | 'bank_details_shared'
  | 'app_installed'
  | 'remote_access'
  | 'aadhaar_pan'
  | 'clicked_link'
  | 'not_sure';

export type TimeBand = 'under_5_min' | '5_to_30_min' | '30_to_2h' | 'over_2h';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type PaymentMethod = 'upi' | 'bank_transfer' | 'card' | 'wallet' | 'other';
export type AmountBand = 'under_1k' | '1k_to_10k' | '10k_to_50k' | '50k_to_1l' | 'over_1l';

export type EventType =
  | 'created'
  | 'severity_assessed'
  | 'plan_generated'
  | 'step_started'
  | 'step_completed'
  | 'evidence_added'
  | 'alert_sent'
  | 'note_added'
  | 'status_changed';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  lang: Language;
  family_id?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  phone: string;
  otp: string;
}

export interface RegisterRequest {
  phone: string;
  name: string;
  role: UserRole;
  lang: Language;
}

// ─── Incident ────────────────────────────────────────────────────────────────

export interface IncidentFacts {
  scam_types: ScamType[];
  time_band: TimeBand;
  amount_band?: AmountBand;
  payment_method?: PaymentMethod;
  service_compromised?: string;
  remote_still_connected?: boolean;
}

export interface PlanStep {
  step_number: number;
  title: string;
  why: string;
  how: string;
  is_urgent: boolean;
  official_resource?: string;
}

export interface EmergencyPlan {
  incident_id: string;
  severity: Severity;
  plan_steps: PlanStep[];
  template_key: string;
  language: Language;
  generated_at: string;
  is_fallback: boolean;
  disclaimer: string;
}

export interface Incident {
  id: string;
  family_id?: string;
  reported_by: string;
  scam_types: ScamType[];
  severity: Severity;
  status: IncidentStatus;
  created_at: string;
  plan?: EmergencyPlan;
}

export interface IncidentEvent {
  id: string;
  incident_id: string;
  event_type: EventType;
  payload: Record<string, any>;
  server_ts: string;
}

// ─── Detection ───────────────────────────────────────────────────────────────

export interface DetectionResult {
  risk: RiskLevel;
  category: string;
  indicators: string[];
  confidence: string;
  explanation: string;
  action: string;
  matched_known_indicator: boolean;
}

// ─── Family ──────────────────────────────────────────────────────────────────

export interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  lang: Language;
}

export interface FamilyStatus {
  family_id: string;
  members: FamilyMember[];
  join_code: string;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  family_id: string;
  member_id: string;
  member_name: string;
  severity: Severity;
  category: string;
  summary: string;
  why: string;
  created_at: string;
  acked_at?: string;
  is_false_alarm: boolean;
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

export const SCAM_TYPE_LABELS: Record<ScamType, { en: string; bn: string; hi: string; icon: string }> = {
  money_sent: { en: 'Money Sent', bn: 'টাকা পাঠিয়েছি', hi: 'पैसे भेजे', icon: '💸' },
  otp_shared: { en: 'OTP Shared', bn: 'OTP শেয়ার করেছি', hi: 'OTP साझा किया', icon: '🔑' },
  bank_details_shared: { en: 'Bank Details Shared', bn: 'ব্যাংক তথ্য দিয়েছি', hi: 'बैंक जानकारी दी', icon: '🏦' },
  app_installed: { en: 'App Installed', bn: 'অ্যাপ ইনস্টল করেছি', hi: 'ऐप इंस्टॉल किया', icon: '📲' },
  remote_access: { en: 'Remote Access', bn: 'রিমোট অ্যাক্সেস', hi: 'रिमोट एक्सेस', icon: '🖥️' },
  aadhaar_pan: { en: 'Aadhaar/PAN Shared', bn: 'আধার/প্যান দিয়েছি', hi: 'आधार/पैन दिया', icon: '🪪' },
  clicked_link: { en: 'Clicked Link', bn: 'লিংকে ক্লিক করেছি', hi: 'लिंक पर क्लिक किया', icon: '🔗' },
  not_sure: { en: 'Not Sure', bn: 'নিশ্চিত নই', hi: 'पता नहीं', icon: '❓' },
};

export const TIME_BAND_LABELS: Record<TimeBand, { en: string; bn: string; hi: string }> = {
  under_5_min: { en: 'Less than 5 minutes ago', bn: '৫ মিনিটেরও কম আগে', hi: '5 मिनट से कम पहले' },
  '5_to_30_min': { en: '5–30 minutes ago', bn: '৫-৩০ মিনিট আগে', hi: '5-30 मिनट पहले' },
  '30_to_2h': { en: '30 minutes – 2 hours ago', bn: '৩০ মিনিট - ২ ঘণ্টা আগে', hi: '30 मिनट - 2 घंटे पहले' },
  over_2h: { en: 'More than 2 hours ago', bn: '২ ঘণ্টারও বেশি আগে', hi: '2 घंटे से ज़्यादा पहले' },
};

export const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; label: string; labelBn: string; labelHi: string }> = {
  low: { color: '#6B7280', bg: '#F3F4F6', label: 'Low', labelBn: 'কম', labelHi: 'कम' },
  medium: { color: '#F59E0B', bg: '#FEF3C7', label: 'Medium', labelBn: 'মাঝারি', labelHi: 'मध्यम' },
  high: { color: '#F97316', bg: '#FFF7ED', label: 'High', labelBn: 'উচ্চ', labelHi: 'उच्च' },
  critical: { color: '#EF4444', bg: '#FEF2F2', label: 'Critical', labelBn: 'জরুরি', labelHi: 'गंभीर' },
};
