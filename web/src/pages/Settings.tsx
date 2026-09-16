import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function Settings() {
  const [whatsappGroupId, setWhatsappGroupId] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyWhatsappPhone, setNotifyWhatsappPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => {
        setWhatsappGroupId(s.whatsappGroupId ?? "");
        setNotifyEmail(s.notifyEmail ?? "");
        setNotifyWhatsappPhone(s.notifyWhatsappPhone ?? "");
      })
      .catch((e) => setError(e.message));
  }, []);

  async function save() {
    try {
      await api.updateSettings({ whatsappGroupId, notifyEmail, notifyWhatsappPhone });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="max-w-lg space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      {error && <div className="text-red-600">שגיאה: {error}</div>}
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">מזהה קבוצת הוואטסאפ</label>
        <input
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="123456789-123456789@g.us"
          value={whatsappGroupId}
          onChange={(e) => setWhatsappGroupId(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">אימייל לסיכום יומי</label>
        <input
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="noa@example.com"
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">מספר וואטסאפ לסיכום יומי</label>
        <input
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="972501234567"
          value={notifyWhatsappPhone}
          onChange={(e) => setNotifyWhatsappPhone(e.target.value)}
        />
      </div>
      <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700" onClick={save}>
        שמירה
      </button>
      {saved && <span className="ms-3 text-sm text-emerald-600">נשמר ✓</span>}
    </div>
  );
}
