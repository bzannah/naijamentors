import type { Metadata } from "next";
import { Check, Download, X } from "lucide-react";
import { Lockup, LogoMark } from "@/components/Logo";
import { AdireLines, AdirePattern, AsoOke, SunRings, VillageLine } from "@/components/Patterns";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { MARK } from "@/lib/logo";

export const metadata: Metadata = {
  title: "Brand & logo",
  description: "The story behind the Naija Mentors identity, and everything you need to use it well: logos, colours, type and voice.",
};

const FILES = "/brand/naija-mentors";

export default function BrandPage() {
  return (
    <div>
      <Hero />
      <Name />
      <Story />
      <Village />
      <Logos />
      <Spacing />
      <Colour />
      <Type />
      <Motifs />
      <Voice />
      <Misuse />
      <Downloads />
    </div>
  );
}

/* ---------------------------------------------------------------- hero */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-forest text-paper">
      <AdireLines className="text-paper/[0.05]" />
      <div className="pointer-events-none absolute -top-48 right-[-12%] h-[760px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgb(226_200_143/0.22),transparent)]" />
      <div className="relative mx-auto grid max-w-[1320px] items-center gap-14 px-5 pt-14 pb-20 sm:px-8 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pb-28">
        <div>
          <p className="eyebrow animate-fade-up text-gold-2">Brand &amp; logo</p>
          <h1
            className="font-display animate-fade-up mt-6 text-[clamp(3rem,7vw,6.2rem)] leading-[0.95] tracking-[-0.045em] text-balance"
            style={{ animationDelay: "80ms" }}
          >
            <span className="block">One line.</span>
            <em className="block text-gold-2">Two people.</em>
            <span className="block">A whole village.</span>
          </h1>
          <p className="animate-fade-up mt-7 max-w-xl text-[1.15rem] leading-relaxed text-paper/75 text-pretty" style={{ animationDelay: "160ms" }}>
            The story behind the {BRAND.name} identity, and everything you need to use it well: the logo, our colours, our
            type and the way we talk.
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <ButtonLink href="#downloads" variant="gold" size="lg">
              <Download className="h-4 w-4" strokeWidth={2.2} /> Download the logo
            </ButtonLink>
            <ButtonLink href="#story" variant="outline-light" size="lg">
              Read the story
            </ButtonLink>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px]">
          <SunRings className="animate-spin-slow absolute top-1/2 left-1/2 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2 text-gold-2/30" />
          <div className="arch absolute inset-0 bg-forest-2 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.5)] ring-1 ring-paper/10">
            <div className="arch absolute inset-3 ring-1 ring-gold-2/35" />
          </div>
          <svg viewBox={MARK.viewBox} className="mark-draw absolute top-[55%] left-1/2 h-[46%] w-auto -translate-x-1/2 -translate-y-1/2 overflow-visible" aria-hidden>
            <path d={MARK.line} pathLength={1} fill="none" stroke="var(--color-paper)" strokeWidth={MARK.stroke} strokeLinecap="round" strokeLinejoin="round" />
            <circle {...MARK.mentor} fill="var(--color-paper)" />
            <circle {...MARK.young} fill="var(--color-gold-2)" />
          </svg>
        </div>
      </div>
      <AsoOke />
    </section>
  );
}

/* ---------------------------------------------------------------- name */

function Name() {
  const rules = [
    { ok: true, text: "Naija Mentors" },
    { ok: true, text: "naijamentors.com" },
    { ok: false, text: "NaijaMentors" },
    { ok: false, text: "Naija mentors" },
    { ok: false, text: "NM" },
  ];
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow text-clay">The name</p>
          <h2 className="font-display mt-4 max-w-3xl text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
            What we call home, and <em>who we are.</em>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-[32px] bg-line ring-1 ring-line md:grid-cols-2">
          {[
            {
              word: "Naija",
              say: "/ˈnaɪ.dʒə/ · noun, informal",
              def: "Nigeria, said with love. What the diaspora calls home, and what our young people already call themselves.",
            },
            {
              word: "Mentors",
              say: "/ˈmɛn.tɔːz/ · noun",
              def: "People who have walked the road and turn back to light it. Our community has them in abundance.",
            },
          ].map((w, i) => (
            <Reveal key={w.word} delay={i * 120} className="bg-card p-8 sm:p-12">
              <p className="font-display text-[clamp(3.4rem,7vw,5.6rem)] leading-none tracking-[-0.045em] text-forest">{w.word}</p>
              <p className="mt-4 text-[0.85rem] font-semibold tracking-wide text-ink-3">{w.say}</p>
              <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-ink-2">{w.def}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-[1.02rem] leading-relaxed text-ink-2">
            Two words, both capitalised. Our line is <strong className="font-semibold text-ink">{BRAND.tagline}</strong> It comes from
            the Igbo proverb <em className="italic-display text-forest">Ora na-azụ nwa</em>: it is the community that raises a child.
          </p>
          <ul className="flex flex-wrap gap-2">
            {rules.map((r) => (
              <li
                key={r.text}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.9rem] font-medium ring-1",
                  r.ok ? "bg-mint text-forest ring-forest-3/20" : "text-ink-3 line-through decoration-clay/60 ring-line-2",
                )}
              >
                {r.ok ? <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> : <X className="h-3.5 w-3.5 text-clay" strokeWidth={2.6} />}
                {r.text}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- the mark, step by step */

type Part = "mentor" | "reach" | "young" | "all";

function StoryMark({ part }: { part: Part }) {
  const faint = "var(--color-paper-3)";
  const ink = "var(--color-forest)";
  const [start, len] = part === "all" ? [0, MARK.length] : MARK.parts[part];
  return (
    <svg viewBox={MARK.viewBox} className="h-36 w-auto overflow-visible sm:h-40" aria-hidden>
      <path d={MARK.line} fill="none" stroke={faint} strokeWidth={MARK.stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={MARK.line}
        pathLength={MARK.length}
        strokeDasharray={`${len} ${MARK.length * 2}`}
        strokeDashoffset={-start}
        fill="none"
        stroke={ink}
        strokeWidth={MARK.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle {...MARK.mentor} fill={part === "mentor" || part === "all" ? ink : faint} />
      <circle {...MARK.young} fill={part === "young" || part === "all" ? "var(--color-gold)" : faint} />
    </svg>
  );
}

function Story() {
  const steps: { part: Part; title: string; body: string }[] = [
    { part: "mentor", title: "The mentor stands tall.", body: "Someone who has walked the road: the paediatrician, the engineer, the barrister, the founder." },
    { part: "reach", title: "They reach back.", body: "Mentorship is a hand extended downwards, to the place where someone else is just starting out." },
    { part: "young", title: "The next one rises.", body: "From exactly where the mentor's reach lands, a young person climbs. Their head is gold: they are the point." },
    { part: "all", title: "Together, an N.", body: "One unbroken line, the N of Naija. Lift as you climb, drawn without lifting the pen." },
  ];
  return (
    <section id="story" className="relative scroll-mt-20 bg-paper-2/60 py-24 sm:py-32">
      <AsoOke className="absolute top-0 opacity-90" />
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow text-clay">The mark</p>
            <h2 className="font-display mt-4 text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
              Look closer. <em>It&rsquo;s two people.</em>
            </h2>
          </div>
          <p className="max-w-lg text-[1.05rem] leading-relaxed text-ink-2 lg:justify-self-end">
            At a glance it&rsquo;s a confident N. Look again and you&rsquo;ll find a mentor and a young person, joined by a single line
            that climbs, reaches back and rises again.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.part} delay={i * 110}>
              <div className="flex h-full flex-col rounded-[28px] bg-card p-7 ring-1 ring-line">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[1.5rem] leading-none text-ink-4 italic">0{i + 1}</span>
                </div>
                <div className="my-10 flex justify-center">
                  <StoryMark part={s.part} />
                </div>
                <h3 className="font-display text-[1.45rem] leading-tight">{s.title}</h3>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- the village line */

function Village() {
  return (
    <section className="relative overflow-hidden bg-forest pt-24 text-paper sm:pt-32">
      <AdirePattern className="text-gold opacity-[0.06]" size={56} />
      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-gold-2">The village line</p>
          <h2 className="font-display mt-4 text-[clamp(2.5rem,5vw,4.4rem)] leading-[1] tracking-[-0.035em] text-balance">
            Keep drawing, and it becomes <em className="text-gold-2">a village.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[1.08rem] leading-relaxed text-paper/75">
            One person is a line. Two is mentorship. Many is a village. The village line is the mark, continued: our signature for
            beginnings, endings and moments worth celebrating. Use it to frame a page, never as wallpaper.
          </p>
        </Reveal>
      </div>
      <Reveal className="relative mt-16 pb-0">
        <VillageLine className="text-paper" accent="var(--color-gold-2)" count={36} height={120} offset={3} />
      </Reveal>
    </section>
  );
}

/* ---------------------------------------------------------------- logo family */

function DownloadLinks({ links, light }: { links: { label: string; href: string }[]; light?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          download
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold ring-1 transition",
            light ? "text-paper/85 ring-paper/25 hover:bg-paper hover:text-forest" : "text-ink-2 ring-line-2 hover:bg-forest hover:text-paper hover:ring-forest",
          )}
        >
          <Download className="h-3.5 w-3.5" strokeWidth={2.2} />
          {l.label}
        </a>
      ))}
    </div>
  );
}

function LogoCard({
  title,
  note,
  dark,
  className,
  links,
  children,
}: {
  title: string;
  note: string;
  dark?: boolean;
  className?: string;
  links: { label: string; href: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden rounded-[28px] ring-1", dark ? "bg-forest text-paper ring-forest" : "bg-card ring-line", className)}>
      <div className="relative flex min-h-[240px] flex-1 items-center justify-center p-6 sm:min-h-[260px] sm:p-10">
        {dark && <AdireLines className="text-paper/[0.04]" />}
        <div className="relative flex max-w-full min-w-0 justify-center">{children}</div>
      </div>
      <div className={cn("flex flex-wrap items-end justify-between gap-4 border-t p-6", dark ? "border-paper/10" : "border-line")}>
        <div>
          <h3 className="font-display text-[1.3rem] leading-tight">{title}</h3>
          <p className={cn("mt-1 text-[0.85rem]", dark ? "text-paper/60" : "text-ink-3")}>{note}</p>
        </div>
        <DownloadLinks links={links} light={dark} />
      </div>
    </div>
  );
}

function Logos() {
  return (
    <section id="logo" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow text-clay">The logo family</p>
          <h2 className="font-display mt-4 max-w-3xl text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
            One idea, <em>dressed for every room.</em>
          </h2>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2">
            The wordmark is set in Fraunces and drawn as artwork, so it looks the same everywhere. Use the horizontal logo by
            default, the stacked logo when space is square, and the mark on its own only where {BRAND.name} is already clear.
          </p>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-6">
          <Reveal className="lg:col-span-4">
            <LogoCard
              title="Primary logo"
              note="Forest and gold on paper. Our default."
              links={[
                { label: "SVG", href: `${FILES}-logo.svg` },
                { label: "PNG", href: `${FILES}-logo.png` },
              ]}
            >
              <Lockup title={BRAND.name} className="h-14 max-w-full sm:h-24" />
            </LogoCard>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-2">
            <LogoCard
              title="Mark"
              note="For small, familiar places."
              links={[
                { label: "SVG", href: `${FILES}-mark.svg` },
                { label: "Reversed", href: `${FILES}-mark-reversed.svg` },
              ]}
            >
              <LogoMark className="h-32" title={`${BRAND.name} mark`} />
            </LogoCard>
          </Reveal>
          <Reveal className="lg:col-span-3">
            <LogoCard
              dark
              title="Reversed"
              note="Paper and light gold on forest."
              links={[
                { label: "SVG", href: `${FILES}-logo-reversed.svg` },
                { label: "PNG", href: `${FILES}-logo-reversed.png` },
              ]}
            >
              <Lockup tone="light" title={BRAND.name} className="h-12 max-w-full sm:h-[72px]" />
            </LogoCard>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-3">
            <LogoCard
              title="Stacked"
              note="For square spaces, signage and merch."
              className="bg-paper-2"
              links={[
                { label: "SVG", href: `${FILES}-logo-stacked.svg` },
                { label: "Reversed", href: `${FILES}-logo-stacked-reversed.svg` },
              ]}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${FILES}-logo-stacked.svg`} alt={`${BRAND.name} stacked logo`} className="h-32 w-auto max-w-full object-contain sm:h-44" />
            </LogoCard>
          </Reveal>
          <Reveal className="lg:col-span-3">
            <LogoCard
              title="App icon"
              note="Home screens, favicons and avatars."
              className="bg-paper-2"
              links={[
                { label: "PNG 1024", href: `${FILES}-app-icon.png` },
                { label: "SVG", href: `${FILES}-app-icon.svg` },
              ]}
            >
              <div className="flex items-end gap-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${FILES}-app-icon.svg`} alt={`${BRAND.name} app icon`} className="h-36 w-36 rounded-[34px] shadow-lift" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${FILES}-app-icon.svg`} alt="" className="h-16 w-16 rounded-[15px] shadow-soft" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${FILES}-app-icon.svg`} alt="" className="h-8 w-8 rounded-[8px]" />
              </div>
            </LogoCard>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-3">
            <LogoCard
              dark
              title="The seal"
              note="Certificates, the mentor pledge, stickers."
              links={[
                { label: "SVG", href: `${FILES}-seal.svg` },
                { label: "PNG", href: `${FILES}-seal.png` },
              ]}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${FILES}-seal.svg`} alt={`${BRAND.name} seal: It takes a village`} className="h-48 w-48 sm:h-56 sm:w-56" />
            </LogoCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- clear space & size */

function Spacing() {
  return (
    <section className="pb-24 sm:pb-32">
      <div className="mx-auto grid max-w-[1320px] gap-5 px-5 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-[28px] bg-card p-8 ring-1 ring-line sm:p-14">
          {/* x = the x-height of the wordmark at this size (0.48em of a 0.7em cap height) */}
          <div className="relative max-w-full rounded-[4px] border border-dashed border-clay/50 bg-[repeating-linear-gradient(135deg,rgb(180_85_45/0.08)_0_6px,transparent_6px_12px)] p-[17px] sm:p-[33px]">
            <div className="bg-card">
              <Lockup className="h-[42px] sm:h-[84px]" title={BRAND.name} />
            </div>
            {["top-0 left-0", "right-0 bottom-0"].map((pos) => (
              <span key={pos} className={cn("font-display absolute flex h-[17px] w-[17px] items-center justify-center text-[0.8rem] text-clay italic sm:h-[33px] sm:w-[33px] sm:text-[0.95rem]", pos)}>
                x
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={100} className="flex flex-col justify-center rounded-[28px] bg-paper-2 p-8 ring-1 ring-line sm:p-10">
          <p className="eyebrow text-clay">Space &amp; size</p>
          <h3 className="font-display mt-4 text-[2rem] leading-[1.05] tracking-[-0.02em]">Give it room to breathe.</h3>
          <dl className="mt-6 space-y-4 text-[0.98rem] leading-relaxed text-ink-2">
            <div>
              <dt className="font-semibold text-ink">Clear space</dt>
              <dd>At least x on every side, where x is the height of the &lsquo;a&rsquo; in Naija.</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Smallest logo</dt>
              <dd>120px wide on screen, 30mm in print.</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Smallest mark</dt>
              <dd>20px tall. Below that, use the app icon.</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- colour */

const COLOURS = [
  { name: "Forest", hex: "#0E3B2E", rgb: "14 59 46", role: "The green of home. Buttons, the logo and big, confident fields.", bg: "bg-forest", fg: "text-paper", share: 26 },
  { name: "Paper", hex: "#F6F1E7", rgb: "246 241 231", role: "Warm, like a well-read letter. Our canvas, never stark white.", bg: "bg-paper ring-1 ring-inset ring-line-2", fg: "text-ink", share: 54 },
  { name: "Gold", hex: "#C39A4B", rgb: "195 154 75", role: "The young person's gold. Used sparingly, so it always means potential.", bg: "bg-gold", fg: "text-ink", share: 8, also: "Light gold #E2C88F on forest" },
  { name: "Clay", hex: "#B4552D", rgb: "180 85 45", role: "Red earth. Eyebrows, alerts and the occasional spark.", bg: "bg-clay", fg: "text-paper", share: 5 },
  { name: "Indigo", hex: "#161E38", rgb: "22 30 56", role: "Adire indigo. Depth for long reads and quiet moments.", bg: "bg-indigo", fg: "text-paper", share: 4 },
  { name: "Ink", hex: "#17140F", rgb: "23 20 15", role: "Body text. Warm, and never pure black.", bg: "bg-ink", fg: "text-paper", share: 3 },
];

function Colour() {
  return (
    <section className="grain relative overflow-hidden bg-paper-2 py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="eyebrow text-clay">Colour</p>
            <h2 className="font-display mt-4 text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
              Green for home. <em>Gold for who&rsquo;s next.</em>
            </h2>
          </div>
          <p className="max-w-lg text-[1.05rem] leading-relaxed text-ink-2 lg:justify-self-end">
            A palette drawn from the flag, red earth and Adire cloth. Mostly paper and forest, with gold kept rare enough to
            matter.
          </p>
        </Reveal>

        <Reveal className="mt-12 flex h-4 overflow-hidden rounded-full ring-1 ring-line">
          {COLOURS.map((c) => (
            <span key={c.name} className={cn(c.bg, "ring-0")} style={{ width: `${c.share}%` }} title={`${c.name} · about ${c.share}%`} />
          ))}
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLOURS.map((c, i) => (
            <Reveal key={c.name} delay={(i % 3) * 90}>
              <div className="h-full overflow-hidden rounded-[26px] bg-card ring-1 ring-line">
                <div className={cn("flex h-40 items-end justify-between p-6", c.bg, c.fg)}>
                  <span className="font-display text-[1.9rem] leading-none">{c.name}</span>
                  <span className="text-[0.8rem] font-semibold opacity-80">≈{c.share}%</span>
                </div>
                <div className="p-6">
                  <p className="font-mono text-[0.85rem] text-ink-2">
                    {c.hex} <span className="text-ink-4">·</span> RGB {c.rgb}
                  </p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">{c.role}</p>
                  {c.also && <p className="mt-2 text-[0.82rem] text-ink-3">{c.also}</p>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- type */

function Type() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow text-clay">Typography</p>
          <h2 className="font-display mt-4 max-w-3xl text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
            A warm voice, <em>a clear head.</em>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <Reveal className="rounded-[28px] bg-card p-8 ring-1 ring-line sm:p-12">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="font-display text-[1.6rem]">Fraunces</h3>
                <p className="mt-1 text-[0.9rem] text-ink-3">Display · headlines and the wordmark</p>
              </div>
              <span className="font-display text-[5.5rem] leading-[0.8] tracking-[-0.04em] text-forest">
                A<em>a</em>
              </span>
            </div>
            <p className="font-display mt-12 text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.035em] text-balance">
              It takes a <em className="text-forest-3">village</em> to raise a generation.
            </p>
            <p className="mt-8 text-[0.95rem] leading-relaxed text-ink-2">
              Soft, generous and a little wonky in italic. Put the heart of a headline in italic, one phrase at most, the way you
              would lean on a word out loud.
            </p>
          </Reveal>
          <Reveal delay={100} className="rounded-[28px] bg-forest p-8 text-paper ring-1 ring-forest sm:p-12">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="font-display text-[1.6rem]">Instrument Sans</h3>
                <p className="mt-1 text-[0.9rem] text-paper/60">Text · interface, forms and everything you read</p>
              </div>
              <span className="text-[5.5rem] leading-[0.8] font-semibold tracking-[-0.04em] text-gold-2">Aa</span>
            </div>
            <p className="mt-12 text-[1.25rem] leading-relaxed text-paper/90">
              Whether you&rsquo;re fifteen or twenty-five, meet the doctors, engineers, lawyers and founders of our own community,
              in free, safe video sessions.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[0.9rem] text-paper/70">
              <span>Regular 400</span>
              <span className="font-medium">Medium 500</span>
              <span className="font-semibold">Semibold 600</span>
              <span className="eyebrow text-gold-2">Eyebrow caps</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- motifs */

function Motifs() {
  return (
    <section className="relative overflow-hidden bg-indigo py-24 text-paper sm:py-32">
      <AdireLines className="text-paper/[0.06]" />
      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow text-gold-2">Motifs</p>
          <h2 className="font-display mt-4 max-w-3xl text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
            Woven from <em className="text-gold-2">our own cloth.</em>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MotifCard title="The arch" body="Every mentor is framed in an arch: a doorway, held open.">
            <div className="arch h-40 w-28 bg-gradient-to-b from-gold-2 to-clay" />
          </MotifCard>
          <MotifCard title="Adire circles" body="From Yoruba resist-dyed cloth. Texture at low opacity, never loud.">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-forest">
              <AdirePattern className="text-gold-2 opacity-60" size={40} />
            </div>
          </MotifCard>
          <MotifCard title="Aso-oke stripe" body="A thin woven edge that opens and closes sections.">
            <div className="flex h-40 w-full flex-col justify-center gap-3">
              <AsoOke className="h-2 rounded-full" />
              <AsoOke className="h-2 rounded-full opacity-70" />
              <AsoOke className="h-2 rounded-full opacity-40" />
            </div>
          </MotifCard>
          <MotifCard title="Sun rings" body="A quiet halo behind faces and the mark. It turns, slowly.">
            <SunRings className="animate-spin-slow h-40 w-40 text-gold-2/70" />
          </MotifCard>
        </div>
      </div>
    </section>
  );
}

function MotifCard({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <Reveal className="h-full">
      <div className="flex h-full flex-col rounded-[26px] bg-paper/[0.06] p-6 ring-1 ring-paper/10">
        <div className="flex flex-1 items-center justify-center py-4">{children}</div>
        <h3 className="font-display mt-6 text-[1.4rem]">{title}</h3>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-paper/70">{body}</p>
      </div>
    </Reveal>
  );
}

/* ---------------------------------------------------------------- voice */

function Voice() {
  const traits = [
    { t: "Warm, not soft.", b: "We sound like family, and we still hold the line on safety." },
    { t: "Proud, not loud.", b: "Our people's achievements speak for themselves. We let them." },
    { t: "Clear, not clinical.", b: "Short sentences. Real words. Nothing a parent has to read twice." },
    { t: "Naija, never a caricature.", b: "A wink, a proverb, a little pidgin when it fits. No costume." },
  ];
  const pairs = [
    { yes: "Give 45 minutes a month. Change what a young person believes is possible.", no: "Leverage your expertise to empower underserved youth." },
    { yes: "Tell Tobi to bring her toughest question.", no: "Mentees are encouraged to prepare questions in advance." },
  ];
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.3fr]">
          <Reveal>
            <p className="eyebrow text-clay">Voice</p>
            <h2 className="font-display mt-4 text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
              Talk like the auntie <em>who made it.</em>
            </h2>
            <ul className="mt-10 space-y-6">
              {traits.map((x) => (
                <li key={x.t} className="border-l-2 border-gold pl-5">
                  <p className="font-display text-[1.35rem] leading-tight">{x.t}</p>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{x.b}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <div className="grid content-start gap-4">
            {pairs.map((p, i) => (
              <Reveal key={p.yes} delay={i * 100} className="grid gap-px overflow-hidden rounded-[26px] bg-line ring-1 ring-line sm:grid-cols-2">
                <div className="bg-card p-7">
                  <p className="flex items-center gap-2 text-[0.75rem] font-bold tracking-wider text-leaf uppercase">
                    <Check className="h-4 w-4" strokeWidth={2.6} /> Say
                  </p>
                  <p className="font-display mt-4 text-[1.35rem] leading-snug">&ldquo;{p.yes}&rdquo;</p>
                </div>
                <div className="bg-paper-2/70 p-7">
                  <p className="flex items-center gap-2 text-[0.75rem] font-bold tracking-wider text-clay uppercase">
                    <X className="h-4 w-4" strokeWidth={2.6} /> Not
                  </p>
                  <p className="mt-4 text-[1.05rem] leading-snug text-ink-3">&ldquo;{p.no}&rdquo;</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={200} className="relative overflow-hidden rounded-[26px] bg-forest p-8 text-paper sm:p-10">
              <AdirePattern className="text-gold opacity-[0.08]" size={44} />
              <p className="eyebrow relative text-gold-2">Said with a wink</p>
              <p className="font-display relative mt-4 text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.08] tracking-[-0.02em] text-balance">
                Finally, <em className="text-gold-2">village people</em> who want you to win.
              </p>
              <p className="relative mt-4 max-w-lg text-[0.95rem] leading-relaxed text-paper/70">
                Every Nigerian knows the joke: when life goes wrong, blame your village people. We are the other kind.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- misuse */

function Misuse() {
  const wrong = [
    { label: "Don't recolour the heads", el: <MisusedMark headL="var(--color-gold)" headR="var(--color-clay)" /> },
    { label: "Don't stretch or squash", el: <div className="scale-x-[1.45]"><LogoMark className="h-24" /></div> },
    { label: "Don't swap the people", el: <MisusedMark swap /> },
    {
      label: "Don't place it on busy pattern",
      el: (
        <div className="relative flex h-28 w-40 items-center justify-center overflow-hidden rounded-2xl bg-clay">
          <AdirePattern className="text-gold-2 opacity-80" size={22} />
          <LogoMark className="relative h-16" />
        </div>
      ),
    },
  ];
  return (
    <section className="pb-24 sm:pb-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow text-clay">Please don&rsquo;t</p>
          <h2 className="font-display mt-4 max-w-3xl text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] tracking-[-0.03em] text-balance">
            The people in the mark are real to us. <em>Treat them kindly.</em>
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {wrong.map((w, i) => (
            <Reveal key={w.label} delay={i * 80}>
              <div className="flex h-full flex-col rounded-[26px] bg-card ring-1 ring-line">
                <div className="relative flex h-48 items-center justify-center">
                  {w.el}
                  <span className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-clay-soft text-clay">
                    <X className="h-4 w-4" strokeWidth={2.6} />
                  </span>
                </div>
                <p className="border-t border-line px-6 py-4 text-[0.92rem] font-medium text-ink-2">{w.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MisusedMark({ headL = "var(--color-forest)", headR = "var(--color-gold)", swap }: { headL?: string; headR?: string; swap?: boolean }) {
  return (
    <svg viewBox={MARK.viewBox} className="h-24 w-auto overflow-visible text-forest" aria-hidden>
      <path d={MARK.line} fill="none" stroke="currentColor" strokeWidth={MARK.stroke} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={swap ? MARK.young.cx : MARK.mentor.cx} cy={MARK.mentor.cy} r={MARK.mentor.r} fill={swap ? headR : headL} />
      <circle cx={swap ? MARK.mentor.cx : MARK.young.cx} cy={MARK.young.cy} r={MARK.young.r} fill={swap ? headL : headR} />
    </svg>
  );
}

/* ---------------------------------------------------------------- downloads */

function Downloads() {
  const rows = [
    { name: "Primary logo", detail: "Horizontal · colour", files: [["SVG", `${FILES}-logo.svg`], ["PNG", `${FILES}-logo.png`]] },
    { name: "Reversed logo", detail: "Horizontal · for dark backgrounds", files: [["SVG", `${FILES}-logo-reversed.svg`], ["PNG", `${FILES}-logo-reversed.png`]] },
    { name: "One-colour logo", detail: "Horizontal · ink", files: [["SVG", `${FILES}-logo-black.svg`]] },
    { name: "Stacked logo", detail: "Colour and reversed", files: [["SVG", `${FILES}-logo-stacked.svg`], ["Reversed SVG", `${FILES}-logo-stacked-reversed.svg`]] },
    { name: "Mark", detail: "Colour and reversed", files: [["SVG", `${FILES}-mark.svg`], ["Reversed SVG", `${FILES}-mark-reversed.svg`]] },
    { name: "App icon", detail: "Square, full bleed", files: [["PNG 1024", `${FILES}-app-icon.png`], ["SVG", `${FILES}-app-icon.svg`]] },
    { name: "Seal", detail: "It takes a village", files: [["SVG", `${FILES}-seal.svg`], ["PNG", `${FILES}-seal.png`]] },
    { name: "Social image", detail: "1200 × 630, for link previews", files: [["PNG", "/opengraph-image.png"]] },
  ] as const;
  return (
    <section id="downloads" className="scroll-mt-20 px-5 pb-24 sm:px-8 sm:pb-32">
      <Reveal className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[40px] bg-forest text-paper">
        <AdirePattern className="text-gold opacity-[0.07]" size={52} />
        <div className="relative grid gap-12 p-8 sm:p-14 lg:grid-cols-[0.8fr_1.2fr] lg:p-16">
          <div>
            <p className="eyebrow text-gold-2">Downloads</p>
            <h2 className="font-display mt-4 text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1] tracking-[-0.035em] text-balance">
              Everything, <em className="text-gold-2">ready to use.</em>
            </h2>
            <p className="mt-6 max-w-sm text-[1.02rem] leading-relaxed text-paper/70">
              Vector files for anything printed or large, PNGs for documents and slides. Writing about us? Say hello at{" "}
              <a href={`mailto:hello@${BRAND.domain}`} className="text-paper underline decoration-gold-2 underline-offset-4">
                hello@{BRAND.domain}
              </a>
              .
            </p>
          </div>
          <ul className="divide-y divide-paper/10 border-y border-paper/10">
            {rows.map((r) => (
              <li key={r.name} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-[0.85rem] text-paper/55">{r.detail}</p>
                </div>
                <DownloadLinks light links={r.files.map(([label, href]) => ({ label, href }))} />
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
