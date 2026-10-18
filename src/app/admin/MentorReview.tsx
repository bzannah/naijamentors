"use client";

import { startTransition, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Copy,
  Fingerprint,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  RotateCcw,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { Avatar, Portrait } from "@/components/Portrait";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { approveMentor, issueSignIn, returnToReview, setMentorCheck, type Check as CheckKey, type SignInDetails } from "./actions";

export type ReviewMentor = {
  id: string;
  slug: string;
  name: string;
  firstName: string;
  role: string;
  org: string;
  city: string;
  email: string;
  /** Still on the placeholder email we set up for them: they haven't signed in yet. */
  placeholder: boolean;
  temporaryPassword: boolean;
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
            {m.placeholder ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> No email yet
              </span>
            ) : (
              <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 hover:text-forest">
                <Mail className="h-3.5 w-3.5" /> {m.email}
              </a>
            )}
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
      <SignInPanel m={m} className="mt-5" />
    </li>
  );
}

/* ---------------- Live mentors ---------------- */

export function LiveRow({ m }: { m: ReviewMentor }) {
  const [pending, start] = useTransition();
  const [showSignIn, setShowSignIn] = useState(false);
  return (
    <li className="py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <Avatar src={m.photo} name={m.name} size={44} />
          <div className="min-w-0">
            <Link href={`/mentors/${m.slug}`} className="block truncate font-semibold hover:text-forest">
              {m.name}
            </Link>
            <p className="truncate text-[0.82rem] text-ink-3">
              {m.role} · {m.placeholder ? "hasn't signed in yet" : m.email}
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
            onClick={() => setShowSignIn((v) => !v)}
            aria-expanded={showSignIn}
            className={buttonClasses({ variant: "ghost", size: "sm", className: "ml-auto sm:ml-0" })}
          >
            <KeyRound className="h-3.5 w-3.5" /> Sign-in
          </button>
          <button
            onClick={() => start(async () => void (await returnToReview(m.id)))}
            disabled={pending}
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            Review again
          </button>
        </div>
      </div>
      {showSignIn && <SignInPanel m={m} className="mt-4" />}
    </li>
  );
}

/* ---------------- Sign-in details ---------------- */

/**
 * Issue a temporary password and show what to send the mentor. For mentors the team set up, this is how
 * they get in for the first time; for everyone else it's a password reset.
 */
function SignInPanel({ m, className }: { m: ReviewMentor; className?: string }) {
  const [issuing, start] = useTransition();
  const [details, setDetails] = useState<SignInDetails>();
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState<"message" | "password">();

  const status = m.placeholder
    ? { text: "Hasn't signed in yet", tone: "bg-gold-soft text-[#7c5e1f]" }
    : m.temporaryPassword
      ? { text: "Hasn't changed their temporary password", tone: "bg-gold-soft text-[#7c5e1f]" }
      : { text: "Uses their own email and password", tone: "bg-mint text-forest-3" };

  const issue = () => {
    if (!m.placeholder && !window.confirm(`Reset ${m.firstName}'s password? The one they use now will stop working.`)) return;
    start(async () => {
      setError(undefined);
      const res = await issueSignIn(m.id);
      if (res.ok && res.details) setDetails(res.details);
      else setError(res.error ?? "That didn't work. Please try again.");
    });
  };

  const copy = async (what: "message" | "password", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(undefined), 2000);
    } catch {
      setError("Couldn't copy automatically. Select the text and copy it instead.");
    }
  };

  return (
    <div className={cn("rounded-2xl bg-paper-2/60 p-4 ring-1 ring-line", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <KeyRound className="h-4 w-4 text-gold" />
        <p className="text-[0.88rem] font-semibold">Sign-in details</p>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold", status.tone)}>{status.text}</span>
        <button
          onClick={issue}
          disabled={issuing}
          className={buttonClasses({ variant: m.placeholder ? "primary" : "secondary", size: "sm", className: "ml-auto" })}
        >
          {issuing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
          {m.placeholder ? (details ? "Issue new details" : "Create sign-in details") : "Reset password"}
        </button>
      </div>

      {details && (
        <div className="animate-fade-up mt-4 space-y-3">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div className="min-w-0 rounded-xl bg-card px-3.5 py-2.5 ring-1 ring-line">
              <dt className="text-[0.7rem] font-semibold tracking-wide text-ink-3 uppercase">Email</dt>
              <dd className="mt-0.5 truncate font-mono text-[0.86rem] select-all">{details.email}</dd>
            </div>
            <div className="min-w-0 rounded-xl bg-card px-3.5 py-2.5 ring-1 ring-line">
              <dt className="text-[0.7rem] font-semibold tracking-wide text-ink-3 uppercase">Temporary password</dt>
              <dd className="mt-0.5 font-mono text-[0.86rem] select-all">{details.password}</dd>
            </div>
          </dl>
          <textarea
            readOnly
            value={details.message}
            rows={10}
            aria-label={`Message to send ${m.firstName}`}
            onFocus={(e) => e.currentTarget.select()}
            className="field font-mono !text-[0.8rem] leading-relaxed"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => copy("message", details.message)} className={buttonClasses({ size: "sm" })}>
              {copied === "message" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy message
            </button>
            <button onClick={() => copy("password", details.password)} className={buttonClasses({ variant: "secondary", size: "sm" })}>
              {copied === "password" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy password
            </button>
            <p className="text-[0.78rem] text-ink-3">Shown only now. Issuing new details makes these stop working.</p>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-clay-soft px-4 py-3 text-[0.86rem] text-clay">
          {error}
        </p>
      )}
    </div>
  );
}
