"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Portrait } from "@/components/Portrait";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { AGE_GROUPS, FIELDS, HONORIFICS, REGIONS } from "@/lib/fields";
import type { Mentor } from "@/lib/types";
import { updateMentorProfile, type AccountState } from "../actions";
import { Field, flag, Notice, submitWith } from "../FormBits";

type Editable = Pick<
  Mentor,
  | "firstName"
  | "lastName"
  | "role"
  | "org"
  | "field"
  | "city"
  | "region"
  | "heritage"
  | "languages"
  | "years"
  | "education"
  | "specialities"
  | "askMeAbout"
  | "headline"
  | "bio"
  | "story"
  | "quote"
  | "ageGroups"
  | "photo"
> & { honorific: string };

export function ProfileForm({ mentor: m }: { mentor: Editable }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(updateMentorProfile, undefined);
  const [education, setEducation] = useState(m.education.length ? m.education : [{ title: "", place: "" }]);
  // Keep a region we don't list (e.g. one set by the team) selectable until the mentor picks another.
  const regions = REGIONS.includes(m.region) ? REGIONS : [m.region, ...REGIONS];
  const bad = (k: string) => cn("field", flag(state, k));

  const setRow = (i: number, patch: Partial<{ title: string; place: string }>) =>
    setEducation((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <form onSubmit={submitWith(action)} className="space-y-6">
      <input type="hidden" name="education" value={JSON.stringify(education.filter((e) => e.title.trim()))} />

      <Section title="Who you are">
        <div className="grid gap-4 sm:grid-cols-[150px_1fr_1fr]">
          <Field label="Title">
            <select name="honorific" defaultValue={m.honorific} className={bad("honorific")}>
              <option value="">None</option>
              {HONORIFICS.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </Field>
          <Field label="First name">
            <input name="firstName" defaultValue={m.firstName} required autoComplete="given-name" className={bad("firstName")} />
          </Field>
          <Field label="Last name">
            <input name="lastName" defaultValue={m.lastName} required autoComplete="family-name" className={bad("lastName")} />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Town or city">
            <input name="city" defaultValue={m.city === "United Kingdom" ? "" : m.city} required placeholder="e.g. Birmingham" className={bad("city")} />
          </Field>
          <Field label="Region" hint="For the directory's region filter">
            <select name="region" defaultValue={m.region} className={bad("region")}>
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Heritage" hint="e.g. Kanuri · Borno roots">
            <input name="heritage" defaultValue={m.heritage} className={bad("heritage")} />
          </Field>
          <Field label="Languages you speak" hint="Separate with commas">
            <input name="languages" defaultValue={m.languages.join(", ")} className={bad("languages")} />
          </Field>
        </div>
      </Section>

      <Section title="Your work">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Job title">
            <input name="role" defaultValue={m.role} required className={bad("role")} />
          </Field>
          <Field label="Where you work">
            <input name="org" defaultValue={m.org} required className={bad("org")} />
          </Field>
          <Field label="Field">
            <select name="field" defaultValue={m.field} className={bad("field")}>
              {FIELDS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Years of experience" hint="Leave blank to hide">
            <input name="years" type="number" min={0} max={60} defaultValue={m.years || ""} className={bad("years")} />
          </Field>
          <Field label="What you can help with" hint="Up to four, separated by commas" className="sm:col-span-2">
            <input name="specialities" defaultValue={m.specialities.join(", ")} required className={bad("specialities")} />
          </Field>
        </div>

        <fieldset className="mt-6">
          <legend className="mb-2 flex w-full items-baseline justify-between gap-3">
            <span className="text-[0.85rem] font-semibold">Education & qualifications</span>
            <span className="text-[0.75rem] text-ink-4">Up to six</span>
          </legend>
          <div className={cn("space-y-2.5", state?.field === "education" && "rounded-2xl ring-1 ring-clay")}>
            {education.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={row.title}
                  onChange={(e) => setRow(i, { title: e.target.value })}
                  placeholder="Qualification, e.g. LLM"
                  aria-label={`Qualification ${i + 1}`}
                  className="field min-w-0 flex-1"
                />
                <input
                  value={row.place}
                  onChange={(e) => setRow(i, { place: e.target.value })}
                  placeholder="Where, e.g. University of Lagos"
                  aria-label={`Where you earned qualification ${i + 1}`}
                  className="field min-w-0 flex-1"
                />
                <button
                  type="button"
                  onClick={() => setEducation((rows) => (rows.length > 1 ? rows.filter((_, j) => j !== i) : [{ title: "", place: "" }]))}
                  aria-label={`Remove qualification ${i + 1}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-3 transition hover:bg-paper-2 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {education.length < 6 && (
            <button
              type="button"
              onClick={() => setEducation((rows) => [...rows, { title: "", place: "" }])}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.86rem] font-semibold text-forest transition hover:bg-paper-2"
            >
              <Plus className="h-4 w-4" /> Add a qualification
            </button>
          )}
        </fieldset>
      </Section>

      <Section title="Your story">
        <div className="grid gap-4">
          <Field label="Headline" hint="One sentence people will remember">
            <input name="headline" defaultValue={m.headline} required maxLength={220} className={bad("headline")} />
          </Field>
          <Field label="About you" hint="Two or three sentences: what you do and why you mentor">
            <textarea name="bio" rows={5} defaultValue={m.bio} required className={bad("bio")} />
          </Field>
          <Field label="My story (optional)" hint="Leave a blank line between paragraphs">
            <textarea
              name="story"
              rows={7}
              defaultValue={m.story.join("\n\n")}
              placeholder="Where you grew up, the turning points, who helped you, and why you want to help the next generation."
              className={bad("story")}
            />
          </Field>
          <Field label="Ask me about" hint="One topic per line, up to six">
            <textarea name="askMeAbout" rows={6} defaultValue={m.askMeAbout.join("\n")} className={bad("askMeAbout")} />
          </Field>
          <Field label="A line you live by (optional)">
            <input name="quote" defaultValue={m.quote} maxLength={200} placeholder="e.g. Rejection is information, not a verdict." className={bad("quote")} />
          </Field>
        </div>
      </Section>

      <Section title="Who you mentor">
        <fieldset>
          <legend className="mb-2 text-[0.85rem] font-semibold">Ages you&rsquo;d like to mentor</legend>
          <div className={cn("flex flex-wrap gap-2", state?.field === "ageGroups" && "rounded-full ring-1 ring-clay")}>
            {AGE_GROUPS.map((a) => (
              <label key={a} className="cursor-pointer">
                <input type="checkbox" name="ageGroups" value={a} defaultChecked={m.ageGroups.includes(a)} className="peer sr-only" />
                <span className="inline-block rounded-full px-4 py-2 text-[0.88rem] font-semibold ring-1 ring-line-2 transition peer-checked:bg-forest peer-checked:text-paper peer-checked:ring-forest peer-focus-visible:ring-2 peer-focus-visible:ring-forest-3">
                  {a}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 flex items-center gap-4 rounded-2xl bg-paper-2/70 p-4">
          <Portrait src={m.photo} name={`${m.firstName} ${m.lastName}`} shape="arch-sm" className="h-20 w-16 shrink-0" sizes="80px" />
          <p className="text-[0.88rem] leading-relaxed text-ink-2">
            <strong className="text-ink">Your photo</strong> is added by the Naija Mentors team so every profile looks its best. To
            change it, send a new one to whoever invited you.
          </p>
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-[24px] bg-card/95 p-3 shadow-lift ring-1 ring-line backdrop-blur sm:p-4">
        <button disabled={pending} className={buttonClasses({ size: "lg" })}>
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save profile"}
        </button>
        <div className="min-w-0 flex-1">
          <Notice state={state} />
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] bg-card p-6 ring-1 ring-line sm:p-8">
      <h2 className="font-display mb-6 text-[1.6rem] leading-tight tracking-[-0.02em]">{title}</h2>
      {children}
    </section>
  );
}
