"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type GuideSection = { id: string; label: string; group?: string };

/** Sticky table of contents with scroll-spy. */
export function GuideNav({ sections }: { sections: GuideSection[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [sections]);

  const index = sections.findIndex((s) => s.id === active);

  return (
    <>
      {/* Desktop */}
      <nav aria-label="Guide contents" className="sticky top-28 hidden lg:block">
        <p className="eyebrow mb-5 text-ink-3">In this guide</p>
        <ol className="relative space-y-0.5 border-l border-line-2">
          <span
            className="absolute -left-px w-[2px] rounded-full bg-gold transition-all duration-500 ease-[var(--ease-out-expo)]"
            style={{ top: `${index * 36 + 6}px`, height: "24px" }}
          />
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn(
                  "flex h-9 items-center gap-3 pl-5 text-[0.9rem] transition-colors",
                  s.id === active ? "font-semibold text-ink" : "text-ink-3 hover:text-ink",
                )}
              >
                <span className="font-display w-5 text-[0.85rem] text-ink-4 italic">{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Mobile */}
      <nav aria-label="Guide contents" className="glass sticky top-[72px] z-20 -mx-5 border-b border-line px-5 py-3 sm:-mx-8 sm:px-8 lg:hidden">
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium whitespace-nowrap transition",
                s.id === active ? "bg-ink text-paper" : "bg-card text-ink-2 ring-1 ring-line",
              )}
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
