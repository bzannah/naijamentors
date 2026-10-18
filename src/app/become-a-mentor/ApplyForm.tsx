"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { ArrowLeft, Check, ImagePlus, Loader2 } from "lucide-react";
import { applyAsMentor, type FormState } from "@/app/actions";
import { Arrow, buttonClasses } from "@/components/ui/Button";
import { WeeklyPicker } from "@/components/WeeklyPicker";
import { cn } from "@/lib/cn";
import { AGE_GROUPS, FIELDS } from "@/lib/fields";
import type { WeeklySlot } from "@/lib/types";

const STEPS = ["About you", "Your work", "Your story", "Availability"];

const REQUIRED: Record<number, string[]> = {
  0: ["firstName", "lastName", "email", "password"],
  1: ["role", "org", "field"],
  2: ["bio"],
  3: [],
};

const FIELD_STEP: Record<string, number> = {
  firstName: 0, lastName: 0, email: 0, password: 0, photo: 1,
  role: 1, org: 1, field: 1, bio: 2, pledge: 3,
};

export function ApplyForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(applyAsMentor, undefined);
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState<WeeklySlot[]>([
    { day: 2, time: "18:30" },
    { day: 6, time: "10:00" },
  ]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Jump back to the step that holds a server-side error.
  const [seenError, setSeenError] = useState<FormState>(undefined);
  if (state !== seenError) {
    setSeenError(state);
    if (state?.field && FIELD_STEP[state.field] !== undefined) setStep(FIELD_STEP[state.field]);
  }

  const next = () => {
    const fd = new FormData(formRef.current!);
    const miss = REQUIRED[step].filter((k) => !String(fd.get(k) ?? "").trim());
    setMissing(miss);
    if (!miss.length) setStep((s) => s + 1);
  };

  const bad = (k: string) => (missing.includes(k) || state?.field === k ? "!border-clay" : "");

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        if (step < STEPS.length - 1) return next();
        const fd = new FormData(e.currentTarget);
        fd.set("availability", JSON.stringify(slots));
        startTransition(() => action(fd));
      }}
      className="overflow-hidden rounded-[32px] bg-card shadow-lift ring-1 ring-line"
    >
      <div className="aso-oke h-1.5" />
      {/* Progress */}
      <div className="border-b border-line px-6 py-5 sm:px-9">
        <ol className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-bold transition",
                  i < step ? "bg-forest-3 text-paper" : i === step ? "bg-forest text-paper ring-4 ring-forest/15" : "bg-paper-2 text-ink-3",
                )}
                aria-label={`Step ${i + 1}: ${s}`}
              >
                {i < step ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </button>
              <span className={cn("hidden text-[0.85rem] font-semibold md:inline", i === step ? "text-ink" : "text-ink-3")}>{s}</span>
              {i < STEPS.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-forest-3" : "bg-line-2")} />}
            </li>
          ))}
        </ol>
      </div>

      <div className="p-6 sm:p-9">
        <p className="eyebrow text-clay">
          Step {step + 1} of {STEPS.length}
        </p>
        <h3 className="font-display mt-2 text-[2rem] leading-tight tracking-[-0.02em]">
          {["Tell us about you", "Your work", "Your story, in your words", "When are you free?"][step]}
        </h3>

        {/* Step 1 */}
        <div className={cn("mt-7 grid gap-4 sm:grid-cols-2", step !== 0 && "hidden")}>
          <Field label="Title (optional)">
            <select name="honorific" className="field" defaultValue="">
              <option value="">None</option>
              <option>Dr.</option>
              <option>Prof.</option>
              <option>Engr.</option>
            </select>
          </Field>
          <div className="hidden sm:block" />
          <Field label="First name">
            <input name="firstName" className={cn("field", bad("firstName"))} autoComplete="given-name" />
          </Field>
          <Field label="Last name">
            <input name="lastName" className={cn("field", bad("lastName"))} autoComplete="family-name" />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className={cn("field", bad("email"))} autoComplete="email" />
          </Field>
          <Field label="Password">
            <input name="password" type="password" className={cn("field", bad("password"))} autoComplete="new-password" placeholder="At least 8 characters" />
          </Field>
          <Field label="Town or city">
            <input name="city" className="field" placeholder="e.g. Birmingham" />
          </Field>
          <Field label="Heritage">
            <input name="heritage" className="field" placeholder="e.g. Yoruba · Ogun roots" />
          </Field>
          <Field label="Languages you speak" hint="Separate with commas" className="sm:col-span-2">
            <input name="languages" className="field" defaultValue="English, " />
          </Field>
        </div>

        {/* Step 2 */}
        <div className={cn("mt-7 grid gap-4 sm:grid-cols-2", step !== 1 && "hidden")}>
          <Field label="Job title">
            <input name="role" className={cn("field", bad("role"))} placeholder="e.g. Senior Pharmacist" />
          </Field>
          <Field label="Where you work">
            <input name="org" className={cn("field", bad("org"))} placeholder="e.g. NHS · Birmingham" />
          </Field>
          <Field label="Field">
            <select name="field" className={cn("field", bad("field"))} defaultValue="">
              <option value="" disabled>
                Choose one
              </option>
              {FIELDS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Years of experience">
            <input name="years" type="number" min={1} max={60} className="field" placeholder="e.g. 8" />
          </Field>
          <Field label="Highest qualification" className="sm:col-span-2">
            <input name="education" className="field" placeholder="e.g. MPharm, Aston University" />
          </Field>
          <Field label="What you can help with" hint="Up to four, separated by commas" className="sm:col-span-2">
            <input name="specialities" className="field" placeholder="e.g. Pharmacy, A-level choices, Faith & ambition" />
          </Field>
          <div className="sm:col-span-2">
            <span className="mb-2 block text-[0.85rem] font-semibold">Profile photo</span>
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-ink-4 p-4 transition hover:border-forest-3">
              <span className="arch-sm relative flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden bg-paper-2 text-ink-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6" />}
              </span>
              <span className="text-[0.88rem] text-ink-2">
                <strong className="text-ink">{photo ? "Looking good." : "Add a warm, well-lit photo."}</strong>
                <br />
                People are far more likely to reach out when they can see you. JPG or PNG.
              </span>
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPhoto(f ? URL.createObjectURL(f) : null);
                }}
              />
            </label>
          </div>
        </div>

        {/* Step 3 */}
        <div className={cn("mt-7 grid gap-4", step !== 2 && "hidden")}>
          <Field label="Your headline" hint="One sentence people will remember">
            <input name="headline" className="field" placeholder="e.g. I was the first in my family to go to university. I'll show you the way." />
          </Field>
          <Field label="About you" hint="Two or three sentences: what you do and why you mentor">
            <textarea name="bio" rows={5} className={cn("field", bad("bio"))} />
          </Field>
          <Field label="Ask me about" hint="One topic per line">
            <textarea name="askMeAbout" rows={4} className="field" placeholder={"Choosing A-levels\nApprenticeships vs university\nWhat my job is really like"} />
          </Field>
          <Field label="A line you live by (optional)">
            <input name="quote" className="field" placeholder="e.g. Small habits, compounded, beat big talent left alone." />
          </Field>
          <fieldset>
            <legend className="mb-2 text-[0.85rem] font-semibold">Ages you&rsquo;d like to mentor</legend>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((a) => (
                <label key={a} className="cursor-pointer">
                  <input type="checkbox" name="ageGroups" value={a} defaultChecked={a !== "11–13" && a !== "25–30"} className="peer sr-only" />
                  <span className="inline-block rounded-full px-4 py-2 text-[0.88rem] font-semibold ring-1 ring-line-2 transition peer-checked:bg-forest peer-checked:text-paper peer-checked:ring-forest">
                    {a}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Step 4 */}
        <div className={cn("mt-5", step !== 3 && "hidden")}>
          <p className="text-[0.95rem] text-ink-2">Add the regular times you could meet. 45-minute sessions, UK time. You can change these any time.</p>
          <div className="mt-4">
            <WeeklyPicker value={slots} onChange={setSlots} />
          </div>
          <label className={cn("mt-6 flex cursor-pointer gap-3 rounded-2xl bg-paper-2/70 p-5 text-[0.9rem] leading-relaxed text-ink-2", state?.field === "pledge" && "ring-1 ring-clay")}>
            <input type="checkbox" name="pledge" className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-forest)]" />
            <span>
              <strong className="text-ink">I take the Naija Mentors pledge.</strong> I&rsquo;ll show up prepared, keep every conversation
              on Naija Mentors, follow the guide, and complete an enhanced DBS check before my first session.
            </span>
          </label>
        </div>

        {state?.error && (
          <p role="alert" className="mt-6 rounded-xl bg-clay-soft px-4 py-3 text-[0.9rem] text-clay">
            {state.error}
          </p>
        )}
        {missing.length > 0 && !state?.error && (
          <p role="alert" className="mt-6 rounded-xl bg-clay-soft px-4 py-3 text-[0.9rem] text-clay">
            Please fill in the highlighted fields to continue.
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-[0.92rem] font-semibold text-ink-2 hover:bg-paper-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className={buttonClasses({ size: "lg" })}>
              Continue <Arrow />
            </button>
          ) : (
            <button disabled={pending} className={buttonClasses({ variant: "gold", size: "lg" })}>
              {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Join the village <Arrow /></>}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[0.85rem] font-semibold">{label}</span>
        {hint && <span className="text-[0.75rem] text-ink-4">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
