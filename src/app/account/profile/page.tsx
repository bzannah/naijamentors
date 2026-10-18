import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AdirePattern } from "@/components/Patterns";
import { requireUser } from "@/lib/auth";
import { mentorForUser } from "@/lib/queries";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Edit your profile" };

export default async function ProfilePage() {
  const user = await requireUser("mentor", "/account/profile");
  const mentor = await mentorForUser(user);
  if (!mentor) redirect("/dashboard");

  return (
    <div className="relative">
      <section className="grain relative overflow-hidden border-b border-line bg-paper-2/60">
        <AdirePattern className="text-gold opacity-[0.1] [mask-image:linear-gradient(90deg,transparent_45%,#000)]" size={46} />
        <div className="relative mx-auto max-w-[1100px] px-5 pt-10 pb-12 sm:px-8 sm:pt-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full py-1.5 pr-3 text-[0.88rem] font-medium text-ink-2 transition hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <p className="eyebrow mt-6 text-clay">Mentor profile</p>
          <h1 className="font-display mt-3 text-[clamp(2.6rem,5.6vw,4.2rem)] leading-[1] tracking-[-0.04em]">
            Your public <em className="text-forest-3">profile</em>
          </h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] text-ink-2">
            This is what mentees and families read before they reach out. Write it the way you&rsquo;d introduce yourself to a young
            person meeting you for the first time.{" "}
            <Link href={`/mentors/${mentor.slug}`} className="inline-flex items-center gap-1 font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4">
              See it live <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-5 py-12 sm:px-8 sm:py-16">
        <ProfileForm
          mentor={{
            honorific: mentor.honorific ?? "",
            firstName: mentor.firstName,
            lastName: mentor.lastName,
            role: mentor.role,
            org: mentor.org,
            field: mentor.field,
            city: mentor.city,
            region: mentor.region,
            heritage: mentor.heritage,
            languages: mentor.languages,
            years: mentor.years,
            education: mentor.education,
            specialities: mentor.specialities,
            askMeAbout: mentor.askMeAbout,
            headline: mentor.headline,
            bio: mentor.bio,
            story: mentor.story,
            quote: mentor.quote,
            ageGroups: mentor.ageGroups,
            photo: mentor.photo,
          }}
        />
      </div>
    </div>
  );
}
