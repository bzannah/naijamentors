import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, LifeBuoy, MessageCircle } from "lucide-react";
import { AdireLines, SunRings } from "@/components/Patterns";
import { Portrait } from "@/components/Portrait";
import { requireUser } from "@/lib/auth";
import { safeguardingEmail } from "@/lib/env";
import { mentorName, sessionById } from "@/lib/queries";
import { fmtDateLong, fmtTime } from "@/lib/time";
import { Checklist, Countdown } from "./RoomClient";

export const metadata: Metadata = { title: "Session room" };

const agenda = (adult: boolean) => [
  { min: 5, title: "Hellos", body: adult ? "Introductions. Cameras on, smiles ready." : "Introductions with the parent present. Cameras on, smiles ready." },
  { min: 10, title: "The mentor's story", body: "How they got here, including the detours and the setbacks." },
  adult
    ? { min: 20, title: "Where they are now", body: "What they're working towards, what's in the way, what they've already tried." }
    : { min: 20, title: "Their world", body: "What they enjoy, what worries them, what they're curious about." },
  { min: 10, title: "One small step", body: "Agree one achievable action before the next session." },
];

export default async function SessionRoom({ params }: PageProps<"/sessions/[id]">) {
  const { id } = await params;
  const user = await requireUser(undefined, `/sessions/${id}`);
  const s = await sessionById(user, id);
  if (!s) notFound();

  const name = mentorName(s.mentor);
  const end = new Date(new Date(s.start).getTime() + s.durationMin * 60000).toISOString();
  const mentor = user.role === "mentor";
  // An adult mentee holds their own account; under-18s are booked by a parent.
  const adult = s.account.role === "mentee";
  const job = s.mentor.role.split(/[,(]/)[0].toLowerCase();
  const questions = !mentor
    ? adult
      ? [
          "What do you wish you'd known in your first year of work?",
          `What do you wish someone had told you before becoming a ${job}?`,
          "What's a mistake you learnt the most from?",
          "What could I do this month to get closer?",
        ]
      : [
          "What did you enjoy most at my age?",
          `What do you wish someone had told you before becoming a ${job}?`,
          "What's a mistake you learnt the most from?",
          "What could I start doing this month?",
        ]
    : adult
      ? [
          "Where would you like to be in two years?",
          "What have you already tried?",
          "What feels hardest about where you are right now?",
          "Who do you look up to, and why?",
        ]
      : [
          `What made ${s.menteeName} curious about this?`,
          "What does a good week look like for you?",
          "What feels hardest about school right now?",
          "Who do you look up to, and why?",
        ];

  return (
    <div className="relative flex-1 overflow-hidden bg-indigo text-paper">
      <AdireLines className="text-paper/[0.05]" />
      <div className="pointer-events-none absolute top-[-20%] left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(195_154_75/0.22),transparent)]" />

      <div className="relative mx-auto max-w-[1180px] px-5 pt-8 pb-24 sm:px-8">
        <Link href={`/inbox/${s.conversationId}`} className="inline-flex items-center gap-2 text-[0.88rem] font-medium text-paper/70 transition hover:text-paper">
          <ArrowLeft className="h-4 w-4" /> Back to conversation
        </Link>

        <div className="mt-10 text-center">
          <p className="eyebrow text-gold-2">Session room</p>
          <h1 className="font-display mx-auto mt-4 max-w-3xl text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[1] tracking-[-0.04em] text-balance">
            {s.menteeName} <em className="text-gold-2">meets</em> {s.mentor.honorific ? `${s.mentor.honorific} ` : ""}
            {s.mentor.firstName}
          </h1>
          <p className="mt-4 text-[1.05rem] text-paper/70">
            {s.topic} · {fmtDateLong(s.start)}, {fmtTime(s.start)}–{fmtTime(end)}
          </p>
        </div>

        {/* Portraits */}
        <div className="relative mx-auto mt-14 flex max-w-[620px] items-center justify-center gap-6 sm:gap-14">
          <SunRings className="animate-spin-slow absolute top-1/2 left-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 text-gold/30" />
          <figure className="relative w-[42%] max-w-[230px]">
            <Portrait src={s.mentor.photo} name={name} className="aspect-[3/4] w-full ring-[5px] ring-indigo-2" sizes="240px" />
            <figcaption className="mt-3 text-center text-[0.88rem] text-paper/75">{name}</figcaption>
          </figure>
          <figure className="relative w-[42%] max-w-[230px]">
            <Portrait name={`${s.menteeName}`} className="aspect-[3/4] w-full ring-[5px] ring-indigo-2" />
            <figcaption className="mt-3 text-center text-[0.88rem] text-paper/75">
              {s.menteeName}, {s.menteeAge} · {s.stage}
            </figcaption>
          </figure>
        </div>

        <div className="mt-12">
          <Countdown start={s.start} end={end} meetingUrl={s.status === "accepted" ? s.meetingUrl : undefined} status={s.status} />
        </div>

        <div className="mt-20 grid gap-5 lg:grid-cols-3">
          <section className="rounded-[28px] bg-paper/[0.06] p-7 ring-1 ring-paper/10 lg:col-span-2">
            <h2 className="font-display text-[1.6rem]">A simple agenda</h2>
            <p className="mt-1 text-[0.9rem] text-paper/60">From the Naija Mentors guide. Use it loosely; conversation beats structure.</p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {agenda(adult).map((a, i) => (
                <li key={a.title} className="rounded-2xl bg-paper/[0.05] p-5 ring-1 ring-paper/10">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-[1.6rem] text-gold-2 italic">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[0.75rem] font-bold tracking-wider text-paper/50 uppercase">{a.min} min</span>
                  </div>
                  <p className="mt-2 font-semibold">{a.title}</p>
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-paper/65">{a.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[28px] bg-paper/[0.06] p-7 ring-1 ring-paper/10">
            <h2 className="font-display text-[1.6rem]">Before you join</h2>
            <Checklist
              id={s.id}
              items={
                mentor
                  ? ["Read the request and goals again", "Quiet space, camera on", "Your story: highs and setbacks", "One small next step in mind", "The guide, refreshed"]
                  : adult
                    ? ["A quiet room with good light", "Camera and microphone tested", "Your questions written down", "Your CV or work to hand, if it helps", "A notebook and pen"]
                    : ["A quiet room with good light", "Camera and microphone tested", "You're nearby for the start", `${s.menteeName}'s questions written down`, "A notebook and pen"]
              }
            />
          </section>

          <section className="rounded-[28px] bg-paper/[0.06] p-7 ring-1 ring-paper/10 lg:col-span-2">
            <h2 className="font-display text-[1.6rem]">
              {mentor ? "Good questions to ask" : adult ? "Questions you could ask" : `Questions ${s.menteeName} could ask`}
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {questions.map((q) => (
                <span key={q} className="rounded-full bg-paper/[0.08] px-4 py-2.5 text-[0.9rem] text-paper/85 ring-1 ring-paper/10">
                  {q}
                </span>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-gold-2/10 p-4 text-[0.9rem] text-paper/80 ring-1 ring-gold-2/20">
              <strong className="text-gold-2">Goals shared in the request:</strong> {s.goals}
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-[28px] bg-paper/[0.06] p-7 ring-1 ring-paper/10">
            <h2 className="font-display text-[1.6rem]">Need anything?</h2>
            <Link href={`/inbox/${s.conversationId}`} className="flex items-center gap-3 rounded-2xl bg-paper/[0.06] p-4 text-[0.9rem] transition hover:bg-paper/10">
              <MessageCircle className="h-5 w-5 text-gold-2" /> Message {mentor ? s.account.name.split(" ")[0] : s.mentor.firstName}
            </Link>
            {s.status === "accepted" && (
              <a href={`/api/sessions/${s.id}/ics`} className="flex items-center gap-3 rounded-2xl bg-paper/[0.06] p-4 text-[0.9rem] transition hover:bg-paper/10">
                <CalendarPlus className="h-5 w-5 text-gold-2" /> Add to calendar
              </a>
            )}
            <a href={`mailto:${safeguardingEmail()}`} className="flex items-center gap-3 rounded-2xl bg-paper/[0.06] p-4 text-[0.9rem] transition hover:bg-paper/10">
              <LifeBuoy className="h-5 w-5 text-gold-2" /> Raise a safeguarding concern
            </a>
            <p className="mt-auto pt-2 text-[0.78rem] leading-relaxed text-paper/50">
              If anything ever feels wrong, leave the call. In an emergency, call 999.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
