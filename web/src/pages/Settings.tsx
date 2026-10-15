import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { IconUserGroup, IconMail, IconPhoneWave, IconCheck, IconAlert } from "../components/icons";

const FIELDS = [
  { key: "whatsappGroupId", label: "מזהה קבוצת הוואטסאפ", placeholder: "123456789-123456789@g.us", icon: IconUserGroup },
  { key: "notifyEmail", label: "אימייל לסיכום יומי", placeholder: "noa@example.com", icon: IconMail },
  { key: "notifyWhatsappPhone", label: "מספר וואטסאפ לסיכום יומי", placeholder: "972501234567", icon: IconPhoneWave },
] as const;

export function Settings() {
  const [values, setValues] = useState({ whatsappGroupId: "", notifyEmail: "", notifyWhatsappPhone: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  async function save() {
    try {
      await api.updateSettings(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="max-w-lg space-y-5 rounded-2xl border border-ink/5 bg-white p-6 shadow-card">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          <IconAlert /> {error}
        </div>
      )}
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
      <div className="flex items-center gap-3 pt-1">
        <button
          className="rounded-xl bg-gradient-to-l from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:shadow-lg"
          onClick={save}
        >
          שמירה
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm font-medium text-sage-700">
            <IconCheck className="h-4 w-4" /> נשמר
          </span>
        )}
      </div>
    </div>
  );
}
