import type { ComponentType } from "react";

interface Props {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "good";
  icon?: ComponentType<{ className?: string }>;
  hint?: string;
  size?: "default" | "lg";
}

export function StatCard({ label, value, tone = "default", icon: Icon, hint, size = "default" }: Props) {
  const toneClasses =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : tone === "good"
        ? "border-sage-200 bg-sage-50 text-sage-800"
        : "border-ink/5 bg-white text-ink";

  const iconToneClasses =
    tone === "warning" ? "bg-amber-100 text-amber-700" : tone === "good" ? "bg-sage-100 text-sage-700" : "bg-brand-50 text-brand-600";

  return (
    <div className={`rounded-2xl border p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg ${toneClasses}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm opacity-60">{label}</div>
        {Icon && (
          <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${iconToneClasses}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <div className={`mt-1 font-serif ${size === "lg" ? "text-4xl" : "text-2xl"}`}>{value}</div>
      {hint && <div className="mt-1.5 flex items-center gap-1 text-xs opacity-60">{hint}</div>}
    </div>
  );
}
