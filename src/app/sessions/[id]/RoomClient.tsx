"use client";

import { useEffect, useState } from "react";
import { Check, Video } from "lucide-react";
import { cn } from "@/lib/cn";
import { fmtTime } from "@/lib/time";
import type { SessionStatus } from "@/lib/types";

export function Countdown({ start, end, meetingUrl, status }: { start: string; end: string; meetingUrl?: string; status: SessionStatus }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const opens = s - 15 * 60000;

  if (status !== "accepted") {
    return (
      <div className="text-center">
        <p className="font-display text-[2rem]">{status === "pending" ? "Waiting for the mentor to confirm" : "This session isn't going ahead"}</p>
        <p className="mt-2 text-paper/60">{status === "pending" ? "You'll get a video link as soon as it's confirmed." : "You can request another time from the mentor's profile."}</p>
      </div>
    );
  }

  const live = now !== null && now >= opens && now <= e + 15 * 60000;
  const over = now !== null && now > e + 15 * 60000;
  const diff = Math.max(0, s - (now ?? s));
  const parts = [
    { v: Math.floor(diff / 86400000), l: "days" },
    { v: Math.floor((diff / 3600000) % 24), l: "hours" },
    { v: Math.floor((diff / 60000) % 60), l: "minutes" },
    { v: Math.floor((diff / 1000) % 60), l: "seconds" },
  ];

  return (
    <div className="flex flex-col items-center text-center">
      {over ? (
        <p className="font-display text-[2rem]">This session has finished. We hope it was wonderful.</p>
      ) : (
        <>
          <p className="text-[0.78rem] font-bold tracking-[0.18em] text-paper/50 uppercase">{live && now! >= s ? "Live now" : "Starts in"}</p>
          <div className="mt-4 flex gap-3 sm:gap-5" aria-live="off">
            {parts.map((p) => (
              <div key={p.l} className="w-[72px] rounded-2xl bg-paper/[0.07] py-4 ring-1 ring-paper/10 sm:w-[96px]">
                <p className="font-display text-[2.2rem] leading-none tabular-nums sm:text-[3rem]">{now === null ? "–" : String(p.v).padStart(2, "0")}</p>
                <p className="mt-2 text-[0.7rem] font-semibold tracking-wider text-paper/50 uppercase">{p.l}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {!over &&
        (live && meetingUrl ? (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-9 inline-flex h-14 items-center gap-3 rounded-full bg-clay px-8 text-[1.02rem] font-semibold text-paper shadow-[0_18px_40px_-14px_rgb(180_85_45/0.9)] transition hover:brightness-110"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-paper opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-paper" />
            </span>
            Join video call
          </a>
        ) : (
          <div className="mt-9 flex flex-col items-center gap-2">
            <span className="inline-flex h-14 items-center gap-3 rounded-full bg-paper/10 px-8 text-[1.02rem] font-semibold text-paper/60 ring-1 ring-paper/15">
              <Video className="h-5 w-5" /> Room opens at {fmtTime(new Date(opens))}
            </span>
            <span className="text-[0.82rem] text-paper/50">Secure video in your browser. No downloads needed.</span>
          </div>
        ))}
    </div>
  );
}

export function Checklist({ id, items }: { id: string; items: string[] }) {
  const key = `nm-checklist-${id}`;
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(key) ?? "[]"));
    } catch {}
  }, [key]);

  const toggle = (i: number) => {
    const next = done.includes(i) ? done.filter((x) => x !== i) : [...done, i];
    setDone(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };

  return (
    <>
      <ul className="mt-5 space-y-2">
        {items.map((it, i) => {
          const on = done.includes(i);
          return (
            <li key={it}>
              <button onClick={() => toggle(i)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-paper/5">
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 transition", on ? "bg-gold-2 text-indigo ring-gold-2" : "ring-paper/30")}>
                  {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className={cn("text-[0.92rem] transition", on ? "text-paper/50 line-through" : "text-paper/85")}>{it}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-paper/10">
        <div className="h-full rounded-full bg-gold-2 transition-all duration-500" style={{ width: `${(done.length / items.length) * 100}%` }} />
      </div>
      <p className="mt-2 text-[0.78rem] text-paper/50">
        {done.length === items.length ? "You're ready. Enjoy it." : `${done.length} of ${items.length} ready`}
      </p>
    </>
  );
}
