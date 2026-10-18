"use client";

import { startTransition, useActionState, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { signUp, type FormState } from "@/app/actions";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { MENTEE_AGES, STAGES } from "@/lib/mentees";

export type AccountKind = "mentee" | "parent";

const KINDS: { kind: AccountKind; title: string; sub: React.ReactNode }[] = [
  { kind: "mentee", title: `I’m ${MENTEE_AGES.adult}–${MENTEE_AGES.max}`, sub: "Looking for a mentor for myself" },
  {
    kind: "parent",
    title: "I’m a parent or guardian",
    sub: (
      <>
        For my child, aged <span className="whitespace-nowrap">{`${MENTEE_AGES.min}–${MENTEE_AGES.adult - 1}`}</span>
      </>
    ),
  },
];

export function SignUpForm({ next, initial }: { next: string; initial: AccountKind }) {
  const [kind, setKind] = useState<AccountKind>(initial);
  const [state, action, pending] = useActionState<FormState, FormData>(signUp, undefined);
  const bad = (f: string) => state?.field === f && "!border-clay";

  return (
    <form
      noValidate
      className="mt-9 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="as" value={kind} />

      <fieldset>
        <legend className="sr-only">Who is the account for?</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {KINDS.map((k) => {
            const on = kind === k.kind;
            return (
              <button
                key={k.kind}
                type="button"
                onClick={() => setKind(k.kind)}
                aria-pressed={on}
                className={cn(
                  "relative rounded-2xl p-4 text-left transition duration-300",
                  on ? "bg-forest text-paper shadow-float" : "bg-card ring-1 ring-line-2 hover:ring-ink/25",
                )}
              >
                <span
                  className={cn(
                    "absolute top-3.5 right-3.5 flex h-5 w-5 items-center justify-center rounded-full transition",
                    on ? "bg-gold-2 text-ink" : "ring-1 ring-line-2",
                  )}
                >
                  {on && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className="font-display block pr-6 text-[1.15rem] leading-tight">{k.title}</span>
                <span className={cn("mt-1 block text-[0.8rem] leading-snug", on ? "text-paper/70" : "text-ink-3")}>{k.sub}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-3">
          {kind === "mentee"
            ? "You’ll book sessions and message mentors yourself. Under 18? Ask a parent or guardian to join for you."
            : "You’ll book sessions for your child, and their conversations always run through you."}
        </p>
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">Your name</span>
        <input
          name="name"
          autoComplete="name"
          className={cn("field", bad("name"))}
          placeholder={kind === "mentee" ? "e.g. Bukola Ajayi" : "e.g. Funmilayo Adeyemi"}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">Email</span>
        <input name="email" type="email" autoComplete="email" className={cn("field", bad("email"))} placeholder="you@example.com" />
      </label>
      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">Password</span>
        <input name="password" type="password" autoComplete="new-password" className={cn("field", bad("password"))} placeholder="At least 8 characters" />
      </label>

      {kind === "mentee" ? (
        <div className="grid grid-cols-[96px_1fr] gap-2.5">
          <label className="block">
            <span className="mb-2 block text-[0.85rem] font-semibold">Age</span>
            <input
              name="age"
              type="number"
              inputMode="numeric"
              min={MENTEE_AGES.adult}
              max={MENTEE_AGES.max}
              className={cn("field", bad("age"))}
              placeholder={String(MENTEE_AGES.adult + 5)}
            />
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-[0.85rem] font-semibold">Where are you right now?</span>
            <select name="stage" defaultValue="" className={cn("field", bad("stage"))}>
              <option value="" disabled>
                Choose one
              </option>
              {STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <fieldset className="rounded-2xl bg-paper-2/70 p-4">
          <legend className="sr-only">Your child</legend>
          <p className="text-[0.85rem] font-semibold">
            Your child <span className="font-normal text-ink-3">(optional, you can add more later)</span>
          </p>
          <div className="mt-3 grid grid-cols-[1fr_90px] gap-2">
            <input name="childName" className="field" placeholder="First name" aria-label="Child's first name" />
            <input
              name="childAge"
              type="number"
              inputMode="numeric"
              min={MENTEE_AGES.min}
              max={MENTEE_AGES.adult - 1}
              className={cn("field", bad("childAge"))}
              placeholder="Age"
              aria-label="Child's age"
            />
          </div>
        </fieldset>
      )}

      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">
          Town or city <span className="font-normal text-ink-3">(optional)</span>
        </span>
        <input name="city" className="field" placeholder="e.g. Croydon" />
      </label>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-clay-soft px-4 py-3 text-[0.88rem] text-clay">
          {state.error}
        </p>
      )}
      <button disabled={pending} className={buttonClasses({ size: "lg", className: "w-full" })}>
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create my free account"}
      </button>
      <p className="text-center text-[0.78rem] leading-relaxed text-ink-3">
        By joining you agree to follow the Naija Mentors guide and code of conduct. We never share your details.
      </p>
    </form>
  );
}
