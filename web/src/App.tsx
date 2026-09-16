import { useState } from "react";
import { getToken, setToken, clearToken, DEMO_MODE } from "./lib/api";
import { Dashboard } from "./pages/Dashboard";
import { Members } from "./pages/Members";
import { AuditLog } from "./pages/AuditLog";
import { Chat } from "./pages/Chat";
import { Settings } from "./pages/Settings";

type Tab = "dashboard" | "members" | "audit" | "chat" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "דשבורד" },
  { id: "members", label: "חברות" },
  { id: "chat", label: "שאלות ותובנות" },
  { id: "audit", label: "יומן פעילות" },
  { id: "settings", label: "הגדרות" },
];

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <form
        className="w-full max-w-sm space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (!value.trim()) return;
          setToken(value.trim());
          onLogin();
        }}
      >
        <h1 className="text-lg font-bold text-stone-800">חדר פיקוד - יוגה פנים</h1>
        <p className="text-sm text-stone-500">הזיני את מפתח הגישה (DASHBOARD_API_TOKEN מהשרת)</p>
        <input
          type="password"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
          כניסה
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [tab, setTab] = useState<Tab>("dashboard");

  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-stone-50">
      {DEMO_MODE && (
        <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-medium text-white">
          מצב הדגמה - נתונים לדוגמה בלבד, לא מחובר לוואטסאפ/סליקה אמיתיים
        </div>
      )}
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-lg font-bold text-stone-800">חדר פיקוד - יוגה פנים</h1>
          <button
            className="text-xs text-stone-400 hover:text-stone-600"
            onClick={() => {
              clearToken();
              setAuthed(false);
            }}
          >
            התנתקות
          </button>
        </div>
        <nav className="mx-auto mt-3 flex max-w-5xl gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                tab === t.id ? "bg-brand-600 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        {tab === "dashboard" && <Dashboard />}
        {tab === "members" && <Members />}
        {tab === "chat" && <Chat />}
        {tab === "audit" && <AuditLog />}
        {tab === "settings" && <Settings />}
      </main>
    </div>
  );
}
