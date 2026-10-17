import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { IconCheck, IconAlert } from "./icons";

interface ToastItem {
  id: number;
  message: string;
  variant: "success" | "error";
}

type ToastFn = (message: string, variant?: "success" | "error") => void;

const ToastContext = createContext<ToastFn | null>(null);

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const toast = useCallback<ToastFn>((message, variant = "success") => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
            className={`glass pointer-events-auto flex animate-fade-up cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-card ${
              t.variant === "success" ? "border-sage-200 text-sage-800" : "border-rose-200 text-rose-700"
            }`}
          >
            {t.variant === "success" ? <IconCheck className="h-4 w-4" /> : <IconAlert className="h-4 w-4" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
