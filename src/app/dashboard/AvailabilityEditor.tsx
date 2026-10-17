"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateAvailability } from "@/app/actions";
import { sortSlots, WeeklyPicker } from "@/components/WeeklyPicker";
import { cn } from "@/lib/cn";
import type { WeeklySlot } from "@/lib/types";

export function AvailabilityEditor({ initial, sessionLength }: { initial: WeeklySlot[]; sessionLength: number }) {
  const [slots, setSlots] = useState<WeeklySlot[]>(initial);
  const [saved, setSaved] = useState<WeeklySlot[]>(initial);
  const [pending, start] = useTransition();
  const [flash, setFlash] = useState(false);

  const dirty = JSON.stringify(sortSlots(slots)) !== JSON.stringify(sortSlots(saved));

  const save = () =>
    start(async () => {
      await updateAvailability(slots);
      setSaved(slots);
      setFlash(true);
      setTimeout(() => setFlash(false), 2200);
    });

  return (
    <div>
      <WeeklyPicker value={slots} onChange={setSlots} sessionLength={sessionLength} />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper-2/70 p-4">
        <p className="text-[0.88rem] text-ink-2">
          <strong className="text-ink">{slots.length}</strong> weekly {slots.length === 1 ? "slot" : "slots"} · {sessionLength}-minute sessions · UK time
        </p>
        <button
          onClick={save}
          disabled={!dirty || pending}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.9rem] font-semibold transition",
            flash ? "bg-leaf text-paper" : "bg-forest text-paper hover:bg-forest-2 disabled:bg-ink-4/30 disabled:text-ink-3",
          )}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : flash ? <Check className="h-4 w-4" /> : null}
          {flash ? "Saved" : "Save availability"}
        </button>
      </div>
    </div>
  );
}
