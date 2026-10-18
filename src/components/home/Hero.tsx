import Link from "next/link";
import { CalendarCheck, Search, ShieldCheck } from "lucide-react";
import { Portrait, Avatar } from "@/components/Portrait";
import { SunRings } from "@/components/Patterns";
import { FIELD_MAP, FIELDS } from "@/lib/fields";
import { fmtDateShort, fmtTime } from "@/lib/time";
import type { MentorListing } from "@/lib/queries";

type HeroProps = {
  /** In order of preference for the collage: the first three appear as portraits, the first five as faces. */
  mentors: MentorListing[];
  stats: { mentors: number; allVerified: boolean; fields: number; cities: number };
};

const QUICK = ["medicine", "law", "tech", "engineering", "enterprise", "creative"] as const;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function Hero({ mentors, stats }: HeroProps) {
  const [feature, left, right] = mentors;
  const faces = mentors.slice(0, 5);
  const shortName = (m: MentorListing) => `${m.honorific ? m.honorific + " " : ""}${m.firstName}`;
  return (
    <section className="grain relative overflow-hidden">
      {/* soft warm glow */}
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[720px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgb(226_200_143/0.55),transparent)]" />
      <div className="pointer-events-none absolute bottom-[-30%] left-[-15%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgb(223_234_223/0.9),transparent)]" />

      <div className="relative mx-auto grid max-w-[1320px] items-center gap-14 px-5 pt-10 pb-20 sm:px-8 lg:grid-cols-[1.08fr_1fr] lg:gap-8 lg:pt-14 lg:pb-28">
        <div className="relative z-10">
          <div className="animate-fade-up inline-flex items-center gap-2.5 rounded-full bg-card/80 py-1.5 pr-4 pl-1.5 text-[0.82rem] font-medium text-ink-2 ring-1 ring-line">
            <span className="flex h-6 items-center gap-1 rounded-full bg-forest px-2.5 text-[0.7rem] font-bold tracking-wide text-paper">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3fa66b]" />
              FREE
            </span>
            Mentorship for young British-Nigerians, 11–30
          </div>

          <h1
            className="font-display animate-fade-up mt-7 text-[clamp(3.1rem,7.4vw,6.6rem)] leading-[0.94] font-[360] tracking-[-0.045em] text-balance"
            style={{ animationDelay: "80ms" }}
          >
            It takes a <em className="text-forest-3">village</em> to raise a generation.
          </h1>

          <p
            className="animate-fade-up mt-7 max-w-[34rem] text-[1.14rem] leading-relaxed text-ink-2 text-pretty"
            style={{ animationDelay: "160ms" }}
          >
            Whether you&rsquo;re fifteen or twenty-five, meet the doctors, engineers, lawyers and founders of our own community.
            People who have walked the road and want to light it for the next generation, in free, safe video sessions.
          </p>

          <p className="animate-fade-up mt-9 mb-3 pl-1 text-[0.85rem] font-semibold text-ink-2" style={{ animationDelay: "220ms" }}>
            What&rsquo;s the dream?
          </p>
          <form
            action="/mentors"
            className="animate-fade-up flex max-w-[36rem] items-center gap-2 rounded-full bg-card p-2 pl-5 shadow-float ring-1 ring-line transition focus-within:ring-forest-3/50"
            style={{ animationDelay: "240ms" }}
          >
            <Search className="h-5 w-5 shrink-0 text-ink-3" />
            <label htmlFor="hero-q" className="sr-only">
              What&rsquo;s the dream?
            </label>
            <input
              id="hero-q"
              name="q"
              placeholder="Doctor, engineer, barrister…"
              className="min-w-0 flex-1 bg-transparent py-3 text-[1rem] outline-none placeholder:text-ink-3"
            />
            <button className="group/btn inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-forest px-5 text-[0.92rem] font-semibold text-paper transition hover:bg-forest-2 sm:px-6">
              <span className="hidden sm:inline">Find a mentor</span>
              <span className="sm:hidden">Search</span>
            </button>
          </form>

          <div className="animate-fade-up mt-5 flex flex-wrap gap-2" style={{ animationDelay: "300ms" }}>
            {QUICK.map((k) => {
              const f = FIELDS.find((x) => x.key === k)!;
              return (
                <Link
                  key={k}
                  href={`/mentors?field=${k}`}
                  className="rounded-full px-3.5 py-1.5 text-[0.85rem] font-medium text-ink-2 ring-1 ring-line-2 transition hover:bg-forest hover:text-paper hover:ring-forest"
                >
                  {f.short}
                </Link>
              );
            })}
          </div>

          {stats.mentors > 0 && (
            <div className="animate-fade-up mt-11 flex items-center gap-4" style={{ animationDelay: "380ms" }}>
              <div className="flex -space-x-3">
                {faces.map((m) => (
                  <Avatar key={m.id} src={m.photo} name={`${m.firstName} ${m.lastName}`} size={44} className="ring-[3px] ring-paper" />
                ))}
              </div>
              <p className="text-[0.9rem] leading-snug text-ink-2">
                <strong className="font-semibold text-ink">{plural(stats.mentors, stats.allVerified ? "verified mentor" : "mentor", stats.allVerified ? "verified mentors" : "mentors")}</strong>
                <br />
                across {plural(stats.fields, "career field", "career fields")}
                {stats.cities > 0 && <> and {plural(stats.cities, "UK city", "UK cities")}</>}
              </p>
            </div>
          )}
        </div>

        {/* Collage */}
        <div className="relative mx-auto h-[440px] w-full max-w-[560px] sm:h-[600px] lg:h-[640px]">
          <SunRings className="animate-spin-slow absolute top-1/2 left-1/2 h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 text-gold/45" />

          {feature && (
            <div className="animate-fade-up absolute top-[6%] left-1/2 w-[54%] -translate-x-[38%]" style={{ animationDelay: "200ms" }}>
              <Portrait src={feature.photo} name={`${feature.firstName} ${feature.lastName}`} priority className="aspect-[3/4] w-full shadow-lift ring-[6px] ring-card" sizes="320px" />
            </div>
          )}

          {left && (
            <div className="animate-fade-up absolute top-[2%] left-[2%] w-[30%]" style={{ animationDelay: "320ms" }}>
              <div className="animate-float-slow">
                <Portrait src={left.photo} name={`${left.firstName} ${left.lastName}`} priority className="aspect-[3/4] w-full shadow-lift ring-[5px] ring-card" sizes="200px" />
              </div>
            </div>
          )}

          {right && (
            <div className="animate-fade-up absolute right-[0%] bottom-[6%] w-[31%]" style={{ animationDelay: "440ms" }}>
              <div className="animate-float" style={{ animationDelay: "1.2s" }}>
                <Portrait src={right.photo} name={`${right.firstName} ${right.lastName}`} priority className="aspect-[3/4] w-full shadow-lift ring-[5px] ring-card" sizes="200px" />
              </div>
            </div>
          )}

          {/* The featured mentor's real next opening */}
          {feature?.nextSlot && (
            <div className="animate-fade-up absolute top-[12%] right-0 w-[176px] sm:top-[16%] sm:right-[-4%] sm:w-[220px]" style={{ animationDelay: "650ms" }}>
              <div className="glass animate-float rounded-2xl p-3.5 shadow-lift ring-1 ring-white/60" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center gap-2 text-[0.72rem] font-bold tracking-wide text-leaf uppercase">
                  <CalendarCheck className="h-4 w-4" /> Next free session
                </div>
                <p className="font-display mt-1.5 text-[1rem] leading-tight sm:text-[1.15rem]">
                  {fmtDateShort(feature.nextSlot)} · {fmtTime(feature.nextSlot)}
                </p>
                <p className="mt-0.5 text-[0.8rem] text-ink-3">with {shortName(feature)}</p>
              </div>
            </div>
          )}

          {/* What a first message looks like */}
          {feature && (
            <div className="animate-fade-up absolute bottom-[3%] left-0 w-[200px] sm:bottom-[10%] sm:left-[-6%] sm:w-[260px]" style={{ animationDelay: "800ms" }}>
              <div className="animate-float-slow rounded-2xl rounded-bl-md bg-forest p-4 text-paper shadow-lift" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-2">
                  <Avatar name="You" size={26} />
                  <span className="text-[0.75rem] font-semibold text-paper/80">You · now</span>
                </div>
                <p className="mt-2 text-[0.84rem] leading-snug sm:text-[0.92rem]">
                  Hi {shortName(feature)}, could we talk about how you got started in {FIELD_MAP[feature.field].short.toLowerCase()}?
                </p>
              </div>
            </div>
          )}

          {/* Trust chip */}
          <div className="animate-fade-up absolute top-[58%] left-[4%] hidden sm:block" style={{ animationDelay: "950ms" }}>
            <div className="flex items-center gap-2 rounded-full bg-card py-2 pr-4 pl-2 text-[0.8rem] font-semibold shadow-soft ring-1 ring-line">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint text-forest-3">
                <ShieldCheck className="h-4 w-4" />
              </span>
              DBS-checked
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
