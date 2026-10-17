import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "light" | "outline-light" | "clay";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-forest text-paper shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_10px_24px_-10px_rgb(14_59_46/0.6)] hover:bg-forest-2",
  secondary: "bg-card text-ink ring-1 ring-line-2 hover:ring-ink/25 hover:bg-white",
  gold: "bg-gold-2 text-ink hover:bg-gold-soft shadow-[0_10px_24px_-12px_rgb(195_154_75/0.8)]",
  ghost: "text-ink-2 hover:bg-ink/5 hover:text-ink",
  light: "bg-paper text-forest hover:bg-white",
  "outline-light": "text-paper ring-1 ring-paper/30 hover:bg-paper/10 hover:ring-paper/50",
  clay: "bg-clay text-paper hover:brightness-110",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.85rem] gap-1.5",
  md: "h-11 px-5 text-[0.92rem] gap-2",
  lg: "h-14 px-7 text-[1rem] gap-2.5",
};

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "group/btn relative inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-[-0.005em] whitespace-nowrap",
    "transition-all duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      className={cn("h-4 w-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-1", className)}
      strokeWidth={2.2}
    />
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; arrow?: boolean };

export function Button({ variant, size, arrow, className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

type LinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; arrow?: boolean; children: ReactNode };

export function ButtonLink({ variant, size, arrow, className, children, ...props }: LinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
