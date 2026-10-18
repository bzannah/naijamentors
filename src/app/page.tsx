import Link from "next/link";
import { BookOpen, Eye, Lock, MessageSquareHeart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { MentorCard } from "@/components/MentorCard";
import { AdireLines, AdirePattern, AsoOke } from "@/components/Patterns";
import { Avatar, Portrait } from "@/components/Portrait";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { FIELDS } from "@/lib/fields";
import { toCard } from "@/lib/present";
import { listMentors, sessionStart, type MentorListing } from "@/lib/queries";

const PROFESSIONS = [
  "Paediatricians",
  "Barristers",
  "Structural engineers",
  "Founders",
  "Data scientists",
  "Architects",
  "Pharmacists",
  "Music producers",
  "Policy advisers",
  "Investment bankers",
  "Matrons",
  "Cyber security leads",
  "Journalists",
  "Academy coaches",
  "Chartered accountants",
  "Research fellows",
];

export default async function Home() {
  const [all, demoSessionAt] = await Promise.all([listMentors(), sessionStart("s_tobi_1")]);
  const mentors = all.filter((m) => m.status === "active");
  const by = (slug: string) => mentors.find((m) => m.slug === slug)!;

  const stats = {
    mentors: mentors.length,
    cities: new Set(mentors.map((m) => m.city)).size,
    heritages: new Set(mentors.map((m) => m.heritage.split(" · ")[0].split("-")[0])).size,
  };

  const featured = ["chiamaka-obi", "chukwuemeka-nnamdi", "ngozi-eze-williams", "ifeanyi-okafor", "zainab-yusuf", "tunde-adebayo", "adaeze-nwosu", "osaze-ehigiator"].map(by);

  return (
    <>
      <Hero
        feature={by("chiamaka-obi")}
        left={by("chukwuemeka-nnamdi")}
        right={by("kemi-oyelaran")}
        faces={["tunde-adebayo", "zainab-yusuf", "ifeanyi-okafor", "adaeze-nwosu", "abubakar-sani"].map(by)}
        stats={stats}
        sessionAt={demoSessionAt}
      />

      <Marquee />

      <Untapped mentors={mentors.length} fields={new Set(mentors.map((m) => m.field)).size} />

      <HowItWorks mentors={[by("chiamaka-obi"), by("abubakar-sani"), by("aisha-bello")]} />

      {/* Featured mentors */}
      <section className="relative bg-paper-2/60 py-24 sm:py-32">
        <AsoOke className="absolute top-0 opacity-90" />
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-clay">Meet the village</p>
              <h2 className="font-display mt-4 max-w-2xl text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
                Real people. Real careers. <em>Our people.</em>
              </h2>
            </div>
            <ButtonLink href="/mentors" variant="secondary" arrow>
              See all {mentors.length} mentors
            </ButtonLink>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((m, i) => (
              <Reveal key={m.id} delay={(i % 4) * 90}>
                <MentorCard m={toCard(m)} className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Fields mentors={mentors} />

      <Proverbs />

      <GuideTeaser />

      <Safety />

      <MentorCta faces={[by("osasu-igbinedion"), by("olumide-bakare"), by("ekaette-effiong"), by("efe-okoro")]} />
    </>
  );
}

function Marquee() {
  const row = [...PROFESSIONS, ...PROFESSIONS];
  return (
    <div className="relative overflow-hidden bg-forest py-6 text-paper">
      <div className="marquee-mask flex">
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10 whitespace-nowrap">
          {row.map((p, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="font-display text-[1.7rem] italic text-paper/90">{p}</span>
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-gold" aria-hidden>
                <path d="M10 0c1 5 5 9 10 10-5 1-9 5-10 10-1-5-5-9-10-10C5 9 9 5 10 0Z" fill="currentColor" />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Untapped({ mentors, fields }: { mentors: number; fields: number }) {
  return (
    <section className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow text-clay">The untapped village</p>
          <p className="font-display mt-6 max-w-5xl text-[clamp(1.9rem,4.2vw,3.6rem)] leading-[1.12] tracking-[-0.03em] text-ink text-balance">
            Our community is full of consultants, engineers, barristers and founders.{" "}
            <span className="text-ink-3">
              Yet too many of our young people grow up, graduate and start out without ever sitting across from one.{" "}
            </span>
            <em className="text-forest-3">Naija Mentors changes that.</em>
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[32px] bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              big: "270k+",
              label: "people born in Nigeria live in England & Wales, before you count their British-born children.",
              note: "Census 2021, ONS",
            },
            { big: String(mentors), label: `verified mentors already giving their time, across ${fields} career fields.`, note: "And growing every week" },
            { big: "£0", label: "for mentees and families. Always. Mentors give their time as a gift to the community.", note: "No fees, no catches" },
            { big: "45", unit: "min", label: "is all it takes to change what a young person believes is possible for them.", note: "One session at a time" },
          ].map((s, i) => (
            <Reveal key={s.big} delay={i * 100} className="bg-card p-8 sm:p-10">
              <p className="font-display text-[3.8rem] leading-none tracking-[-0.04em] text-forest">
                {s.big}
                {s.unit && <span className="ml-1 text-2xl text-ink-3 italic">{s.unit}</span>}
              </p>
              <p className="mt-5 text-[0.98rem] leading-relaxed text-ink-2">{s.label}</p>
              <p className="mt-4 text-[0.75rem] font-semibold tracking-wider text-ink-4 uppercase">{s.note}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fields({ mentors }: { mentors: MentorListing[] }) {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-clay">Every dream has a mentor</p>
          <h2 className="font-display mt-4 text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
            Whatever they want to become, <em>someone here has done it.</em>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {FIELDS.map((f, i) => {
            const people = mentors.filter((m) => m.field === f.key);
            return (
              <Reveal key={f.key} delay={(i % 5) * 70}>
                <Link
                  href={`/mentors?field=${f.key}`}
                  className="group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-[26px] bg-card p-6 ring-1 ring-line transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:bg-forest hover:text-paper hover:shadow-lift"
                >
                  <AdirePattern className="text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-[0.12]" size={36} />
                  <div className="relative flex items-start justify-between">
                    <div className="flex -space-x-2.5">
                      {people.slice(0, 3).map((m) => (
                        <Avatar key={m.id} src={m.photo} name={m.firstName} size={36} className="ring-[2.5px] ring-card transition group-hover:ring-forest" />
                      ))}
                    </div>
                    <span className="font-display text-[1.5rem] leading-none text-ink-4 italic transition group-hover:text-gold-2">
                      {String(people.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="relative mt-8">
                    <h3 className="font-display text-[1.45rem] leading-tight">{f.label}</h3>
                    <p className="mt-1.5 text-[0.85rem] leading-snug text-ink-3 transition group-hover:text-paper/70">{f.blurb}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Proverbs() {
  const items = [
    { lang: "Igbo", text: "Ora na-azụ nwa.", meaning: "It is the community that raises a child." },
    { lang: "Yoruba", text: "Àgbà kì í wà lọ́jà, kí orí ọmọ tuntun wọ́.", meaning: "An elder cannot be in the marketplace and let a newborn’s head hang crooked." },
    { lang: "Hausa", text: "Hannu ɗaya ba ya ɗaukar jinka.", meaning: "One hand alone cannot lift a roof." },
  ];
  return (
    <section className="grain relative overflow-hidden bg-paper-2 py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="eyebrow text-clay">Three languages, one truth</p>
          <h2 className="font-display mx-auto mt-4 max-w-3xl text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.05] tracking-[-0.03em] text-balance">
            Our grandparents already knew how to raise brilliant children.
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line-2">
          {items.map((p, i) => (
            <Reveal key={p.lang} delay={i * 140} className="px-2 text-center md:px-10">
              <p className="eyebrow text-gold">{p.lang}</p>
              <p className="font-display mt-5 text-[1.9rem] leading-[1.18] text-forest italic text-balance">“{p.text}”</p>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-2 text-balance">{p.meaning}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuideTeaser() {
  const cards = [
    { who: "For mentors", points: ["Show up on time, every time", "Listen more than you talk", "Keep every conversation on Naija Mentors"] },
    { who: "For mentees", points: ["Bring your real questions", "Camera on, notes out", "Follow through on one small action"] },
    { who: "For parents", points: ["Stay nearby for under-16s", "Let your child lead the conversation", "Share feedback after each session"] },
  ];
  return (
    <section className="relative overflow-hidden bg-indigo py-24 text-paper sm:py-32">
      <AdireLines className="text-paper/[0.06]" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(195_154_75/0.28),transparent)]" />
      <div className="relative mx-auto grid max-w-[1320px] items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <p className="eyebrow text-gold-2">The Naija Mentors guide</p>
          <h2 className="font-display mt-4 text-[clamp(2.5rem,5vw,4.4rem)] leading-[1] tracking-[-0.035em] text-balance">
            Mentorship, <em className="text-gold-2">done properly.</em>
          </h2>
          <p className="mt-6 max-w-md text-[1.08rem] leading-relaxed text-paper/75">
            Clear expectations for mentors, mentees and parents, so every session is safe, warm and worth everyone&rsquo;s
            time. Read it together before your first session.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/guide" variant="gold" size="lg" arrow>
              Read the guide
            </ButtonLink>
            <ButtonLink href="/guide#first-session" variant="outline-light" size="lg">
              The first session
            </ButtonLink>
          </div>
        </Reveal>
        <div className="grid gap-4">
          {cards.map((c, i) => (
            <Reveal key={c.who} delay={i * 120}>
              <div
                className="rounded-[26px] bg-paper/[0.06] p-6 ring-1 ring-paper/10 backdrop-blur-sm transition duration-500 hover:bg-paper/[0.09] sm:p-7"
                style={{ marginLeft: `${i * 6}%` }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[1.5rem]">{c.who}</h3>
                  <BookOpen className="h-5 w-5 text-gold-2" />
                </div>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-3 sm:gap-4">
                  {c.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[0.9rem] leading-snug text-paper/80">
                      <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-2" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Safety() {
  const items = [
    { icon: ShieldCheck, title: "Every mentor is vetted", body: "Identity checks, two professional references and an enhanced DBS check before a mentor can accept sessions." },
    { icon: Users, title: "Parents in the loop", body: "Under-18s are booked by a parent, who sees every message and can join any session. From 18, mentees book for themselves." },
    { icon: Lock, title: "Conversations stay here", body: "Messages and video links live on Naija Mentors. Mentors never ask for phone numbers or social media." },
    { icon: Eye, title: "Clear, simple reporting", body: "A named safeguarding lead and a one-tap way to raise a concern, reviewed within 24 hours." },
  ];
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.4fr]">
          <Reveal>
            <p className="eyebrow text-clay">Safe by design</p>
            <h2 className="font-display mt-4 text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
              Trust is the <em>whole point.</em>
            </h2>
            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-2">
              We built Naija Mentors the way a careful auntie would: warm and welcoming, but nobody gets near our young people without
              being properly checked.
            </p>
            <Link href="/guide#safeguarding" className="mt-7 inline-flex items-center gap-2 text-[0.95rem] font-semibold text-forest underline decoration-gold decoration-2 underline-offset-[6px] hover:decoration-forest">
              Read our safeguarding approach
            </Link>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((it, i) => (
              <Reveal key={it.title} delay={i * 90}>
                <div className="h-full rounded-[26px] bg-card p-7 ring-1 ring-line">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-forest-3">
                    <it.icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
                  </span>
                  <h3 className="font-display mt-6 text-[1.4rem] leading-tight">{it.title}</h3>
                  <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-2">{it.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MentorCta({ faces }: { faces: MentorListing[] }) {
  return (
    <section className="px-5 pb-24 sm:px-8 sm:pb-32">
      <Reveal className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[40px] bg-forest text-paper">
        <AdirePattern className="text-gold opacity-[0.09]" size={52} />
        <div className="relative grid items-center gap-12 p-8 sm:p-14 lg:grid-cols-[1.2fr_1fr] lg:p-20">
          <div>
            <p className="eyebrow flex items-center gap-2 text-gold-2">
              <Sparkles className="h-4 w-4" /> For professionals
            </p>
            <h2 className="font-display mt-5 text-[clamp(2.6rem,5.4vw,4.8rem)] leading-[0.98] tracking-[-0.04em] text-balance">
              You are someone&rsquo;s <em className="text-gold-2">proof.</em>
            </h2>
            <p className="mt-6 max-w-lg text-[1.1rem] leading-relaxed text-paper/75">
              Somewhere in Britain, a fifteen-year-old with your surname is wondering whether people like them become people
              like you. A graduate is sending their fortieth application. Give 45 minutes a month and show them.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/become-a-mentor" variant="gold" size="lg" arrow>
                Become a mentor
              </ButtonLink>
              <ButtonLink href="/guide#mentors" variant="outline-light" size="lg">
                What&rsquo;s expected
              </ButtonLink>
            </div>
          </div>
          <div className="relative mx-auto grid w-full max-w-[420px] grid-cols-2 gap-4">
            {faces.map((m, i) => (
              <div key={m.id} className={i % 2 ? "translate-y-10" : ""}>
                <Portrait src={m.photo} name={m.firstName} className="aspect-[3/4] w-full ring-4 ring-forest-2" sizes="220px" />
              </div>
            ))}
            <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-paper px-4 py-2.5 text-[0.82rem] font-semibold text-forest shadow-lift">
              <MessageSquareHeart className="h-4 w-4 text-clay" /> 45 min a month
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
