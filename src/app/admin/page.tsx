import type { Metadata } from "next";
import { BadgeCheck, ClipboardCheck, Hourglass, ShieldCheck, Users } from "lucide-react";
import { AdirePattern } from "@/components/Patterns";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { FIELD_MAP } from "@/lib/fields";
import { mentorName, mentorsForReview, type MentorReview } from "@/lib/queries";
import { fmtDateShort, fmtRelativeDay } from "@/lib/time";
import { LiveRow, ReviewCard, type ReviewMentor } from "./MentorReview";

export const metadata: Metadata = { title: "Mentor verification" };

function toReview(m: MentorReview, now: number): ReviewMentor {
  return {
    id: m.id,
    slug: m.slug,
    name: mentorName(m),
    firstName: m.firstName,
    role: m.role,
    org: m.org,
    city: m.city,
    email: m.email,
    field: FIELD_MAP[m.field]?.label ?? m.field,
    bio: m.bio,
    photo: m.photo,
    applied: fmtRelativeDay(m.joined, now).replace(/^(Today|Tomorrow)$/, (d) => d.toLowerCase()),
    approved: m.approvedAt ? fmtDateShort(m.approvedAt) : undefined,
    weeklySlots: m.availability.length,
    sessionCount: m.sessionCount,
    verified: { ...m.verified },
  };
}

export default async function AdminPage() {
  await requireUser("admin", "/admin");
  const now = Date.now();
  const all = await mentorsForReview();
  const pending = all.filter((m) => m.status === "pending");
  const live = all.filter((m) => m.status === "active");
  const outstanding = pending.reduce((n, m) => n + [m.verified.dbs, m.verified.id, m.verified.references].filter((v) => !v).length, 0);

  const stats = [
    { label: "Awaiting review", value: pending.length, icon: Hourglass, tone: pending.length ? "text-clay" : "text-ink" },
    { label: "Checks outstanding", value: outstanding, icon: ClipboardCheck, tone: "text-ink" },
    { label: "Verified & live", value: live.length, icon: BadgeCheck, tone: "text-ink" },
    { label: "Sessions booked", value: all.reduce((n, m) => n + m.sessionCount, 0), icon: Users, tone: "text-ink" },
  ];

  return (
    <div className="relative">
      <section className="grain relative overflow-hidden border-b border-line bg-paper-2/60">
        <AdirePattern className="text-gold opacity-[0.1] [mask-image:linear-gradient(90deg,transparent_45%,#000)]" size={46} />
        <div className="relative mx-auto max-w-[1320px] px-5 pt-12 pb-12 sm:px-8 sm:pt-16">
          <p className="eyebrow text-clay">Naija Mentors team · Mentor verification</p>
          <h1 className="font-display mt-3 text-[clamp(2.6rem,5.6vw,4.6rem)] leading-[1] tracking-[-0.04em]">
            Keep the village <em className="text-forest-3">safe.</em>
          </h1>
          <p className="mt-4 max-w-2xl text-[1.08rem] text-ink-2">
            {pending.length
              ? `${pending.length} ${pending.length === 1 ? "mentor is" : "mentors are"} waiting for their DBS, identity and reference checks.`
              : "Every mentor has been reviewed. The village is in safe hands."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] space-y-6 px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[24px] bg-card p-5 ring-1 ring-line sm:p-6">
              <s.icon className="h-5 w-5 text-gold" />
              <p className={cn("font-display mt-4 text-[2.6rem] leading-none", s.tone)}>{s.value}</p>
              <p className="mt-2 text-[0.85rem] text-ink-3">{s.label}</p>
            </div>
          ))}
        </div>

        <section>
          <div className="mt-6 mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[1.9rem] tracking-[-0.02em]">Awaiting review</h2>
              <p className="mt-1 text-[0.9rem] text-ink-3">
                Mentors can be approved once their enhanced DBS, identity and references are all confirmed.
              </p>
            </div>
          </div>
          {pending.length === 0 ? (
            <div className="relative overflow-hidden rounded-[32px] bg-forest p-8 text-paper sm:p-10">
              <AdirePattern className="text-gold opacity-[0.08]" size={44} />
              <div className="relative flex items-center gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-paper/10 text-gold-2">
                  <ShieldCheck className="h-7 w-7" />
                </span>
                <div>
                  <p className="font-display text-[1.7rem] leading-tight">All caught up.</p>
                  <p className="mt-1 text-paper/70">New mentor applications will appear here for checks.</p>
                </div>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {pending.map((m) => (
                <ReviewCard key={m.id} m={toReview(m, now)} />
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[28px] bg-card p-6 ring-1 ring-line sm:p-7">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2.5 text-[1.05rem] font-semibold">
                <BadgeCheck className="h-[18px] w-[18px] text-gold" /> Verified &amp; live
              </h2>
              <p className="mt-1 text-[0.85rem] text-ink-3">
                Send a mentor back for review if a check lapses, for example while a DBS renewal is in progress.
              </p>
            </div>
            <span className="shrink-0 text-[0.85rem] font-semibold text-ink-3">{live.length}</span>
          </div>
          <ul className="divide-y divide-line">
            {live.map((m) => (
              <LiveRow key={m.id} m={toReview(m, now)} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
