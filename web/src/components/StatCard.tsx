interface Props {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "good";
}

export function StatCard({ label, value, tone = "default" }: Props) {
  const toneClasses =
    tone === "warning"
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : tone === "good"
        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
        : "border-stone-200 bg-white text-stone-800";

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${toneClasses}`}>
      <div className="text-sm opacity-70">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
