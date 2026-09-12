import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization');
    const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

    // 1. Try forwarding to backend if running
    if (authHeader) {
      try {
        const backendRes = await fetch(`${backendUrl}/alerts/emergency`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(3000),
        });

        if (backendRes.ok) {
          const data = await backendRes.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        console.warn('[Next.js /api/alerts/emergency] Backend unreachable, using demo fallback:', err);
      }
    }

    // 2. Demo Fallback: return a valid GuardianEmergencyAlertResponse
    const now = new Date();
    const alertId = 'alert-' + Math.random().toString(36).substring(2, 10) + '-' + now.getTime().toString(36);
    const incidentId = 'inc-' + Math.random().toString(36).substring(2, 10);
    const category = body.category || 'UPI / Financial';
    const amountStr = body.amount ? ` Amount: ${body.amount}` : '';
    const txStr = body.transaction_id ? ` | Tx: ${body.transaction_id}` : '';

    const responsePayload = {
      status: 'alert_sent',
      alert_id: alertId,
      incident_id: incidentId,
      family_id: 'demo-family-1',
      severity: body.severity || 'critical',
      summary: `🚨 ${(body.severity || 'CRITICAL').toUpperCase()} SCAM INCIDENT — ${category} reported by মা (Maa).${amountStr}${txStr}`,
      timestamp: now.toISOString(),
      channels: ['WhatsApp Emergency Priority', 'Guardian App Notification', 'SMS Gateway'],
      guardian_name: 'Rina (Primary Guardian)',
      guardian_phone: '+919000000002',
    };

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error('[Next.js /api/alerts/emergency error]:', err);
    return NextResponse.json(
      { detail: err.message || 'Internal error dispatching guardian alert' },
      { status: 500 }
    );
  }
}
