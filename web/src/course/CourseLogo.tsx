/** Wordmark in the spirit of face-yoga.co.il: blue circle behind a navy line face. */
export function CourseLogo({ small = false }: { small?: boolean }) {
  const size = small ? "h-10 w-10" : "h-14 w-14";
  return (
    <div className="inline-flex items-center gap-3">
      <div className={`relative ${size}`}>
        <div className="absolute inset-[12%] translate-x-[18%] rounded-full bg-fy-blue/80" />
        <svg viewBox="0 0 48 48" className="relative h-full w-full" fill="none" stroke="#1f2a7a" strokeWidth="1.6" strokeLinecap="round">
          <path d="M18 6c-6 3-8 12-5 19 2 5 1 9-1 12M18 6c7-2 13 3 13 10 0 4-2 6-1 9 1 2 4 3 4 5s-3 3-3 5c0 3-4 5-8 4" />
          <path d="M22 19c1.5-1 3-1 4 0M24 30c1.5 1 3 1 4 0" />
        </svg>
      </div>
      <span className={`${small ? "text-xl" : "text-3xl"} font-light text-fy-navy`}>יוגה פנים</span>
    </div>
  );
}
