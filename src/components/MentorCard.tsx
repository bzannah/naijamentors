import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { FIELD_MAP } from "@/lib/fields";
import type { FieldKey } from "@/lib/types";
import { Portrait } from "./Portrait";

export type MentorCardData = {
  slug: string;
  name: string;
  role: string;
  org: string;
  field: FieldKey;
  city: string;
  heritage: string;
  languages: string[];
  specialities: string[];
  photo?: string;
  nextLabel: string | null;
  verified: boolean;
  pending: boolean;
};

export function MentorCard({ m, priority, className }: { m: MentorCardData; priority?: boolean; className?: string }) {
  return (
    <Link
      href={`/mentors/${m.slug}`}
      className={cn(
        "group relative flex flex-col rounded-[30px] bg-card p-2.5 ring-1 ring-line transition-all duration-500 ease-[var(--ease-out-expo)]",
        "hover:-translate-y-1.5 hover:shadow-lift hover:ring-line-2",
        className,
      )}
    >
      <div className="relative">
        <Portrait src={m.photo} name={m.name} className="aspect-[4/5] w-full" sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 92vw" priority={priority} zoom />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-[28px] bg-gradient-to-t from-black/35 to-transparent" />
        {m.nextLabel ? (
          <span className="glass absolute bottom-3.5 left-3.5 inline-flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2.5 text-[0.78rem] font-semibold text-ink shadow-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
            </span>
            Next: {m.nextLabel}
          </span>
        ) : (
          <span className="glass absolute bottom-3.5 left-3.5 rounded-full px-3.5 py-1.5 text-[0.78rem] font-semibold text-ink-2">
            {m.pending ? "Joining soon" : "Fully booked"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pt-5 pb-4">
        <p className="eyebrow text-clay">{FIELD_MAP[m.field].label}</p>
        <h3 className="font-display mt-2 flex items-center gap-2 text-[1.6rem] leading-[1.1]">
          {m.name}
          {m.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-forest-3" strokeWidth={2} aria-label="Verified mentor" />}
        </h3>
        <p className="mt-1.5 text-[0.95rem] font-medium text-ink-2">{m.role}</p>
        <p className="text-[0.88rem] text-ink-3">{m.org}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {m.specialities.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-paper-2 px-3 py-1 text-[0.78rem] font-medium text-ink-2">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-[0.82rem] text-ink-3">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {m.city} · {m.heritage.split(" · ")[0]}
            </span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-paper transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:w-[6.5rem]">
            <span className="hidden text-[0.8rem] font-semibold whitespace-nowrap group-hover:inline">View profile</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 group-hover:hidden" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
