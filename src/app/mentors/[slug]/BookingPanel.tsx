"use client";

import { startTransition, useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Loader2, ShieldCheck, Sparkles, Video } from "lucide-react";
import { demoSignIn, requestSession, type FormState } from "@/app/actions";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { fmtDateLong, fmtDayNum, fmtMonth, fmtTime, fmtWeekday, type Slot } from "@/lib/time";
import type { Child, Role } from "@/lib/types";

type Props = {
  mentor: { id: string; slug: string; firstName: string; displayName: string; sessionLength: number; specialities: string[] };
  slots: Slot[];
  viewer: { role: Role; children: Child[] } | null;
  initialSlot?: string;
};

export function BookingPanel({ mentor, slots, viewer, initialSlot }: Props) {
  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) map.set(s.dateKey, [...(map.get(s.dateKey) ?? []), s]);
    return [...map.entries()].map(([key, list]) => ({ key, list }));
  }, [slots]);

  const validInitial = slots.find((s) => s.start === initialSlot);
  const [day, setDay] = useState(validInitial?.dateKey ?? days[0]?.key ?? "");
  const [start, setStart] = useState(validInitial?.start ?? "");
  const [step, setStep] = useState<"time" | "details">(validInitial ? "details" : "time");
  const [state, action, pending] = useActionState<FormState, FormData>(requestSession, undefined);

  const selectedDay = days.find((d) => d.key === day);
  const end = start ? new Date(new Date(start).getTime() + mentor.sessionLength * 60000).toISOString() : "";

  if (!slots.length) {
    return (
      <PanelShell mentor={mentor}>
        <div className="rounded-2xl bg-paper-2 p-6 text-center">
          <p className="font-display text-xl">Fully booked for now</p>
          <p className="mt-2 text-[0.9rem] text-ink-2">
            {mentor.firstName} has no open times in the next few weeks. Check back soon, or explore similar mentors below.
          </p>
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell mentor={mentor}>
      {step === "time" ? (
        <div className="animate-fade-up">
          <div className="flex items-center justify-between">
            <p className="text-[0.82rem] font-semibold tracking-wide text-ink-3 uppercase">Choose a day</p>
            <p className="text-[0.78rem] text-ink-4">UK time</p>
          </div>
          <div className="scrollbar-none -mx-1 mt-3 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
            {days.map(({ key, list }) => {
              const active = key === day;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setDay(key);
                    setStart("");
                  }}
                  className={cn(
                    "flex w-[68px] shrink-0 snap-start flex-col items-center rounded-2xl py-3 transition-all duration-300",
                    active ? "bg-forest text-paper shadow-float" : "bg-paper-2/70 text-ink hover:bg-paper-2",
                  )}
                  aria-pressed={active}
                >
                  <span className={cn("text-[0.68rem] font-bold tracking-wider uppercase", active ? "text-paper/70" : "text-ink-3")}>
                    {fmtWeekday(list[0].start)}
                  </span>
                  <span className="font-display mt-0.5 text-[1.6rem] leading-none">{fmtDayNum(list[0].start)}</span>
                  <span className={cn("mt-1 text-[0.7rem]", active ? "text-paper/70" : "text-ink-3")}>{fmtMonth(list[0].start)}</span>
                  <span className="mt-1.5 flex gap-0.5">
                    {list.map((s) => (
                      <span key={s.start} className={cn("h-1 w-1 rounded-full", active ? "bg-gold-2" : "bg-leaf")} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-[0.82rem] font-semibold tracking-wide text-ink-3 uppercase">Choose a time</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {selectedDay?.list.map((s) => (
              <button
                key={s.start}
                type="button"
                onClick={() => setStart(s.start)}
                className={cn(
                  "rounded-full py-3 text-[0.9rem] font-semibold transition-all duration-300",
                  s.start === start ? "bg-gold-2 text-ink shadow-[0_8px_20px_-10px_rgb(195_154_75/0.9)]" : "ring-1 ring-line-2 hover:ring-forest-3",
                )}
                aria-pressed={s.start === start}
              >
                {fmtTime(s.start)}
              </button>
            ))}
          </div>

          <div className={cn("mt-6 overflow-hidden rounded-2xl bg-mint/60 transition-all duration-500", start ? "max-h-40 p-4 opacity-100" : "max-h-0 p-0 opacity-0")}>
            {start && (
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-forest-3" />
                <div>
                  <p className="font-semibold">{fmtDateLong(start)}</p>
                  <p className="text-[0.9rem] text-ink-2">
                    {fmtTime(start)} – {fmtTime(end)} · {mentor.sessionLength} minutes
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!start || (viewer != null && viewer.role !== "parent")}
            onClick={() => setStep("details")}
            className={buttonClasses({ size: "lg", className: "mt-5 w-full" })}
          >
            {start ? "Continue" : "Pick a time to continue"}
          </button>
          {viewer && viewer.role !== "parent" && (
            <p className="mt-3 text-center text-[0.82rem] text-ink-3">
              You&rsquo;re signed in as {viewer.role === "admin" ? "an admin" : "a mentor"}. Parents request sessions here.
            </p>
          )}
        </div>
      ) : !viewer || state?.error === "signin" ? (
        <SignInPrompt mentor={mentor} start={start} onBack={() => setStep("time")} />
      ) : (
        <form
          className="animate-fade-up"
          onSubmit={(e) => {
            // Submit manually so React doesn't reset the fields when validation fails.
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(() => action(fd));
          }}
        >
          <input type="hidden" name="mentorId" value={mentor.id} />
          <input type="hidden" name="start" value={start} />
          <button type="button" onClick={() => setStep("time")} className="-ml-1 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.85rem] font-semibold text-ink-2 hover:bg-paper-2">
            <ArrowLeft className="h-4 w-4" /> Change time
          </button>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-mint/60 p-3.5">
            <CalendarDays className="h-5 w-5 shrink-0 text-forest-3" />
            <p className="text-[0.9rem]">
              <span className="font-semibold">{fmtDateLong(start)}</span> · {fmtTime(start)}
            </p>
          </div>

          <DetailsFields viewer={viewer} mentor={mentor} state={state} />

          {state?.error && state.error !== "signin" && (
            <p role="alert" className="mt-4 rounded-xl bg-clay-soft px-4 py-3 text-[0.88rem] text-clay">
              {state.error}
            </p>
          )}

          <button disabled={pending} className={buttonClasses({ size: "lg", className: "mt-5 w-full" })}>
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send request to {mentor.firstName}</>}
          </button>
          <p className="mt-3 text-center text-[0.78rem] text-ink-3">Free, always. {mentor.firstName} will reply in your Village inbox.</p>
        </form>
      )}
    </PanelShell>
  );
}

function PanelShell({ mentor, children }: { mentor: Props["mentor"]; children: React.ReactNode }) {
  return (
    <div id="book" className="scroll-mt-28 overflow-hidden rounded-[32px] bg-card shadow-lift ring-1 ring-line">
      <div className="aso-oke h-1.5" />
      <div className="p-6 sm:p-7">
        <div className="mb-6">
          <p className="eyebrow flex items-center gap-1.5 text-clay">
            <Sparkles className="h-3.5 w-3.5" /> Free session
          </p>
          <h2 className="font-display mt-2 text-[1.9rem] leading-tight tracking-[-0.02em]">Meet {mentor.firstName}</h2>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.85rem] text-ink-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-ink-3" /> {mentor.sessionLength} min
            </span>
            <span className="flex items-center gap-1.5">
              <Video className="h-4 w-4 text-ink-3" /> Video call
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-ink-3" /> Parent welcome
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function DetailsFields({ viewer, mentor, state }: { viewer: NonNullable<Props["viewer"]>; mentor: Props["mentor"]; state: FormState }) {
  const kids = viewer.children;
  const [childIdx, setChildIdx] = useState(kids.length ? 0 : -1);
  const child = childIdx >= 0 ? kids[childIdx] : null;
  const topics = [...mentor.specialities, "General career chat", "Confidence & identity", "Something else"];
  const err = (f: string) => state?.field === f;

  return (
    <div className="mt-5 space-y-4">
      <fieldset>
        <legend className="mb-2 text-[0.85rem] font-semibold">Who is the session for?</legend>
        {kids.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {kids.map((k, i) => (
              <button
                key={k.name}
                type="button"
                onClick={() => setChildIdx(i)}
                className={cn(
                  "rounded-full px-4 py-2 text-[0.88rem] font-semibold transition",
                  childIdx === i ? "bg-forest text-paper" : "ring-1 ring-line-2 hover:ring-forest-3",
                )}
              >
                {k.name}, {k.age}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setChildIdx(-1)}
              className={cn("rounded-full px-4 py-2 text-[0.88rem] font-semibold transition", childIdx === -1 ? "bg-forest text-paper" : "ring-1 ring-line-2")}
            >
              Someone else
            </button>
          </div>
        )}
        {child ? (
          <>
            <input type="hidden" name="menteeName" value={child.name} />
            <input type="hidden" name="menteeAge" value={child.age} />
          </>
        ) : (
          <div className="grid grid-cols-[1fr_96px] gap-2">
            <input name="menteeName" placeholder="Child's first name" className={cn("field", err("menteeName") && "!border-clay")} />
            <input name="menteeAge" type="number" min={11} max={18} placeholder="Age" className={cn("field", err("menteeAge") && "!border-clay")} />
          </div>
        )}
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">What would they like to focus on?</span>
        <select name="topic" defaultValue={mentor.specialities[0]} className={cn("field", err("topic") && "!border-clay")}>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-[0.85rem] font-semibold">A note for {mentor.firstName}</span>
        <textarea
          name="message"
          rows={5}
          placeholder={`What does ${child?.name ?? "your child"} love? What are they unsure about? What would make this session a success?`}
          className={cn("field", err("message") && "!border-clay")}
        />
      </label>

      <label className={cn("flex cursor-pointer gap-3 rounded-2xl bg-paper-2/70 p-4 text-[0.85rem] leading-snug text-ink-2", err("consent") && "ring-1 ring-clay")}>
        <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-forest)]" />
        <span>
          I&rsquo;ll be nearby during the session, and we&rsquo;ve read the{" "}
          <Link href="/guide" target="_blank" className="font-semibold text-forest underline decoration-gold underline-offset-2">
            Village guide
          </Link>{" "}
          together.
        </span>
      </label>
    </div>
  );
}

function SignInPrompt({ mentor, start, onBack }: { mentor: Props["mentor"]; start: string; onBack: () => void }) {
  const next = `/mentors/${mentor.slug}?slot=${encodeURIComponent(start)}#book`;
  return (
    <div className="animate-fade-up">
      <button type="button" onClick={onBack} className="-ml-1 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.85rem] font-semibold text-ink-2 hover:bg-paper-2">
        <ArrowLeft className="h-4 w-4" /> Change time
      </button>
      <div className="mt-3 rounded-2xl bg-paper-2/70 p-5">
        <p className="font-display text-[1.35rem] leading-snug">One quick step.</p>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-2">
          Requests come from a parent or guardian account, so you stay in the loop for every message. It takes less than a
          minute and it&rsquo;s free.
        </p>
      </div>
      <div className="mt-5 grid gap-2.5">
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className={buttonClasses({ size: "lg", className: "w-full" })}>
          Create a free parent account
        </Link>
        <Link href={`/signin?next=${encodeURIComponent(next)}`} className={buttonClasses({ variant: "secondary", size: "lg", className: "w-full" })}>
          I already have an account
        </Link>
        <form action={demoSignIn}>
          <input type="hidden" name="who" value="parent" />
          <input type="hidden" name="next" value={next} />
          <button className="w-full rounded-full py-3 text-[0.85rem] font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4 hover:text-forest-3">
            Just exploring? Continue as a demo parent
          </button>
        </form>
      </div>
    </div>
  );
}
