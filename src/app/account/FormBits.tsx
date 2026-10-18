"use client";

import { startTransition, type FormEvent } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AccountState } from "./actions";

/**
 * Submit through the action without React's automatic form reset, so a validation error never wipes
 * what someone typed.
 */
export function submitWith(action: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };
}

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[0.85rem] font-semibold">{label}</span>
        {hint && <span className="text-right text-[0.75rem] text-ink-4">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** The result of the last save: an error in clay, a confirmation in green. */
export function Notice({ state }: { state: AccountState }) {
  if (state?.error)
    return (
      <p role="alert" className="rounded-xl bg-clay-soft px-4 py-3 text-[0.88rem] text-clay">
        {state.error}
      </p>
    );
  if (state?.ok)
    return (
      <p role="status" className="flex items-center gap-2 rounded-xl bg-mint px-4 py-3 text-[0.88rem] text-forest-3">
        <Check className="h-4 w-4 shrink-0" strokeWidth={2.6} /> {state.ok}
      </p>
    );
  return null;
}

/** Outline the field the server complained about. */
export const flag = (state: AccountState, name: string) => (state?.field === name ? "!border-clay" : "");
