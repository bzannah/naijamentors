import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Clock3, Fingerprint, GraduationCap, Languages, MapPin, MessageCircle, ScrollText, ShieldCheck, Users } from "lucide-react";
import { MentorCard } from "@/components/MentorCard";
import { AdirePattern } from "@/components/Patterns";
import { Portrait } from "@/components/Portrait";
import { Reveal } from "@/components/Reveal";
import { getCurrentUser } from "@/lib/auth";
import { FIELD_MAP } from "@/lib/fields";
import { fmtNext, toCard } from "@/lib/present";
import { conversationBetween, getMentorBySlug, listMentors, mentorName } from "@/lib/queries";
import { Arrow, buttonClasses } from "@/components/ui/Button";
import { BookingPanel } from "./BookingPanel";

export async function generateMetadata({ params }: PageProps<"/mentors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getMentorBySlug(slug);
  if (!found) return { title: "Mentor not found" };
  const m = found.mentor;
  return { title: `${mentorName(m)}, ${m.role}`, description: m.headline };
}

export default async function MentorPage({ params, searchParams }: PageProps<"/mentors/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const found = await getMentorBySlug(slug);
  if (!found) notFound();
  const { mentor: m, slots } = found;
  const user = await getCurrentUser();
  const name = mentorName(m);
  const field = FIELD_MAP[m.field];
  const isOwner = user?.id === m.userId;

  const similar = (await listMentors())
    .filter((x) => x.id !== m.id && x.status === "active")
    .sort((a, b) => Number(b.field === m.field) - Number(a.field === m.field) || Number(b.region === m.region) - Number(a.region === m.region))
    .slice(0, 4);

  const existing =
    user?.role === "parent" ? await conversationBetween(user.id, m.id) : null;

  const verified = [
    { on: m.verified.dbs, icon: ShieldCheck, label: "Enhanced DBS check" },
    { on: m.verified.id, icon: Fingerprint, label: "Identity verified" },
    { on: m.verified.references, icon: ScrollText, label: "References confirmed" },
  ];

  return (
    <div className="relative">
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-paper-2/70">
        <AdirePattern className="text-gold opacity-[0.1] [mask-image:radial-gradient(ellipse_at_20%_40%,#000,transparent_70%)]" size={48} />
        <div className="relative mx-auto max-w-[1320px] px-5 pt-8 pb-14 sm:px-8 lg:pb-16">
          <Link href="/mentors" className="inline-flex items-center gap-2 rounded-full py-1.5 pr-3 text-[0.88rem] font-medium text-ink-2 transition hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> All mentors
          </Link>

          <div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
            <div className="animate-fade-up relative mx-auto w-full max-w-[300px] sm:max-w-[420px]">
              <Portrait src={m.photo} name={name} priority className="aspect-[4/5] w-full shadow-lift ring-[7px] ring-card" sizes="(min-width: 1024px) 420px, 90vw" />
              {m.status === "active" && (
                <div className="absolute -right-3 bottom-8 flex items-center gap-2 rounded-full bg-card py-2 pr-4 pl-2 shadow-lift ring-1 ring-line sm:-right-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-gold-2">
                    <BadgeCheck className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-[0.82rem] leading-tight font-semibold">
                    Verified
                    <br />
                    <span className="font-normal text-ink-3">mentor</span>
                  </span>
                </div>
              )}
            </div>

            <div className="animate-fade-up pb-2" style={{ animationDelay: "120ms" }}>
              <Link href={`/mentors?field=${m.field}`} className="eyebrow text-clay hover:underline">
                {field.label}
              </Link>
              <h1 className="font-display mt-4 text-[clamp(2.8rem,6.4vw,5.6rem)] leading-[0.95] tracking-[-0.045em]">{name}</h1>
              <p className="mt-4 text-[1.2rem] font-medium text-ink">{m.role}</p>
              <p className="text-[1.02rem] text-ink-3">{m.org}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Fact icon={MapPin}>{m.city}</Fact>
                <Fact icon={Users}>{m.heritage}</Fact>
                <Fact icon={Languages}>{m.languages.join(", ")}</Fact>
                <Fact icon={Clock3}>{m.years} years in the field</Fact>
              </div>

              <blockquote className="font-display relative mt-9 max-w-2xl border-l-2 border-gold pl-6 text-[clamp(1.35rem,2.2vw,1.85rem)] leading-[1.3] text-ink-2 italic text-balance">
                {m.headline}
              </blockquote>

              {!isOwner && (
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <a href="#book" className={buttonClasses({ size: "lg" })}>
                    Book a free session <Arrow />
                  </a>
                  {slots[0] ? (
                    <span className="flex items-center gap-2 text-[0.92rem] text-ink-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
                      </span>
                      Next available <strong className="font-semibold text-ink">{fmtNext(slots[0].start)}</strong>
                    </span>
                  ) : (
                    <span className="text-[0.92rem] text-ink-3">Fully booked right now</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto grid max-w-[1320px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_420px] lg:gap-16 lg:py-20">
        <div className="min-w-0 space-y-16">
          {m.status === "pending" && (
            <div className="rounded-2xl bg-gold-soft p-5 text-[0.92rem] text-ink-2">
              <strong className="text-ink">{m.firstName} is new to Village.</strong> Their DBS check and references are in progress.
              You can still send a request, and we&rsquo;ll let you know once verification is complete.
            </div>
          )}

          <Reveal>
            <SectionTitle>About {m.firstName}</SectionTitle>
            <p className="font-display mt-6 text-[1.55rem] leading-[1.4] tracking-[-0.01em] text-ink text-pretty">{m.bio}</p>
          </Reveal>

          {m.askMeAbout.length > 0 && (
            <Reveal>
              <SectionTitle>Ask me about</SectionTitle>
              <ol className="mt-6 divide-y divide-line border-y border-line">
                {m.askMeAbout.map((t, i) => (
                  <li key={t} className="group flex items-baseline gap-6 py-5">
                    <span className="font-display w-8 shrink-0 text-[1.3rem] text-gold italic">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[1.08rem] leading-snug text-ink transition group-hover:translate-x-1">{t}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}

          {m.story.length > 0 && (
            <Reveal>
              <SectionTitle>My story</SectionTitle>
              <div className="prose-village mt-6 max-w-2xl">
                {m.story.map((p, i) => (
                  <p key={i} className={i === 0 ? "first-letter:font-display first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-forest" : ""}>
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          )}

          {m.quote && (
            <Reveal>
              <figure className="relative overflow-hidden rounded-[32px] bg-forest px-8 py-12 text-paper sm:px-12">
                <AdirePattern className="text-gold opacity-[0.08]" size={40} />
                <span className="font-display absolute -top-6 left-6 text-[9rem] leading-none text-gold/40">“</span>
                <blockquote className="font-display relative text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.25] italic text-balance">{m.quote}</blockquote>
                <figcaption className="relative mt-5 text-[0.9rem] text-paper/60">— {name}</figcaption>
              </figure>
            </Reveal>
          )}

          <Reveal className="grid gap-10 sm:grid-cols-2">
            {m.education.length > 0 && (
              <div>
                <SectionTitle>Education</SectionTitle>
                <ul className="mt-6 space-y-5">
                  {m.education.map((e) => (
                    <li key={e.title} className="flex gap-4">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-2 text-forest-3">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold">{e.title}</p>
                        {e.place && <p className="text-[0.92rem] text-ink-3">{e.place}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <SectionTitle>Trust & safety</SectionTitle>
              <ul className="mt-6 space-y-4">
                {verified.map((v) => (
                  <li key={v.label} className="flex items-center gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${v.on ? "bg-mint text-forest-3" : "bg-paper-2 text-ink-4"}`}>
                      <v.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{v.label}</p>
                      <p className="text-[0.88rem] text-ink-3">{v.on ? "Checked by the Village team" : "In progress"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal className="rounded-[28px] bg-paper-2/70 p-7 ring-1 ring-line">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[0.92rem]">
              <div>
                <p className="text-ink-3">Works with ages</p>
                <p className="font-display text-[1.4rem]">{m.ageGroups.join(" · ")}</p>
              </div>
              <div>
                <p className="text-ink-3">Session length</p>
                <p className="font-display text-[1.4rem]">{m.sessionLength} minutes</p>
              </div>
              <div>
                <p className="text-ink-3">Response time</p>
                <p className="font-display text-[1.4rem]">{m.replies.replace("Usually replies ", "")}</p>
              </div>
            </div>
          </Reveal>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-[96px] lg:self-start">
          {isOwner ? (
            <div className="rounded-[32px] bg-card p-7 shadow-lift ring-1 ring-line">
              <p className="font-display text-2xl">This is your public profile.</p>
              <p className="mt-2 text-ink-2">Parents see exactly this page. Manage your availability and requests from your dashboard.</p>
              <Link href="/dashboard" className="mt-5 inline-flex h-11 items-center rounded-full bg-forest px-5 font-semibold text-paper">
                Go to dashboard
              </Link>
            </div>
          ) : (
            <BookingPanel
              mentor={{ id: m.id, slug: m.slug, firstName: m.firstName, displayName: name, sessionLength: m.sessionLength, specialities: m.specialities }}
              slots={slots}
              viewer={user ? { role: user.role, children: user.children ?? [] } : null}
              initialSlot={typeof sp.slot === "string" ? sp.slot : undefined}
            />
          )}
          {existing && (
            <Link
              href={`/inbox/${existing.id}`}
              className="mt-4 flex items-center gap-3 rounded-2xl bg-card p-4 text-[0.9rem] ring-1 ring-line transition hover:ring-line-2"
            >
              <MessageCircle className="h-5 w-5 text-forest-3" />
              <span>
                You&rsquo;re already talking to {m.firstName}. <span className="font-semibold text-forest">Open conversation</span>
              </span>
            </Link>
          )}
          <p className="mt-5 px-2 text-center text-[0.8rem] leading-relaxed text-ink-3">
            {m.replies}. All messages stay on Village and are visible to the parent account.
          </p>
        </aside>
      </section>

      {/* Similar */}
      <section className="border-t border-line bg-paper-2/50 py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-tight tracking-[-0.03em]">
              More from the <em>village</em>
            </h2>
            <Link href="/mentors" className="hidden text-[0.92rem] font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4 sm:block">
              Browse everyone
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <MentorCard key={s.id} m={toCard(s)} className="h-full" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-4 text-[0.78rem] font-bold tracking-[0.18em] text-ink-3 uppercase">
      {children}
      <span className="h-px flex-1 bg-line-2" />
    </h2>
  );
}

function Fact({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3.5 py-2 text-[0.86rem] text-ink-2 ring-1 ring-line">
      <Icon className="h-4 w-4 text-ink-3" />
      {children}
    </span>
  );
}
