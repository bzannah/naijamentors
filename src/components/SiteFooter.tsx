import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LogoMark } from "./Logo";
import { AdireLines, AsoOke } from "./Patterns";

const COLS = [
  {
    title: "Families",
    links: [
      { href: "/mentors", label: "Find a mentor" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/guide#parents", label: "Guide for parents" },
      { href: "/signup", label: "Create an account" },
    ],
  },
  {
    title: "Mentors",
    links: [
      { href: "/become-a-mentor", label: "Become a mentor" },
      { href: "/guide#mentors", label: "Mentor expectations" },
      { href: "/guide#first-session", label: "Your first session" },
      { href: "/signin", label: "Mentor sign in" },
    ],
  },
  {
    title: "Trust & safety",
    links: [
      { href: "/guide#safeguarding", label: "Safeguarding" },
      { href: "/guide#boundaries", label: "Boundaries" },
      { href: "/guide#pledge", label: "The Village pledge" },
      { href: `mailto:${BRAND.safeguardingEmail}`, label: "Report a concern" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-forest text-paper">
      <AsoOke />
      <AdireLines className="text-paper/[0.05]" />
      <div className="relative mx-auto max-w-[1320px] px-5 pt-20 pb-10 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-3 text-paper">
              <LogoMark className="h-10 w-10" />
              <span className="font-display text-4xl tracking-[-0.03em]">{BRAND.name}</span>
            </div>
            <p className="font-display mt-8 max-w-sm text-[1.7rem] leading-[1.2] text-paper/90">
              <em>“Ora na-azụ nwa.”</em>
            </p>
            <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-paper/60">
              It is the community that raises a child. An Igbo proverb, and the reason we built Village.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLS.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-gold-2">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-[0.95rem] text-paper/75 transition hover:text-paper">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-paper/10 pt-8 text-[0.82rem] text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.name}. Built with love by the Nigerian community in the UK.</p>
          <p>
            In an emergency call <strong className="text-paper/80">999</strong> · Childline{" "}
            <strong className="text-paper/80">0800 1111</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
