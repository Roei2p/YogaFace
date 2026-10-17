import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { api, type Stats, type TimeseriesPoint } from "../lib/api";
import { StatCard } from "../components/StatCard";
import { Skeleton } from "../components/Skeleton";
import { IconAlert } from "../components/icons";

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [series, setSeries] = useState<TimeseriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getStats(), api.getTimeseries()])
      .then(([s, t]) => {
        setStats(s);
        setSeries(t);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error)
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
        <IconAlert /> {error}
      </div>
    );

  if (!stats)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem]" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="חברות פעילות" value={stats.active} tone="good" />
        <StatCard label="בקבוצת הוואטסאפ" value={stats.inGroup} />
        <StatCard label="הכנסה חודשית משוערת" value={`₪${stats.estimatedMrr.toLocaleString("he-IL")}`} />
        <StatCard label="הצטרפו לאחרונה (30 יום)" value={stats.newLast30d} />
        <StatCard label="ביטולים (30 יום)" value={stats.cancelledLast30d} tone={stats.cancelledLast30d > 0 ? "warning" : "default"} />
        <StatCard label="פג תוקף" value={stats.expired} />
        <StatCard label="בוטלו" value={stats.cancelled} />
        <StatCard
          label="שגיאות סנכרון"
          value={stats.syncErrors}
          tone={stats.syncErrors > 0 ? "warning" : "good"}
        />
      </div>

      <div className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
        <h2 className="mb-3 font-semibold text-ink/80">גודל הקבוצה לאורך זמן</h2>
        {series.length === 0 ? (
          <p className="text-sm text-ink/40">אין עדיין מספיק נתונים להצגת גרף.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece5dd" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9a8f86" }} />
              <YAxis tick={{ fontSize: 12, fill: "#9a8f86" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(36,31,27,0.08)",
                  boxShadow: "0 12px 32px -16px rgba(36,31,27,0.2)",
                }}
              />
              <Line type="monotone" dataKey="groupSize" stroke="#b2502a" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
