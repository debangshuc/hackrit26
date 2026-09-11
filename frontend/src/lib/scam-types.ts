import { z } from 'zod';

export type ScamVerdict = 'SCAM' | 'LIKELY_SCAM' | 'SUSPICIOUS' | 'LIKELY_LEGIT';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const ScamVerdictSchema = z.enum(['SCAM', 'LIKELY_SCAM', 'SUSPICIOUS', 'LIKELY_LEGIT']);
export const RiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const ScamIndicatorSchema = z.object({
  type: z.string().describe('Short tag of the indicator, e.g. Urgency, Impersonation, Fake Link, etc.'),
  explanation: z.string().describe('Clear explanation of why this indicator is suspicious in the message'),
});

export const ScamAnalysisSchema = z.object({
  verdict: ScamVerdictSchema,
  risk_level: RiskLevelSchema,
  category: z.string(),
  summary: z.string(),
  assessment_strength: z.number().min(1).max(10).default(8),
  indicators: z.array(ScamIndicatorSchema).default([]),
  recommended_actions: z.array(z.string()).default([]),
  already_affected: z.object({
    money_sent: z.boolean().default(false),
    information_shared: z.boolean().default(false),
    clicked_link: z.boolean().default(false),
  }).default({
    money_sent: false,
    information_shared: false,
    clicked_link: false,
  }),
});

export type ScamIndicator = z.infer<typeof ScamIndicatorSchema>;
export type ScamAnalysis = z.infer<typeof ScamAnalysisSchema>;

export interface IncidentDetails {
  incident_type: string;
  amount_lost: string;
  currency: string;
  payment_method: string;
  transaction_id: string;
  date_time: string;
  scammer_contact: string;
  what_happened: string;
  actions_taken: string[];
  evidence_saved: string[];
}

export interface EmergencyChecklistItem {
  id: string;
  label: string;
  hint: string;
}

export const DEFAULT_CHECKLIST_ITEMS: EmergencyChecklistItem[] = [
  {
    id: 'tx_id',
    label: 'Transaction ID / UTR saved',
    hint: 'Copy the transaction ID, UPI reference, or bank reference number.',
  },
  {
    id: 'screenshot',
    label: 'Screenshot saved',
    hint: 'Save screenshots of the message, payment confirmation, and call logs.',
  },
  {
    id: 'scammer_phone',
    label: 'Scam phone number / email / ID saved',
    hint: 'Record the caller number, sender WhatsApp handle, UPI ID, or email.',
  },
  {
    id: 'scam_link',
    label: 'Suspicious link saved',
    hint: 'Copy or screenshot the exact link received (do not open it).',
  },
  {
    id: 'bank_contacted',
    label: 'Bank / payment provider contacted',
    hint: 'Call your bank or UPI provider customer support immediately to request a stop/freeze.',
  },
  {
    id: 'account_secured',
    label: 'Account & credentials secured',
    hint: 'Change UPI PIN, net banking password, and revoke any remote-access tools (AnyDesk, TeamViewer).',
  },
  {
    id: 'incident_reported',
    label: 'Incident reported to cybercrime helpline (1930)',
    hint: 'Call 1930 (India National Cybercrime Helpline) or log on to cybercrime.gov.in.',
  },
];
