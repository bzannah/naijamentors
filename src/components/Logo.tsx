import Link from "next/link";
import { cn } from "@/lib/cn";
import { BRAND } from "@/lib/brand";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-8 w-8", className)} aria-hidden>
      <path
        d="M7 37V19C7 11.8 12.8 6 20 6s13 5.8 13 13v18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path d="M14 37V22.5a6 6 0 0 1 12 0V37Z" fill="var(--color-gold)" />
      <circle cx="20" cy="15.2" r="2.1" fill="var(--color-clay)" />
    </svg>
  );
}

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link
      href="/"
      aria-label={`${BRAND.name} home`}
      className={cn(
        "group inline-flex items-center gap-2.5",
        tone === "dark" ? "text-forest" : "text-paper",
        className,
      )}
    >
      <LogoMark className="transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-0.5" />
      <span className="font-display text-[1.6rem] leading-none font-medium tracking-[-0.03em]">
        {BRAND.name}
      </span>
    </Link>
  );
}
