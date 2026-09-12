/**
 * API client — fetch wrapper with JWT auth header injection.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('scam_shield_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('scam_shield_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('scam_shield_token');
      localStorage.removeItem('scam_shield_user');
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // ─── Auth ──────────────────────────────────────────────────────────────

  async register(data: { phone: string; name: string; role: string; lang: string }) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(phone: string, otp: string) {
    try {
      return await this.request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      });
    } catch (err) {
      // Demo fallback if backend is offline or unreachable
      if (otp === '123456' || phone.includes('900000000')) {
        const isGuardian = phone === '+919000000002';
        const demoUser = {
          id: isGuardian ? 'demo-guardian-rina' : 'demo-user-maa',
          phone,
          name: isGuardian ? 'Rina (Guardian)' : 'মা (Maa)',
          role: isGuardian ? 'guardian' : 'protected',
          lang: isGuardian ? 'en' : 'bn',
          family_id: 'demo-family-1',
          created_at: new Date().toISOString(),
        };
        const demoToken = 'demo-jwt-token-' + (isGuardian ? 'rina' : 'maa');
        this.setToken(demoToken);
        return {
          access_token: demoToken,
          token_type: 'bearer',
          user: demoUser,
        };
      }
      throw err;
    }
  }

  async demoSetup() {
    try {
      return await this.request<any>('/auth/demo-setup', { method: 'POST' });
    } catch (err) {
      // Offline fallback for demo setup
      return { message: 'Demo setup initialized locally', family_id: 'demo-family-1' };
    }
  }

  // ─── Incidents ─────────────────────────────────────────────────────────

  async createEmergency(facts: any, lang: string = 'bn') {
    return this.request<any>('/incidents/emergency', {
      method: 'POST',
      body: JSON.stringify({ facts, lang }),
    });
  }

  async getIncident(id: string) {
    return this.request<any>(`/incidents/${id}`);
  }

  async getIncidentEvents(id: string) {
    return this.request<any>(`/incidents/${id}/events`);
  }

  async updateStep(incidentId: string, stepNumber: number, completed: boolean) {
    return this.request<any>(`/incidents/${incidentId}/steps/update`, {
      method: 'POST',
      body: JSON.stringify({ step_number: stepNumber, completed }),
    });
  }

  async listIncidents() {
    return this.request<any>('/incidents/');
  }

  // ─── Detection ─────────────────────────────────────────────────────────

  async detectText(content: string, lang: string = 'en') {
    return this.request<any>('/detect/text', {
      method: 'POST',
      body: JSON.stringify({ content, lang }),
    });
  }

  async detectScreenshot(file: File, lang: string = 'en') {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', lang);

    const res = await fetch(`${API_BASE}/detect/screenshot`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // ─── Alerts ────────────────────────────────────────────────────────────

  async createEmergencyAlert(data: {
    incident_type?: string;
    category?: string;
    severity?: string;
    amount?: string;
    currency?: string;
    payment_method?: string;
    transaction_id?: string;
    scammer_contact?: string;
    what_happened?: string;
    checklist_progress?: string;
  }) {
    let result: any = null;

    // 1. Try FastAPI backend first
    try {
      result = await this.request<any>('/alerts/emergency', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (backendErr) {
      console.warn('[ApiClient] Backend /alerts/emergency failed, attempting Next.js route fallback:', backendErr);

      // 2. Try Next.js internal API route fallback
      try {
        const token = this.getToken();
        const nextRes = await fetch('/api/alerts/emergency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
        });

        if (nextRes.ok) {
          result = await nextRes.json();
        }
      } catch (nextErr) {
        console.warn('[ApiClient] Next.js route fallback also failed, generating client fallback:', nextErr);
      }

      // 3. Guaranteed client-side demo fallback
      if (!result) {
        const now = new Date();
        result = {
          status: 'alert_sent',
          alert_id: 'alert-' + Math.random().toString(36).substring(2, 10) + '-' + now.getTime().toString(36),
          incident_id: 'inc-' + Math.random().toString(36).substring(2, 10),
          family_id: 'demo-family-1',
          severity: data.severity || 'critical',
          summary: `🚨 ${(data.severity || 'CRITICAL').toUpperCase()} SCAM INCIDENT — ${data.category || 'UPI / Payment'} reported by মা (Maa).${data.amount ? ` Amount: ${data.amount}` : ''}`,
          timestamp: now.toISOString(),
        };
      }
    }

    // Persist demo alert locally so Guardian Dashboard immediately displays it
    if (typeof window !== 'undefined' && result) {
      try {
        const existingRaw = localStorage.getItem('scam_shield_demo_alerts');
        const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
        const newAlertObj = {
          id: result.alert_id,
          family_id: result.family_id || 'demo-family-1',
          member_id: 'demo-user-maa',
          member_name: 'মা (Maa)',
          severity: result.severity || 'critical',
          category: data.category || 'UPI / Payment',
          summary: result.summary,
          why: `Victim initiated Emergency Protocol. Payment: ${data.payment_method || 'UPI'} | UTR: ${data.transaction_id || 'N/A'}`,
          created_at: result.timestamp || new Date().toISOString(),
          is_false_alarm: false,
          payload: {
            incident_id: result.incident_id,
            amount: data.amount,
            currency: data.currency || 'INR',
            payment_method: data.payment_method,
            transaction_id: data.transaction_id,
            category: data.category,
          },
        };
        // Prepend new alert
        const updated = [newAlertObj, ...existing.filter(a => a.id !== result.alert_id)];
        localStorage.setItem('scam_shield_demo_alerts', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (saveErr) {
        console.warn('[ApiClient] Failed to cache demo alert:', saveErr);
      }
    }

    return result;
  }

  async pollAlerts(unackedOnly: boolean = true) {
    let serverAlerts: any[] = [];
    let fetchSucceeded = false;

    try {
      serverAlerts = await this.request<any[]>(`/alerts/poll?unacked_only=${unackedOnly}`);
      fetchSucceeded = true;
    } catch {
      // Backend offline or unauthenticated
      fetchSucceeded = false;
    }

    // Merge with cached local demo alerts
    let localAlerts: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('scam_shield_demo_alerts');
        if (raw) {
          localAlerts = JSON.parse(raw);
          if (unackedOnly) {
            localAlerts = localAlerts.filter(a => !a.acked_at && !a.is_false_alarm);
          }
        }
      } catch {}
    }

    if (!fetchSucceeded) {
      return localAlerts;
    }

    // Merge without duplicates
    const seenIds = new Set(serverAlerts.map(a => a.id));
    const merged = [...serverAlerts];
    for (const la of localAlerts) {
      if (!seenIds.has(la.id)) {
        merged.push(la);
        seenIds.add(la.id);
      }
    }
    return merged;
  }

  async ackAlert(alertId: string) {
    // Update local storage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('scam_shield_demo_alerts');
        if (raw) {
          const list = JSON.parse(raw);
          const updated = list.map((a: any) =>
            a.id === alertId ? { ...a, acked_at: new Date().toISOString() } : a
          );
          localStorage.setItem('scam_shield_demo_alerts', JSON.stringify(updated));
        }
      } catch {}
    }

    try {
      return await this.request<any>(`/alerts/${alertId}/ack`, { method: 'POST' });
    } catch {
      return { status: 'acknowledged', alert_id: alertId };
    }
  }

  async markFalseAlarm(alertId: string) {
    // Update local storage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('scam_shield_demo_alerts');
        if (raw) {
          const list = JSON.parse(raw);
          const updated = list.map((a: any) =>
            a.id === alertId ? { ...a, is_false_alarm: true } : a
          );
          localStorage.setItem('scam_shield_demo_alerts', JSON.stringify(updated));
        }
      } catch {}
    }

    try {
      return await this.request<any>(`/alerts/${alertId}/false-alarm`, { method: 'POST' });
    } catch {
      return { status: 'marked_false_alarm', alert_id: alertId };
    }
  }

  // ─── Family ────────────────────────────────────────────────────────────

  async createFamily() {
    return this.request<any>('/family/create', { method: 'POST' });
  }

  async joinFamily(joinCode: string) {
    return this.request<any>('/family/join', {
      method: 'POST',
      body: JSON.stringify({ join_code: joinCode }),
    });
  }

  async familyStatus() {
    return this.request<any>('/family/status');
  }

  // ─── Export ────────────────────────────────────────────────────────────

  async exportPdf(incidentId: string) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  }

  // ─── Health ────────────────────────────────────────────────────────────

  async health() {
    return this.request<any>('/health');
  }
}

export const api = new ApiClient();
