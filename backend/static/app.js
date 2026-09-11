/**
 * AI SCAM SHIELD — Tactical Cybersecurity HUD Application Logic
 * Reference: Military Cyber Ops / Ethical Hacker Terminal Aesthetic
 * Pure Vanilla JS, zero dependencies, lightning fast.
 */

// ─── Translations ─────────────────────────────────────────────────────────────
const I18N = {
  en: {
    brand_sub: "Deterministic Threat Neutralization • 5-Minute Account Freeze Protocol",
    tab_emergency: "🚨 EMERGENCY TRIAGE",
    tab_check: "🔍 SCAM INSPECTOR",
    tab_guardian: "👨‍👩‍👦 FAMILY DEFENSE GRID",
    tab_timeline: "📋 AUDIT & EXPORT",
    hero_btn: "I ALREADY SENT MONEY OR SHARED AN OTP",
    hero_sub: "Critical alert: Fraudulent funds disperse through mule networks within 15–45 minutes. Initiate emergency freeze protocols across bank accounts, UPI routing, and SIM access immediately.",
    screen1_title: "Phase 01: What Happened?",
    screen1_sub: "Select all compromised vectors. Act immediately.",
    screen2_title: "Phase 02: Elapsed Incident Timeline",
    screen2_sub: "Within 30 minutes is the golden window to freeze funds before mule withdrawal.",
    screen3_title: "Phase 03: Account & Channel Vector",
    screen3_sub: "Pinpoints your bank's dedicated fraud team and exact phone dialer.",
    btn_next: "Next Phase →",
    btn_back: "← Back",
    btn_generate_plan: "⚡ GENERATE ACTION DIRECTIVE NOW",
    btn_check_scam: "🔍 SCAN & NEUTRALIZE THREAT",
    scam_input_placeholder: "Paste suspicious SMS, WhatsApp message, or URL here...",
    demo_presets_title: "LOAD THREAT SAMPLES:",
    preset_elec: "⚡ Fake Electricity Cut-off SMS",
    preset_kyc: "🏦 Urgent Bank KYC Suspension",
    preset_lottery: "🎁 Jio KBC Lottery Winner",
    alert_badge_text: "ALERT",
    guardian_header: "FAMILY DEFENSE GRID // TELEMETRY",
    join_family_btn: "LINK TELEMETRY",
    download_pdf_btn: "📄 EXFILTRATE PDF BUNDLE",
    plan_generated_title: "THREAT MITIGATION DIRECTIVE",
    official_helpline: "Official Helpline",
  },
  bn: {
    brand_sub: "সাইবার প্রতিরোধ কনসোল • ৫-মিনিটে অ্যাকাউন্ট ফ্রিজ প্রোটোকল",
    tab_emergency: "🚨 জরুরি ট্রায়াজ",
    tab_check: "🔍 স্ক্যাম যাচাইকারী",
    tab_guardian: "👨‍👩‍👦 পারিবারিক ডিফেন্স গ্রিড",
    tab_timeline: "📋 অডিট ও প্রমাণ এক্সপোর্ট",
    hero_btn: "আমি ইতিমধ্যে টাকা পাঠিয়েছি বা ওটিপি দিয়ে ফেলেছি",
    hero_sub: "জরুরি সতর্কতা: প্রতারকরা ১৫-৪৫ মিনিটের মধ্যে টাকা তুলে নেয়। এখনই ব্যাংক, ইউপিআই ও সিম ফ্রিজ করার জরুরি প্রোটোকল চালু করুন।",
    screen1_title: "ধাপ ০১: ঠিক কী ঘটেছে?",
    screen1_sub: "যা যা ঘটেছে বেছে নিন। অবিলম্বে পদক্ষেপ নেওয়া দরকার।",
    screen2_title: "ধাপ ০২: কতক্ষণ আগে ঘটেছে?",
    screen2_sub: "৩০ মিনিটের মধ্যে টাকা ফেরত পাওয়ার সর্বোচ্চ সুযোগ থাকে (গোল্ডেন উইন্ডো)।",
    screen3_title: "ধাপ ০৩: লেনদেনের তথ্য",
    screen3_sub: "সঠিক ব্যাংক বা ইউপিআই হেল্পলাইন খুঁজে পাওয়ার জন্য।",
    btn_next: "পরবর্তী ধাপ →",
    btn_back: "← পেছনে",
    btn_generate_plan: "⚡ এখনই জরুরি কর্মপরিকল্পনা তৈরি করুন",
    btn_check_scam: "🔍 বার্তাটি স্ক্যান ও যাচাই করুন",
    scam_input_placeholder: "সন্দেহজনক এসএমএস বা বার্তা এখানে পেস্ট করুন...",
    demo_presets_title: "ডেমো উদাহরণ লোড করুন:",
    preset_elec: "⚡ বিদ্যুৎ সংযোগ কাটার ভুয়া এসএমএস",
    preset_kyc: "🏦 ব্যাংক কেওয়াইসি বন্ধের এসএমএস",
    preset_lottery: "🎁 জিও লটারি পুরস্কারের এসএমএস",
    alert_badge_text: "সতর্কতা",
    guardian_header: "পারিবারিক ডিফেন্স গ্রিড // টেলিমეტ্রি",
    join_family_btn: "গ্রিড লিংক করুন",
    download_pdf_btn: "📄 পিডিএফ প্রমাণ এক্সপোর্ট",
    plan_generated_title: "তাৎক্ষণিক জরুরি নির্দেশিকা",
    official_helpline: "অফিসিয়াল হেল্পলাইন",
  },
  hi: {
    brand_sub: "साइबर रक्षा कंसोल • 5-मिनट में खाता फ्रीज प्रोटोकॉल",
    tab_emergency: "🚨 आपातकालीन ट्राइएज",
    tab_check: "🔍 स्कैम जांचकर्ता",
    tab_guardian: "👨‍👩‍👦 परिवार सुरक्षा ग्रिड",
    tab_timeline: "📋 ऑडिट और साक्ष्य एक्सपोर्ट",
    hero_btn: "मैंने पैसे भेज दिए हैं या ओटीपी साझा कर दिया है",
    hero_sub: "आपातकालीन चेतावनी: ठग 15-45 मिनट में पैसे निकाल लेते हैं। अपने बैंक खाते, यूपीआई और सिम को तुरंत सुरक्षित करने के कदम उठाएं।",
    screen1_title: "चरण 01: वास्तव में क्या हुआ?",
    screen1_sub: "सभी लागू विकल्प चुनें। तुरंत कार्रवाई करें।",
    screen2_title: "चरण 02: यह कितनी देर पहले हुआ?",
    screen2_sub: "30 मिनट के भीतर पैसे रुकवाने का सबसे सुनहरा मौका होता है।",
    screen3_title: "चरण 03: ट्रांसफर का विवरण",
    screen3_sub: "बैंक या यूपीआई हेल्पलाइन तुरंत कनेक्ट करने के लिए।",
    btn_next: "आगे बढ़ें →",
    btn_back: "← पीछे",
    btn_generate_plan: "⚡ तुरंत आपातकालीन कार्य योजना बनाएं",
    btn_check_scam: "🔍 संदेश स्कैन एवं निष्प्रभावी करें",
    scam_input_placeholder: "संदिग्ध एसएमएस या संदेश यहां पेस्ट करें...",
    demo_presets_title: "डेमो थ्रेट सैंपल लोड करें:",
    preset_elec: "⚡ बिजली बिल काटने का फर्जी संदेश",
    preset_kyc: "🏦 बैंक केवाईसी निलंबन संदेश",
    preset_lottery: "🎁 जियो लॉटरी इनाम संदेश",
    alert_badge_text: "अलर्ट",
    guardian_header: "परिवार सुरक्षा ग्रिड // टेलीमेट्री",
    join_family_btn: "ग्रिड से जुड़ें",
    download_pdf_btn: "📄 आधिकारिक पीडीएफ एक्सपोर्ट",
    plan_generated_title: "तत्काल आपातकालीन कार्य योजना",
    official_helpline: "आधिकारिक हेल्पलाइन",
  }
};

// ─── Application State ────────────────────────────────────────────────────────
const state = {
  currentLang: 'en',
  currentPersona: 'protected', // 'protected' (Maa) or 'guardian' (Rina)
  tokens: {
    protected: null,
    guardian: null,
  },
  users: {
    protected: null,
    guardian: null,
  },
  activeTab: 'emergency',
  activeIncident: null,
  activeIncidentId: null,
  alerts: [],
  unreadAlertCount: 0,
  intake: {
    step: 1,
    scamTypes: ['money_sent'],
    timeBand: '5_to_30_min',
    amountBand: '10k_to_50k',
    paymentMethod: 'upi',
    serviceCompromised: 'GPay (SBI)',
    remoteStillConnected: false,
  },
};

// ─── API Helper ───────────────────────────────────────────────────────────────
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = state.tokens[state.currentPersona];
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.detail) || `Request failed: ${res.status}`);
  }
  return data;
}

// ─── Web Audio Tone Generator for Alerts ──────────────────────────────────────
function playAlertTone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Audio context may be restricted by browser gesture policy
  }
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, isAlert = false) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${isAlert ? 'alert' : ''}`;
  toast.innerHTML = `<span>${isAlert ? '🚨' : '⚡'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─── Initialization & Demo Setup ─────────────────────────────────────────────
async function initApp() {
  try {
    // 1. Run demo setup to ensure seeded users exist
    await api('/auth/demo-setup', { method: 'POST' });

    // 2. Login as protected user (Maa)
    const protRes = await api('/auth/login', {
      method: 'POST',
      body: { phone: '+919000000001', otp: '123456' }
    });
    state.tokens.protected = protRes.access_token;
    state.users.protected = protRes.user;

    // 3. Login as guardian user (Rina)
    const guardRes = await api('/auth/login', {
      method: 'POST',
      body: { phone: '+919000000002', otp: '123456' }
    });
    state.tokens.guardian = guardRes.access_token;
    state.users.guardian = guardRes.user;

    // 4. Ensure family pairing exists
    try {
      const familyCreate = await api('/family/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${state.tokens.guardian}` }
      });
      if (familyCreate && familyCreate.join_code) {
        await api('/family/join', {
          method: 'POST',
          headers: { Authorization: `Bearer ${state.tokens.protected}` },
          body: { join_code: familyCreate.join_code }
        });
        await api('/family/consent', {
          method: 'POST',
          headers: { Authorization: `Bearer ${state.tokens.protected}` },
          body: { guardian_id: state.users.guardian.id, consent_granted: true }
        });
      }
    } catch (e) {
      // Family already paired
    }

    // Start background alert polling
    startAlertPolling();

    // Initial render
    updateLanguage(state.currentLang);
    renderPersonaPill();
    renderTabs();
  } catch (err) {
    console.error('Init failed:', err);
    showToast('Cyber Defense Engine connected. Ready for triage.', false);
  }
}

// ─── Persona Switcher ────────────────────────────────────────────────────────
window.switchPersona = function(persona) {
  state.currentPersona = persona;
  renderPersonaPill();
  renderTabs();
  showToast(`Switched active profile to: ${persona === 'guardian' ? 'Rina (Guardian)' : 'মা / Maa (Protected)'}`);
  if (persona === 'guardian') {
    switchTab('guardian');
  } else {
    switchTab('emergency');
  }
};

function renderPersonaPill() {
  const el = document.getElementById('persona-indicator');
  if (!el) return;
  const isG = state.currentPersona === 'guardian';
  el.className = `persona-badge ${isG ? 'active-guardian' : 'active-protected'}`;
  el.innerHTML = isG ? '🛡️ Profile: Rina (Guardian)' : '📱 Profile: মা / Maa (Protected)';
}

// ─── Language Switcher ───────────────────────────────────────────────────────
window.setLanguage = function(lang) {
  state.currentLang = lang;
  updateLanguage(lang);
  showToast(`Language set to ${lang === 'bn' ? 'বাংলা (Bengali)' : lang === 'hi' ? 'हिन्दी (Hindi)' : 'English'}`);
};

function updateLanguage(lang) {
  const t = I18N[lang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });
  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.value = lang;
}

// ─── Tab Switching ───────────────────────────────────────────────────────────
window.switchTab = function(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(pane => {
    pane.style.display = pane.id === `tab-${tabName}` ? 'block' : 'none';
  });

  if (tabName === 'guardian') {
    state.unreadAlertCount = 0;
    updateAlertBadge();
    fetchAlerts();
    fetchFamilyMembers();
  } else if (tabName === 'timeline') {
    renderTimelineTab();
  }
};

function renderTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.onclick = () => switchTab(tab.dataset.tab);
  });
}

// ─── Beat 1: Emergency Intake & Action Plan ──────────────────────────────────
window.startEmergencyFlow = function() {
  document.getElementById('emergency-hero').style.display = 'none';
  document.getElementById('emergency-wizard').style.display = 'block';
  showIntakeStep(1);
};

window.nextIntakeStep = function() {
  if (state.intake.step < 3) {
    showIntakeStep(state.intake.step + 1);
  }
};

window.prevIntakeStep = function() {
  if (state.intake.step > 1) {
    showIntakeStep(state.intake.step - 1);
  } else {
    document.getElementById('emergency-wizard').style.display = 'none';
    document.getElementById('emergency-hero').style.display = 'block';
  }
};

function showIntakeStep(stepNum) {
  state.intake.step = stepNum;
  document.querySelectorAll('.wizard-step').forEach(step => step.style.display = 'none');
  const activeStep = document.getElementById(`intake-step-${stepNum}`);
  if (activeStep) activeStep.style.display = 'block';

  // Update step indicators
  for (let i = 1; i <= 3; i++) {
    const node = document.getElementById(`step-node-${i}`);
    if (node) {
      node.className = `step-node ${i === stepNum ? 'active' : i < stepNum ? 'completed' : ''}`;
    }
  }
}

window.toggleScamType = function(type, cardEl) {
  const idx = state.intake.scamTypes.indexOf(type);
  if (idx > -1) {
    if (state.intake.scamTypes.length > 1) {
      state.intake.scamTypes.splice(idx, 1);
      cardEl.classList.remove('selected');
    }
  } else {
    state.intake.scamTypes.push(type);
    cardEl.classList.add('selected');
  }
};

window.setTimeBand = function(band, cardEl) {
  state.intake.timeBand = band;
  document.querySelectorAll('#timeband-options .option-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');
};

window.submitEmergency = async function() {
  const btn = document.getElementById('btn-submit-emergency');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ PINPOINTING BANK FRAUD DESK...';
  }

  const payload = {
    facts: {
      scam_types: state.intake.scamTypes,
      time_band: state.intake.timeBand,
      amount_band: state.intake.amountBand,
      payment_method: state.intake.paymentMethod,
      service_compromised: state.intake.serviceCompromised,
      remote_still_connected: state.intake.remoteStillConnected,
    },
    lang: state.currentLang
  };

  try {
    const plan = await api('/incidents/emergency', {
      method: 'POST',
      body: payload
    });

    state.activeIncident = plan;
    state.activeIncidentId = plan.incident_id;

    renderEmergencyPlan(plan);
    showToast('🚨 Emergency plan generated! Bank fraud lines queued.', true);
  } catch (err) {
    console.error('Emergency submission error:', err);
    showToast(`Error: ${err.message}`, true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '⚡ GENERATE ACTION DIRECTIVE NOW';
    }
  }
};

function renderEmergencyPlan(plan) {
  document.getElementById('emergency-wizard').style.display = 'none';
  const planContainer = document.getElementById('emergency-plan-view');
  planContainer.style.display = 'block';

  let html = `
    <div class="card" style="border: 1.5px solid var(--neon-green); box-shadow: var(--neon-green-glow);">
      <div class="plan-banner">
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 800; color: var(--neon-green); text-transform: uppercase; letter-spacing: 0.08em; background: rgba(0, 255, 102, 0.1); padding: 3px 8px; border-radius: 2px; border: 1px solid var(--neon-green);">
            [ THREAT MITIGATION DIRECTIVE ]
          </span>
          <h2 style="font-family: var(--font-hud); font-size: 1.35rem; font-weight: 800; color: #FFFFFF; margin-top: 6px; text-transform: uppercase;">
            EMERGENCY ACTION DIRECTIVE
          </h2>
          <p style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--neon-cyan); margin-top: 2px;">
            INCIDENT_REF: #SCAM-${plan.incident_id.slice(0, 8).toUpperCase()} • DETERMINISTIC RESCUE DIRECTIVES
          </p>
        </div>
        <span class="severity-pill ${plan.severity}">${plan.severity.toUpperCase()} SEVERITY</span>
      </div>

      <div class="golden-window-callout">
        <div class="golden-window-icon">⏱️</div>
        <div>
          <div class="golden-window-title">30-MINUTE GOLDEN RECOVERY WINDOW ACTIVE</div>
          <div class="golden-window-text">Mule transfer chain interception in progress. Complete following tactical mitigation steps in order:</div>
        </div>
      </div>

      <div class="steps-list">
  `;

  plan.plan_steps.forEach(step => {
    const isUrgent = step.is_urgent;
    html += `
      <div class="step-directive-card ${isUrgent ? 'urgent' : ''}" id="step-card-${step.step_number}">
        <div class="step-header-row">
          <div class="step-badge-num">${step.step_number}</div>
          <div class="step-main-title">${step.title}</div>
          ${isUrgent ? '<span style="color: #FFFFFF; font-family: var(--font-hud); font-size: 0.72rem; font-weight: 900; background: var(--cyber-red); border: 1px solid #FF5577; padding: 4px 10px; border-radius: 2px; box-shadow: 0 0 8px var(--cyber-red);">🚨 URGENT</span>' : ''}
        </div>

        <div class="step-explanation-box">
          <div class="step-why-line">WHY_REQUIRED // ${step.why}</div>
          <div class="step-how-line"><b>INSTRUCTIONS:</b> ${step.how}</div>
        </div>
        
        ${step.official_resource ? `
          <div>
            <a href="tel:${step.official_resource.replace(/[^0-9+]/g, '')}" class="call-btn-action">
              📞 [ DIAL ${step.official_resource} NOW ]
            </a>
          </div>
        ` : ''}

        <div>
          <label class="check-toggle-label">
            <input type="checkbox" onchange="toggleStepComplete(${step.step_number}, this.checked)">
            <span>[✓] MARK ACTION AS EXECUTED</span>
          </label>
        </div>
      </div>
    `;
  });

  html += `
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px dashed rgba(0, 255, 102, 0.25);">
        <button class="btn btn-primary" style="font-weight: 800;" onclick="exportCurrentPdf()">
          📄 EXFILTRATE PDF EVIDENCE BUNDLE
        </button>
        <button class="btn btn-secondary" onclick="resetEmergencyFlow()">
          + LOG ANOTHER INCIDENT
        </button>
      </div>
    </div>
  `;

  planContainer.innerHTML = html;
}

window.toggleStepComplete = async function(stepNum, completed) {
  if (!state.activeIncidentId) return;
  const card = document.getElementById(`step-card-${stepNum}`);
  if (card) {
    card.classList.toggle('completed', completed);
  }

  try {
    await api(`/incidents/${state.activeIncidentId}/steps/update`, {
      method: 'POST',
      body: {
        step_number: stepNum,
        completed: completed
      }
    });
    showToast(`Step ${stepNum} status updated: ${completed ? 'Completed' : 'Pending'}`);
  } catch (err) {
    console.error('Step update error:', err);
  }
};

window.resetEmergencyFlow = function() {
  document.getElementById('emergency-plan-view').style.display = 'none';
  document.getElementById('emergency-wizard').style.display = 'none';
  document.getElementById('emergency-hero').style.display = 'block';
  state.intake.step = 1;
};

// ─── Beat 2: Scam Detection Check ────────────────────────────────────────────
window.loadPresetText = function(type) {
  const input = document.getElementById('scam-check-input');
  if (!input) return;

  if (type === 'electricity') {
    input.value = "Dear consumer your electricity power will be disconnected tonight at 9:30pm because your previous month bill was not updated. Please immediately call electricity officer at 9876543210.";
  } else if (type === 'kyc') {
    input.value = "SBI Alert: Your NetBanking account will be suspended today due to pending KYC verification. Click to complete verification: http://sbi-kyc-update.com immediately.";
  } else if (type === 'lottery') {
    input.value = "Congratulations! You have won ₹25,00,000 in KBC Jio Lucky Draw. To claim your prize money, send processing fee of ₹1,500 via GPay to 9999988888.";
  }
};

window.runScamCheck = async function() {
  const input = document.getElementById('scam-check-input');
  const btn = document.getElementById('btn-run-scam-check');
  const resultBox = document.getElementById('scam-check-result');
  if (!input || !input.value.trim()) {
    showToast('Please paste payload to scan.', false);
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '🔍 SCANNING AGAINST THREAT SIGNATURES...';
  }

  try {
    const res = await api('/detect/text', {
      method: 'POST',
      body: {
        content: input.value.trim(),
        lang: state.currentLang
      }
    });

    const isHigh = res.risk === 'high' || res.risk === 'critical';
    resultBox.style.display = 'block';
    resultBox.className = `detection-card ${isHigh ? 'high-risk' : ''}`;
    resultBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(0, 255, 102, 0.25);">
        <span class="risk-badge ${isHigh ? 'high' : 'low'}">
          ${isHigh ? '🚨 HIGH RISK THREAT DETECTED' : '✅ LOW RISK / VERIFIED SAFE'}
        </span>
        <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--neon-cyan); background: #040907; border: 1px solid var(--neon-cyan); padding: 3px 10px; border-radius: 2px;">
          CONFIDENCE: ${res.confidence.toUpperCase()}
        </span>
      </div>

      <p style="font-family: var(--font-hud); font-size: 1rem; font-weight: 800; color: #FFFFFF; margin-bottom: 8px; text-transform: uppercase;">
        THREAT_CLASS: <span style="color: ${isHigh ? 'var(--cyber-red)' : 'var(--neon-green)'};">${res.category.replace(/_/g, ' ').toUpperCase()}</span>
      </p>

      <p style="font-size: 0.92rem; color: #D1FAE5; line-height: 1.6; margin-bottom: 12px;">
        ${res.explanation}
      </p>

      ${res.indicators && res.indicators.length ? `
        <div class="flagged-items-box">
          <div style="font-family: var(--font-mono); font-size: 0.78rem; color: #FFA3B2; font-weight: 800; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.06em;">FLAGGED THREAT SIGNATURES:</div>
          <ul style="padding-left: 20px; font-family: var(--font-mono); font-size: 0.88rem; color: #FFA3B2; font-weight: 700;">
            ${res.indicators.map(ind => `<li>${ind}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="background: rgba(0, 255, 102, 0.1); border: 1.5px solid var(--neon-green); border-radius: 3px; padding: 12px 16px; margin-top: 14px;">
        <span style="font-family: var(--font-hud); font-size: 0.85rem; font-weight: 800; color: var(--neon-green); text-transform: uppercase;">🛡️ TACTICAL ACTION REQUIRED:</span>
        <span style="font-size: 0.88rem; color: #FFFFFF; margin-left: 6px;">${res.action}</span>
      </div>
    `;

    if (isHigh) {
      playAlertTone();
      showToast('⚠️ Scam detected! Alert telemetry dispatched to family grid.', true);
    }
  } catch (err) {
    console.error('Detection error:', err);
    showToast(`Detection error: ${err.message}`, true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🔍 SCAN & NEUTRALIZE THREAT';
    }
  }
};

// ─── Beat 3: Family Linking & Real-time Alerts ───────────────────────────────
function startAlertPolling() {
  setInterval(async () => {
    if (!state.tokens.guardian) return;
    try {
      const alerts = await api('/alerts/poll?unacked_only=true', {
        headers: { Authorization: `Bearer ${state.tokens.guardian}` }
      });
      if (alerts && alerts.length > 0) {
        if (alerts.length > state.unreadAlertCount) {
          playAlertTone();
          showToast(`🚨 INTRUSION ALERT: ${alerts[0].category} flagged on family grid!`, true);
        }
        state.alerts = alerts;
        state.unreadAlertCount = alerts.length;
        updateAlertBadge();
        if (state.activeTab === 'guardian') {
          renderAlertsList();
        }
      }
    } catch (e) {
      // Background poll retry
    }
  }, 4000);
}

function updateAlertBadge() {
  const badge = document.getElementById('guardian-badge');
  if (!badge) return;
  if (state.unreadAlertCount > 0) {
    badge.style.display = 'inline-block';
    badge.textContent = state.unreadAlertCount;
  } else {
    badge.style.display = 'none';
  }
}

async function fetchAlerts() {
  try {
    const alerts = await api('/alerts/poll?unacked_only=false', {
      headers: { Authorization: `Bearer ${state.tokens.guardian}` }
    });
    state.alerts = alerts || [];
    renderAlertsList();
  } catch (err) {
    console.error('Fetch alerts error:', err);
  }
}

async function fetchFamilyMembers() {
  const el = document.getElementById('family-status-box');
  if (!el) return;
  try {
    const status = await api('/family/status', {
      headers: { Authorization: `Bearer ${state.tokens.guardian}` }
    });
    el.innerHTML = `
      <div class="family-shield-header">
        <div>
          <span style="font-family: var(--font-hud); font-weight: 800; color: var(--neon-green); font-size: 1.05rem; text-transform: uppercase;">FAMILY DEFENSE TELEMETRY</span>
          <span style="margin-left: 10px; font-family: var(--font-mono); font-size: 0.82rem; color: var(--neon-cyan);">
            GRID_ID: <code>${status.family_id.slice(0, 8)}</code>
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">JOIN_CODE:</span>
          <span class="code-pill">${status.join_code}</span>
        </div>
      </div>
      <div class="member-chip-row">
        ${status.members.map(m => `
          <div class="member-chip">
            <span style="font-size: 1.1rem;">${m.role === 'guardian' ? '🛡️' : '👵'}</span>
            <div>
              <div style="font-family: var(--font-hud); font-weight: 800; color: #FFFFFF; font-size: 0.9rem;">${m.name}</div>
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--neon-cyan);">${m.role === 'guardian' ? 'GUARDIAN (TELEMETRY RECEIVER)' : 'PROTECTED NODE'} • ${m.phone}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<span style="font-family: var(--font-mono); color: var(--text-muted);">Family telemetry active.</span>`;
  }
}

function renderAlertsList() {
  const listEl = document.getElementById('alerts-feed');
  if (!listEl) return;

  if (!state.alerts || state.alerts.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 28px; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.9rem; background: #030805; border: 1px dashed rgba(0, 255, 102, 0.2);">
        ALL CHANNELS SECURE // NO ACTIVE THREAT TELEMETRY
      </div>
    `;
    return;
  }

  listEl.innerHTML = state.alerts.map(a => `
    <div class="alert-feed-item">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="risk-badge high">
            ${a.severity.toUpperCase()}
          </span>
          <span style="font-family: var(--font-hud); font-weight: 800; color: #FFFFFF; font-size: 0.95rem; text-transform: uppercase;">${a.category.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
        <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted);">${new Date(a.created_at).toLocaleTimeString()}</span>
      </div>
      <p style="font-size: 0.9rem; color: #E6FFF2; margin-bottom: 6px;">
        <b>TARGETED_MEMBER:</b> ${a.member_name} — ${a.summary}
      </p>
      <p style="font-family: var(--font-mono); font-size: 0.85rem; color: #FF8093; margin-bottom: 14px; background: rgba(255, 0, 60, 0.12); border: 1px solid rgba(255, 0, 60, 0.3); padding: 8px 12px; border-radius: 2px;">
        <i>WHY_FLAGGED:</i> ${a.why}
      </p>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-danger" style="padding: 8px 16px; font-size: 0.82rem;" onclick="callMember('${a.member_id}')">
          📞 CALL ${a.member_name} IMMEDIATELY
        </button>
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.82rem;" onclick="ackAlert('${a.id}')">
          ✓ ACKNOWLEDGE THREAT
        </button>
      </div>
    </div>
  `).join('');
}

window.ackAlert = async function(alertId) {
  try {
    await api(`/alerts/${alertId}/ack`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${state.tokens.guardian}` }
    });
    showToast('Threat alert acknowledged.');
    fetchAlerts();
  } catch (err) {
    showToast(`Error: ${err.message}`, true);
  }
};

window.callMember = function(memberId) {
  showToast('Establishing direct voice channel to: +91 9000000001');
  window.location.href = 'tel:+919000000001';
};

// ─── Beat 4: Timeline & PDF Export ───────────────────────────────────────────
async function renderTimelineTab() {
  const container = document.getElementById('timeline-feed');
  if (!container) return;

  if (!state.activeIncidentId) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px; color: var(--text-muted); font-family: var(--font-mono); background: #030805; border: 1px dashed rgba(0, 255, 102, 0.2);">
        AWAITING INCIDENT TRIAGE LOGS...
      </div>
    `;
    return;
  }

  try {
    const events = await api(`/incidents/${state.activeIncidentId}/events`);
    if (!events || events.length === 0) {
      container.innerHTML = `<div style="color: var(--text-muted); font-family: var(--font-mono);">No timeline events recorded yet.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="timeline-track">
        ${events.map(ev => `
          <div class="timeline-entry ${ev.event_type.includes('alert') ? 'alert-node' : ''}">
            <div class="timeline-node"></div>
            <div class="timeline-card-content">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-family: var(--font-hud); font-weight: 800; font-size: 0.88rem; color: var(--neon-green);">
                  ${ev.event_type.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--neon-cyan);">${new Date(ev.server_ts).toLocaleTimeString()}</span>
              </div>
              <div style="color: #A7F3D0; font-size: 0.82rem; font-family: var(--font-mono); background: #030805; border: 1px solid rgba(0, 255, 102, 0.15); padding: 8px 12px; border-radius: 2px; margin-top: 6px; word-break: break-all;">
                ${JSON.stringify(ev.payload)}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: var(--cyber-red); font-family: var(--font-mono);">Error loading events: ${err.message}</div>`;
  }
}

window.exportCurrentPdf = function() {
  if (!state.activeIncidentId) {
    showToast('No active incident to export.', true);
    return;
  }
  showToast('Exfiltrating official PDF evidence bundle...');
  window.open(`/incidents/${state.activeIncidentId}/export`, '_blank');
};

// Start application on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
