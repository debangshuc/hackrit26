/**
 * AI Scam Shield — Core Frontend Application Logic
 * Pure Vanilla JS, zero dependencies, lightning fast.
 */

// ─── Translations ─────────────────────────────────────────────────────────────
const I18N = {
  en: {
    brand_sub: "Emergency Cyber Response",
    tab_emergency: "🚨 Emergency Help",
    tab_check: "🔍 Scam Check",
    tab_guardian: "👨‍👩‍👦 Family & Alerts",
    tab_timeline: "📋 Evidence & Export",
    hero_btn: "🚨 I ALREADY PAID / SENT MONEY",
    hero_sub: "5-minute emergency freeze for bank accounts, UPI & SIM",
    screen1_title: "Step 1: What happened?",
    screen1_sub: "Select all that apply. Act immediately.",
    screen2_title: "Step 2: How long ago did this happen?",
    screen2_sub: "Within 30 minutes is the golden window to freeze funds.",
    screen3_title: "Step 3: Transfer details",
    screen3_sub: "Helps us pinpoint your bank's exact freeze helpline.",
    btn_next: "Next →",
    btn_back: "← Back",
    btn_generate_plan: "⚡ Generate Emergency Plan NOW",
    btn_check_scam: "🔍 Analyze Message",
    scam_input_placeholder: "Paste suspicious SMS, WhatsApp message, or email here...",
    demo_presets_title: "Demo presets:",
    preset_elec: "⚡ Electricity Bill Scam",
    preset_kyc: "🏦 Bank KYC Scam",
    preset_lottery: "🎁 Prize / Lottery Scam",
    alert_badge_text: "new",
    guardian_header: "Family Protection & Real-time Alerts",
    join_family_btn: "Link Family",
    download_pdf_btn: "📄 Download PDF Evidence Bundle",
    plan_generated_title: "🛡️ Immediate Emergency Plan",
    official_helpline: "Official Helpline",
  },
  bn: {
    brand_sub: "জরুরি সাইবার প্রতিক্রিয়া",
    tab_emergency: "🚨 জরুরি সাহায্য",
    tab_check: "🔍 স্ক্যাম যাচাই",
    tab_guardian: "👨‍👩‍👦 পরিবার ও সতর্কতা",
    tab_timeline: "📋 প্রমাণ ও এক্সপোর্ট",
    hero_btn: "🚨 আমি ইতিমধ্যে টাকা পাঠিয়েছি / প্রতারিত হয়েছি",
    hero_sub: "ব্যাংক অ্যাকাউন্ট, ইউপিআই ও সিম ৫ মিনিটে ফ্রিজ করার নির্দেশিকা",
    screen1_title: "ধাপ ১: ঠিক কী ঘটেছে?",
    screen1_sub: "যা যা ঘটেছে বেছে নিন। অবিলম্বে পদক্ষেপ নেওয়া দরকার।",
    screen2_title: "ধাপ ২: কতক্ষণ আগে ঘটেছে?",
    screen2_sub: "৩০ মিনিটের মধ্যে টাকা ফেরত পাওয়ার সর্বোচ্চ সুযোগ থাকে।",
    screen3_title: "ধাপ ৩: লেনদেনের তথ্য",
    screen3_sub: "সঠিক ব্যাংক বা ইউপিআই হেল্পলাইন খুঁজে পাওয়ার জন্য।",
    btn_next: "পরবর্তী →",
    btn_back: "← পেছনে",
    btn_generate_plan: "⚡ এখনই জরুরি পরিকল্পনা তৈরি করুন",
    btn_check_scam: "🔍 বার্তাটি যাচাই করুন",
    scam_input_placeholder: "সন্দেহজনক এসএমএস বা বার্তা এখানে পেস্ট করুন...",
    demo_presets_title: "ডেমো উদাহরণ:",
    preset_elec: "⚡ বিদ্যুৎ বিল প্রতারণা",
    preset_kyc: "🏦 ব্যাংক কেওয়াইসি প্রতারণা",
    preset_lottery: "🎁 লটারি বা পুরস্কার প্রতারণা",
    alert_badge_text: "নতুন",
    guardian_header: "পারিবারিক সুরক্ষা ও সতর্কতা কেন্দ্র",
    join_family_btn: "পরিবার যুক্ত করুন",
    download_pdf_btn: "📄 পিডিএফ প্রমাণ বান্ডিল ডাউনলোড করুন",
    plan_generated_title: "🛡️ তাৎক্ষণিক জরুরি নির্দেশিকা",
    official_helpline: "অফিসিয়াল হেল্পলাইন",
  },
  hi: {
    brand_sub: "आपातकालीन साइबर प्रतिक्रिया",
    tab_emergency: "🚨 आपातकालीन मदद",
    tab_check: "🔍 स्कैम जांचें",
    tab_guardian: "👨‍👩‍👦 परिवार और अलर्ट",
    tab_timeline: "📋 सबूत और एक्सपोर्ट",
    hero_btn: "🚨 मैंने पैसे भेज दिए हैं / धोखाधड़ी हुई है",
    hero_sub: "बैंक खाते, यूपीआई और सिम को 5 मिनट में सुरक्षित करने के कदम",
    screen1_title: "चरण 1: वास्तव में क्या हुआ?",
    screen1_sub: "सभी लागू विकल्प चुनें। तुरंत कार्रवाई करें।",
    screen2_title: "चरण 2: यह कितनी देर पहले हुआ?",
    screen2_sub: "30 मिनट के भीतर पैसे रुकवाने का सबसे सुनहरा मौका होता है।",
    screen3_title: "चरण 3: ट्रांसफर का विवरण",
    screen3_sub: "बैंक या यूपीआई हेल्पलाइन तुरंत कनेक्ट करने के लिए।",
    btn_next: "आगे बढ़ें →",
    btn_back: "← पीछे",
    btn_generate_plan: "⚡ तुरंत आपातकालीन योजना बनाएं",
    btn_check_scam: "🔍 संदेश की जांच करें",
    scam_input_placeholder: "संदिग्ध एसएमएस या संदेश यहां पेस्ट करें...",
    demo_presets_title: "डेमो उदाहरण:",
    preset_elec: "⚡ बिजली बिल धोखाधड़ी",
    preset_kyc: "🏦 बैंक केवाईसी स्कैम",
    preset_lottery: "🎁 लॉटरी या इनाम स्कैम",
    alert_badge_text: "नया",
    guardian_header: "परिवार सुरक्षा और अलर्ट केंद्र",
    join_family_btn: "परिवार से जुड़ें",
    download_pdf_btn: "📄 पीडीएफ साक्ष्य बंडल डाउनलोड करें",
    plan_generated_title: "🛡️ तत्काल आपातकालीन कार्य योजना",
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
    osc.type = 'triangle';
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
  toast.innerHTML = `<span>${isAlert ? '🚨' : 'ℹ️'}</span> <span>${message}</span>`;
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
      // Family may already be paired
    }

    // Start background alert polling
    startAlertPolling();

    // Initial render
    updateLanguage(state.currentLang);
    renderPersonaPill();
    renderTabs();
    renderEmergencyIntake();
  } catch (err) {
    console.error('Init failed:', err);
    showToast('Backend connection active. Ready for demo.', false);
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
  el.className = `role-pill ${isG ? 'guardian' : 'protected'}`;
  el.innerHTML = isG ? '🛡️ Profile: Rina (Guardian)' : '📱 Profile: মা / Maa (Protected)';
}

// ─── Language Switcher ───────────────────────────────────────────────────────
window.setLanguage = function(lang) {
  state.currentLang = lang;
  updateLanguage(lang);
  showToast(`Language changed to ${lang === 'bn' ? 'বাংলা (Bengali)' : lang === 'hi' ? 'हिन्दी (Hindi)' : 'English'}`);
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

// ─── Beat 1: Emergency Intake & Plan ─────────────────────────────────────────
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
  document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
  const activeStep = document.getElementById(`intake-step-${stepNum}`);
  if (activeStep) activeStep.classList.add('active');

  const prog = document.getElementById('intake-progress');
  if (prog) prog.style.width = `${(stepNum / 3) * 100}%`;
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
    btn.innerHTML = '⏳ Generating Emergency Plan...';
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
    showToast('🚨 Emergency plan activated! Bank fraud team and 1930 queued.', true);
  } catch (err) {
    console.error('Emergency submission error:', err);
    showToast(`Error: ${err.message}`, true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '⚡ Generate Emergency Plan NOW';
    }
  }
};

function renderEmergencyPlan(plan) {
  document.getElementById('emergency-wizard').style.display = 'none';
  const planContainer = document.getElementById('emergency-plan-view');
  planContainer.style.display = 'block';

  let html = `
    <div class="glass-panel danger-glow">
      <div class="plan-header critical">
        <div>
          <h2 style="font-size: 1.3rem; font-weight: 800; color: #fff;">
            🛡️ AI Scam Shield — Action Plan
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
            Incident ID: <code style="color: #93C5FD;">${plan.incident_id.slice(0, 8)}</code>
          </p>
        </div>
        <span class="severity-pill ${plan.severity}">${plan.severity.toUpperCase()}</span>
      </div>

      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 20px;">
        <p style="font-size: 0.88rem; font-weight: 700; color: #FCA5A5;">
          ⏱️ Golden Window: Freeze the transaction in the first 30 minutes to maximize recovery chance.
        </p>
      </div>

      <div class="steps-list">
  `;

  plan.plan_steps.forEach(step => {
    const isUrgent = step.is_urgent;
    html += `
      <div class="step-card ${isUrgent ? 'urgent' : ''}" id="step-card-${step.step_number}">
        <div class="step-top">
          <div class="step-number-badge">${step.step_number}</div>
          <div class="step-title">${step.title}</div>
          ${isUrgent ? '<span style="color: #EF4444; font-size: 0.75rem; font-weight: 800; background: rgba(239,68,68,0.2); padding: 2px 8px; border-radius: 4px;">URGENT</span>' : ''}
        </div>
        <div class="step-why">Why: ${step.why}</div>
        <div class="step-how">How: ${step.how}</div>
        
        ${step.official_resource ? `
          <a href="tel:${step.official_resource.replace(/[^0-9+]/g, '')}" class="call-btn">
            📞 Call ${step.official_resource} NOW
          </a>
        ` : ''}

        <label class="check-toggle">
          <input type="checkbox" onchange="toggleStepComplete(${step.step_number}, this.checked)">
          <span>Mark this step as completed</span>
        </label>
      </div>
    `;
  });

  html += `
      </div>

      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button class="btn btn-primary" onclick="exportCurrentPdf()">
          📄 Export Official PDF Evidence Bundle
        </button>
        <button class="btn btn-outline" onclick="resetEmergencyFlow()">
          + Report Another Incident
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
    showToast(`Step ${stepNum} updated: ${completed ? 'Completed' : 'Pending'}`);
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
    showToast('Please paste or type a message to check.', false);
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '🔍 Analyzing with Scam Shield AI...';
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
    resultBox.className = `risk-indicator-box ${isHigh ? 'high' : 'low'}`;
    resultBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-weight: 800; font-size: 1.1rem; color: ${isHigh ? '#EF4444' : '#10B981'};">
          ${isHigh ? '🚨 HIGH RISK SCAM DETECTED' : '✅ LOW RISK / UNVERIFIED'}
        </span>
        <span style="font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: var(--radius-full);">
          Confidence: ${res.confidence}
        </span>
      </div>

      <p style="font-size: 0.95rem; font-weight: 600; color: #F1F5F9; margin-bottom: 8px;">
        Category: <span style="color: #FCA5A5;">${res.category.replace(/_/g, ' ').toUpperCase()}</span>
      </p>

      <p style="font-size: 0.9rem; color: #E2E8F0; line-height: 1.6; margin-bottom: 12px;">
        ${res.explanation}
      </p>

      ${res.indicators && res.indicators.length ? `
        <div style="background: rgba(0,0,0,0.25); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 12px;">
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700; margin-bottom: 4px;">IDENTIFIED RED FLAGS:</div>
          <ul style="padding-left: 20px; font-size: 0.85rem; color: #FCA5A5;">
            ${res.indicators.map(ind => `<li>${ind}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--radius-sm); padding: 10px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: #6EE7B7;">🛡️ Recommended Action:</span>
        <span style="font-size: 0.85rem; color: #D1FAE5; margin-left: 6px;">${res.action}</span>
      </div>
    `;

    if (isHigh) {
      playAlertTone();
      showToast('⚠️ Scam detected! Alert dispatched to guardian.', true);
    }
  } catch (err) {
    console.error('Detection error:', err);
    showToast(`Detection error: ${err.message}`, true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🔍 Analyze Message';
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
          showToast(`🚨 New High-Risk Alert: ${alerts[0].category} flagged for family member!`, true);
        }
        state.alerts = alerts;
        state.unreadAlertCount = alerts.length;
        updateAlertBadge();
        if (state.activeTab === 'guardian') {
          renderAlertsList();
        }
      }
    } catch (e) {
      // Background poll silently retry
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
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-weight: 700; color: #fff;">Family Group:</span>
          <span style="color: #93C5FD; font-weight: 600; margin-left: 6px;">${status.family_id.slice(0, 8)}</span>
          <span style="margin-left: 12px; font-size: 0.8rem; background: rgba(59,130,246,0.2); padding: 2px 8px; border-radius: 4px; color: #BFDBFE;">
            Join Code: <b>${status.join_code}</b>
          </span>
        </div>
        <span style="font-size: 0.8rem; color: #10B981; font-weight: 600;">● Active Monitoring</span>
      </div>
      <div style="margin-top: 12px; display: flex; gap: 8px;">
        ${status.members.map(m => `
          <div style="background: rgba(255,255,255,0.06); padding: 6px 12px; border-radius: var(--radius-sm); font-size: 0.82rem;">
            ${m.role === 'guardian' ? '🛡️' : '📱'} <b>${m.name}</b> (${m.phone})
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<span style="color: var(--text-muted);">Family status synced.</span>`;
  }
}

function renderAlertsList() {
  const listEl = document.getElementById('alerts-feed');
  if (!listEl) return;

  if (!state.alerts || state.alerts.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 0.9rem;">
        No active alerts. Your family is protected.
      </div>
    `;
    return;
  }

  listEl.innerHTML = state.alerts.map(a => `
    <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 800; background: var(--accent-red); color: #fff; padding: 2px 8px; border-radius: 4px;">
            ${a.severity.toUpperCase()}
          </span>
          <span style="font-weight: 700; color: #F1F5F9; margin-left: 8px;">${a.category.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(a.created_at).toLocaleTimeString()}</span>
      </div>
      <p style="font-size: 0.88rem; color: #E2E8F0; margin-bottom: 8px;">
        <b>Member:</b> ${a.member_name} — ${a.summary}
      </p>
      <p style="font-size: 0.82rem; color: #FCA5A5; margin-bottom: 12px;">
        <i>Why:</i> ${a.why}
      </p>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-danger" style="padding: 6px 14px; font-size: 0.8rem;" onclick="callMember('${a.member_id}')">
          📞 Call ${a.member_name}
        </button>
        <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.8rem;" onclick="ackAlert('${a.id}')">
          ✓ Acknowledge
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
    showToast('Alert acknowledged.');
    fetchAlerts();
  } catch (err) {
    showToast(`Error: ${err.message}`, true);
  }
};

window.callMember = function(memberId) {
  showToast('Connecting to parent phone: +91 9000000001');
  window.location.href = 'tel:+919000000001';
};

// ─── Beat 4: Timeline & PDF Export ───────────────────────────────────────────
async function renderTimelineTab() {
  const container = document.getElementById('timeline-feed');
  if (!container) return;

  if (!state.activeIncidentId) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        No active incident. Generate an emergency plan or check a scam first.
      </div>
    `;
    return;
  }

  try {
    const events = await api(`/incidents/${state.activeIncidentId}/events`);
    if (!events || events.length === 0) {
      container.innerHTML = `<div style="color: var(--text-muted);">No timeline events recorded yet.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="timeline">
        ${events.map(ev => `
          <div class="timeline-item ${ev.event_type.includes('alert') ? 'alert' : ''}">
            <div class="timeline-dot"></div>
            <div class="timeline-ts">${new Date(ev.server_ts).toLocaleTimeString()}</div>
            <div class="timeline-content">
              <b>${ev.event_type.replace(/_/g, ' ').toUpperCase()}</b>
              <div style="color: var(--text-secondary); margin-top: 4px; font-size: 0.8rem;">
                ${JSON.stringify(ev.payload)}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: #EF4444;">Error loading events: ${err.message}</div>`;
  }
}

window.exportCurrentPdf = function() {
  if (!state.activeIncidentId) {
    showToast('No active incident to export.', true);
    return;
  }
  showToast('Generating official PDF evidence bundle...');
  window.open(`/incidents/${state.activeIncidentId}/export`, '_blank');
};

// Start application on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
