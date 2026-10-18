import Link from "next/link";
import { cn } from "@/lib/cn";
import { BRAND } from "@/lib/brand";
import { LOCKUP, MARK } from "@/lib/logo";

/*
  The Naija Mentors mark: one continuous line that climbs (the mentor), reaches back down, and rises
  again (the young person). Two heads sit above it, the young one in gold. Together they draw the N.
  Line and mentor take currentColor; the young person's head takes --logo-accent.
*/

type Tone = "dark" | "light";

const TONES: Record<Tone, string> = {
  dark: "text-forest [--logo-accent:var(--color-gold)]",
  light: "text-paper [--logo-accent:var(--color-gold-2)]",
};

function MarkShapes() {
  return (
    <>
      <path d={MARK.line} fill="none" stroke="currentColor" strokeWidth={MARK.stroke} strokeLinecap="round" strokeLinejoin="round" />
      <circle {...MARK.mentor} fill="currentColor" />
      <circle {...MARK.young} fill="var(--logo-accent, var(--color-gold))" className="logo-young" />
    </>
  );
}

export function LogoMark({ className, tone = "dark", title }: { className?: string; tone?: Tone; title?: string }) {
  return (
    <svg
      viewBox={MARK.viewBox}
      className={cn("h-9 w-auto overflow-visible", TONES[tone], className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <MarkShapes />
    </svg>
  );
}

/** Mark + wordmark. The wordmark is Fraunces in outline, so it renders identically everywhere. */
export function Lockup({ className, tone = "dark", title }: { className?: string; tone?: Tone; title?: string }) {
  return (
    <svg
      viewBox={`0 0 ${LOCKUP.width} ${LOCKUP.height}`}
      className={cn("h-9 w-auto overflow-visible", TONES[tone], className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g transform={`translate(${LOCKUP.mark.x} ${LOCKUP.mark.y}) scale(${LOCKUP.mark.scale})`}>
        <MarkShapes />
      </g>
      <path d={LOCKUP.wordmark} fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, tone = "dark" }: { className?: string; tone?: Tone }) {
  return (
    <Link href="/" aria-label={`${BRAND.name} home`} className={cn("group inline-flex items-center", className)}>
      <Lockup tone={tone} className="h-[30px] sm:h-[34px]" />
    </Link>
  );
}
