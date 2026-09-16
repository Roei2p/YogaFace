import { useEffect, useState } from "react";
import { api, type AuditEvent } from "../lib/api";

const typeLabel: Record<string, string> = {
  added_to_group: "נוספה לקבוצה",
  removed_from_group: "הוסרה מהקבוצה",
  payment_success: "תשלום התקבל",
  payment_failed: "תשלום נכשל",
  subscription_cancelled: "מנוי בוטל",
  sync_error: "שגיאת סנכרון",
  drift_corrected: "תוקן פער מול הקבוצה",
  manual_edit: "עריכה ידנית",
};

export function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAuditLog().then(setEvents).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="text-red-600">שגיאה: {error}</div>;

  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
      <ul className="divide-y divide-stone-100">
        {events.map((e) => (
          <li key={e.id} className="flex items-start justify-between p-3 text-sm">
            <div>
              <span className="font-medium text-stone-700">{typeLabel[e.type] ?? e.type}</span>
              <p className="text-stone-500">{e.message}</p>
              {e.member && (
                <p className="text-xs text-stone-400">
                  {e.member.name ?? "—"} · {e.member.phone}
                </p>
              )}
            </div>
            <span className="whitespace-nowrap text-xs text-stone-400">
              {new Date(e.createdAt).toLocaleString("he-IL")}
            </span>
          </li>
        ))}
        {events.length === 0 && <li className="p-6 text-center text-stone-400">אין עדיין פעילות</li>}
      </ul>
    </div>
  );
}
