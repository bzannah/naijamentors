"use client";

import { startTransition, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CalendarClock, Check, Fingerprint, Loader2, Mail, MapPin, RotateCcw, ScrollText, ShieldCheck } from "lucide-react";
import { Avatar, Portrait } from "@/components/Portrait";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { approveMentor, returnToReview, setMentorCheck, type Check as CheckKey } from "./actions";

export type ReviewMentor = {
  id: string;
  slug: string;
  name: string;
  firstName: string;
  role: string;
  org: string;
  city: string;
  email: string;
  field: string;
  bio: string;
  photo?: string;
  applied: string;
  approved?: string;
  weeklySlots: number;
  sessionCount: number;
  verified: Record<CheckKey, boolean>;
};

const CHECKS: { key: CheckKey; label: string; icon: typeof ShieldCheck }[] = [
  { key: "dbs", label: "Enhanced DBS", icon: ShieldCheck },
  { key: "id", label: "Identity", icon: Fingerprint },
  { key: "references", label: "References", icon: ScrollText },
];

/* ---------------- Awaiting review ---------------- */

export function ReviewCard({ m }: { m: ReviewMentor }) {
  const [checks, setCheck] = useOptimistic(m.verified, (s, { key, on }: { key: CheckKey; on: boolean }) => ({ ...s, [key]: on }));
  const [approving, startApprove] = useTransition();
  const [error, setError] = useState<string>();
  const ready = CHECKS.every((c) => checks[c.key]);
  const done = CHECKS.filter((c) => checks[c.key]).length;

  const toggle = (key: CheckKey) =>
    startTransition(async () => {
      setError(undefined);
      const on = !checks[key];
      setCheck({ key, on });
      const res = await setMentorCheck(m.id, key, on);
      if (!res.ok) setError(res.error ?? "That didn't save. Please try again.");
    });

  const approve = () =>
    startApprove(async () => {
      setError(undefined);
      const res = await approveMentor(m.id);
      if (!res.ok) setError(res.error ?? "That didn't save. Please try again.");
    });

  return (
    <li className="animate-fade-up rounded-[28px] bg-card p-5 ring-1 ring-line sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        <Portrait src={m.photo} name={m.name} shape="arch-sm" className="h-32 w-[100px] shrink-0" sizes="120px" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow text-clay">{m.field}</p>
              <p className="font-display mt-2 text-[1.65rem] leading-tight tracking-[-0.02em]">{m.name}</p>
              <p className="mt-0.5 text-[0.92rem] text-ink-2">
                {m.role} · {m.org}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-gold-soft px-3 py-1 text-[0.72rem] font-bold text-[#7c5e1f]">Applied {m.applied}</span>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.84rem] text-ink-3">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {m.city}
            </span>
            <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 hover:text-forest">
              <Mail className="h-3.5 w-3.5" /> {m.email}
            </a>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> {m.weeklySlots} weekly {m.weeklySlots === 1 ? "slot" : "slots"}
            </span>
          </p>
          <p className="mt-3 line-clamp-3 max-w-2xl text-[0.94rem] leading-relaxed text-ink-2">{m.bio}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5 border-t border-line pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2.5 text-[0.75rem] font-semibold tracking-wide text-ink-3 uppercase">
            Checks · {done} of {CHECKS.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {CHECKS.map(({ key, label, icon: Icon }) => {
              const on = checks[key];
              return (
                <button
                  key={key}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggle(key)}
                  className={cn(
                    "inline-flex h-11 items-center gap-2.5 rounded-full py-1 pr-4 pl-1.5 text-[0.86rem] font-semibold ring-1 transition duration-300",
                    on ? "bg-mint text-forest-3 ring-forest-3/20" : "bg-paper-2/70 text-ink-3 ring-line hover:text-ink-2 hover:ring-line-2",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition duration-300",
                      on ? "bg-forest text-gold-2" : "bg-card text-ink-4",
                    )}
                  >
                    {on ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <Icon className="h-4 w-4" />}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={`/mentors/${m.slug}`} target="_blank" className={buttonClasses({ variant: "secondary", size: "md" })}>
            View profile <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button onClick={approve} disabled={!ready || approving} className={buttonClasses({ size: "md" })}>
            {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
            Approve &amp; publish
          </button>
        </div>
      </div>
      {!ready && !error && (
        <p className="mt-3 text-[0.82rem] text-ink-3 lg:text-right">Tick all three checks to approve {m.firstName}.</p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-clay-soft px-4 py-3 text-[0.88rem] text-clay">
          {error}
        </p>
      )}
    </li>
  );
}

/* ---------------- Live mentors ---------------- */

export function LiveRow({ m }: { m: ReviewMentor }) {
  const [pending, start] = useTransition();
  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <Avatar src={m.photo} name={m.name} size={44} />
        <div className="min-w-0">
          <Link href={`/mentors/${m.slug}`} className="block truncate font-semibold hover:text-forest">
            {m.name}
          </Link>
          <p className="truncate text-[0.82rem] text-ink-3">
            {m.role} · {m.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 pl-[58px] sm:pl-0">
        <div className="flex gap-1" aria-label="Verification checks">
          {CHECKS.map(({ key, label, icon: Icon }) => (
            <span
              key={key}
              title={`${label}${m.verified[key] ? " verified" : " missing"}`}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                m.verified[key] ? "bg-mint text-forest-3" : "bg-clay-soft text-clay",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>
        <p className="w-[124px] text-[0.8rem] leading-tight text-ink-3">
          <span className="block font-semibold text-ink-2">
            {m.sessionCount} {m.sessionCount === 1 ? "session" : "sessions"}
          </span>
          {m.approved ? `since ${m.approved}` : ""}
        </p>
        <button
          onClick={() => start(async () => void (await returnToReview(m.id)))}
          disabled={pending}
          className={buttonClasses({ variant: "ghost", size: "sm", className: "ml-auto sm:ml-0" })}
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Review again
        </button>
      </div>
    </li>
  );
}
