import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearStudentToken,
  getStudentToken,
  studentApi,
  StudentApiError,
  type StudentModule,
  type StudentProfile,
} from "../lib/studentApi";
import { CourseLogin } from "./CourseLogin";
import { CourseLogo } from "./CourseLogo";
import { LessonPlayer } from "./LessonPlayer";
import { ProfileCard } from "./ProfileCard";
import { Curriculum } from "./Curriculum";

type View = { kind: "home" } | { kind: "lesson"; id: string } | { kind: "profile" };

export function CourseApp() {
  const [authed, setAuthed] = useState(!!getStudentToken());
  if (!authed) return <CourseLogin onLogin={() => setAuthed(true)} />;
  return <CourseArea onLogout={() => setAuthed(false)} />;
}

function CourseArea({ onLogout }: { onLogout: () => void }) {
  const [modules, setModules] = useState<StudentModule[] | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ kind: "home" });

  const load = useCallback(() => {
    Promise.all([studentApi.course(), studentApi.me()])
      .then(([m, p]) => {
        setModules(m);
        setProfile(p);
      })
      .catch((e: StudentApiError) => {
        if (e.status === 401) onLogout();
        else setError(e.message);
      });
  }, [onLogout]);

  useEffect(load, [load]);

  const lessons = useMemo(() => modules?.flatMap((m) => m.lessons) ?? [], [modules]);
  const nextUp = lessons.find((l) => !l.completed) ?? lessons[0] ?? null;

  async function logout() {
    await studentApi.logout().catch(() => {});
    clearStudentToken();
    onLogout();
  }

  async function toggle(id: string, completed: boolean) {
    await studentApi.setProgress(id, completed);
    load();
  }

  const open = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-fy-ink">
      <header className="sticky top-0 z-10 border-b border-fy-blue/10 bg-gradient-to-b from-fy-soft to-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <button onClick={() => open({ kind: "home" })}>
            <CourseLogo small />
          </button>
          <nav className="flex gap-1 text-sm">
            <NavBtn active={view.kind !== "profile"} onClick={() => open({ kind: "home" })}>הקורס</NavBtn>
            <NavBtn active={view.kind === "profile"} onClick={() => open({ kind: "profile" })}>הפרופיל שלי</NavBtn>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {error && <div className="rounded-2xl bg-rose-50 p-4 text-center text-rose-700">{error}</div>}
        {!error && (!modules || !profile) && <p className="py-20 text-center text-fy-ink/40">טוען...</p>}

        {modules && profile && view.kind === "profile" && (
          <ProfileCard
            profile={profile}
            onSaveName={async (name) => setProfile(await studentApi.updateMe(name))}
            onLogout={logout}
          />
        )}

        {modules && profile && view.kind === "home" && (
          <div className="space-y-10">
            <section className="rounded-3xl bg-gradient-to-l from-fy-soft to-white p-8">
              <p className="text-fy-blue">שלום{profile.name ? ` ${profile.name}` : ""},</p>
              <h1 className="mt-1 text-3xl font-light text-fy-navy md:text-4xl">מוכנה לתרגול של היום?</h1>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-fy-blue transition-all"
                  style={{ width: `${profile.totalLessons ? (profile.completedLessons / profile.totalLessons) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-fy-ink/60">
                תרגלת {profile.completedLessons} מתוך {profile.totalLessons} שיעורים
                {profile.streakDays > 0 && ` · ${profile.streakDays} ימים ברצף`}
              </p>
              {nextUp && (
                <button
                  onClick={() => open({ kind: "lesson", id: nextUp.id })}
                  className="mt-6 rounded-full bg-fy-blue px-6 py-3 font-medium text-white transition hover:bg-fy-deep"
                >
                  {profile.completedLessons ? "להמשיך מאיפה שעצרתי" : "להתחיל את הקורס"}: {nextUp.title}
                </button>
              )}
            </section>

            {modules.length === 0 ? (
              <p className="py-10 text-center text-fy-ink/50">נועה מכינה עכשיו את סרטוני התרגול. הם יופיעו כאן ממש בקרוב 💙</p>
            ) : (
              <Curriculum modules={modules} onOpen={(id) => open({ kind: "lesson", id })} />
            )}
          </div>
        )}

        {modules && view.kind === "lesson" && (() => {
          const idx = lessons.findIndex((l) => l.id === view.id);
          const lesson = lessons[idx];
          if (!lesson) return null;
          return (
            <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
              <LessonPlayer
                lesson={lesson}
                next={lessons[idx + 1] ?? null}
                onToggleComplete={(c) => toggle(lesson.id, c)}
                onNext={() => open({ kind: "lesson", id: lessons[idx + 1].id })}
              />
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <Curriculum modules={modules} activeId={lesson.id} compact onOpen={(id) => open({ kind: "lesson", id })} />
              </aside>
            </div>
          );
        })()}
      </main>
    </div>
  );
}

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 transition ${active ? "bg-fy-blue text-white" : "text-fy-navy hover:bg-fy-soft"}`}
    >
      {children}
    </button>
  );
}
