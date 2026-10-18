"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { MentorCard, type MentorCardData } from "@/components/MentorCard";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { AGE_GROUPS, FIELDS } from "@/lib/fields";

export type DirectoryEntry = {
  card: MentorCardData;
  search: string;
  languages: string[];
  region: string;
  ageGroups: string[];
  nextSlot: string | null;
  years: number;
};

type Sort = "soonest" | "name" | "experience";

export function MentorDirectory({
  entries,
  languages,
  regions,
  initial,
}: {
  entries: DirectoryEntry[];
  languages: string[];
  regions: string[];
  initial: { q: string; field: string };
}) {
  const [q, setQ] = useState(initial.q);
  const [field, setField] = useState(initial.field);
  const [language, setLanguage] = useState("");
  const [region, setRegion] = useState("");
  const [age, setAge] = useState("");
  const [thisWeek, setThisWeek] = useState(false);
  const [sort, setSort] = useState<Sort>("soonest");
  const [showFilters, setShowFilters] = useState(false);
  const query = useDeferredValue(q);

  // Keep the URL shareable without triggering navigation.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
    field ? url.searchParams.set("field", field) : url.searchParams.delete("field");
    window.history.replaceState(null, "", url);
  }, [query, field]);

  const [now] = useState(() => Date.now());

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const weekEnd = now + 7 * 86400_000;
    const list = entries.filter((e) => {
      if (field && e.card.field !== field) return false;
      if (language && !e.languages.includes(language)) return false;
      if (region && e.region !== region) return false;
      if (age && !e.ageGroups.includes(age)) return false;
      if (thisWeek && (!e.nextSlot || new Date(e.nextSlot).getTime() > weekEnd)) return false;
      return terms.every((t) => e.search.includes(t));
    });
    return list.sort((a, b) => {
      if (sort === "name") return a.card.name.replace(/^Dr\.\s/, "").localeCompare(b.card.name.replace(/^Dr\.\s/, ""));
      if (sort === "experience") return b.years - a.years;
      return (a.nextSlot ?? "9").localeCompare(b.nextSlot ?? "9");
    });
  }, [entries, query, field, language, region, age, thisWeek, sort, now]);

  const activeExtras = [language, region, age, thisWeek ? "this-week" : ""].filter(Boolean).length;

  const reset = () => {
    setQ("");
    setField("");
    setLanguage("");
    setRegion("");
    setAge("");
    setThisWeek(false);
  };

  return (
    <>
      <div className="glass sticky top-[72px] z-30 border-b border-line">
        <div className="mx-auto max-w-[1320px] px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full bg-card px-4 ring-1 ring-line-2 transition focus-within:ring-2 focus-within:ring-forest-3/40 lg:max-w-md">
              <Search className="h-[18px] w-[18px] shrink-0 text-ink-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try “medicine”, “Igbo” or “Leeds”"
                className="min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-ink-4"
                aria-label="Search mentors"
              />
              {q && (
                <button onClick={() => setQ("")} aria-label="Clear search" className="rounded-full p-1 text-ink-3 hover:bg-paper-2">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "relative flex h-12 items-center gap-2 rounded-full px-4 text-[0.9rem] font-semibold ring-1 transition",
                showFilters || activeExtras ? "bg-forest text-paper ring-forest" : "bg-card text-ink ring-line-2 hover:ring-ink/25",
              )}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeExtras > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-2 px-1 text-[0.7rem] font-bold text-ink">
                  {activeExtras}
                </span>
              )}
            </button>

            <div className="ml-auto hidden items-center gap-2 lg:flex">
              <span className="text-[0.85rem] text-ink-3">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !w-auto !rounded-full !py-2.5 text-[0.88rem]" aria-label="Sort mentors">
                <option value="soonest">Soonest available</option>
                <option value="name">Name A–Z</option>
                <option value="experience">Most experienced</option>
              </select>
            </div>
          </div>

          <div className="scrollbar-none -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip active={!field} onClick={() => setField("")}>
              All fields
            </Chip>
            {FIELDS.map((f) => (
              <Chip key={f.key} active={field === f.key} onClick={() => setField(field === f.key ? "" : f.key)}>
                {f.short}
              </Chip>
            ))}
          </div>

          {showFilters && (
            <div className="animate-fade-up mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-5">
              <Select label="Language at home" value={language} onChange={setLanguage} options={languages} any="Any language" />
              <Select label="Region" value={region} onChange={setRegion} options={regions} any="Anywhere in the UK" />
              <Select label="Mentee's age" value={age} onChange={setAge} options={AGE_GROUPS} any="Any age" />
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-line-2 lg:self-end">
                <span className="text-[0.9rem] font-medium">Available this week</span>
                <span className={cn("relative h-6 w-11 rounded-full transition", thisWeek ? "bg-forest-3" : "bg-paper-3")}>
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", thisWeek ? "left-[22px]" : "left-0.5")} />
                </span>
                <input type="checkbox" className="sr-only" checked={thisWeek} onChange={(e) => setThisWeek(e.target.checked)} />
              </label>
              <div className="flex items-end lg:justify-end">
                <button onClick={reset} className="h-12 rounded-full px-4 text-[0.88rem] font-semibold text-clay hover:bg-clay-soft">
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <p className="text-[0.95rem] text-ink-2" aria-live="polite">
            <span className="font-display text-2xl text-ink">{results.length}</span>{" "}
            {results.length === 1 ? "mentor" : "mentors"}
            {field && <> in {FIELDS.find((f) => f.key === field)?.label}</>}
          </p>
          {(q || field || activeExtras > 0) && (
            <button onClick={reset} className="text-[0.88rem] font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4">
              Show everyone
            </button>
          )}
        </div>

        {results.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((e, i) => (
              <div key={e.card.slug} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                <MentorCard m={e.card} priority={i < 4} className="h-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-lg rounded-[32px] bg-card px-8 py-16 text-center ring-1 ring-line">
            <p className="font-display text-[2rem] leading-tight">No one matches that… yet.</p>
            <p className="mt-3 text-ink-2">
              Our village is growing every week. Try a broader search, or invite someone you know to become a mentor.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={reset} className="h-11 rounded-full bg-forest px-5 text-[0.92rem] font-semibold text-paper">
                Show all mentors
              </button>
              <ButtonLink href="/become-a-mentor" variant="secondary">
                Invite a mentor
              </ButtonLink>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-[0.86rem] font-medium whitespace-nowrap transition-all duration-300",
        active ? "bg-ink text-paper shadow-soft" : "bg-card/70 text-ink-2 ring-1 ring-line hover:bg-card hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  any,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  any: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.78rem] font-semibold tracking-wide text-ink-3">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field">
        <option value="">{any}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
