import type { StudentModule } from "../lib/studentApi";

interface Props {
  modules: StudentModule[];
  activeId?: string;
  compact?: boolean;
  onOpen: (lessonId: string) => void;
}

export function Curriculum({ modules, activeId, compact = false, onOpen }: Props) {
  return (
    <div className={compact ? "space-y-5" : "space-y-8"}>
      {modules.map((m, mi) => {
        const done = m.lessons.filter((l) => l.completed).length;
        return (
          <section key={m.id}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className={`${compact ? "text-base" : "text-xl"} font-medium text-fy-navy`}>
                {mi + 1}. {m.title}
              </h2>
              <span className="text-xs text-fy-ink/40">{done}/{m.lessons.length}</span>
            </div>
            {!compact && m.description && <p className="-mt-1 mb-3 text-sm text-fy-ink/60">{m.description}</p>}
            <ul className={compact ? "space-y-1" : "grid gap-3 sm:grid-cols-2"}>
              {m.lessons.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => onOpen(l.id)}
                    className={`flex w-full items-center gap-3 text-right transition ${
                      compact
                        ? `rounded-xl px-3 py-2 text-sm ${l.id === activeId ? "bg-fy-soft text-fy-navy" : "hover:bg-fy-mist"}`
                        : "rounded-2xl bg-fy-mist p-4 hover:-translate-y-0.5 hover:bg-fy-soft"
                    }`}
                  >
                    <span
                      className={`grid shrink-0 place-items-center rounded-full ${compact ? "h-6 w-6 text-xs" : "h-9 w-9"} ${
                        l.completed ? "bg-emerald-500 text-white" : "bg-white text-fy-blue ring-1 ring-fy-blue/30"
                      }`}
                    >
                      {l.completed ? "✓" : "▶"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-fy-navy">{l.title}</span>
                      {!compact && l.durationMin && <span className="text-xs text-fy-ink/50">{l.durationMin} דק׳</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
