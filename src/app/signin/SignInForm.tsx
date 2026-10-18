"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { demoSignIn, signIn, type FormState } from "@/app/actions";
import { Avatar } from "@/components/Portrait";
import { buttonClasses } from "@/components/ui/Button";

export type Demo = "mentee" | "parent";

const DEMOS: Record<Demo, { title: string; sub: string; initials: string; photo?: string }> = {
  mentee: { title: "As a mentee", sub: "Bukola, 23, recent graduate", initials: "Bukola Ajayi" },
  parent: { title: "As a parent", sub: "Funmi, mum of Tobi & David", initials: "Funmilayo Adeyemi" },
};

export function SignInForm({ next, demos }: { next: string; demos: Demo[] }) {
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

      {demos.length > 0 && (
        <>
          <div className="my-9 flex items-center gap-4 text-[0.75rem] font-semibold tracking-[0.16em] text-ink-4 uppercase">
            <span className="hairline flex-1" /> Or explore the demo <span className="hairline flex-1" />
          </div>
          <div className="grid gap-2.5">
            {demos.map((who) => (
              <DemoButton key={who} who={who} next={next} {...DEMOS[who]} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function DemoButton({ who, next, title, sub, photo, initials }: { who: Demo; next: string; title: string; sub: string; photo?: string; initials: string }) {
  return (
    <form action={demoSignIn}>
      <input type="hidden" name="who" value={who} />
      <input type="hidden" name="next" value={next} />
      <button className="group flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-soft hover:ring-line-2">
        <Avatar src={photo} name={initials} size={40} />
        <span className="min-w-0 flex-1">
          <span className="block text-[0.9rem] font-semibold">{title}</span>
          <span className="block truncate text-[0.78rem] text-ink-3">{sub}</span>
        </span>
        <ArrowRight className="mr-1 h-4 w-4 text-ink-4 transition group-hover:translate-x-0.5 group-hover:text-forest" />
      </button>
    </form>
  );
}
