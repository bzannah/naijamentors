import type { Metadata } from "next";
import { AdirePattern } from "@/components/Patterns";
import { getCurrentUser } from "@/lib/auth";
import { toCard } from "@/lib/present";
import { listMentors } from "@/lib/queries";
import { MentorDirectory, type DirectoryEntry } from "./MentorDirectory";

export const metadata: Metadata = {
  title: "Find a mentor",
  description: "Browse British-Nigerian mentors by career, city and language, and request a free video session.",
};

export default async function MentorsPage({ searchParams }: PageProps<"/mentors">) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const mentors = await listMentors();

  const entries: DirectoryEntry[] = mentors.map((m) => ({
    card: toCard(m),
    search: [m.firstName, m.lastName, m.role, m.org, m.city, m.region, m.heritage, ...m.specialities, ...m.askMeAbout, m.headline, ...m.languages]
      .join(" ")
      .toLowerCase(),
    languages: m.languages.map((l) => l.replace(/\s*\(.*\)/, "")),
    region: m.region,
    ageGroups: m.ageGroups,
    nextSlot: m.nextSlot,
    years: m.years,
  }));

  const languages = [...new Set(entries.flatMap((e) => e.languages))].filter((l) => l !== "English").sort();
  const regions = [...new Set(entries.map((e) => e.region))].sort();

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

  return (
    <div className="relative">
      <section className="grain relative overflow-hidden border-b border-line">
        <AdirePattern className="text-gold opacity-[0.12] [mask-image:linear-gradient(90deg,transparent_40%,#000)]" size={46} />
        <div className="pointer-events-none absolute -top-48 -right-32 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgb(226_200_143/0.5),transparent)]" />
        <div className="relative mx-auto max-w-[1320px] px-5 pt-12 pb-14 sm:px-8 sm:pt-16 sm:pb-16">
          {first(sp.welcome) && user && (
            <div className="animate-fade-up mb-8 inline-flex items-center gap-3 rounded-full bg-forest py-2 pr-5 pl-2 text-[0.9rem] text-paper">
              <span className="rounded-full bg-gold-2 px-3 py-1 text-[0.75rem] font-bold text-ink">Ẹ káàbọ̀ · Welcome</span>
              You&rsquo;re in, {user.name.split(" ")[0]}. Here&rsquo;s your village.
            </div>
          )}
          <p className="eyebrow animate-fade-up text-clay">The directory</p>
          <h1 className="font-display animate-fade-up mt-4 max-w-4xl text-[clamp(2.8rem,6vw,5.2rem)] leading-[0.98] tracking-[-0.04em] text-balance">
            Find the mentor who&rsquo;s <em className="text-forest-3">walked the road.</em>
          </h1>
          <p className="animate-fade-up mt-5 max-w-xl text-[1.08rem] leading-relaxed text-ink-2" style={{ animationDelay: "100ms" }}>
            {mentors.length} accomplished British-Nigerians, every one verified and ready to give their time. Search by dream
            career, language or city.
          </p>
        </div>
      </section>

      <MentorDirectory
        entries={entries}
        languages={languages}
        regions={regions}
        initial={{ q: first(sp.q), field: first(sp.field) }}
      />
    </div>
  );
}
