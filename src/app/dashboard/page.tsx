import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BookOpen, CalendarClock, Clock, DoorOpen, HeartHandshake, Inbox, Sparkles, Users } from "lucide-react";
import { MentorCard } from "@/components/MentorCard";
import { AdirePattern } from "@/components/Patterns";
import { Avatar, Portrait } from "@/components/Portrait";
import { ButtonLink } from "@/components/ui/Button";
import { requireUser, type SafeUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { toCard } from "@/lib/present";
import { conversationsFor, listMentors, mentorForUser, mentorName, sessionsFor, type SessionView } from "@/lib/queries";
import { fmtAgo, fmtDateLong, fmtDayNum, fmtMonth, fmtRelativeDay, fmtTime, fmtWeekday, greeting } from "@/lib/time";
import type { Mentor } from "@/lib/types";
import { AvailabilityEditor } from "./AvailabilityEditor";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser(undefined, "/dashboard");
  const sp = await searchParams;
  const now = Date.now();
  const sessions = sessionsFor(user);
  const upcoming = sessions.filter((s) => s.status === "accepted" && new Date(s.start).getTime() + s.durationMin * 60000 > now);
  const pending = sessions.filter((s) => s.status === "pending");
  const convos = conversationsFor(user);
  const unread = convos.filter((c) => c.unread > 0);
  const mentor = mentorForUser(user);
  const first = user.role === "mentor" && mentor ? `${mentor.honorific ? mentor.honorific + " " : ""}${mentor.firstName}` : user.name.split(" ")[0];

  return (
    <div className="relative">
      <section className="grain relative overflow-hidden border-b border-line bg-paper-2/60">
        <AdirePattern className="text-gold opacity-[0.1] [mask-image:linear-gradient(90deg,transparent_45%,#000)]" size={46} />
        <div className="relative mx-auto max-w-[1320px] px-5 pt-12 pb-12 sm:px-8 sm:pt-16">
          {sp.welcome === "mentor" && (
            <div className="animate-pop mb-8 max-w-2xl rounded-[24px] bg-forest p-5 text-paper shadow-float">
              <p className="font-display text-[1.4rem]">Welcome to the village, {first}. 🎉</p>
              <p className="mt-1 text-[0.92rem] text-paper/75">
                Your profile is live. Our team will be in touch about your DBS check and references. Start by setting the times
                you&rsquo;re free below.
              </p>
            </div>
          )}
          <p className="eyebrow text-clay">{user.role === "mentor" ? "Mentor dashboard" : "Family dashboard"}</p>
          <h1 className="font-display mt-3 text-[clamp(2.6rem,5.6vw,4.6rem)] leading-[1] tracking-[-0.04em]">
            {greeting(now)}, <em className="text-forest-3">{first}.</em>
          </h1>
          <p className="mt-4 text-[1.08rem] text-ink-2">
            {user.role === "mentor"
              ? pending.length
                ? `${pending.length} ${pending.length === 1 ? "family is" : "families are"} waiting to hear from you.`
                : "You're all caught up. Thank you for showing up for our young people."
              : upcoming.length
                ? `${upcoming.length} upcoming ${upcoming.length === 1 ? "session" : "sessions"} in your village.`
                : "Let's find someone wonderful for your teenager to meet."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16">
        {user.role === "mentor" && mentor ? (
          <MentorBoard mentor={mentor} sessions={sessions} upcoming={upcoming} pending={pending} unreadCount={unread.length} now={now} />
        ) : (
          <ParentBoard user={user} upcoming={upcoming} pending={pending} convos={convos} now={now} />
        )}
      </div>
    </div>
  );
}

/* ---------------- Parent ---------------- */

function ParentBoard({
  user,
  upcoming,
  pending,
  convos,
  now,
}: {
  user: SafeUser;
  upcoming: SessionView[];
  pending: SessionView[];
  convos: ReturnType<typeof conversationsFor>;
  now: number;
}) {
  const next = upcoming[0];
  const recommended = listMentors()
    .filter((m) => m.status === "active" && !convos.some((c) => c.conversation.mentorId === m.id))
    .sort((a, b) => (a.nextSlot ?? "9").localeCompare(b.nextSlot ?? "9"))
    .slice(0, 3);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="min-w-0 space-y-6">
        {next ? <NextSessionCard s={next} viewer="parent" now={now} /> : <EmptyNext />}

        <Panel title="Requests & sessions" icon={CalendarClock} action={{ href: "/inbox", label: "Open messages" }}>
          {[...pending, ...upcoming.slice(1)].length === 0 ? (
            <p className="py-6 text-center text-[0.92rem] text-ink-3">Nothing else scheduled. Browse mentors to book another session.</p>
          ) : (
            <ul className="divide-y divide-line">
              {[...pending, ...upcoming.slice(1)].map((s) => (
                <SessionRow key={s.id} s={s} title={`${s.menteeName} × ${mentorName(s.mentor)}`} photo={s.mentor.photo} />
              ))}
            </ul>
          )}
        </Panel>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-[1.9rem] tracking-[-0.02em]">Mentors to meet next</h2>
            <Link href="/mentors" className="text-[0.9rem] font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4">
              Browse all
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {recommended.map((m) => (
              <MentorCard key={m.id} m={toCard(m)} className="h-full" />
            ))}
          </div>
        </section>
      </div>

      <div className="min-w-0 space-y-6">
        <Panel title="Messages" icon={Inbox} action={{ href: "/inbox", label: "All" }}>
          {convos.length === 0 ? (
            <p className="py-4 text-[0.92rem] text-ink-3">No messages yet.</p>
          ) : (
            <ul className="-mx-2">
              {convos.slice(0, 4).map((c) => (
                <li key={c.conversation.id}>
                  <Link href={`/inbox/${c.conversation.id}`} className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-paper-2/70">
                    <Avatar src={c.other.photo} name={c.other.name} size={42} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-[0.92rem]", c.unread ? "font-bold" : "font-semibold")}>{c.other.name}</p>
                      <p className="truncate text-[0.82rem] text-ink-3">{c.last?.kind === "system" ? "Session update" : c.last?.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[0.72rem] text-ink-4">{c.last ? fmtAgo(c.last.createdAt, now) : ""}</span>
                      {c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1.5 text-[0.68rem] font-bold text-paper">{c.unread}</span>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Your teenagers" icon={Users}>
          {user.children?.length ? (
            <ul className="space-y-2.5">
              {user.children.map((c) => (
                <li key={c.name} className="flex items-center gap-3 rounded-2xl bg-paper-2/60 p-3">
                  <Avatar name={c.name} size={40} />
                  <div className="flex-1">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-[0.82rem] text-ink-3">
                      {c.age} · {c.schoolYear}
                    </p>
                  </div>
                  <Link href="/mentors" className="text-[0.82rem] font-semibold text-forest">
                    Find mentor
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.92rem] text-ink-3">Add your child&rsquo;s first name when you send your first request.</p>
          )}
        </Panel>

        <GuideCard
          title="Your role as a parent"
          body="Be nearby, let your child lead, and share feedback. Five minutes of reading makes every session better."
          href="/guide#parents"
        />
      </div>
    </div>
  );
}

/* ---------------- Mentor ---------------- */

function MentorBoard({
  mentor,
  sessions,
  upcoming,
  pending,
  unreadCount,
  now,
}: {
  mentor: Mentor;
  sessions: SessionView[];
  upcoming: SessionView[];
  pending: SessionView[];
  unreadCount: number;
  now: number;
}) {
  const done = sessions.filter((s) => s.status === "accepted" && new Date(s.start).getTime() + s.durationMin * 60000 <= now);
  const families = new Set(sessions.filter((s) => s.status === "accepted").map((s) => s.parentId)).size;
  const minutes = done.reduce((m, s) => m + s.durationMin, 0);
  const stats = [
    { label: "Waiting for you", value: pending.length, icon: Clock, tone: pending.length ? "text-clay" : "text-ink" },
    { label: "Upcoming sessions", value: upcoming.length, icon: CalendarClock, tone: "text-ink" },
    { label: "Families supported", value: families, icon: HeartHandshake, tone: "text-ink" },
    { label: "Time given", value: minutes < 60 ? `${minutes}m` : `${(minutes / 60).toFixed(minutes % 60 ? 1 : 0)}h`, icon: Sparkles, tone: "text-ink" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[24px] bg-card p-5 ring-1 ring-line sm:p-6">
            <s.icon className="h-5 w-5 text-gold" />
            <p className={cn("font-display mt-4 text-[2.6rem] leading-none", s.tone)}>{s.value}</p>
            <p className="mt-2 text-[0.85rem] text-ink-3">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Panel title="Needs your reply" icon={Inbox} action={{ href: "/inbox", label: unreadCount ? `${unreadCount} unread` : "Messages" }}>
            {pending.length === 0 ? (
              <p className="py-6 text-center text-[0.92rem] text-ink-3">No pending requests. New ones will appear here.</p>
            ) : (
              <ul className="space-y-3">
                {pending.map((s) => (
                  <li key={s.id} className="rounded-2xl bg-gold-soft/50 p-4 ring-1 ring-gold/25">
                    <div className="flex flex-wrap items-center gap-4">
                      <DateBlock iso={s.start} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {s.menteeName}, {s.menteeAge} <span className="font-normal text-ink-3">· {s.schoolYear}</span>
                        </p>
                        <p className="text-[0.85rem] text-ink-2">{s.topic}</p>
                        <p className="text-[0.8rem] text-ink-3">
                          {fmtTime(s.start)} · requested by {s.parentName}
                        </p>
                      </div>
                      <ButtonLink href={`/inbox/${s.conversationId}`} size="sm">
                        Review
                      </ButtonLink>
                    </div>
                    <p className="mt-3 line-clamp-2 border-t border-gold/20 pt-3 text-[0.88rem] text-ink-2 italic">“{s.goals}”</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {upcoming[0] && <NextSessionCard s={upcoming[0]} viewer="mentor" now={now} />}

          {upcoming.length > 1 && (
            <Panel title="Later sessions" icon={CalendarClock}>
              <ul className="divide-y divide-line">
                {upcoming.slice(1).map((s) => (
                  <SessionRow key={s.id} s={s} title={`${s.menteeName}, ${s.menteeAge} · ${s.parentName}`} />
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Weekly availability" icon={CalendarClock} subtitle="Families can book any of these times. Changes apply from today.">
            <AvailabilityEditor initial={mentor.availability} sessionLength={mentor.sessionLength} />
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-[28px] bg-card ring-1 ring-line">
            <div className="flex items-center gap-4 p-5">
              <Portrait src={mentor.photo} name={mentorName(mentor)} shape="arch-sm" className="h-24 w-20 shrink-0" sizes="100px" />
              <div className="min-w-0">
                <p className="font-display truncate text-[1.35rem] leading-tight">{mentorName(mentor)}</p>
                <p className="truncate text-[0.85rem] text-ink-3">{mentor.role}</p>
                <p className={cn("mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-bold", mentor.status === "active" ? "bg-mint text-forest-3" : "bg-gold-soft text-[#7c5e1f]")}>
                  <BadgeCheck className="h-3.5 w-3.5" /> {mentor.status === "active" ? "Verified & live" : "Verification in progress"}
                </p>
              </div>
            </div>
            <Link href={`/mentors/${mentor.slug}`} className="flex items-center justify-between border-t border-line px-5 py-3.5 text-[0.88rem] font-semibold text-forest transition hover:bg-paper-2/60">
              View my public profile <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <GuideCard
            title="Mentor expectations"
            body="Consistency, curiosity and clear boundaries. A two-minute refresher before each session goes a long way."
            href="/guide#mentors"
          />
          <GuideCard title="Safeguarding essentials" body="What to do if a young person tells you something worrying. Know it before you need it." href="/guide#safeguarding" tone="clay" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Shared bits ---------------- */

function Panel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] bg-card p-6 ring-1 ring-line sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-[1.05rem] font-semibold">
            <Icon className="h-[18px] w-[18px] text-gold" /> {title}
          </h2>
          {subtitle && <p className="mt-1 text-[0.85rem] text-ink-3">{subtitle}</p>}
        </div>
        {action && (
          <Link href={action.href} className="shrink-0 text-[0.85rem] font-semibold text-forest hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function DateBlock({ iso }: { iso: string }) {
  return (
    <div className="flex w-[58px] shrink-0 flex-col items-center rounded-2xl bg-forest py-2 text-paper">
      <span className="text-[0.62rem] font-bold tracking-wider uppercase opacity-70">{fmtWeekday(iso)}</span>
      <span className="font-display text-[1.5rem] leading-none">{fmtDayNum(iso)}</span>
      <span className="text-[0.65rem] opacity-70">{fmtMonth(iso)}</span>
    </div>
  );
}

function SessionRow({ s, title, photo }: { s: SessionView; title: string; photo?: string }) {
  return (
    <li>
      <Link href={`/inbox/${s.conversationId}`} className="flex items-center gap-4 py-3.5 transition hover:opacity-80">
        {photo ? <Avatar src={photo} name={title} size={44} /> : <DateBlock iso={s.start} />}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{title}</p>
          <p className="truncate text-[0.85rem] text-ink-3">
            {fmtRelativeDay(s.start)}, {fmtTime(s.start)} · {s.topic}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-bold",
            s.status === "pending" ? "bg-gold-soft text-[#7c5e1f]" : "bg-mint text-forest-3",
          )}
        >
          {s.status === "pending" ? "Awaiting reply" : "Confirmed"}
        </span>
      </Link>
    </li>
  );
}

function NextSessionCard({ s, viewer, now }: { s: SessionView; viewer: "parent" | "mentor"; now: number }) {
  const start = new Date(s.start).getTime();
  const days = Math.floor((start - now) / 86400000);
  const hours = Math.floor(((start - now) % 86400000) / 3600000);
  const until = start <= now ? "Happening now" : days > 0 ? `In ${days} day${days > 1 ? "s" : ""}${hours ? `, ${hours} hr${hours > 1 ? "s" : ""}` : ""}` : `In ${Math.max(1, hours)} hour${hours > 1 ? "s" : ""}`;
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-forest p-7 text-paper sm:p-9">
      <AdirePattern className="text-gold opacity-[0.08]" size={44} />
      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center">
        <div className="flex -space-x-5">
          <Portrait src={s.mentor.photo} name={mentorName(s.mentor)} shape="arch-sm" className="h-28 w-[88px] ring-4 ring-forest" sizes="120px" />
          <Portrait name={s.menteeName} shape="arch-sm" className="mt-6 h-28 w-[88px] ring-4 ring-forest" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-gold-2">Next session · {until}</p>
          <p className="font-display mt-3 text-[clamp(1.7rem,3vw,2.3rem)] leading-tight">
            {s.menteeName} meets {viewer === "parent" ? mentorName(s.mentor) : "you"}
          </p>
          <p className="mt-1.5 text-paper/70">
            {fmtDateLong(s.start)} · {fmtTime(s.start)} · {s.topic}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <ButtonLink href={`/sessions/${s.id}`} variant="gold">
              <DoorOpen className="h-4 w-4" /> Session room
            </ButtonLink>
            <ButtonLink href={`/inbox/${s.conversationId}`} variant="outline-light">
              Message {viewer === "parent" ? s.mentor.firstName : s.parentName.split(" ")[0]}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyNext() {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-forest p-8 text-paper sm:p-10">
      <AdirePattern className="text-gold opacity-[0.08]" size={44} />
      <div className="relative">
        <p className="eyebrow text-gold-2">Start here</p>
        <p className="font-display mt-3 text-[2.2rem] leading-tight">Your teen&rsquo;s first mentor is waiting.</p>
        <p className="mt-2 max-w-md text-paper/70">Find someone who has walked the road they dream of, and request a free 45-minute session.</p>
        <ButtonLink href="/mentors" variant="gold" className="mt-6" arrow>
          Find a mentor
        </ButtonLink>
      </div>
    </section>
  );
}

function GuideCard({ title, body, href, tone = "indigo" }: { title: string; body: string; href: string; tone?: "indigo" | "clay" }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-[28px] p-6 text-paper transition hover:-translate-y-0.5 hover:shadow-lift",
        tone === "indigo" ? "bg-indigo" : "bg-clay",
      )}
    >
      <AdirePattern className="text-paper opacity-[0.07]" size={36} />
      <div className="relative">
        <BookOpen className="h-5 w-5 text-gold-2" />
        <p className="font-display mt-4 text-[1.4rem] leading-tight">{title}</p>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-paper/75">{body}</p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-gold-2">
          Read the guide <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </p>
      </div>
    </Link>
  );
}
