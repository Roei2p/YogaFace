import { useState } from "react";
import type { StudentProfile } from "../lib/studentApi";

interface Props {
  profile: StudentProfile;
  onSaveName: (name: string) => Promise<void>;
  onLogout: () => void;
}

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("he-IL") : "—");

export function ProfileCard({ profile, onSaveName, onLogout }: Props) {
  const [name, setName] = useState(profile.name ?? "");
  const [saving, setSaving] = useState(false);
  const pct = profile.totalLessons ? Math.round((profile.completedLessons / profile.totalLessons) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-fy-soft to-white p-8 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-fy-blue text-3xl font-light text-white">
          {(profile.name ?? "?").trim().charAt(0) || "?"}
        </div>
        <h1 className="mt-4 text-2xl font-medium text-fy-navy">{profile.name || "המרחב שלי"}</h1>
        <p className="mt-1 text-sm text-fy-ink/50" dir="ltr">{profile.phone}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="שיעורים שתרגלתי" value={`${profile.completedLessons}/${profile.totalLessons}`} />
        <Stat label="ימי תרגול ברצף" value={String(profile.streakDays)} />
        <Stat label="התקדמות" value={`${pct}%`} />
      </div>

      <div className="rounded-3xl bg-white p-6 ring-1 ring-fy-blue/10">
        <label className="text-sm font-medium text-fy-navy">איך לקרוא לך?</label>
        <div className="mt-2 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className="flex-1 rounded-full border border-fy-blue/25 px-4 py-2.5 outline-none focus:border-fy-blue"
          />
          <button
            disabled={saving || name === (profile.name ?? "")}
            onClick={async () => {
              setSaving(true);
              await onSaveName(name).finally(() => setSaving(false));
            }}
            className="rounded-full bg-fy-blue px-5 text-sm font-medium text-white hover:bg-fy-deep disabled:opacity-50"
          >
            שמירה
          </button>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-fy-ink/50">מנויה מאז</dt>
          <dd className="text-fy-ink">{fmt(profile.memberSince)}</dd>
          <dt className="text-fy-ink/50">תרגול אחרון</dt>
          <dd className="text-fy-ink">{fmt(profile.lastPracticeAt)}</dd>
          {profile.subscriptionEnd && (
            <>
              <dt className="text-fy-ink/50">המנוי בתוקף עד</dt>
              <dd className="text-fy-ink">{fmt(profile.subscriptionEnd)}</dd>
            </>
          )}
        </dl>
      </div>

      <button onClick={onLogout} className="w-full text-sm text-fy-ink/50 hover:text-fy-ink">
        התנתקות
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center ring-1 ring-fy-blue/10">
      <div className="text-2xl font-light text-fy-navy">{value}</div>
      <div className="mt-1 text-xs text-fy-ink/50">{label}</div>
    </div>
  );
}
