// Small hand-drawn-style line icons, kept minimal and in one consistent
// stroke language so the product doesn't lean on a generic icon library.

export function Logomark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div
      className={`relative grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none">
        <circle cx="12" cy="12" r="7.25" stroke="white" strokeWidth="1.4" />
        <path
          d="M12 6.2c2.6 1.4 2.6 10.2 0 11.6"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M15.6 8.4c-2.2 1.9-2.2 5.3 0 7.2"
          stroke="#f3c7a8"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

const common = { fill: "none", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function IconSync({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M4 12a8 8 0 0 1 13.66-5.66M20 12a8 8 0 0 1-13.66 5.66" />
      <path d="M17 3v4h-4M7 21v-4h4" />
    </svg>
  );
}

export function IconSparkle({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M12 3v4M12 17v4M5 10h4M15 10h4" opacity="0.5" />
      <path d="M12 7c0 3-2 5-5 5 3 0 5 2 5 5 0-3 2-5 5-5-3 0-5-2-5-5Z" />
    </svg>
  );
}

export function IconChart({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H3" />
    </svg>
  );
}

export function IconBell({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function IconLock({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <rect x="5" y="11" width="14" height="9" rx="2.2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

export function IconArrowLeft({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}
