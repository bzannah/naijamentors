"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { completeSetup, updateEmail, updatePassword, type AccountState } from "./actions";
import { Field, flag, Notice, submitWith } from "./FormBits";

/** First sign-in with a password the team issued. */
export function SetupForm({ askEmail }: { askEmail: boolean }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(completeSetup, undefined);
  return (
    <form onSubmit={submitWith(action)} className="mt-9 space-y-4">
      {askEmail && (
        <Field label="Your email" hint="You'll sign in with this">
          <input name="email" type="email" autoComplete="email" required className={cn("field", flag(state, "email"))} placeholder="you@example.com" />
        </Field>
      )}
      <Field label="New password" hint="At least 8 characters">
        <input name="password" type="password" autoComplete="new-password" required minLength={8} className={cn("field", flag(state, "password"))} />
      </Field>
      <Field label="Type it again">
        <input name="confirm" type="password" autoComplete="new-password" required className={cn("field", flag(state, "confirm"))} />
      </Field>
      <Notice state={state} />
      <button disabled={pending} className={buttonClasses({ size: "lg", className: "w-full" })}>
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save and continue"}
      </button>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(updateEmail, undefined);
  return (
    <form onSubmit={submitWith(action)} className="grid gap-4 sm:grid-cols-2">
      <Field label="Email">
        <input name="email" type="email" autoComplete="email" required defaultValue={email} className={cn("field", flag(state, "email"))} />
      </Field>
      <Field label="Current password" hint="To confirm it's you">
        <input name="current" type="password" autoComplete="current-password" required className={cn("field", flag(state, "current"))} />
      </Field>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={pending} className={buttonClasses()}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update email"}
        </button>
        <div className="min-w-0 flex-1">
          <Notice state={state} />
        </div>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<AccountState, FormData>(updatePassword, undefined);
  const form = useRef<HTMLFormElement>(null);
  // Clear the fields once the new password is saved.
  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);
  return (
    <form ref={form} onSubmit={submitWith(action)} className="grid gap-4 sm:grid-cols-3">
      <Field label="Current password">
        <input name="current" type="password" autoComplete="current-password" required className={cn("field", flag(state, "current"))} />
      </Field>
      <Field label="New password" hint="8+ characters">
        <input name="password" type="password" autoComplete="new-password" required minLength={8} className={cn("field", flag(state, "password"))} />
      </Field>
      <Field label="Type it again">
        <input name="confirm" type="password" autoComplete="new-password" required className={cn("field", flag(state, "confirm"))} />
      </Field>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
        <button disabled={pending} className={buttonClasses()}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change password"}
        </button>
        <div className="min-w-0 flex-1">
          <Notice state={state} />
        </div>
      </div>
    </form>
  );
}
