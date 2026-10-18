"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signIn, type FormState } from "@/app/actions";
import { buttonClasses } from "@/components/ui/Button";

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, undefined);

  return (
    <form action={action} className="mt-9 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">Email</span>
        <input name="email" type="email" autoComplete="email" required className="field" placeholder="you@example.com" />
      </label>
      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" placeholder="••••••••" />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-clay-soft px-4 py-3 text-[0.88rem] text-clay">
          {state.error}
        </p>
      )}
      <button disabled={pending} className={buttonClasses({ size: "lg", className: "w-full" })}>
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
      </button>
    </form>
  );
}
