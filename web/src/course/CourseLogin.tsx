import { useState } from "react";
import { studentApi, setStudentToken } from "../lib/studentApi";
import { CourseLogo } from "./CourseLogo";

export function CourseLogin({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (step === "phone") {
        await studentApi.requestCode(phone);
        setStep("code");
      } else {
        const { token } = await studentApi.verify(phone, code);
        setStudentToken(token);
        onLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-fy-soft via-white to-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-12 md:flex-row md:justify-between">
        <div className="max-w-md text-center md:text-right">
          <CourseLogo />
          <h1 className="mt-8 text-4xl font-light leading-tight text-fy-navy md:text-5xl">יוגה פנים עם נועה</h1>
          <p className="mt-4 text-lg text-fy-ink/80">להיראות טוב, להרגיש טוב.</p>
          <p className="mt-2 text-fy-ink/60">
            המרחב האישי שלך לתרגול: כל הסרטונים, המעקב אחרי ההתקדמות, והכל במקום אחד.
          </p>
        </div>

        <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_20px_60px_-25px_rgba(31,42,122,0.35)]">
          <h2 className="text-xl font-medium text-fy-navy">כניסה לקורס</h2>
          <p className="mt-1 text-sm text-fy-ink/60">
            {step === "phone"
              ? "הכניסי את מספר הטלפון שאיתו נרשמת, ונשלח לך קוד בוואטסאפ."
              : `אם המספר רשום כמנויה פעילה, נשלח אליו קוד בוואטסאפ. הכניסי אותו כאן.`}
          </p>

          {step === "phone" ? (
            <input
              type="tel"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              placeholder="050-0000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-6 w-full rounded-full border border-fy-blue/25 px-5 py-3 text-center text-lg outline-none focus:border-fy-blue focus:ring-4 focus:ring-fy-blue/15"
              required
            />
          ) : (
            <input
              inputMode="numeric"
              dir="ltr"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="mt-6 w-full rounded-full border border-fy-blue/25 px-5 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-fy-blue focus:ring-4 focus:ring-fy-blue/15"
              required
            />
          )}

          {error && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}

          <button
            disabled={busy}
            className="mt-5 w-full rounded-full bg-fy-blue px-5 py-3 font-medium text-white transition hover:bg-fy-deep disabled:opacity-60"
          >
            {busy ? "רגע..." : step === "phone" ? "שלחי לי קוד" : "כניסה"}
          </button>

          {step === "code" && (
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
              className="mt-3 w-full text-sm text-fy-blue hover:underline"
            >
              מספר אחר / לשלוח שוב
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
