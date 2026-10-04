interface Props {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "good";
}

export function StatCard({ label, value, tone = "default" }: Props) {
  const toneClasses =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : tone === "good"
        ? "border-sage-200 bg-sage-50 text-sage-800"
        : "border-ink/5 bg-white text-ink";

  return (
    <div className={`rounded-2xl border p-4 shadow-card transition hover:-translate-y-0.5 ${toneClasses}`}>
      <div className="text-sm opacity-60">{label}</div>
      <div className="mt-1 font-serif text-2xl">{value}</div>
    </div>
  );
}
