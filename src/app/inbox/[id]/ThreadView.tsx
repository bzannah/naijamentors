"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useLayoutEffect, useOptimistic, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowUp,
  CalendarCheck,
  CalendarPlus,
  CalendarX,
  CheckCircle2,
  DoorOpen,
  Loader2,
  ShieldCheck,
  Video,
} from "lucide-react";
import { cancelSession, markRead, respondToSession, sendMessage } from "@/app/actions";
import { Avatar } from "@/components/Portrait";
import { cn } from "@/lib/cn";
import type { SessionStatus } from "@/lib/types";

export type ThreadMessage = {
  id: string;
  kind: "text" | "request" | "system";
  senderId: string;
  body: string;
  sessionId?: string;
  createdAt: string;
  time: string;
  dayKey: string;
  dayLabel: string;
};

export type SessionCardData = {
  id: string;
  status: SessionStatus;
  topic: string;
  goals: string;
  meetingUrl?: string;
  dateLong: string;
  relDay: string;
  time: string;
  wd: string;
  dn: string;
  mo: string;
  endTime: string;
  joinable: boolean;
  past: boolean;
};

type Props = {
  conversationId: string;
  viewer: { id: string; role: "parent" | "mentor" };
  header: { name: string; photo?: string; subtitle: string; href?: string };
  mentee: { name: string; age: number; schoolYear: string };
  mentor: { userId: string; firstName: string; displayName: string; short: string; replies: string };
  parent: { id: string; firstName: string; name: string; city?: string };
  messages: ThreadMessage[];
  sessions: Record<string, SessionCardData>;
  justSent: boolean;
};

export function ThreadView(props: Props) {
  const { conversationId, viewer, header, mentee, mentor, parent, sessions } = props;
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSent, setShowSent] = useState(props.justSent);
  const [messages, addOptimistic] = useOptimistic(props.messages, (state, msg: ThreadMessage) => [...state, msg]);

  // Live-ish updates: refresh the server data every few seconds while visible.
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 5000);
    return () => clearInterval(t);
  }, [router]);

  useEffect(() => {
    markRead(conversationId);
  }, [conversationId, props.messages.length]);

  useEffect(() => {
    if (!props.justSent) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("sent");
    window.history.replaceState(window.history.state, "", url);
  }, [props.justSent]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: messages.length > props.messages.length ? "smooth" : "auto" });
  }, [messages.length, props.messages.length]);

  const send = (text: string) => {
    const now = new Date();
    startTransition(async () => {
      addOptimistic({
        id: `tmp_${now.getTime()}`,
        kind: "text",
        senderId: viewer.id,
        body: text,
        createdAt: now.toISOString(),
        time: "Sending…",
        dayKey: "zz-now",
        dayLabel: "Today",
      });
      await sendMessage(conversationId, text);
      router.refresh();
    });
  };

  const nameOf = (id: string) => (id === mentor.userId ? mentor.short : id === parent.id ? parent.firstName : "");
  const lastFromOther = [...messages].reverse().find((m) => m.kind !== "system")?.senderId !== viewer.id;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3.5 sm:px-6">
        <Link href="/inbox" className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2 md:hidden" aria-label="Back to messages">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar src={header.photo} name={header.name} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[1.02rem] font-semibold">{header.name}</p>
          <p className="truncate text-[0.8rem] text-ink-3">{header.subtitle}</p>
        </div>
        {header.href ? (
          <Link href={header.href} className="hidden h-10 items-center rounded-full px-4 text-[0.85rem] font-semibold text-ink-2 ring-1 ring-line-2 transition hover:bg-paper-2 hover:text-ink sm:flex">
            View profile
          </Link>
        ) : (
          <span className="hidden items-center gap-2 rounded-full bg-gold-soft px-3.5 py-2 text-[0.8rem] font-semibold text-[#7c5e1f] sm:flex">
            Mentee: {mentee.name}, {mentee.age} · {mentee.schoolYear}
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="thin-scroll relative flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        {showSent && (
          <div className="animate-pop mx-auto mb-8 max-w-md rounded-[24px] bg-forest p-5 text-center text-paper shadow-float">
            <CheckCircle2 className="mx-auto h-8 w-8 text-gold-2" />
            <p className="font-display mt-2 text-[1.4rem]">Request sent to {mentor.short}</p>
            <p className="mt-1 text-[0.88rem] text-paper/70">{mentor.replies}. Their reply will appear right here, and on your dashboard.</p>
            <button onClick={() => setShowSent(false)} className="mt-3 text-[0.8rem] font-semibold text-gold-2 underline underline-offset-4">
              Got it
            </button>
          </div>
        )}

        <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const newDay = !prev || prev.dayKey !== m.dayKey;
            const mine = m.senderId === viewer.id;
            const grouped = !newDay && prev && prev.senderId === m.senderId && prev.kind === "text" && m.kind === "text";
            return (
              <div key={m.id}>
                {newDay && m.dayKey !== "zz-now" && (
                  <div className="my-5 flex items-center gap-4 text-[0.72rem] font-bold tracking-[0.14em] text-ink-4 uppercase">
                    <span className="h-px flex-1 bg-line" />
                    {m.dayLabel}
                    <span className="h-px flex-1 bg-line" />
                  </div>
                )}
                {m.kind === "system" ? (
                  <SystemNote body={m.body} session={m.sessionId ? sessions[m.sessionId] : undefined} mentor={mentor.short} parent={parent.firstName} />
                ) : m.kind === "request" && m.sessionId && sessions[m.sessionId] ? (
                  <RequestCard
                    session={sessions[m.sessionId]}
                    note={m.body}
                    mine={mine}
                    from={nameOf(m.senderId)}
                    time={m.time}
                    viewer={viewer.role}
                    mentee={mentee}
                    parentFirst={parent.firstName}
                    mentorShort={mentor.short}
                  />
                ) : (
                  <Bubble mine={mine} grouped={!!grouped} text={m.body} time={m.time} avatar={!mine ? header : undefined} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Composer
        onSend={send}
        role={viewer.role}
        suggestions={
          viewer.role === "mentor" && lastFromOther
            ? [`Thank you, ${parent.firstName}! Looking forward to meeting ${mentee.name}.`, `${mentee.name} could jot down three questions before we meet.`, "Could we find another time that works?"]
            : viewer.role === "parent" && lastFromOther
              ? ["Thank you so much!", `${mentee.name} is really looking forward to it.`, "Could we reschedule?"]
              : []
        }
      />
    </div>
  );
}

function Bubble({ mine, grouped, text, time, avatar }: { mine: boolean; grouped: boolean; text: string; time: string; avatar?: { name: string; photo?: string } }) {
  return (
    <div className={cn("animate-fade-up flex items-end gap-2.5", mine ? "justify-end" : "justify-start", !grouped && "mt-3")} style={{ animationDuration: "0.5s" }}>
      {!mine && <div className="w-8 shrink-0">{!grouped && avatar && <Avatar src={avatar.photo} name={avatar.name} size={32} />}</div>}
      <div className={cn("group max-w-[80%] sm:max-w-[70%]", mine && "text-right")}>
        <div
          className={cn(
            "inline-block rounded-[22px] px-4 py-3 text-left text-[0.95rem] leading-relaxed whitespace-pre-wrap",
            mine ? "rounded-br-md bg-forest text-paper" : "rounded-bl-md bg-paper-2 text-ink",
          )}
        >
          {text}
        </div>
        <p className={cn("mt-1 px-1 text-[0.7rem] text-ink-4", mine && "text-right")}>{time}</p>
      </div>
    </div>
  );
}

function SystemNote({ body, session, mentor, parent }: { body: string; session?: SessionCardData; mentor: string; parent: string }) {
  const [kind, who] = body.split(":");
  const text =
    kind === "accepted"
      ? `${mentor} confirmed the session${session ? ` for ${session.relDay}, ${session.time}` : ""}`
      : kind === "declined"
        ? `${mentor} couldn’t make that time`
        : kind === "cancelled"
          ? `${who === "mentor" ? mentor : parent} cancelled the session`
          : body;
  const Icon = kind === "accepted" ? CalendarCheck : CalendarX;
  return (
    <div className="my-4 flex justify-center">
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.8rem] font-semibold",
          kind === "accepted" ? "bg-mint text-forest-3" : "bg-paper-2 text-ink-3",
        )}
      >
        <Icon className="h-4 w-4" />
        {text}
      </span>
    </div>
  );
}

const CHIP: Record<SessionStatus, { label: string; cls: string }> = {
  pending: { label: "Awaiting reply", cls: "bg-gold-soft text-[#7c5e1f]" },
  accepted: { label: "Confirmed", cls: "bg-mint text-forest-3" },
  declined: { label: "Declined", cls: "bg-paper-2 text-ink-3" },
  cancelled: { label: "Cancelled", cls: "bg-paper-2 text-ink-3" },
};

function RequestCard({
  session: s,
  note,
  mine,
  from,
  time,
  viewer,
  mentee,
  parentFirst,
  mentorShort,
}: {
  session: SessionCardData;
  note: string;
  mine: boolean;
  from: string;
  time: string;
  viewer: "parent" | "mentor";
  mentee: { name: string; age: number; schoolYear: string };
  parentFirst: string;
  mentorShort: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "accept" | "decline">(null);
  const [reply, setReply] = useState("");
  const [pending, start] = useTransition();
  const inactive = s.status === "declined" || s.status === "cancelled";
  const status = s.status === "accepted" && s.past ? { label: "Completed", cls: "bg-paper-2 text-ink-2" } : CHIP[s.status];

  const open = (m: "accept" | "decline") => {
    const when = s.relDay === "Today" || s.relDay === "Tomorrow" ? s.relDay.toLowerCase() : s.dateLong;
    setMode(m);
    setReply(
      m === "accept"
        ? `Hello ${parentFirst}, thank you for reaching out! I'd love to meet ${mentee.name}. See you both ${when === "today" || when === "tomorrow" ? when : `on ${when}`} at ${s.time}. No preparation needed, but questions are always welcome.`
        : `Hello ${parentFirst}, thank you for thinking of me. Unfortunately I can't make ${when} at ${s.time}. Please do pick another time from my calendar and I'll be glad to meet ${mentee.name}.`,
    );
  };

  const confirm = () =>
    start(async () => {
      await respondToSession(s.id, mode!, reply);
      setMode(null);
      router.refresh();
    });

  const cancel = () => {
    if (!window.confirm(s.status === "pending" ? "Withdraw this request?" : "Cancel this session? The other person will be notified.")) return;
    start(async () => {
      await cancelSession(s.id);
      router.refresh();
    });
  };

  return (
    <div className={cn("my-3 flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("w-full max-w-[480px] overflow-hidden rounded-[26px] bg-card shadow-soft ring-1 ring-line transition", inactive && "opacity-70")}>
        <div className="aso-oke h-1" />
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow text-clay">Session request</span>
            <span className={cn("rounded-full px-2.5 py-1 text-[0.7rem] font-bold", status.cls)}>{status.label}</span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className={cn("flex w-[64px] shrink-0 flex-col items-center rounded-2xl py-2.5", inactive ? "bg-paper-2 text-ink-3" : "bg-forest text-paper")}>
              <span className="text-[0.65rem] font-bold tracking-wider uppercase opacity-70">{s.wd}</span>
              <span className={cn("font-display text-[1.7rem] leading-none", inactive && "line-through decoration-1")}>{s.dn}</span>
              <span className="text-[0.68rem] opacity-70">{s.mo}</span>
            </div>
            <div className="min-w-0">
              <p className="font-display text-[1.3rem] leading-tight">
                {s.time} – {s.endTime}
              </p>
              <p className="text-[0.85rem] text-ink-3">{s.dateLong} · UK time</p>
              <p className="mt-1 truncate text-[0.88rem] font-semibold text-ink-2">{s.topic}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-paper-2/70 p-4">
            <p className="text-[0.92rem] leading-relaxed whitespace-pre-wrap text-ink-2">{note}</p>
            <p className="mt-2 text-[0.75rem] text-ink-4">
              {from} · for {mentee.name}, {mentee.age} · {time}
            </p>
          </div>

          {/* Actions */}
          {s.status === "pending" && viewer === "mentor" && !mode && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => open("accept")} className="h-11 rounded-full bg-forest text-[0.9rem] font-semibold text-paper transition hover:bg-forest-2">
                Accept
              </button>
              <button onClick={() => open("decline")} className="h-11 rounded-full text-[0.9rem] font-semibold text-ink-2 ring-1 ring-line-2 transition hover:bg-paper-2">
                Decline
              </button>
            </div>
          )}

          {mode && (
            <div className="animate-fade-up mt-4" ref={(el) => el?.scrollIntoView({ block: "nearest", behavior: "smooth" })}>
              <label className="mb-2 block text-[0.8rem] font-semibold text-ink-2">
                {mode === "accept" ? "Add a welcome note" : "Let them down gently"}
              </label>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} className="field text-[0.9rem]" />
              <div className="mt-2.5 flex gap-2">
                <button
                  onClick={confirm}
                  disabled={pending}
                  className={cn(
                    "flex h-11 flex-1 items-center justify-center rounded-full text-[0.9rem] font-semibold transition",
                    mode === "accept" ? "bg-forest text-paper hover:bg-forest-2" : "bg-ink text-paper",
                  )}
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "accept" ? "Confirm session" : "Decline & send"}
                </button>
                <button onClick={() => setMode(null)} className="h-11 rounded-full px-4 text-[0.88rem] font-semibold text-ink-3 hover:bg-paper-2">
                  Back
                </button>
              </div>
            </div>
          )}

          {s.status === "pending" && viewer === "parent" && (
            <div className="mt-4 flex items-center justify-between gap-3 text-[0.85rem]">
              <span className="flex items-center gap-2 text-ink-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                </span>
                Waiting for {mentorShort}
              </span>
              <button onClick={cancel} disabled={pending} className="font-semibold text-ink-3 underline underline-offset-4 hover:text-clay">
                Withdraw
              </button>
            </div>
          )}

          {s.status === "accepted" && !s.past && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                {s.joinable && s.meetingUrl ? (
                  <a href={s.meetingUrl} target="_blank" rel="noreferrer" className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-full bg-clay text-[0.92rem] font-semibold text-paper">
                    <Video className="h-4 w-4" /> Join video call now
                  </a>
                ) : null}
                <Link href={`/sessions/${s.id}`} className="flex h-11 items-center justify-center gap-2 rounded-full bg-forest text-[0.88rem] font-semibold text-paper transition hover:bg-forest-2">
                  <DoorOpen className="h-4 w-4" /> Session room
                </Link>
                <a href={`/api/sessions/${s.id}/ics`} className="flex h-11 items-center justify-center gap-2 rounded-full text-[0.88rem] font-semibold text-ink-2 ring-1 ring-line-2 transition hover:bg-paper-2">
                  <CalendarPlus className="h-4 w-4" /> Add to calendar
                </a>
              </div>
              <div className="mt-3 flex items-center justify-between text-[0.78rem] text-ink-3">
                <span>{s.joinable ? "The room is open." : "The video link opens 15 minutes before."}</span>
                <button onClick={cancel} disabled={pending} className="font-semibold underline underline-offset-4 hover:text-clay">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Composer({ onSend, role, suggestions }: { onSend: (t: string) => void; role: "parent" | "mentor"; suggestions: string[] }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="border-t border-line bg-card px-3 pt-3 pb-4 sm:px-6">
      {suggestions.length > 0 && !text && (
        <div className="scrollbar-none mx-auto mb-2.5 flex max-w-3xl gap-2 overflow-x-auto">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setText(s)} className="shrink-0 rounded-full bg-paper-2/80 px-3.5 py-1.5 text-[0.8rem] text-ink-2 transition hover:bg-paper-2 hover:text-ink">
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-[26px] bg-paper-2/70 p-2 pl-4 ring-1 ring-line transition focus-within:bg-card focus-within:ring-2 focus-within:ring-forest-3/30"
      >
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Write a message…"
          aria-label="Message"
          className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent py-2.5 text-[0.95rem] leading-relaxed outline-none placeholder:text-ink-4"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-paper transition hover:bg-forest-2 disabled:bg-ink-4/40"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
      <p className="mx-auto mt-2 flex max-w-3xl items-center gap-1.5 px-2 text-[0.72rem] text-ink-4">
        <ShieldCheck className="h-3.5 w-3.5" />
        {role === "mentor"
          ? "Messages are shared with the parent account. Keep phone numbers and social media off Village."
          : "Mentors never need your phone number or your child’s social media. Keep everything on Village."}
      </p>
    </div>
  );
}
