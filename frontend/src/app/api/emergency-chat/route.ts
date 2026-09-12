import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface IncidentContext {
  incidentType?: string;
  amount?: string;
  currency?: string;
  paymentMethod?: string;
  transactionId?: string;
  whatHappened?: string;
}

const SYSTEM_PROMPT = `You are RedFlag Emergency Damage Control Specialist — an expert cyber-fraud forensic first responder for victims in India.

The user interacting with you has just fallen victim to a scam or is in peak panic. They need IMMEDIATE, actionable, clear damage control instructions to minimize financial loss and secure their identity.

CORE PROTOCOLS & GUIDELINES:
1. THE GOLDEN HOUR (FIRST 2 HOURS):
   - Every minute counts before stolen funds are transferred across mule accounts or withdrawn via ATMs.
   - Immediate Step 1: Call Bank's 24x7 Cyber-Fraud Helpline to freeze the compromised account/card and initiate a transaction recall. Mention RBI Customer Protection Circular (Zero Liability if reported promptly).
   - Immediate Step 2: Call the National Cyber Crime Helpline at 1930 or report on https://cybercrime.gov.in immediately. This registers an alert on the CFCFRMS (Citizen Financial Cyber Fraud Reporting and Management System) to freeze the fraudster's beneficiary account in real time.
   - Immediate Step 3: For UPI (Google Pay, PhonePe, Paytm), raise an in-app dispute on the specific transaction (Select: "Fraud / Sent to unknown scammer") and save the NPCI 12-digit UTR number.

2. REMOTE ACCESS APPS (AnyDesk, TeamViewer, RustDesk, QuickSupport):
   - Immediately switch phone to AIRPLANE MODE and turn off Wi-Fi.
   - Uninstall the remote access app immediately from Settings -> Apps.
   - Go to Settings -> Accessibility and disable any unknown active services.
   - Change bank passwords and UPI PINs from a DIFFERENT, clean device.

3. "DIGITAL ARREST" & LAW ENFORCEMENT IMPERSONATION (CBI, Police, Customs, ED, FedEx):
   - Firmly reassure the victim: "YOU ARE SAFE. There is NO legal provision for 'Digital Arrest' under Indian Law. Police, CBI, Customs, and Judges NEVER conduct court hearings, interrogations, or arrest people over Skype/WhatsApp video calls. They NEVER demand security deposits or bail via UPI."
   - Instruct the user to disconnect the call immediately, block the number, and not pay a single rupee.

4. CREDENTIAL / OTP LEAK:
   - Call bank hotline to lock Net Banking and block debit/credit cards immediately.
   - Reset UPI PIN via bank ATM or clean device.

5. COMMUNICATION STYLE:
   - Empathetic, calm, authoritative, and direct.
   - Use numbered bullet steps for chronological urgency.
   - Provide exact telephone numbers (e.g. 1930) and official websites (cybercrime.gov.in, sancharsaathi.gov.in).
   - If the user writes in Hindi, Hinglish, Bengali, or mixed languages, respond in that same language or bilingual for maximum comfort.
   - Keep answers focused, practical, and devoid of unnecessary jargon.`;

function getLocalEmergencyFallback(userQuery: string, context?: IncidentContext): string {
  const lower = userQuery.toLowerCase();

  if (lower.includes('anydesk') || lower.includes('teamviewer') || lower.includes('remote') || lower.includes('screen') || lower.includes('app install')) {
    return `### 🚨 IMMEDIATE ACTIONS FOR REMOTE ACCESS / MALWARE

1. **Disconnect from the Internet RIGHT NOW**:
   - Turn ON **Airplane Mode** and turn OFF **Wi-Fi** immediately to break the scammer's live connection to your device.

2. **Uninstall the Remote Application**:
   - Go to your phone's **Settings → Apps → Installed Apps**.
   - Locate and uninstall **AnyDesk, TeamViewer, RustDesk, or QuickSupport** immediately.
   - Check **Settings → Accessibility** and ensure no unknown app has screen-reading permissions.

3. **Secure Your Bank Accounts From a DIFFERENT Device**:
   - Using another family member's clean phone or PC, log in to your bank portal or call your bank's fraud helpline.
   - Request an immediate **temporary freeze on Net Banking and UPI services**.
   - Change your Internet Banking password and UPI PIN.

4. **Report the Incident**:
   - Dial **1930** (National Cyber Crime Helpline) or submit an urgent complaint at [cybercrime.gov.in](https://cybercrime.gov.in).`;
  }

  if (lower.includes('arrest') || lower.includes('cbi') || lower.includes('police') || lower.includes('customs') || lower.includes('narcotics') || lower.includes('skype') || lower.includes('video call')) {
    return `### 🛑 STOP — YOU ARE NOT UNDER ARREST. THIS IS 100% A SCAM.

1. **Hang Up and Block Them Immediately**:
   - There is **NO SUCH THING as "Digital Arrest"** under Indian Law (Bharatiya Nagarik Suraksha Sanhita / CrPC).
   - The Supreme Court, High Courts, CBI, ED, and State Police **NEVER** conduct trials, interrogations, or arrest people over Skype or WhatsApp video calls.

2. **DO NOT Transfer Any Money**:
   - Police and government agencies **NEVER demand "verification deposits" or "bail money" via UPI or bank transfer**. Any account they gave you belongs to a mule.

3. **Report the Extortion**:
   - Call the Cybercrime Helpline at **1930** immediately.
   - Report the phone number and WhatsApp profile on the Ministry of Communications **Chakshu portal** at [sancharsaathi.gov.in](https://sancharsaathi.gov.in).

4. **You Are Completely Safe**:
   - The scammer uses high-pressure intimidation and fake uniforms to induce panic. Block their numbers and inform your family or a trusted local person.`;
  }

  const txInfo = context?.transactionId ? `(UTR: ${context.transactionId})` : '';
  const amtInfo = context?.amount ? `amounting to ${context.amount}` : '';

  return `### ⏱️ GOLDEN HOUR EMERGENCY ACTION PROTOCOL

${amtInfo ? `Regarding the fraudulent transfer ${amtInfo} ${txInfo}:` : 'If you have transferred money or shared sensitive credentials:'}

1. **Call Your Bank's Cyber Fraud Hotline IMMEDIATELY**:
   - Ask for the **Fraud Desk** and request an immediate **Debit Freeze / Hotlist** on the transaction.
   - Quote RBI's Customer Protection Circular on limiting customer liability for unauthorized transactions.

2. **Call the 1930 National Cybercrime Helpline**:
   - **Dial 1930 right now** (toll-free across India) or visit **[cybercrime.gov.in](https://cybercrime.gov.in)**.
   - The operator will immediately log the transaction into the **CFCFRMS system**, which sends an instant digital hold to the recipient bank/wallet to freeze the scammer's account before they cash out.

3. **Report Directly in Your Payment App**:
   - If paid via **UPI (GPay / PhonePe / Paytm / BHIM)**: Open the transaction history → Tap **Report Fraud / Problem with Payment** → Select **"Sent to Fraudster / Scammer"**.
   - Note down the **12-digit UTR (UPI Reference Number)**.

4. **Preserve All Evidence**:
   - Take screenshots of the chat, SMS, phone call log, and payment debit receipt.
   - Do NOT delete the conversation history or messages.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, incidentContext } = body as {
      messages: ChatMessage[];
      incidentContext?: IncidentContext;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required.' },
        { status: 400 }
      );
    }

    const latestUserMessage = messages[messages.length - 1]?.content?.trim();
    if (!latestUserMessage) {
      return NextResponse.json(
        { error: 'Latest message cannot be empty.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash';

    // Build context prefix if user supplied incident facts
    let contextNote = '';
    if (incidentContext) {
      const parts: string[] = [];
      if (incidentContext.incidentType) parts.push(`Incident Type: ${incidentContext.incidentType}`);
      if (incidentContext.amount) parts.push(`Amount Lost: ${incidentContext.amount} ${incidentContext.currency || 'INR'}`);
      if (incidentContext.paymentMethod) parts.push(`Payment Method: ${incidentContext.paymentMethod}`);
      if (incidentContext.transactionId) parts.push(`Transaction ID / UTR: ${incidentContext.transactionId}`);
      if (incidentContext.whatHappened) parts.push(`Context Narrative: ${incidentContext.whatHappened}`);
      if (parts.length > 0) {
        contextNote = `[VICTIM'S RECORDED INCIDENT FACTS]:\n${parts.join('\n')}\n\n`;
      }
    }

    // Call Gemini if API Key is configured
    if (apiKey) {
      try {
        // Format history for Gemini contents API
        const geminiContents = messages.map((msg, idx) => {
          const role = msg.role === 'assistant' ? 'model' : 'user';
          let text = msg.content;
          // Prepend incident context to the very first user message
          if (idx === 0 && role === 'user' && contextNote) {
            text = `${contextNote}${text}`;
          }
          return {
            role,
            parts: [{ text }],
          };
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: geminiContents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1024,
            },
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText && replyText.trim().length > 0) {
            return NextResponse.json({
              reply: replyText.trim(),
              source: 'redflag_ai',
              model: modelName,
            });
          }
        } else {
          const errData = await response.text();
          console.warn('[Gemini Emergency Chat Failed, falling back]:', response.status, errData);
        }
      } catch (geminiErr) {
        console.warn('[Gemini Emergency Chat Exception, falling back]:', geminiErr);
      }
    }

    // Resilient Fallback
    const fallbackReply = getLocalEmergencyFallback(latestUserMessage, incidentContext);
    return NextResponse.json({
      reply: fallbackReply,
      source: 'local_protocol_engine',
    });
  } catch (error: any) {
    console.error('Emergency chat route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error in emergency chat.' },
      { status: 500 }
    );
  }
}
