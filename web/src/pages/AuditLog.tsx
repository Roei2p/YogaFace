import { useEffect, useState } from "react";
import { api, type AuditEvent } from "../lib/api";
import { IconSync, IconCheck, IconAlert, IconSettingsGear, IconX } from "../components/icons";

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

const typeMeta: Record<string, { icon: typeof IconSync; tone: string }> = {
  added_to_group: { icon: IconCheck, tone: "bg-sage-100 text-sage-700" },
  removed_from_group: { icon: IconX, tone: "bg-rose-100 text-rose-700" },
  payment_success: { icon: IconCheck, tone: "bg-sage-100 text-sage-700" },
  payment_failed: { icon: IconAlert, tone: "bg-rose-100 text-rose-700" },
  subscription_cancelled: { icon: IconAlert, tone: "bg-amber-100 text-amber-700" },
  sync_error: { icon: IconAlert, tone: "bg-rose-100 text-rose-700" },
  drift_corrected: { icon: IconSync, tone: "bg-ink/5 text-ink/50" },
  manual_edit: { icon: IconSettingsGear, tone: "bg-ink/5 text-ink/50" },
};

export function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAuditLog().then(setEvents).catch((e) => setError(e.message));
  }, []);

  if (error)
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
        <IconAlert /> {error}
      </div>
    );

  return (
    <div className="rounded-2xl border border-ink/5 bg-white shadow-card">
      <ul className="divide-y divide-ink/5">
        {events.map((e) => {
          const meta = typeMeta[e.type] ?? { icon: IconSettingsGear, tone: "bg-ink/5 text-ink/50" };
          const Icon = meta.icon;
          return (
            <li key={e.id} className="flex items-start gap-3 p-4 text-sm transition hover:bg-brand-50/30">
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${meta.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-medium text-ink">{typeLabel[e.type] ?? e.type}</span>
                  <span className="whitespace-nowrap text-xs text-ink/35">
                    {new Date(e.createdAt).toLocaleString("he-IL")}
                  </span>
                </div>
                <p className="text-ink/55">{e.message}</p>
                {e.member && (
                  <p className="text-xs text-ink/35">
                    {e.member.name ?? "—"} · {e.member.phone}
                  </p>
                )}
              </div>
            </li>
          );
        })}
        {events.length === 0 && <li className="p-10 text-center text-ink/35">אין עדיין פעילות</li>}
      </ul>
    </div>
  );
}
