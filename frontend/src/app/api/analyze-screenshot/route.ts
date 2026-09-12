import { NextRequest, NextResponse } from 'next/server';
import { ScamAnalysisSchema, type ScamAnalysis } from '@/lib/scam-types';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected multipart/form-data.' },
        { status: 400 }
      );
    }

    const file = formData.get('screenshot') as File | null;
    if (!file) {
      return NextResponse.json(
        { error: 'No screenshot file provided. Please upload an image.' },
        { status: 400 }
      );
    }

    // 1. Validate MIME type
    const mimeType = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${mimeType || 'unknown'}. Only PNG, JPG, and WEBP screenshots are supported.`,
        },
        { status: 400 }
      );
    }

    // 2. Validate file size
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Uploaded file is empty (0 bytes). Please upload a valid screenshot.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Screenshot is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`,
        },
        { status: 400 }
      );
    }

    // Convert file to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Basic image header sniffing (Magic bytes validation)
    const isPng = buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isJpg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isWebp = buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';

    if (!isPng && !isJpg && !isWebp) {
      return NextResponse.json(
        { error: 'Corrupted or invalid image file. Header bytes do not match PNG, JPG, or WEBP.' },
        { status: 400 }
      );
    }

    const base64Data = buffer.toString('base64');
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash';

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Screenshot AI analysis is currently unavailable because the AI service is unconfigured. You can paste the message text into the text scanner instead.',
        },
        { status: 503 }
      );
    }

    // 3. Gemini Multimodal Analysis
    const systemPrompt = `You are AI Scam Shield, an expert cyber-fraud and financial scam analyst.
Your task is to analyze screenshots of messages, SMS, WhatsApp chats, emails, banking alerts, or app notifications in English, Hindi, Hinglish, Bengali, or mixed languages.
Read ALL visible text, sender handles, phone numbers, URLs, and payment details in the screenshot.

Assess combinations of fraud signals: urgency, threats, impersonation, money requests, OTP requests, UPI PIN requests, password/credential requests, suspicious links, fake customer support, fake government/police claims, digital arrest threats, investment promises, courier contraband claims, electricity disconnection claims, job offers, KYC/account verification, fake refunds, prize/lottery claims, account suspension, remote-access requests (AnyDesk, TeamViewer).
Do NOT classify as scam merely because the image contains a URL, payment language, urgency, OTP, bank name, or government terminology. Context matters.

Classify into:
- verdict: "SCAM" | "LIKELY_SCAM" | "SUSPICIOUS" | "LIKELY_LEGIT"
- risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
- category: one of "Electricity", "KYC / Identity", "Courier / Delivery", "Job / Recruitment", "Investment / Trading", "UPI / Payment", "Customer Support", "Police / Government Impersonation", "Prize / Lottery", "Other"
- summary: 1 or 2 concise, clear sentences.
- assessment_strength: integer between 1 and 10 representing analytical certainty.
- indicators: array of objects { type: string, explanation: string } explaining each red flag or legitimate factor.
- recommended_actions: array of prioritized action items.
- already_affected: object { money_sent: boolean, information_shared: boolean, clicked_link: boolean } estimating if the screenshot text suggests the user already took action.

Respond ONLY with valid JSON matching the exact schema.`;

    const userPrompt = `Read and analyze this screenshot for scam and fraud indicators in India.`;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
                  data: base64Data,
                },
              },
              { text: userPrompt },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
      signal: AbortSignal.timeout(20000), // 20s timeout for vision model
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text().catch(() => '');
      console.error('[Gemini Vision API Error]:', geminiResponse.status, errBody);
      return NextResponse.json(
        {
          error: 'Screenshot analysis is temporarily unavailable. You can paste the message text into the text scanner instead.',
        },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();
    const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return NextResponse.json(
        {
          error: 'AI analysis returned an empty response. You can paste the message text into the text scanner instead.',
        },
        { status: 502 }
      );
    }

    let cleanJson = candidateText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanJson);
    const validated: ScamAnalysis = ScamAnalysisSchema.parse(parsed);
    return NextResponse.json(validated);
  } catch (err: any) {
    console.error('Fatal analyze-screenshot error:', err);
    return NextResponse.json(
      {
        error: 'Screenshot analysis encountered an error. You can paste the message text into the text scanner instead.',
        detail: err.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
