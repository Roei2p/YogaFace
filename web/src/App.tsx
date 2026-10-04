import { useState } from "react";
import { getToken, clearToken, DEMO_MODE } from "./lib/api";
import { LandingPage } from "./pages/LandingPage";
import { Logomark } from "./components/icons";
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

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [tab, setTab] = useState<Tab>("dashboard");

  if (!authed) return <LandingPage onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-paper">
      {DEMO_MODE && (
        <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-medium text-white">
          מצב הדגמה - נתונים לדוגמה בלבד, לא מחובר לוואטסאפ/סליקה אמיתיים
        </div>
      )}
      <header className="sticky top-0 z-10 border-b border-ink/5 bg-white/80 px-6 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logomark className="h-8 w-8" />
            <div className="leading-tight">
              <p className="font-serif text-base text-ink">יוגה פנים</p>
              <p className="text-[0.65rem] tracking-wide text-ink/40">חדר פיקוד</p>
            </div>
          </div>
          <button
            className="text-xs text-ink/40 transition hover:text-ink/70"
            onClick={() => {
              clearToken();
              setAuthed(false);
            }}
          >
            התנתקות
          </button>
        </div>
        <nav className="mx-auto mt-3 flex max-w-5xl gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-brand-600 text-white shadow-glow"
                  : "text-ink/55 hover:bg-brand-50 hover:text-brand-700"
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
