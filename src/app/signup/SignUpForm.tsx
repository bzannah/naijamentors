"use client";

import { startTransition, useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signUp, type FormState } from "@/app/actions";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function SignUpForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signUp, undefined);
  const bad = (f: string) => state?.field === f && "!border-clay";

  return (
    <form
      className="mt-9 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">Your name</span>
        <input name="name" autoComplete="name" className={cn("field", bad("name"))} placeholder="e.g. Funmilayo Adeyemi" />
      </label>
      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">Email</span>
        <input name="email" type="email" autoComplete="email" className={cn("field", bad("email"))} placeholder="you@example.com" />
      </label>
      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">Password</span>
        <input name="password" type="password" autoComplete="new-password" className={cn("field", bad("password"))} placeholder="At least 8 characters" />
      </label>

      <fieldset className="rounded-2xl bg-paper-2/70 p-4">
        <legend className="sr-only">Your child</legend>
        <p className="text-[0.85rem] font-semibold">Your teenager <span className="font-normal text-ink-3">(optional, you can add more later)</span></p>
        <div className="mt-3 grid grid-cols-[1fr_90px] gap-2">
          <input name="childName" className="field" placeholder="First name" aria-label="Child's first name" />
          <input name="childAge" type="number" min={11} max={18} className="field" placeholder="Age" aria-label="Child's age" />
        </div>
      </fieldset>

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
        By joining you agree to follow the Village guide and code of conduct. We never share your details.
      </p>
    </form>
  );
}
