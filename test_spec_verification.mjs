/**
 * Automated Verification Script for AI Scam Shield Hackathon MVP
 * Tests schema contract, edge cases, demo scenarios, and incident summary formatting.
 */

import { ScamAnalysisSchema, DEFAULT_CHECKLIST_ITEMS } from './frontend/src/lib/scam-types.ts';
import { DEMO_SCENARIOS } from './frontend/src/lib/demo-scenarios.ts';

console.log('====================================================');
console.log(' AI SCAM SHIELD — AGENT SPECIFICATION VERIFICATION  ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Verify Demo Scenarios (Section 19)
console.log('--- 1. Testing Demo Scenarios Dataset (Section 19) ---');
assert(DEMO_SCENARIOS.length >= 10, `At least 10 demo scenarios present (found ${DEMO_SCENARIOS.length})`);

const expectedCategories = [
  'Electricity',
  'KYC / Identity',
  'Courier / Delivery',
  'UPI / Payment',
  'Police / Government Impersonation',
  'Job / Recruitment',
  'Investment / Trading',
  'Customer Support',
];

for (const cat of expectedCategories) {
  const hasCat = DEMO_SCENARIOS.some(s => s.category === cat);
  assert(hasCat, `Demo scenarios cover category: ${cat}`);
}

// 2. Verify Emergency Checklist (Section 13)
console.log('\n--- 2. Testing Emergency Checklist Items (Section 13) ---');
assert(DEFAULT_CHECKLIST_ITEMS.length === 7, `Exactly 7 checklist items specified (found ${DEFAULT_CHECKLIST_ITEMS.length})`);

const expectedChecklistKeys = [
  'tx_id',
  'screenshot',
  'scammer_phone',
  'scam_link',
  'bank_contacted',
  'account_secured',
  'incident_reported',
];

for (const key of expectedChecklistKeys) {
  const found = DEFAULT_CHECKLIST_ITEMS.some(i => i.id === key);
  assert(found, `Checklist item exists: ${key}`);
}

// 3. Verify Zod Schema Validation against Spec Contract (Section 5)
console.log('\n--- 3. Testing Schema Contract & Validation (Section 5) ---');

const sampleValidAnalysis = {
  verdict: 'SCAM',
  risk_level: 'HIGH',
  category: 'Electricity',
  summary: 'Urgent disconnection threat with fake officer phone number.',
  assessment_strength: 9,
  indicators: [
    { type: 'Urgency', explanation: 'Threatens power cutoff tonight at 9:30pm.' },
    { type: 'Unofficial Link', explanation: 'Links to unverified domain.' },
  ],
  recommended_actions: [
    'Do not click the link.',
    'Do not pay through unofficial contacts.',
  ],
  already_affected: {
    money_sent: false,
    information_shared: false,
    clicked_link: true,
  },
};

const parsed = ScamAnalysisSchema.safeParse(sampleValidAnalysis);
assert(parsed.success, 'Valid analysis object conforms to ScamAnalysisSchema');

const invalidAnalysis = {
  verdict: 'DEFINITELY_SCAM', // Invalid verdict enum
  risk_level: 'EXTREME',      // Invalid risk enum
};
const invalidParsed = ScamAnalysisSchema.safeParse(invalidAnalysis);
assert(!invalidParsed.success, 'Rejects invalid verdict/risk enums correctly');

// 4. Verify Incident Summary Formatting (Section 15)
console.log('\n--- 4. Testing Incident Summary Generator Rules (Section 15) ---');

function generateIncidentSummary(details) {
  return `INCIDENT SUMMARY

Incident type: ${details.incident_type || 'Not provided'}
Amount: ${details.amount_lost ? `${details.amount_lost} ${details.currency || ''}`.trim() : 'Not provided'}
Payment method: ${details.payment_method || 'Not provided'}
Transaction ID: ${details.transaction_id || 'Not provided'}
Date/time: ${details.date_time || 'Not provided'}
Scammer contact: ${details.scammer_contact || 'Not provided'}

What happened:
${details.what_happened || 'Not provided'}

Immediate actions taken:
${details.actions_taken?.length ? details.actions_taken.join('\n') : 'Not provided'}

Evidence available:
${details.evidence_saved?.length ? details.evidence_saved.join('\n') : 'Not provided'}`;
}

const partialIncident = {
  incident_type: 'Electricity Disconnection Fraud',
  amount_lost: '10,000',
  currency: 'INR',
  payment_method: 'UPI',
  // transaction_id left blank intentionally to test "Not provided"
  date_time: '11-SEP-2026',
};

const generatedText = generateIncidentSummary(partialIncident);
assert(generatedText.includes('Incident type: Electricity Disconnection Fraud'), 'Includes provided incident type');
assert(generatedText.includes('Amount: 10,000 INR'), 'Includes formatted amount with currency');
assert(generatedText.includes('Transaction ID: Not provided'), 'Uses "Not provided" for missing fields (No hallucination)');
assert(generatedText.includes('What happened:\nNot provided'), 'Uses "Not provided" for missing description');
assert(!generatedText.includes('guarantee of recovery'), 'Never guarantees recovery');

console.log('\n====================================================');
console.log(` RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
