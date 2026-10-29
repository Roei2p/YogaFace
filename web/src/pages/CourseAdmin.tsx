import { useCallback, useEffect, useState } from "react";
import { courseAdminApi, type AdminLesson, type AdminModule, type LessonInput } from "../lib/api";
import { toEmbedUrl } from "../lib/video";
import { useToast } from "../components/Toast";
import { IconAlert } from "../components/icons";

const EMPTY: LessonInput = { title: "", description: "", videoUrl: "", durationMin: null, published: true };
const input = "w-full rounded-xl border border-ink/10 px-3 py-2 text-sm outline-none focus:border-brand-400";

export function CourseAdmin() {
  const toast = useToast();
  const [modules, setModules] = useState<AdminModule[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newModule, setNewModule] = useState("");
  // moduleId -> open "add lesson" form, or lessonId being edited
  const [editing, setEditing] = useState<{ moduleId: string; lesson?: AdminLesson } | null>(null);

  const load = useCallback(() => {
    courseAdminApi.list().then(setModules).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      await action();
      toast(done);
      load();
      return true;
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
      return false;
    }
  }

  async function move(list: { id: string }[], index: number, dir: -1 | 1, update: (id: string, order: number) => Promise<unknown>) {
    const other = index + dir;
    if (other < 0 || other >= list.length) return;
    await run(
      () => Promise.all([update(list[index].id, other), update(list[other].id, index)]),
      "הסדר עודכן",
    );
  }

  if (error)
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
        <IconAlert /> {error}
      </div>
    );
  if (!modules) return <p className="text-sm text-ink/40">טוען...</p>;

  const studentUrl = `${window.location.origin}${import.meta.env.BASE_URL}course`;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
        <h1 className="font-serif text-xl text-ink">ניהול הקורס</h1>
        <p className="mt-1 text-sm text-ink/55">
          מוסיפים פרקים, ובתוכם שיעורים עם קישור לסרטון ב-YouTube או ב-Vimeo (אפשר קישור לא רשום). רק מנויות פעילות
          יכולות להיכנס, עם קוד שנשלח אליהן בוואטסאפ.
        </p>
        <p className="mt-2 text-sm">
          קישור לקורס בשביל המתרגלות:{" "}
          <a href={studentUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline" dir="ltr">
            {studentUrl}
          </a>
        </p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await run(() => courseAdminApi.createModule(newModule, ""), "הפרק נוסף")) setNewModule("");
          }}
        >
          <input className={input} placeholder="שם פרק חדש, למשל: שבוע 1 - עיניים" value={newModule} onChange={(e) => setNewModule(e.target.value)} required />
          <button className="shrink-0 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">הוספת פרק</button>
        </form>
      </div>

      {modules.length === 0 && <p className="text-center text-sm text-ink/40">עדיין אין פרקים. התחילי בהוספת פרק ראשון.</p>}

      {modules.map((m, mi) => (
        <div key={m.id} className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-ink">{mi + 1}. {m.title}</h2>
            <div className="flex gap-1 text-xs">
              <SmallBtn onClick={() => move(modules, mi, -1, (id, order) => courseAdminApi.updateModule(id, { order }))}>↑</SmallBtn>
              <SmallBtn onClick={() => move(modules, mi, 1, (id, order) => courseAdminApi.updateModule(id, { order }))}>↓</SmallBtn>
              <SmallBtn
                onClick={() => {
                  const title = prompt("שם הפרק", m.title);
                  if (title) run(() => courseAdminApi.updateModule(m.id, { title }), "הפרק עודכן");
                }}
              >
                שינוי שם
              </SmallBtn>
              <SmallBtn
                danger
                onClick={() => {
                  if (confirm(`למחוק את הפרק "${m.title}" ואת כל השיעורים שבו?`)) run(() => courseAdminApi.deleteModule(m.id), "הפרק נמחק");
                }}
              >
                מחיקה
              </SmallBtn>
            </div>
          </div>

          <ul className="mt-3 divide-y divide-ink/5">
            {m.lessons.map((l, li) =>
              editing?.lesson?.id === l.id ? (
                <li key={l.id} className="py-3">
                  <LessonForm
                    initial={l}
                    onCancel={() => setEditing(null)}
                    onSave={async (data) => {
                      if (await run(() => courseAdminApi.updateLesson(l.id, data), "השיעור עודכן")) setEditing(null);
                    }}
                  />
                </li>
              ) : (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {l.title} {!l.published && <span className="mr-1 rounded bg-ink/5 px-1.5 text-xs text-ink/50">טיוטה</span>}
                    </p>
                    <p className="text-xs text-ink/40">
                      {l._count.progress} תרגלו{l.durationMin ? ` · ${l.durationMin} דק׳` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1 text-xs">
                    <SmallBtn onClick={() => move(m.lessons, li, -1, (id, order) => courseAdminApi.updateLesson(id, { order }))}>↑</SmallBtn>
                    <SmallBtn onClick={() => move(m.lessons, li, 1, (id, order) => courseAdminApi.updateLesson(id, { order }))}>↓</SmallBtn>
                    <SmallBtn onClick={() => setEditing({ moduleId: m.id, lesson: l })}>עריכה</SmallBtn>
                    <SmallBtn
                      danger
                      onClick={() => {
                        if (confirm(`למחוק את השיעור "${l.title}"?`)) run(() => courseAdminApi.deleteLesson(l.id), "השיעור נמחק");
                      }}
                    >
                      מחיקה
                    </SmallBtn>
                  </div>
                </li>
              ),
            )}
          </ul>

          {editing?.moduleId === m.id && !editing.lesson ? (
            <div className="mt-3">
              <LessonForm
                initial={EMPTY}
                onCancel={() => setEditing(null)}
                onSave={async (data) => {
                  if (await run(() => courseAdminApi.createLesson({ ...data, moduleId: m.id }), "השיעור נוסף")) setEditing(null);
                }}
              />
            </div>
          ) : (
            <button onClick={() => setEditing({ moduleId: m.id })} className="mt-3 text-sm font-medium text-brand-600 hover:underline">
              + הוספת שיעור
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function LessonForm({ initial, onSave, onCancel }: { initial: LessonInput | AdminLesson; onSave: (d: LessonInput) => void; onCancel: () => void }) {
  const [d, setD] = useState<LessonInput>({
    title: initial.title,
    description: initial.description ?? "",
    videoUrl: initial.videoUrl,
    durationMin: initial.durationMin,
    published: initial.published,
  });
  const embed = d.videoUrl ? toEmbedUrl(d.videoUrl) : null;
  return (
    <form
      className="space-y-3 rounded-xl bg-paper p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(d);
      }}
    >
      <input className={input} placeholder="כותרת השיעור" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} required />
      <input
        className={input}
        dir="ltr"
        placeholder="https://vimeo.com/... או https://youtu.be/..."
        value={d.videoUrl}
        onChange={(e) => setD({ ...d, videoUrl: e.target.value })}
        required
      />
      {d.videoUrl && !embed && <p className="text-xs text-rose-600">הקישור לא מזוהה כסרטון YouTube או Vimeo</p>}
      {embed && (
        <div className="aspect-video max-w-sm overflow-hidden rounded-lg bg-ink">
          <iframe src={embed} title="preview" className="h-full w-full" allowFullScreen />
        </div>
      )}
      <textarea
        className={input}
        rows={3}
        placeholder="הסבר / דגשים לתרגול (לא חובה)"
        value={d.description}
        onChange={(e) => setD({ ...d, description: e.target.value })}
      />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          משך (דקות)
          <input
            type="number"
            min={1}
            className={`${input} w-20`}
            value={d.durationMin ?? ""}
            onChange={(e) => setD({ ...d, durationMin: e.target.value ? Number(e.target.value) : null })}
          />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={d.published} onChange={(e) => setD({ ...d, published: e.target.checked })} />
          גלוי למתרגלות
        </label>
      </div>
      <div className="flex gap-2">
        <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">שמירה</button>
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 text-sm text-ink/60 hover:bg-ink/5">ביטול</button>
      </div>
    </form>
  );
}

function SmallBtn({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2 py-1 transition ${danger ? "text-rose-600 hover:bg-rose-50" : "text-ink/55 hover:bg-ink/5"}`}
    >
      {children}
    </button>
  );
}
