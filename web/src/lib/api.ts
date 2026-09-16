const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const TOKEN_KEY = "yogaface_dashboard_token";

export function getToken(): string | null {
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
  getStats: () => request<Stats>("/api/stats"),
  getTimeseries: () => request<TimeseriesPoint[]>("/api/stats/timeseries"),
  getMembers: (search?: string) =>
    request<Member[]>(`/api/members${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  syncMember: (id: string) => request<Member>(`/api/members/${id}/sync`, { method: "POST" }),
  updateMember: (id: string, data: { subscriptionStatus?: string; name?: string }) =>
    request<Member>(`/api/members/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  importCsv: (csv: string) =>
    request<{ imported: number; errors: string[] }>("/api/members/import-csv", {
      method: "POST",
      body: JSON.stringify({ csv }),
    }),
  getAuditLog: () => request<AuditEvent[]>("/api/audit-log"),
  askInsights: (question: string) =>
    request<{ answer: string }>("/api/insights/ask", { method: "POST", body: JSON.stringify({ question }) }),
  getSettings: () =>
    request<{ whatsappGroupId: string | null; notifyEmail: string | null; notifyWhatsappPhone: string | null }>(
      "/api/settings",
    ),
  updateSettings: (data: { whatsappGroupId?: string; notifyEmail?: string; notifyWhatsappPhone?: string }) =>
    request("/api/settings", { method: "PATCH", body: JSON.stringify(data) }),
};

export { ApiError };
