import { toEmbedUrl } from "../lib/video";
import type { StudentLesson } from "../lib/studentApi";

interface Props {
  lesson: StudentLesson;
  next: StudentLesson | null;
  onToggleComplete: (completed: boolean) => void;
  onNext: () => void;
}

export function LessonPlayer({ lesson, next, onToggleComplete, onNext }: Props) {
  const embed = toEmbedUrl(lesson.videoUrl);
  return (
    <div>
      <div className="aspect-video overflow-hidden rounded-3xl bg-fy-navy shadow-[0_20px_60px_-30px_rgba(31,42,122,0.6)]">
        {embed ? (
          <iframe
            key={lesson.id}
            src={embed}
            title={lesson.title}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="grid h-full place-items-center text-white/70">הסרטון לא זמין כרגע</div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-fy-navy">{lesson.title}</h1>
          {lesson.durationMin && <p className="mt-1 text-sm text-fy-ink/50">{lesson.durationMin} דקות תרגול</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onToggleComplete(!lesson.completed)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
              lesson.completed
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                : "bg-fy-blue text-white hover:bg-fy-deep"
            }`}
          >
            {lesson.completed ? "✓ תרגלתי" : "סמני שתרגלת"}
          </button>
          {next && (
            <button
              onClick={onNext}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-fy-blue ring-1 ring-fy-blue/30 transition hover:bg-fy-soft"
            >
              לשיעור הבא ←
            </button>
          )}
        </div>
      </div>

      {lesson.description && (
        <p className="mt-4 whitespace-pre-line leading-relaxed text-fy-ink/80">{lesson.description}</p>
      )}
    </div>
  );
}
