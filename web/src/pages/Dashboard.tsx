import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { api, type Stats, type TimeseriesPoint } from "../lib/api";
import { StatCard } from "../components/StatCard";
import { Skeleton } from "../components/Skeleton";
import {
  IconAlert,
  IconUserGroup,
  IconSync,
  IconTrendUp,
  IconTrendDown,
  IconX,
  IconChart,
} from "../components/icons";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "בוקר טוב";
  if (hour < 18) return "צהריים טובים";
  return "ערב טוב";
}

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
        <Skeleton className="h-28" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem]" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );

  const today = new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <p className="text-sm text-ink/40">
          {greeting()} · {today}
        </p>
        <h1 className="mt-0.5 font-serif text-2xl text-ink">הנה המצב של הקבוצה שלך</h1>
      </div>

      {/* Hero row: the two numbers that matter most, side by side */}
      <div className="grid gap-4 md:grid-cols-2">
        <div
          className="animate-fade-up rounded-2xl border border-ink/5 bg-gradient-to-br from-white to-brand-50/60 p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg [animation-delay:60ms]"
        >
          <div className="flex items-center gap-2 text-sm text-ink/55">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100 text-brand-600">
              <IconTrendUp className="h-3.5 w-3.5" />
            </div>
            הכנסה חודשית משוערת
          </div>
          <div className="mt-2 font-serif text-4xl text-ink">₪{stats.estimatedMrr.toLocaleString("he-IL")}</div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-sage-700">
              <IconTrendUp className="h-3 w-3" /> {stats.newLast30d} הצטרפו ב-30 יום
            </span>
            {stats.cancelledLast30d > 0 && (
              <span className="flex items-center gap-1 text-rose-600">
                <IconTrendDown className="h-3 w-3" /> {stats.cancelledLast30d} ביטלו
              </span>
            )}
          </div>
        </div>

        <div className="animate-fade-up rounded-2xl border border-ink/5 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg [animation-delay:110ms]">
          <div className="flex items-center gap-2 text-sm text-ink/55">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-sage-100 text-sage-700">
              <IconUserGroup className="h-3.5 w-3.5" />
            </div>
            חברות פעילות
          </div>
          <div className="mt-2 flex items-end gap-3">
            <span className="font-serif text-4xl text-ink">{stats.active}</span>
            <span className="mb-1 flex items-center gap-1 text-xs text-ink/40">
              <IconSync className="h-3 w-3" />
              {stats.inGroup} בקבוצת הוואטסאפ בפועל
            </span>
          </div>
          {stats.active !== stats.inGroup && (
            <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
              <IconAlert className="h-3 w-3" /> יש פער בין מי שצריכה להיות בקבוצה למי שבפועל נמצאת שם
            </p>
          )}
        </div>
      </div>

      {/* Supporting stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="הצטרפו לאחרונה (30 יום)"
          value={stats.newLast30d}
          tone="good"
          icon={IconTrendUp}
        />
        <StatCard
          label="ביטולים (30 יום)"
          value={stats.cancelledLast30d}
          tone={stats.cancelledLast30d > 0 ? "warning" : "default"}
          icon={IconTrendDown}
        />
        <StatCard label="פג תוקף" value={stats.expired} icon={IconAlert} />
        <StatCard label="בוטלו בסה״כ" value={stats.cancelled} icon={IconX} />
      </div>

      {stats.syncErrors > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100">
            <IconAlert className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <span className="font-semibold">{stats.syncErrors} שגיאות סנכרון</span> - כדאי לבדוק בעמוד
            "חברות" מי לא הצליחה להתעדכן בקבוצת הוואטסאפ.
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink/80">
          <IconChart className="h-4 w-4 text-brand-600" />
          גודל הקבוצה לאורך זמן
        </h2>
        {series.length === 0 ? (
          <p className="text-sm text-ink/40">אין עדיין מספיק נתונים להצגת גרף.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="groupGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b2502a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#b2502a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece5dd" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9a8f86" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9a8f86" }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(36,31,27,0.08)",
                  boxShadow: "0 12px 32px -16px rgba(36,31,27,0.2)",
                }}
              />
              <Area type="monotone" dataKey="groupSize" stroke="#b2502a" strokeWidth={2.5} fill="url(#groupGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
