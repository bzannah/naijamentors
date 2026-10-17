"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { demoSignIn, signIn, type FormState } from "@/app/actions";
import { Avatar } from "@/components/Portrait";
import { buttonClasses } from "@/components/ui/Button";

const CHIAMAKA = "https://images.unsplash.com/photo-1678695972687-033fa0bdbac9";

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, undefined);

  return (
    <>
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

      <div className="my-9 flex items-center gap-4 text-[0.75rem] font-semibold tracking-[0.16em] text-ink-4 uppercase">
        <span className="hairline flex-1" /> Or explore the demo <span className="hairline flex-1" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DemoButton who="parent" next={next} title="As a parent" sub="Funmi, mum of Tobi & David" initials="Funmilayo Adeyemi" />
        <DemoButton who="mentor" next={next} title="As a mentor" sub="Dr. Chiamaka Obi" photo={CHIAMAKA} initials="Chiamaka Obi" />
      </div>
    </>
  );
}

function DemoButton({ who, next, title, sub, photo, initials }: { who: string; next: string; title: string; sub: string; photo?: string; initials: string }) {
  return (
    <form action={demoSignIn}>
      <input type="hidden" name="who" value={who} />
      <input type="hidden" name="next" value={next} />
      <button className="group flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 text-left ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-soft hover:ring-line-2">
        <Avatar src={photo} name={initials} size={42} />
        <span className="min-w-0">
          <span className="block text-[0.9rem] font-semibold">{title}</span>
          <span className="block truncate text-[0.78rem] text-ink-3">{sub}</span>
        </span>
      </button>
    </form>
  );
}
