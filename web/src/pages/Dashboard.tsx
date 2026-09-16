import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { api, type Stats, type TimeseriesPoint } from "../lib/api";
import { StatCard } from "../components/StatCard";

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

  if (error) return <div className="text-red-600">שגיאה: {error}</div>;
  if (!stats) return <div className="text-stone-500">טוען...</div>;

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

      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-stone-700">גודל הקבוצה לאורך זמן</h2>
        {series.length === 0 ? (
          <p className="text-sm text-stone-500">אין עדיין מספיק נתונים להצגת גרף.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="groupSize" stroke="#c1613a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
