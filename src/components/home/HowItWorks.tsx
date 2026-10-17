import { Check, Search, Video } from "lucide-react";
import { Avatar, Portrait } from "@/components/Portrait";
import { Reveal } from "@/components/Reveal";
import type { MentorListing } from "@/lib/queries";

export function HowItWorks({ mentors }: { mentors: MentorListing[] }) {
  const [a, b, c] = mentors;
  const steps = [
    {
      n: "01",
      title: "Discover your village",
      body: "Browse mentors by the career your teen dreams of, the city you live in, or the language your family speaks at home.",
      visual: (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 rounded-full bg-card px-4 py-3 text-[0.85rem] text-ink-3 shadow-soft ring-1 ring-line">
            <Search className="h-4 w-4" /> Medicine in Manchester…
          </div>
          {[a, b, c].map((m, i) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-2xl bg-card p-2.5 pr-4 shadow-soft ring-1 ring-line"
              style={{ marginLeft: i * 14 }}
            >
              <Avatar src={m.photo} name={m.firstName} size={38} />
              <div className="min-w-0">
                <p className="truncate text-[0.85rem] font-semibold">
                  {m.honorific} {m.firstName} {m.lastName}
                </p>
                <p className="truncate text-[0.75rem] text-ink-3">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      n: "02",
      title: "Request a session",
      body: "Pick a time from their real availability, tell them a little about your child, and send the request. Mentors reply right here.",
      visual: (
        <div className="rounded-3xl bg-card p-4 shadow-soft ring-1 ring-line">
          <div className="grid grid-cols-4 gap-2 text-center">
            {["Tue", "Thu", "Sat", "Sun"].map((d, i) => (
              <div key={d} className={i === 1 ? "rounded-xl bg-forest py-2 text-paper" : "rounded-xl bg-paper-2 py-2"}>
                <p className="text-[0.65rem] font-semibold tracking-wider uppercase opacity-70">{d}</p>
                <p className="font-display text-lg">{20 + i * 2}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["5:30pm", "6:30pm", "7:30pm"].map((t, i) => (
              <div
                key={t}
                className={
                  i === 1
                    ? "rounded-full bg-gold-2 py-2 text-center text-[0.78rem] font-semibold"
                    : "rounded-full py-2 text-center text-[0.78rem] font-medium ring-1 ring-line-2"
                }
              >
                {t}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-forest py-2.5 text-[0.8rem] font-semibold text-paper">
            Send request
          </div>
        </div>
      ),
    },
    {
      n: "03",
      title: "Meet, face to face",
      body: "Join a secure video session with a parent nearby. Follow up in your inbox, book the next one, and watch your teen's world get bigger.",
      visual: (
        <div className="relative overflow-hidden rounded-3xl bg-indigo p-3 shadow-soft">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Portrait src={a.photo} name={a.firstName} shape="none" className="absolute inset-0" sizes="200px" />
              <span className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                {a.honorific} {a.firstName}
              </span>
            </div>
            <div className="relative flex aspect-[4/5] items-center justify-center rounded-2xl bg-gradient-to-br from-clay to-gold">
              <span className="font-display text-4xl text-paper italic">T</span>
              <span className="absolute bottom-2 left-2 rounded-full bg-black/35 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                Tobi, 15
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-paper/80">
              <Check className="h-3.5 w-3.5 text-[#6fd39b]" /> Parent present
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay text-paper">
              <Video className="h-4 w-4" />
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow text-clay">How it works</p>
            <h2 className="font-display mt-4 max-w-2xl text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] tracking-[-0.035em] text-balance">
              Three steps from <em>“who do we ask?”</em> to a mentor who cares.
            </h2>
          </div>
          <p className="max-w-sm text-[1.02rem] leading-relaxed text-ink-2">
            No fees, no agencies, no awkward cold emails. Parents stay in control from the very first message.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="group flex h-full flex-col rounded-[32px] bg-paper-2/70 p-7 ring-1 ring-line transition duration-500 hover:bg-paper-2 sm:p-8">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[3.2rem] leading-none text-gold italic">{s.n}</span>
                  <span className="h-px flex-1 translate-y-[-0.6rem] bg-line-2 mx-5" />
                </div>
                <h3 className="font-display mt-6 text-[1.75rem] leading-tight tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-2">{s.body}</p>
                <div className="mt-8 flex flex-1 items-end">
                  <div className="w-full transition duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">{s.visual}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
