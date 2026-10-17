import type { Metadata } from "next";
import { AlertTriangle, Check, Ear, Hourglass, Lightbulb, Phone, ShieldCheck, Sprout, X } from "lucide-react";
import { AdireLines, AdirePattern, AsoOke } from "@/components/Patterns";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";
import { GuideNav, type GuideSection } from "./GuideNav";

export const metadata: Metadata = {
  title: "The mentorship guide",
  description: "Clear expectations for mentors, teenagers and parents, so every Village session is safe, warm and worth it.",
};

const SECTIONS: GuideSection[] = [
  { id: "why", label: "Why this matters" },
  { id: "principles", label: "Five principles" },
  { id: "mentors", label: "For mentors" },
  { id: "mentees", label: "For teens" },
  { id: "parents", label: "For parents" },
  { id: "first-session", label: "The first session" },
  { id: "arc", label: "The three-month arc" },
  { id: "questions", label: "Great questions" },
  { id: "boundaries", label: "Boundaries" },
  { id: "safeguarding", label: "Safeguarding" },
  { id: "ending", label: "Ending well" },
  { id: "pledge", label: "The pledge" },
];

export default function GuidePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-indigo text-paper">
        <AdireLines className="text-paper/[0.06]" />
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(closest-side,rgb(195_154_75/0.3),transparent)]" />
        <div className="relative mx-auto max-w-[1320px] px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
          <p className="eyebrow animate-fade-up text-gold-2">The Village guide · 12 minute read</p>
          <h1 className="font-display animate-fade-up mt-6 max-w-4xl text-[clamp(3rem,7.4vw,6.4rem)] leading-[0.94] tracking-[-0.045em] text-balance" style={{ animationDelay: "80ms" }}>
            Mentorship, <em className="text-gold-2">done properly.</em>
          </h1>
          <p className="animate-fade-up mt-7 max-w-2xl text-[1.15rem] leading-relaxed text-paper/75" style={{ animationDelay: "160ms" }}>
            Good intentions are where mentorship starts, not where it ends. This guide sets out what mentors, teenagers and
            parents can expect from each other, so every conversation is safe, warm and genuinely useful.
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            {[
              { href: "#mentors", label: "I'm a mentor" },
              { href: "#mentees", label: "I'm a teenager" },
              { href: "#parents", label: "I'm a parent" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="rounded-full bg-paper/10 px-5 py-3 text-[0.95rem] font-semibold ring-1 ring-paper/20 transition hover:bg-paper hover:text-indigo">
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <AsoOke />
      </section>

      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-20">
        <div className="lg:pt-20">
          <GuideNav sections={SECTIONS} />
        </div>

        <article className="min-w-0 max-w-[760px] pt-10 pb-28 lg:pt-20">
          {/* Why */}
          <Section id="why" eyebrow="01" title={<>It takes a <em>village.</em></>}>
            <div className="prose-village">
              <p>
                Most of us can name the aunty, uncle, teacher or older cousin who once told us something that changed
                everything. A word of encouragement. A door held open. A warning we&rsquo;re glad we heeded.
              </p>
              <p>
                Our children are growing up in Britain surrounded by Nigerian excellence: consultants, engineers, barristers,
                founders, nurses, artists. Yet many never get to sit across from one and ask,{" "}
                <strong>&ldquo;How did you do it?&rdquo;</strong> Village exists to make that conversation ordinary.
              </p>
              <p>
                A mentor is not a tutor, a therapist or a replacement parent. A mentor is a trusted guide who has walked a
                little further down the road and is willing to turn around and describe it honestly.
              </p>
            </div>
          </Section>

          {/* Principles */}
          <Section id="principles" eyebrow="02" title={<>Five principles we <em>all</em> keep.</>}>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Ear, title: "Listen first", body: "The teenager's goals lead. Mentors ask more than they tell, and resist the urge to fix everything." },
                { icon: Hourglass, title: "Show up, consistently", body: "Reliability builds trust faster than brilliance. Be on time, keep commitments, give notice if you can't." },
                { icon: Lightbulb, title: "Be honest", body: "Share the setbacks as well as the successes. Young people learn more from how you recovered than from your CV." },
                { icon: Sprout, title: "Small steps, often", body: "Every session ends with one achievable action. Progress is built in inches, not leaps." },
                { icon: ShieldCheck, title: "Safety, always", body: "Everything happens on Village, with parents informed. Clear boundaries protect everyone, mentors included." },
              ].map((p, i) => (
                <Reveal key={p.title} delay={i * 60} className={i === 4 ? "sm:col-span-2" : ""}>
                  <div className="h-full rounded-[24px] bg-card p-6 ring-1 ring-line">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-forest-3">
                        <p.icon className="h-5 w-5" />
                      </span>
                      <span className="font-display text-[1.8rem] text-gold/70 italic">{i + 1}</span>
                    </div>
                    <h3 className="font-display mt-5 text-[1.4rem]">{p.title}</h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* Mentors */}
          <Section id="mentors" eyebrow="03 · For mentors" title={<>What we ask of <em>mentors.</em></>}>
            <div className="prose-village">
              <p>
                You don&rsquo;t need to be perfect, and you don&rsquo;t need all the answers. You need to be present, prepared and
                principled. Here&rsquo;s what that looks like in practice.
              </p>
            </div>
            <Commitments
              items={[
                ["Time", "One or two 45-minute sessions a month, for at least three months."],
                ["Notice", "Reply to requests within 48 hours. Give 24 hours' notice if you need to cancel."],
                ["Preparation", "Re-read the request and your notes before each session. Five minutes is enough."],
                ["Checks", "An enhanced DBS check, ID verification and two references before your first session."],
              ]}
            />
            <DoDont
              dos={[
                "Ask open questions and let silence do some of the work",
                "Share your real story, including the detours",
                "Agree one small next step at the end of every session",
                "Celebrate effort, not only results",
                "Point them to free resources, schemes and opportunities",
                "Tell us if you're worried about anything, however small",
              ]}
              donts={[
                "Do their homework or write their personal statement",
                "Contact them outside Village, or follow them on social media",
                "Offer money, gifts or lifts, or meet in person without the family",
                "Promise to keep secrets",
                "Push your own career path as the only good one",
                "Criticise their parents, school or faith",
              ]}
            />
          </Section>

          {/* Mentees */}
          <Section id="mentees" eyebrow="04 · For teens" title={<>Getting the most from <em>your</em> mentor.</>}>
            <div className="prose-village">
              <p>
                Your mentor is giving you their time because they believe in you. You don&rsquo;t have to be confident, sure of your
                future, or top of the class. You just have to be curious and willing to try.
              </p>
            </div>
            <Timeline
              steps={[
                { label: "Before", items: ["Write down three questions, even if they feel silly", "Find a quiet spot with good light", "Test your camera and microphone"] },
                { label: "During", items: ["Camera on, phone away", "Be honest about what you don't know", "Take notes: you'll forget more than you think"] },
                { label: "After", items: ["Do the one small step you agreed", "Send a short thank-you message", "Tell a parent if anything felt uncomfortable"] },
              ]}
            />
            <Callout tone="gold" title="Remember">
              It&rsquo;s completely fine to change your mind about what you want to do. That&rsquo;s exactly what exploring is for.
            </Callout>
          </Section>

          {/* Parents */}
          <Section id="parents" eyebrow="05 · For parents" title={<>Your role: <em>present,</em> not in charge.</>}>
            <div className="prose-village">
              <p>
                You know your child better than anyone. Mentors bring something different: distance, a fresh perspective and
                the credibility of someone who isn&rsquo;t their parent. The magic happens when both work together.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { title: "Set it up", body: "Read this guide together. Help your teen choose a mentor and write the first request." },
                { title: "Stay nearby", body: "For under-16s, be in the room for introductions and within earshot throughout." },
                { title: "Step back", body: "Let your child do the talking. Resist answering for them, even when it's tempting." },
                { title: "Follow up", body: "Ask what they learnt, not what they said. Encourage the agreed next step." },
                { title: "Give feedback", body: "Tell the mentor what worked. Tell us if anything didn't." },
                { title: "Keep it here", body: "Keep messages and links on Village, where they're safe and visible to you." },
              ].map((c, i) => (
                <Reveal key={c.title} delay={i * 50}>
                  <div className="h-full rounded-[22px] bg-paper-2/70 p-5 ring-1 ring-line">
                    <p className="font-display text-[1.25rem]">{c.title}</p>
                    <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-2">{c.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* First session */}
          <Section id="first-session" eyebrow="06" title={<>The first <em>45 minutes.</em></>}>
            <div className="prose-village">
              <p>First sessions can feel awkward. A loose structure helps everyone relax. Use this as a guide, not a script.</p>
            </div>
            <div className="mt-8 overflow-hidden rounded-[26px] bg-card ring-1 ring-line">
              <div className="flex h-3">
                {[
                  { w: 5, c: "bg-gold-2" },
                  { w: 10, c: "bg-clay" },
                  { w: 20, c: "bg-forest-3" },
                  { w: 10, c: "bg-indigo-2" },
                ].map((b, i) => (
                  <span key={i} className={b.c} style={{ flex: b.w }} />
                ))}
              </div>
              <ol className="divide-y divide-line">
                {[
                  { t: "0–5", c: "bg-gold-2", title: "Hellos", body: "Parent and teen say hello together. The mentor explains how sessions work and what's okay to talk about." },
                  { t: "5–15", c: "bg-clay", title: "The mentor's story", body: "Where they grew up, what they studied, and the moments that changed their direction. Keep it human." },
                  { t: "15–35", c: "bg-forest-3", title: "The teen's world", body: "What they enjoy, what they're curious about, what feels hard. The mentor listens and asks follow-up questions." },
                  { t: "35–45", c: "bg-indigo-2", title: "One small step", body: "Agree a single, achievable action and a date for the next session. Write it in the Village chat." },
                ].map((r) => (
                  <li key={r.t} className="flex gap-5 p-5 sm:p-6">
                    <div className="w-16 shrink-0">
                      <span className={`mb-2 block h-1.5 w-6 rounded-full ${r.c}`} />
                      <p className="font-display text-[1.15rem] leading-none">{r.t}</p>
                      <p className="text-[0.72rem] text-ink-4">min</p>
                    </div>
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{r.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Section>

          {/* Arc */}
          <Section id="arc" eyebrow="07" title={<>A three-month <em>arc.</em></>}>
            <div className="prose-village">
              <p>Most Village mentorships run for an initial three months. That&rsquo;s long enough to build trust, short enough to stay focused.</p>
            </div>
            <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
              <div className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-line-2 sm:block" />
              {[
                { m: "Month 1", title: "Get to know", body: "Build trust. Understand the teen's interests, strengths and worries. Agree what success looks like." },
                { m: "Month 2", title: "Explore", body: "Investigate options: courses, careers, work experience, competitions. Try one new thing." },
                { m: "Month 3", title: "Act & reflect", body: "Take a concrete step: an application, a project, a conversation. Then look back at how far you've come." },
              ].map((s, i) => (
                <Reveal key={s.m} delay={i * 100} className="relative text-center">
                  <span className="font-display relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest text-[1.2rem] text-paper ring-8 ring-paper">
                    {i + 1}
                  </span>
                  <p className="eyebrow mt-5 text-clay">{s.m}</p>
                  <p className="font-display mt-2 text-[1.5rem]">{s.title}</p>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2">{s.body}</p>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* Questions */}
          <Section id="questions" eyebrow="08" title={<>Questions that <em>open doors.</em></>}>
            <div className="grid gap-5 sm:grid-cols-2">
              <QuestionList
                title="Teens might ask"
                items={[
                  "What were you like at my age?",
                  "What's a normal day in your job?",
                  "What do you wish you'd known at sixteen?",
                  "What was your biggest setback?",
                  "How did you choose your subjects?",
                  "What could I do this month to get started?",
                ]}
              />
              <QuestionList
                title="Mentors might ask"
                items={[
                  "What do you enjoy so much you lose track of time?",
                  "Which lesson do you look forward to most?",
                  "Who do you admire, and why?",
                  "What feels hardest right now?",
                  "If nothing could go wrong, what would you try?",
                  "What would make our next session useful?",
                ]}
              />
            </div>
          </Section>

          {/* Boundaries */}
          <Section id="boundaries" eyebrow="09" title={<>The <em>non-negotiables.</em></>}>
            <div className="prose-village">
              <p>These rules protect young people and mentors alike. Breaking them means leaving Village.</p>
            </div>
            <div className="relative mt-8 overflow-hidden rounded-[26px] bg-forest p-7 text-paper sm:p-9">
              <AdirePattern className="text-gold opacity-[0.07]" size={40} />
              <ul className="relative grid gap-4 sm:grid-cols-2">
                {[
                  "All messages and video calls happen on Village",
                  "No private phone numbers, emails or social media",
                  "No in-person meetings without the family's agreement and presence",
                  "No gifts, money or favours in either direction",
                  "Parents can see every message on their account",
                  "Sessions involving under-16s have a parent nearby",
                ].map((r) => (
                  <li key={r} className="flex gap-3 text-[0.98rem] leading-snug">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-2" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* Safeguarding */}
          <Section id="safeguarding" eyebrow="10" title={<>If something <em>doesn&rsquo;t feel right.</em></>}>
            <div className="prose-village">
              <p>
                Occasionally a young person may share something worrying: about their safety, their health or someone else&rsquo;s
                behaviour. Every mentor must know what to do before it happens.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-5">
              {[
                ["Stay calm", "Listen without showing shock."],
                ["Don't promise secrecy", "Explain you may need to tell someone who can help."],
                ["Don't investigate", "Let them speak; avoid leading questions."],
                ["Write it down", "Their words, the date and time, as soon as you can."],
                ["Report it", "Tell our safeguarding lead within 24 hours."],
              ].map(([t, b], i) => (
                <div key={t} className="rounded-[20px] bg-clay-soft/70 p-4">
                  <span className="font-display text-[1.4rem] text-clay italic">{i + 1}</span>
                  <p className="mt-2 text-[0.92rem] font-semibold leading-snug">{t}</p>
                  <p className="mt-1 text-[0.82rem] leading-snug text-ink-2">{b}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Helpline icon={AlertTriangle} label="Immediate danger" value="999" />
              <Helpline icon={Phone} label="Childline (for young people)" value="0800 1111" />
              <Helpline icon={ShieldCheck} label="Village safeguarding lead" value={BRAND.safeguardingEmail} small />
            </div>
          </Section>

          {/* Ending */}
          <Section id="ending" eyebrow="11" title={<>Ending <em>well.</em></>}>
            <div className="prose-village">
              <p>
                Good mentorships end deliberately rather than fading away. In your final session, look back at the first one.
                What&rsquo;s changed? What has the young person learnt about themselves?
              </p>
              <p>
                Some pairs choose to continue for another three months. Others part with a clear plan and a warm goodbye. Both
                are success. Either way, <strong>say thank you, say well done, and say it out loud.</strong> It may be the
                sentence they remember for years.
              </p>
            </div>
          </Section>

          {/* Pledge */}
          <Section id="pledge" eyebrow="12" title={<>The Village <em>pledge.</em></>}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Pledge
                who="Mentors"
                lines={[
                  "I will show up, on time and prepared.",
                  "I will listen more than I speak.",
                  "I will be honest about my journey.",
                  "I will keep every conversation on Village.",
                  "I will put the young person's safety first.",
                ]}
              />
              <Pledge
                who="Teens"
                lines={[
                  "I will come with questions.",
                  "I will be honest, even when I'm unsure.",
                  "I will try the small steps we agree.",
                  "I will treat my mentor's time as a gift.",
                  "I will speak up if something feels wrong.",
                ]}
              />
            </div>
          </Section>

          <Reveal className="relative mt-24 overflow-hidden rounded-[32px] bg-forest p-9 text-paper sm:p-12">
            <AdirePattern className="text-gold opacity-[0.09]" size={46} />
            <div className="relative">
              <p className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.03em]">
                Ready to <em className="text-gold-2">begin?</em>
              </p>
              <p className="mt-3 max-w-md text-paper/75">The village is ready when you are.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/mentors" variant="gold" size="lg" arrow>
                  Find a mentor
                </ButtonLink>
                <ButtonLink href="/become-a-mentor" variant="outline-light" size="lg">
                  Become a mentor
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </article>
      </div>
    </div>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-36 border-t border-line pt-14 pb-6 first:border-t-0 first:pt-0 lg:scroll-mt-28">
      <Reveal>
        <p className="eyebrow text-clay">{eyebrow}</p>
        <h2 className="font-display mt-4 mb-7 text-[clamp(2.1rem,4vw,3.2rem)] leading-[1.04] tracking-[-0.035em] text-balance">{title}</h2>
      </Reveal>
      {children}
    </section>
  );
}

function Commitments({ items }: { items: [string, string][] }) {
  return (
    <dl className="mt-8 grid gap-px overflow-hidden rounded-[24px] bg-line ring-1 ring-line sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="bg-card p-5">
          <dt className="eyebrow text-gold">{k}</dt>
          <dd className="mt-2 text-[0.95rem] leading-relaxed text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function DoDont({ dos, donts }: { dos: string[]; donts: string[] }) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <div className="rounded-[24px] bg-mint/50 p-6 ring-1 ring-forest-3/10">
        <p className="font-display text-[1.35rem] text-forest">Always</p>
        <ul className="mt-4 space-y-3">
          {dos.map((d) => (
            <li key={d} className="flex gap-3 text-[0.94rem] leading-snug">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-3 text-paper">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {d}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[24px] bg-clay-soft/50 p-6 ring-1 ring-clay/10">
        <p className="font-display text-[1.35rem] text-clay">Never</p>
        <ul className="mt-4 space-y-3">
          {donts.map((d) => (
            <li key={d} className="flex gap-3 text-[0.94rem] leading-snug">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clay text-paper">
                <X className="h-3 w-3" strokeWidth={3} />
              </span>
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Timeline({ steps }: { steps: { label: string; items: string[] }[] }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {steps.map((s, i) => (
        <Reveal key={s.label} delay={i * 80}>
          <div className="h-full rounded-[24px] bg-card p-6 ring-1 ring-line">
            <p className="font-display text-[1.5rem] italic text-forest-3">{s.label}</p>
            <ul className="mt-4 space-y-2.5">
              {s.items.map((it) => (
                <li key={it} className="flex gap-2.5 text-[0.92rem] leading-snug text-ink-2">
                  <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function Callout({ title, children, tone }: { title: string; children: React.ReactNode; tone: "gold" }) {
  return (
    <div className={tone === "gold" ? "mt-6 rounded-[22px] bg-gold-soft/70 p-6" : ""}>
      <p className="eyebrow text-[#8a6a25]">{title}</p>
      <p className="font-display mt-2 text-[1.3rem] leading-snug">{children}</p>
    </div>
  );
}

function QuestionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] bg-card p-6 ring-1 ring-line">
      <p className="font-display text-[1.4rem]">{title}</p>
      <ul className="mt-4 space-y-2">
        {items.map((q) => (
          <li key={q} className="rounded-2xl bg-paper-2/70 px-4 py-3 text-[0.94rem] leading-snug">
            &ldquo;{q}&rdquo;
          </li>
        ))}
      </ul>
    </div>
  );
}

function Helpline({ icon: Icon, label, value, small }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; small?: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-[20px] bg-card p-4 ring-1 ring-line">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-paper">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.78rem] text-ink-3">{label}</p>
        <p className={small ? "truncate text-[0.88rem] font-semibold" : "font-display text-[1.5rem] leading-none"}>{value}</p>
      </div>
    </div>
  );
}

function Pledge({ who, lines }: { who: string; lines: string[] }) {
  return (
    <Reveal>
      <div className="relative h-full overflow-hidden rounded-[28px] bg-card p-1.5 shadow-soft ring-1 ring-line">
        <div className="h-full overflow-hidden rounded-[23px] border border-gold/40">
          <AsoOke />
          <div className="p-7">
          <p className="eyebrow text-center text-gold">The pledge for</p>
          <p className="font-display mt-1 text-center text-[2rem] italic">{who}</p>
          <ol className="mt-6 space-y-3">
            {lines.map((l, i) => (
              <li key={l} className="flex gap-3 text-[0.98rem] leading-snug">
                <span className="font-display w-5 shrink-0 text-gold italic">{i + 1}.</span>
                {l}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-end gap-3 text-[0.78rem] text-ink-4">
            <span className="h-px flex-1 bg-line-2" />
            Signed with a handshake
            <span className="h-px flex-1 bg-line-2" />
          </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

