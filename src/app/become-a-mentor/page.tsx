import type { Metadata } from "next";
import { CalendarHeart, Clock, GraduationCap, ShieldCheck } from "lucide-react";
import { AdirePattern, SunRings } from "@/components/Patterns";
import { Avatar, Portrait } from "@/components/Portrait";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { listMentors } from "@/lib/queries";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = {
  title: "Become a mentor",
  description: "Give 45 minutes a month to a British-Nigerian teenager who needs to see what's possible.",
};

export default function BecomeAMentor() {
  const mentors = listMentors();
  const by = (slug: string) => mentors.find((m) => m.slug === slug)!;
  const emeka = by("chukwuemeka-nnamdi");
  const trio = [by("ebiere-tamuno"), emeka, by("aisha-bello")];

  return (
    <div>
      {/* Hero */}
      <section className="grain relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(223_234_223/0.95),transparent)]" />
        <div className="relative mx-auto grid max-w-[1320px] items-center gap-16 px-5 pt-12 pb-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-28">
          <div>
            <p className="eyebrow animate-fade-up text-clay">For British-Nigerian professionals</p>
            <h1 className="font-display animate-fade-up mt-5 text-[clamp(3rem,7vw,6.2rem)] leading-[0.94] tracking-[-0.045em] text-balance" style={{ animationDelay: "80ms" }}>
              You are someone&rsquo;s <em className="text-forest-3">proof.</em>
            </h1>
            <p className="animate-fade-up mt-7 max-w-xl text-[1.15rem] leading-relaxed text-ink-2" style={{ animationDelay: "160ms" }}>
              Somewhere in Britain, a teenager who looks like you, sounds like you and eats jollof like you is quietly wondering
              whether people like them become people like you. Forty-five minutes a month is all it takes to answer.
            </p>
            <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "240ms" }}>
              <ButtonLink href="#apply" size="lg" arrow>
                Start your application
              </ButtonLink>
              <ButtonLink href="/guide#mentors" variant="ghost" size="lg">
                Read what&rsquo;s expected
              </ButtonLink>
            </div>
            <div className="animate-fade-up mt-12 flex items-center gap-4" style={{ animationDelay: "320ms" }}>
              <div className="flex -space-x-3">
                {mentors.slice(0, 6).map((m) => (
                  <Avatar key={m.id} src={m.photo} name={m.firstName} size={40} className="ring-[3px] ring-paper" />
                ))}
              </div>
              <p className="text-[0.9rem] text-ink-2">
                Join <strong className="text-ink">{mentors.length} mentors</strong> already giving back
              </p>
            </div>
          </div>

          <div className="relative mx-auto h-[460px] w-full max-w-[520px] sm:h-[540px]">
            <SunRings className="animate-spin-slow absolute top-1/2 left-1/2 h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2 text-gold/40" />
            <div className="absolute top-[4%] left-[2%] w-[36%]">
              <div className="animate-float-slow">
                <Portrait src={trio[0].photo} name={trio[0].firstName} priority className="aspect-[3/4] w-full shadow-lift ring-[5px] ring-card" sizes="200px" />
              </div>
            </div>
            <div className="absolute top-[12%] left-1/2 w-[44%] -translate-x-[20%]">
              <Portrait src={trio[1].photo} name={trio[1].firstName} priority className="aspect-[3/4] w-full shadow-lift ring-[6px] ring-card" sizes="260px" />
            </div>
            <div className="absolute bottom-[2%] left-[8%] w-[34%]">
              <div className="animate-float" style={{ animationDelay: "1s" }}>
                <Portrait src={trio[2].photo} name={trio[2].firstName} priority className="aspect-[3/4] w-full shadow-lift ring-[5px] ring-card" sizes="200px" />
              </div>
            </div>
            <figure className="absolute right-0 bottom-[6%] w-[62%] rounded-[24px] bg-forest p-5 text-paper shadow-lift sm:right-[-4%]">
              <blockquote className="font-display text-[1.2rem] leading-snug italic">&ldquo;{emeka.quote}&rdquo;</blockquote>
              <figcaption className="mt-3 text-[0.8rem] text-paper/65">
                Emeka · {emeka.role}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* What it takes */}
      <section className="border-y border-line bg-paper-2/60 py-20 sm:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-clay">What it takes</p>
            <h2 className="font-display mt-4 text-[clamp(2.3rem,4.4vw,3.8rem)] leading-[1.02] tracking-[-0.035em] text-balance">
              Less time than you think. <em>More impact than you know.</em>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock, title: "45 minutes a month", body: "One or two video sessions, at times you choose. Evenings and weekends work best for families." },
              { icon: ShieldCheck, title: "We handle the checks", body: "ID verification, references and an enhanced DBS check, arranged and paid for by Village." },
              { icon: GraduationCap, title: "No teaching required", body: "You're not a tutor. You share your story, ask good questions and help them take one step." },
              { icon: CalendarHeart, title: "Fully flexible", body: "Pause any time. Set your availability in seconds, and only accept requests that suit you." },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <div className="h-full rounded-[26px] bg-card p-7 ring-1 ring-line">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-gold-2">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-6 text-[1.45rem] leading-tight">{c.title}</h3>
                  <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-2">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Steps + form */}
      <section id="apply" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-clay">Apply in five minutes</p>
            <h2 className="font-display mt-4 text-[clamp(2.3rem,4.4vw,3.6rem)] leading-[1.02] tracking-[-0.035em]">
              From <em>hello</em> to your first session.
            </h2>
            <ol className="mt-10 space-y-7">
              {[
                ["Apply", "Tell us about your work, your story and when you're free."],
                ["Get verified", "A short call, two references and an enhanced DBS check. We cover the cost."],
                ["Go live", "Your profile appears in the directory for families across the UK."],
                ["Meet", "Accept requests that suit you and meet on secure video, with parents in the loop."],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-5">
                  <span className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-soft text-[1.1rem] text-[#7c5e1f] italic">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="relative mt-10 overflow-hidden rounded-[24px] bg-indigo p-6 text-paper">
              <AdirePattern className="text-paper opacity-[0.06]" size={36} />
              <p className="relative text-[0.92rem] leading-relaxed text-paper/80">
                <strong className="text-gold-2">Not sure yet?</strong> Read the mentor section of the guide first. It takes
                three minutes and answers most questions.
              </p>
            </div>
          </div>
          <ApplyForm />
        </div>
      </section>
    </div>
  );
}
