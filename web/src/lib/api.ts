const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const TOKEN_KEY = "yogaface_dashboard_token";

/** GitHub Pages build only: no real backend exists there, so the UI runs on fixture data. */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export function getToken(): string | null {
  if (DEMO_MODE) return "demo";
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    clearToken();
    throw new ApiError(401, "Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface Stats {
  totalMembers: number;
  active: number;
  trial: number;
  cancelled: number;
  expired: number;
  inGroup: number;
  newLast30d: number;
  cancelledLast30d: number;
  estimatedMrr: number;
  syncErrors: number;
}

export interface Member {
  id: string;
  name: string | null;
  phone: string;
  subscriptionStatus: "ACTIVE" | "CANCELLED" | "EXPIRED" | "TRIAL" | "UNKNOWN";
  groupStatus: "IN_GROUP" | "NOT_IN_GROUP" | "ERROR";
  groupStatusError: string | null;
  lastPaymentAt: string | null;
  lastPaymentAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  member: { name: string | null; phone: string } | null;
}

export interface TimeseriesPoint {
  day: string;
  added: number;
  removed: number;
  groupSize: number;
}

export const api = {
  getStats: async () => {
    if (DEMO_MODE) return (await import("./demoData")).DEMO_STATS;
    return request<Stats>("/api/stats");
  },
  getTimeseries: async () => {
    if (DEMO_MODE) return (await import("./demoData")).DEMO_TIMESERIES;
    return request<TimeseriesPoint[]>("/api/stats/timeseries");
  },
  getMembers: async (search?: string) => {
    if (DEMO_MODE) {
      const { DEMO_MEMBERS } = await import("./demoData");
      if (!search) return DEMO_MEMBERS;
      const q = search.toLowerCase();
      return DEMO_MEMBERS.filter((m) => m.name?.toLowerCase().includes(q) || m.phone.includes(q));
    }
    return request<Member[]>(`/api/members${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  },
  syncMember: async (id: string) => {
    if (DEMO_MODE) {
      const { DEMO_MEMBERS } = await import("./demoData");
      return DEMO_MEMBERS.find((m) => m.id === id)!;
    }
    return request<Member>(`/api/members/${id}/sync`, { method: "POST" });
  },
  updateMember: async (id: string, data: { subscriptionStatus?: string; name?: string }) => {
    if (DEMO_MODE) {
      const { DEMO_MEMBERS } = await import("./demoData");
      const member = DEMO_MEMBERS.find((m) => m.id === id)!;
      return { ...member, ...data } as Member;
    }
    return request<Member>(`/api/members/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },
  importCsv: async (csv: string) => {
    if (DEMO_MODE) return { imported: csv.trim().split("\n").length, errors: [] };
    return request<{ imported: number; errors: string[] }>("/api/members/import-csv", {
      method: "POST",
      body: JSON.stringify({ csv }),
    });
  },
  getAuditLog: async () => {
    if (DEMO_MODE) return (await import("./demoData")).DEMO_AUDIT_LOG;
    return request<AuditEvent[]>("/api/audit-log");
  },
  askInsights: async (question: string) => {
    if (DEMO_MODE) {
      const { DEMO_INSIGHTS_ANSWER } = await import("./demoData");
      return { answer: `(${question})\n\n${DEMO_INSIGHTS_ANSWER}` };
    }
    return request<{ answer: string }>("/api/insights/ask", { method: "POST", body: JSON.stringify({ question }) });
  },
  getSettings: async () => {
    if (DEMO_MODE) return { whatsappGroupId: "demo-group@g.us", notifyEmail: "noa@example.com", notifyWhatsappPhone: null };
    return request<{ whatsappGroupId: string | null; notifyEmail: string | null; notifyWhatsappPhone: string | null }>(
      "/api/settings",
    );
  },
  updateSettings: async (data: { whatsappGroupId?: string; notifyEmail?: string; notifyWhatsappPhone?: string }) => {
    if (DEMO_MODE) return data;
    return request("/api/settings", { method: "PATCH", body: JSON.stringify(data) });
  },
};

export { ApiError };
