"use client";

import { Plus, X } from "lucide-react";
import { fmtClock, WEEKDAYS } from "@/lib/time";
import type { WeeklySlot } from "@/lib/types";

const ORDER = [1, 2, 3, 4, 5, 6, 0];
const TIMES = Array.from({ length: 29 }, (_, i) => {
  const mins = 7 * 60 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

export function sortSlots(s: WeeklySlot[]) {
  return [...s].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
}

/** Weekly recurring availability, one row per day. Times never overlap a session length. */
export function WeeklyPicker({ value, onChange, sessionLength = 45 }: { value: WeeklySlot[]; onChange: (v: WeeklySlot[]) => void; sessionLength?: number }) {
  return (
    <div className="divide-y divide-line">
      {ORDER.map((day) => {
        const mine = sortSlots(value.filter((s) => s.day === day));
        const free = TIMES.filter((t) => mine.every((m) => Math.abs(toMin(m.time) - toMin(t)) >= sessionLength));
        return (
          <div key={day} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center">
            <p className="w-28 shrink-0 text-[0.92rem] font-semibold">{WEEKDAYS[day]}</p>
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {mine.map((s) => (
                <span key={s.time} className="animate-pop inline-flex items-center gap-1 rounded-full bg-forest py-1.5 pr-1.5 pl-3.5 text-[0.85rem] font-semibold text-paper">
                  {fmtClock(s.time)}
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((x) => !(x.day === day && x.time === s.time)))}
                    aria-label={`Remove ${fmtClock(s.time)} on ${WEEKDAYS[day]}`}
                    className="rounded-full p-0.5 text-paper/70 hover:bg-paper/15 hover:text-paper"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-ink-4 px-3 py-1.5 text-[0.82rem] font-semibold text-ink-3 transition hover:border-forest-3 hover:text-forest">
                <Plus className="h-3.5 w-3.5" /> Add time
                <select
                  value=""
                  onChange={(e) => e.target.value && onChange([...value, { day, time: e.target.value }])}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label={`Add a time on ${WEEKDAYS[day]}`}
                >
                  <option value="">Add time</option>
                  {free.map((t) => (
                    <option key={t} value={t}>
                      {fmtClock(t)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
