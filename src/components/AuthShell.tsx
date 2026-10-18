import { listMentors } from "@/lib/queries";
import { AdirePattern } from "./Patterns";
import { Portrait } from "./Portrait";

export async function AuthShell({ children, quote }: { children: React.ReactNode; quote?: { text: string; by: string } }) {
  const mentors = (await listMentors()).filter((m) => m.photo && m.status === "active");
  const pick = ["osasu-igbinedion", "tunde-adebayo", "zainab-yusuf", "mujahid-okafor", "adaeze-nwosu", "terry-agber"]
    .map((s) => mentors.find((m) => m.slug === s))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <div className="grid flex-1 lg:grid-cols-[1fr_1fr]">
      <div className="flex items-center justify-center px-5 py-14 sm:px-8 lg:py-20">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden bg-forest lg:block">
        <AdirePattern className="text-gold opacity-[0.08]" size={56} />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="grid w-full max-w-[520px] grid-cols-3 gap-4">
            {pick.map((m, i) => (
              <div key={m.id} className={i % 3 === 1 ? "translate-y-12" : ""}>
                <div className={i % 2 ? "animate-float-slow" : "animate-float"} style={{ animationDelay: `${i * 0.7}s` }}>
                  <Portrait src={m.photo} name={m.firstName} className="aspect-[3/4] w-full ring-4 ring-forest-2" sizes="180px" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {quote && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest via-forest/95 to-transparent px-12 pt-24 pb-12">
            <p className="font-display max-w-md text-[1.7rem] leading-snug text-paper italic">“{quote.text}”</p>
            <p className="mt-3 text-[0.9rem] text-paper/60">{quote.by}</p>
          </div>
        )}
      </div>
    </div>
  );
}
