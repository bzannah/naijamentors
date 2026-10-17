import { useId } from "react";
import { cn } from "@/lib/cn";

/** Adire-inspired tie-dye circles, drawn in currentColor. */
export function AdirePattern({ className, size = 44 }: { className?: string; size?: number }) {
  const id = useId();
  return (
    <svg className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <circle cx={size / 2} cy={size / 2} r={size * 0.27} fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx={size / 2} cy={size / 2} r={size * 0.15} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx={size / 2} cy={size / 2} r={size * 0.045} fill="currentColor" />
          <circle cx="0" cy="0" r={size * 0.035} fill="currentColor" />
          <circle cx={size} cy="0" r={size * 0.035} fill="currentColor" />
          <circle cx="0" cy={size} r={size * 0.035} fill="currentColor" />
          <circle cx={size} cy={size} r={size * 0.035} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Adire "eleko" style lines — a softer, linear pattern for dark sections. */
export function AdireLines({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M0 32h64M32 0v64" stroke="currentColor" strokeWidth="0.6" />
          <path d="M8 8l16 16M40 40l16 16M56 8L40 24M24 40L8 56" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
          <circle cx="32" cy="32" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="32" cy="32" r="1.6" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Thin woven aso-oke strip. */
export function AsoOke({ className }: { className?: string }) {
  return <div aria-hidden className={cn("aso-oke h-1.5 w-full", className)} />;
}

/** Concentric sun rings — a quiet focal ornament behind portraits. */
export function SunRings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={cn("pointer-events-none", className)} aria-hidden>
      {[190, 160, 130, 100].map((r, i) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeWidth={i === 0 ? 1 : 0.8} strokeDasharray={i % 2 ? "2 6" : undefined} />
      ))}
      {Array.from({ length: 48 }).map((_, i) => {
        const a = (i / 48) * Math.PI * 2;
        const cx = Math.round((200 + Math.cos(a) * 175) * 100) / 100;
        const cy = Math.round((200 + Math.sin(a) * 175) * 100) / 100;
        return <circle key={i} cx={cx} cy={cy} r="1.6" fill="currentColor" />;
      })}
    </svg>
  );
}
