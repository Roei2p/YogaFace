import { useState } from "react";
import { api } from "../lib/api";

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
    <div className="flex h-full flex-col gap-4">
      {turns.length === 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm text-stone-500">אפשר לשאול, לדוגמה:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs text-brand-700 hover:bg-brand-100"
                onClick={() => ask(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto">
        {turns.map((t, i) => (
          <div key={i} className="space-y-2">
            <div className="ms-auto w-fit max-w-[80%] rounded-2xl rounded-tl-sm bg-brand-600 px-4 py-2 text-sm text-white">
              {t.question}
            </div>
            <div className="w-fit max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tr-sm border border-stone-200 bg-white px-4 py-2 text-sm text-stone-800">
              {t.answer}
            </div>
          </div>
        ))}
        {error && <div className="text-sm text-red-600">שגיאה: {error}</div>}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <input
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="שאלי אותי משהו על הנתונים..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "חושב..." : "שלחי"}
        </button>
      </form>
    </div>
  );
}
