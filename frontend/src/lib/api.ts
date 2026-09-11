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
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  }

  async demoSetup() {
    return this.request<any>('/auth/demo-setup', { method: 'POST' });
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
    return this.request<any>('/alerts/emergency', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async pollAlerts(unackedOnly: boolean = true) {
    return this.request<any>(`/alerts/poll?unacked_only=${unackedOnly}`);
  }

  async ackAlert(alertId: string) {
    return this.request<any>(`/alerts/${alertId}/ack`, { method: 'POST' });
  }

  async markFalseAlarm(alertId: string) {
    return this.request<any>(`/alerts/${alertId}/false-alarm`, { method: 'POST' });
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
