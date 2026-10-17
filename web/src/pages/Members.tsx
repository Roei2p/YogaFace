import { useEffect, useState } from "react";
import { api, type Member } from "../lib/api";
import { IconSearch, IconSync, IconAlert, IconUpload } from "../components/icons";
import { Skeleton } from "../components/Skeleton";
import { useToast } from "../components/Toast";

const statusLabel: Record<Member["subscriptionStatus"], string> = {
  ACTIVE: "פעיל",
  CANCELLED: "בוטל",
  EXPIRED: "פג תוקף",
  TRIAL: "ניסיון",
  UNKNOWN: "לא ידוע",
};

const groupLabel: Record<Member["groupStatus"], string> = {
  IN_GROUP: "בקבוצה",
  NOT_IN_GROUP: "לא בקבוצה",
  ERROR: "שגיאה",
};

function statusColor(status: Member["subscriptionStatus"]) {
  if (status === "ACTIVE" || status === "TRIAL") return "bg-sage-100 text-sage-800";
  if (status === "CANCELLED" || status === "EXPIRED") return "bg-rose-100 text-rose-700";
  return "bg-ink/5 text-ink/60";
}

function groupColor(status: Member["groupStatus"]) {
  if (status === "IN_GROUP") return "bg-sage-100 text-sage-800";
  if (status === "ERROR") return "bg-amber-100 text-amber-800";
  return "bg-ink/5 text-ink/60";
}

function initials(name: string | null, phone: string) {
  if (name && name.trim()) return name.trim().slice(0, 1);
  return phone.slice(-2);
}

export function Members() {
  const toast = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [csv, setCsv] = useState("");

  function load() {
    api
      .getMembers(search || undefined)
      .then(setMembers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [search]);

  async function handleSync(id: string) {
    setBusyId(id);
    try {
      await api.syncMember(id);
      load();
      toast("הסנכרון הושלם");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleStatusChange(id: string, subscriptionStatus: string) {
    setBusyId(id);
    try {
      await api.updateMember(id, { subscriptionStatus });
      load();
      toast("הסטטוס עודכן");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleImport() {
    try {
      const res = await api.importCsv(csv);
      toast(`יובאו ${res.imported} חברות${res.errors.length ? `, ${res.errors.length} שגיאות` : ""}`);
      setCsv("");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          <IconAlert /> {error}
        </div>
      )}

      <div className="relative w-72">
        <IconSearch className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
        <input
          className="w-full rounded-xl border border-ink/10 bg-white py-2.5 pe-10 ps-3 text-sm text-ink placeholder:text-ink/30 transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
          placeholder="חיפוש לפי שם או טלפון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink/5 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/5 text-xs uppercase tracking-wide text-ink/40">
              <th className="p-4 text-right font-medium">שם</th>
              <th className="p-4 text-right font-medium">טלפון</th>
              <th className="p-4 text-right font-medium">סטטוס מנוי</th>
              <th className="p-4 text-right font-medium">סטטוס בקבוצה</th>
              <th className="p-4 text-right font-medium">תשלום אחרון</th>
              <th className="p-4 text-right font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t border-ink/5">
                  <td className="p-4" colSpan={6}>
                    <Skeleton className="h-6" />
                  </td>
                </tr>
              ))}
            {!loading &&
              members.map((m) => (
              <tr key={m.id} className="border-t border-ink/5 transition hover:bg-brand-50/40">
                <td className="p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 font-serif text-sm text-brand-700">
                      {initials(m.name, m.phone)}
                    </div>
                    <span className="font-medium text-ink">{m.name ?? "—"}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-ink/60">{m.phone}</td>
                <td className="p-4">
                  <select
                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-200 ${statusColor(m.subscriptionStatus)}`}
                    value={m.subscriptionStatus}
                    disabled={busyId === m.id}
                    onChange={(e) => handleStatusChange(m.id, e.target.value)}
                  >
                    {Object.entries(statusLabel).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${groupColor(m.groupStatus)}`}>
                    {groupLabel[m.groupStatus]}
                  </span>
                  {m.groupStatusError && (
                    <div
                      className="mt-1 flex max-w-[220px] items-center gap-1 truncate text-xs text-amber-700"
                      title={m.groupStatusError}
                    >
                      <IconAlert className="h-3 w-3 shrink-0" />
                      {m.groupStatusError}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className="font-serif text-ink">{m.lastPaymentAmount ? `₪${m.lastPaymentAmount}` : "—"}</span>
                  {m.lastPaymentAt && (
                    <div className="text-xs text-ink/40">{new Date(m.lastPaymentAt).toLocaleDateString("he-IL")}</div>
                  )}
                </td>
                <td className="p-4">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-40"
                    disabled={busyId === m.id}
                    onClick={() => handleSync(m.id)}
                  >
                    <IconSync className={`h-3.5 w-3.5 ${busyId === m.id ? "animate-spin" : ""}`} />
                    סנכרון
                  </button>
                </td>
              </tr>
            ))}
            {!loading && members.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-ink/35">
                  אין חברות עדיין
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <details className="group rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
        <summary className="flex cursor-pointer items-center gap-2 font-semibold text-ink marker:content-none">
          <IconUpload className="h-4 w-4 text-brand-600" />
          ייבוא רשימה ידני (CSV)
        </summary>
        <p className="mt-3 text-xs leading-relaxed text-ink/50">
          פורמט: phone,name,status (status אחד מ-ACTIVE / CANCELLED / EXPIRED / TRIAL). שורה ראשונה יכולה להיות כותרת.
        </p>
        <textarea
          className="mt-3 h-28 w-full rounded-xl border border-ink/10 bg-paper/50 p-3 font-mono text-xs focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
          placeholder={"phone,name,status\n972501234567,דנה כהן,ACTIVE"}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        <button
          className="mt-3 rounded-xl bg-gradient-to-l from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:shadow-lg disabled:opacity-40 disabled:shadow-none"
          disabled={!csv.trim()}
          onClick={handleImport}
        >
          ייבוא
        </button>
      </details>
    </div>
  );
}
