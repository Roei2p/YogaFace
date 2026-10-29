const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const TOKEN_KEY = "yogaface_student_token";

export const getStudentToken = () => localStorage.getItem(TOKEN_KEY);
export const setStudentToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearStudentToken = () => localStorage.removeItem(TOKEN_KEY);

export class StudentApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStudentToken();
  const res = await fetch(`${API_BASE}/student${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) clearStudentToken();
  if (!res.ok) throw new StudentApiError(res.status, body.error ?? "משהו השתבש, נסי שוב");
  return body as T;
}

export interface StudentProfile {
  name: string | null;
  phone: string;
  memberSince: string;
  subscriptionEnd: string | null;
  totalLessons: number;
  completedLessons: number;
  streakDays: number;
  lastPracticeAt: string | null;
}

export interface StudentLesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  durationMin: number | null;
  completed: boolean;
}

export interface StudentModule {
  id: string;
  title: string;
  description: string | null;
  lessons: StudentLesson[];
}

const post = (body: unknown) => ({ method: "POST", body: JSON.stringify(body) });

export const studentApi = {
  requestCode: (phone: string) => request<{ ok: true }>("/auth/request-code", post({ phone })),
  verify: (phone: string, code: string) => request<{ token: string }>("/auth/verify", post({ phone, code })),
  logout: () => request("/auth/logout", post({})),
  me: () => request<StudentProfile>("/me"),
  updateMe: (name: string) => request<StudentProfile>("/me", { method: "PATCH", body: JSON.stringify({ name }) }),
  course: () => request<StudentModule[]>("/course"),
  setProgress: (lessonId: string, completed: boolean) =>
    request(`/lessons/${lessonId}/progress`, { method: "PUT", body: JSON.stringify({ completed }) }),
};
