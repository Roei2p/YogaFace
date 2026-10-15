import { useState } from "react";
import { api } from "../lib/api";
import { IconSparkle, IconAlert, Logomark } from "../components/icons";

interface Turn {
  question: string;
  answer: string;
}

const SUGGESTIONS = [
  "כמה חברות פעילות יש לי כרגע?",
  "כמה הכנסה חודשית משוערת מהקבוצה?",
  "מי ביטלה מנוי בשבוע האחרון?",
  "האם יש שגיאות סנכרון שכדאי לטפל בהן?",
];

export function Chat() {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.askInsights(q);
      setTurns((t) => [...t, { question: q, answer: res.answer }]);
      setQuestion("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-11rem)] flex-col gap-4">
      {turns.length === 0 && (
        <div className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-ink/70">
            <IconSparkle className="h-4 w-4 text-brand-600" /> אפשר לשאול, לדוגמה:
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs text-brand-700 transition hover:bg-brand-100"
                onClick={() => ask(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-5 overflow-y-auto px-1">
        {turns.map((t, i) => (
          <div key={i} className="space-y-2.5">
            <div className="ms-auto w-fit max-w-[80%] rounded-2xl rounded-tl-md bg-gradient-to-l from-brand-600 to-brand-500 px-4 py-2.5 text-sm text-white shadow-glow">
              {t.question}
            </div>
            <div className="flex w-fit max-w-[80%] items-start gap-2.5">
              <Logomark className="h-7 w-7 shrink-0" />
              <div className="whitespace-pre-wrap rounded-2xl rounded-tr-md border border-ink/5 bg-white px-4 py-2.5 text-sm leading-relaxed text-ink shadow-card">
                {t.answer}
              </div>
            </div>
          </div>
        ))}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
            <IconAlert /> {error}
          </div>
        )}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <input
          className="flex-1 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/30 transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
          placeholder="שאלי אותי משהו על הנתונים..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          className="rounded-xl bg-gradient-to-l from-brand-600 to-brand-500 px-5 py-3 text-sm font-medium text-white shadow-glow transition hover:shadow-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "חושב..." : "שלחי"}
        </button>
      </form>
    </div>
  );
}
