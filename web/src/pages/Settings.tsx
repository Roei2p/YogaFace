import { useEffect, useState } from "react";
import { api, type CardcomRawEvent, type WhatsappGroup } from "../lib/api";
import { IconUserGroup, IconMail, IconPhoneWave, IconAlert, IconSearch, IconSync } from "../components/icons";
import { useToast } from "../components/Toast";

const FIELDS = [
  { key: "notifyEmail", label: "אימייל לסיכום יומי", placeholder: "noa@example.com", icon: IconMail },
  { key: "notifyWhatsappPhone", label: "מספר וואטסאפ לסיכום יומי", placeholder: "972501234567", icon: IconPhoneWave },
] as const;

export function Settings() {
  const toast = useToast();
  const [values, setValues] = useState({ whatsappGroupId: "", notifyEmail: "", notifyWhatsappPhone: "" });
  const [error, setError] = useState<string | null>(null);
  const [cardcomLog, setCardcomLog] = useState<CardcomRawEvent[]>([]);
  const [groups, setGroups] = useState<WhatsappGroup[] | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSettings()
      .then((s) =>
        setValues({
          whatsappGroupId: s.whatsappGroupId ?? "",
          notifyEmail: s.notifyEmail ?? "",
          notifyWhatsappPhone: s.notifyWhatsappPhone ?? "",
        }),
      )
      .catch((e) => setError(e.message));
    api.getCardcomLog().then(setCardcomLog).catch(() => {});
  }, []);

  async function save() {
    try {
      await api.updateSettings(values);
      toast("ההגדרות נשמרו");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    }
  }

  async function findGroups() {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      setGroups(await api.listWhatsappGroups());
    } catch (e) {
      setGroupsError(e instanceof Error ? e.message : String(e));
    } finally {
      setGroupsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="max-w-lg space-y-5 rounded-2xl border border-ink/5 bg-white p-6 shadow-card">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
            <IconAlert /> {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink/70">
            <IconUserGroup className="h-4 w-4 text-brand-500" />
            מזהה קבוצת הוואטסאפ
          </label>
          <div className="flex gap-2">
            <input
              className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
              placeholder="123456789-123456789@g.us"
              value={values.whatsappGroupId}
              onChange={(e) => setValues((v) => ({ ...v, whatsappGroupId: e.target.value }))}
            />
            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-ink/10 px-3.5 text-xs font-medium text-ink/60 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-40"
              onClick={findGroups}
              disabled={groupsLoading}
            >
              <IconSync className={`h-3.5 w-3.5 ${groupsLoading ? "animate-spin" : ""}`} />
              מצאי את הקבוצה שלי
            </button>
          </div>
          {groupsError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
              <IconAlert className="h-3 w-3" /> {groupsError}
            </p>
          )}
          {groups && groups.length === 0 && !groupsError && (
            <p className="mt-1.5 text-xs text-ink/40">לא נמצאו קבוצות - ודאי שה-WhatsApp מחובר ל-Green API ומנהל/ת קבוצה כלשהי.</p>
          )}
          {groups && groups.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs text-brand-700 transition hover:bg-brand-100"
                  onClick={() => setValues((v) => ({ ...v, whatsappGroupId: g.id }))}
                >
                  {g.name ?? g.id}
                </button>
              ))}
            </div>
          )}
        </div>

        {FIELDS.map(({ key, label, placeholder, icon: Icon }) => (
          <div key={key}>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink/70">
              <Icon className="h-4 w-4 text-brand-500" />
              {label}
            </label>
            <input
              className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
              placeholder={placeholder}
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            />
          </div>
        ))}
        <button
          className="rounded-xl bg-gradient-to-l from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:shadow-lg"
          onClick={save}
        >
          שמירה
        </button>
      </div>

      <details className="group max-w-lg rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
        <summary className="flex cursor-pointer items-center gap-2 font-semibold text-ink marker:content-none">
          <IconSearch className="h-4 w-4 text-brand-600" />
          אבחון Cardcom webhook
          <span className="ms-auto text-xs font-normal text-ink/35">{cardcomLog.length} אירועים אחרונים</span>
        </summary>
        <p className="mt-3 text-xs leading-relaxed text-ink/50">
          כל webhook גולמי שמתקבל מ-Cardcom נשמר כאן - זה המקום לבדוק שהשדות בפועל תואמים למיפוי ב-
          <code className="rounded bg-ink/5 px-1 py-0.5">server/src/integrations/cardcom.ts</code>.
        </p>
        <div className="mt-3 space-y-3">
          {cardcomLog.length === 0 && <p className="text-sm text-ink/35">עדיין לא התקבל אף webhook.</p>}
          {cardcomLog.map((e) => (
            <div key={e.id} className="rounded-xl border border-ink/5 bg-paper/60 p-3">
              <p className="mb-1.5 text-xs text-ink/40">{new Date(e.createdAt).toLocaleString("he-IL")}</p>
              <pre
                dir="ltr"
                className="overflow-x-auto whitespace-pre-wrap break-all text-left font-mono text-xs leading-relaxed text-ink/70"
              >
                {JSON.stringify(e.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
