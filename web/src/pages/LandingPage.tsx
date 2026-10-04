import { useState } from "react";
import { setToken } from "../lib/api";
import { Logomark, IconSync, IconSparkle, IconChart, IconBell, IconLock, IconArrowLeft } from "../components/icons";

const FEATURES = [
  {
    icon: IconSync,
    title: "סנכרון אוטומטי",
    body: "מי ששילמה - מצטרפת לקבוצה. מי שביטלה - יוצאת. בלי שתרימי אצבע.",
  },
  {
    icon: IconSparkle,
    title: "תובנות AI",
    body: 'שאלי בשפה חופשית - "מי ביטלה השבוע?", "כמה הכנסה יש לי החודש?"',
  },
  {
    icon: IconChart,
    title: "דשבורד חי",
    body: "כל המספרים שלך במבט אחד: חברות פעילות, הכנסה, קצב גדילה.",
  },
  {
    icon: IconBell,
    title: "התראות יזומות",
    body: "סיכום יומי שמגיע לבד - למייל או ישירות לוואטסאפ שלך.",
  },
];

export function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setToken(value.trim());
    onLogin();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      {/* decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[32rem] w-[32rem] animate-drift rounded-full bg-gradient-to-br from-brand-200 via-brand-300 to-brand-400 opacity-40 blur-3xl" />
        <div className="absolute -bottom-48 -left-24 h-[28rem] w-[28rem] animate-drift-slow rounded-full bg-gradient-to-tr from-sage-200 via-sage-300 to-sage-400 opacity-40 blur-3xl" />
        <div className="absolute inset-0 bg-grain" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center gap-3">
          <Logomark />
          <div>
            <p className="font-serif text-lg leading-none text-ink">יוגה פנים</p>
            <p className="text-xs tracking-wide text-ink/50">חדר פיקוד</p>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-16 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:py-16">
          <div className="animate-fade-up">
            <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              פלטפורמת ניהול לעסקי יוגה פנים
            </span>
            <h1 className="mt-5 font-serif text-4xl leading-[1.15] text-ink sm:text-5xl lg:text-[3.4rem]">
              הקבוצה שלך בוואטסאפ,
              <br />
              <span className="text-brand-600">מנוהלת לבד.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-ink/70">
              מערכת שעוקבת אחרי הסליקה שלך, מוסיפה ומסירה חברות מקבוצת הוואטסאפ בזמן אמת, ונותנת לך חדר
              פיקוד אחד עם תובנות, גרפים וצ'אט חכם שעונה על כל שאלה על העסק שלך.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-card">
                    <Icon />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 text-sm leading-snug text-ink/60">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`glass animate-fade-up rounded-3xl border border-white/60 p-8 shadow-glow [animation-delay:150ms] ${
              shake ? "animate-shake" : ""
            }`}
          >
            <div className="mb-6 flex items-center gap-2 text-brand-700">
              <IconLock />
              <span className="text-sm font-semibold">כניסה לחדר הפיקוד</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink/70">מפתח גישה</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-ink/10 bg-white/90 px-4 py-3 text-sm text-ink placeholder:text-ink/30 transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
                  placeholder="DASHBOARD_API_TOKEN"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-brand-600 to-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:shadow-lg active:scale-[0.99]">
                כניסה
                <IconArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
              </button>
            </form>
            <p className="mt-5 text-xs leading-relaxed text-ink/40">
              המערכת מאובטחת באמצעות טוקן אישי שהוגדר מראש על ידך בשרת (משתנה הסביבה{" "}
              <code className="rounded bg-ink/5 px-1 py-0.5">DASHBOARD_API_TOKEN</code>).
            </p>
          </div>
        </main>

        <footer className="pb-4 text-center text-xs text-ink/35">חדר פיקוד · יוגה פנים</footer>
      </div>
    </div>
  );
}
