import { useEffect, useState } from "react";
import { api, type Member } from "../lib/api";

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
  if (status === "ACTIVE" || status === "TRIAL") return "bg-emerald-100 text-emerald-800";
  if (status === "CANCELLED" || status === "EXPIRED") return "bg-red-100 text-red-800";
  return "bg-stone-100 text-stone-700";
}

function groupColor(status: Member["groupStatus"]) {
  if (status === "IN_GROUP") return "bg-emerald-100 text-emerald-800";
  if (status === "ERROR") return "bg-red-100 text-red-800";
  return "bg-stone-100 text-stone-700";
}

export function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [csv, setCsv] = useState("");
  const [importResult, setImportResult] = useState<string | null>(null);

  function load() {
    api
      .getMembers(search || undefined)
      .then(setMembers)
      .catch((e) => setError(e.message));
  }

  useEffect(load, [search]);

  async function handleSync(id: string) {
    setBusyId(id);
    try {
      await api.syncMember(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  async function handleStatusChange(id: string, subscriptionStatus: string) {
    setBusyId(id);
    try {
      await api.updateMember(id, { subscriptionStatus });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  async function handleImport() {
    try {
      const res = await api.importCsv(csv);
      setImportResult(`יובאו ${res.imported} חברות${res.errors.length ? `, ${res.errors.length} שגיאות` : ""}`);
      setCsv("");
      load();
    } catch (e) {
      setImportResult(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600">שגיאה: {error}</div>}

      <div className="flex items-center gap-3">
        <input
          className="w-64 rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="חיפוש לפי שם או טלפון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="p-3 text-right">שם</th>
              <th className="p-3 text-right">טלפון</th>
              <th className="p-3 text-right">סטטוס מנוי</th>
              <th className="p-3 text-right">סטטוס בקבוצה</th>
              <th className="p-3 text-right">תשלום אחרון</th>
              <th className="p-3 text-right">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-stone-100">
                <td className="p-3">{m.name ?? "—"}</td>
                <td className="p-3 font-mono">{m.phone}</td>
                <td className="p-3">
                  <select
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor(m.subscriptionStatus)}`}
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
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${groupColor(m.groupStatus)}`}>
                    {groupLabel[m.groupStatus]}
                  </span>
                  {m.groupStatusError && (
                    <div className="mt-1 max-w-[200px] truncate text-xs text-red-500" title={m.groupStatusError}>
                      {m.groupStatusError}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {m.lastPaymentAmount ? `₪${m.lastPaymentAmount}` : "—"}
                  {m.lastPaymentAt && (
                    <div className="text-xs text-stone-400">{new Date(m.lastPaymentAt).toLocaleDateString("he-IL")}</div>
                  )}
                </td>
                <td className="p-3">
                  <button
                    className="rounded-lg border border-stone-300 px-2 py-1 text-xs hover:bg-stone-50 disabled:opacity-50"
                    disabled={busyId === m.id}
                    onClick={() => handleSync(m.id)}
                  >
                    סנכרון מחדש
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-stone-400">
                  אין חברות עדיין
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <details className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <summary className="cursor-pointer font-semibold text-stone-700">ייבוא רשימה ידני (CSV)</summary>
        <p className="mt-2 text-xs text-stone-500">
          פורמט: phone,name,status (status אחד מ-ACTIVE / CANCELLED / EXPIRED / TRIAL). שורה ראשונה יכולה להיות כותרת.
        </p>
        <textarea
          className="mt-2 h-28 w-full rounded-lg border border-stone-300 p-2 font-mono text-xs"
          placeholder={"phone,name,status\n972501234567,דנה כהן,ACTIVE"}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        <button
          className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
          disabled={!csv.trim()}
          onClick={handleImport}
        >
          ייבוא
        </button>
        {importResult && <p className="mt-2 text-sm text-stone-600">{importResult}</p>}
      </details>
    </div>
  );
}
