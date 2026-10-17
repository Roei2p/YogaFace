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

export function IconSearch({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.8-4.8" />
    </svg>
  );
}

export function IconSettingsGear({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" />
    </svg>
  );
}

export function IconCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M5 13l4 4 10-10" />
    </svg>
  );
}

export function IconAlert({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconUpload({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M12 16V4M7 8.5 12 4l5 4.5" />
      <path d="M4 16v2.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V16" />
    </svg>
  );
}

export function IconMail({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </svg>
  );
}

export function IconPhoneWave({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

export function IconX({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconTrendUp({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M3 16 9.5 9.5 14 14 21 7" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

export function IconTrendDown({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <path d="M3 8 9.5 14.5 14 10 21 17" />
      <path d="M15 17h6v-6" />
    </svg>
  );
}

export function IconCoin({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2v9.6M14.8 9.3c0-1.1-1.2-1.8-2.8-1.8s-2.6.8-2.6 1.8c0 2.6 5.4 1.3 5.4 3.9 0 1.1-1.1 1.9-2.8 1.9s-2.9-.7-2.9-1.9" />
    </svg>
  );
}

export function IconUserGroup({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common} stroke="currentColor">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17" cy="9" r="2.3" opacity="0.6" />
      <path d="M15.5 19c.3-2 1.8-3.4 4-3.9" opacity="0.6" />
    </svg>
  );
}
