import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, KeyRound, Mail, PenLine } from "lucide-react";
import { AdirePattern } from "@/components/Patterns";
import { Portrait } from "@/components/Portrait";
import { requireUser } from "@/lib/auth";
import { mentorForUser, mentorName } from "@/lib/queries";
import { EmailForm, PasswordForm } from "./AccountForms";

export const metadata: Metadata = { title: "Account settings" };

export default async function AccountPage() {
  const user = await requireUser(undefined, "/account");
  const mentor = await mentorForUser(user);

  return (
    <div className="relative">
      <section className="grain relative overflow-hidden border-b border-line bg-paper-2/60">
        <AdirePattern className="text-gold opacity-[0.1] [mask-image:linear-gradient(90deg,transparent_45%,#000)]" size={46} />
        <div className="relative mx-auto max-w-[1100px] px-5 pt-12 pb-12 sm:px-8 sm:pt-16">
          <p className="eyebrow text-clay">Your account</p>
          <h1 className="font-display mt-3 text-[clamp(2.6rem,5.6vw,4.2rem)] leading-[1] tracking-[-0.04em]">
            Account <em className="text-forest-3">settings</em>
          </h1>
          <p className="mt-4 text-[1.05rem] text-ink-2">How you sign in to Naija Mentors.</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] space-y-6 px-5 py-12 sm:px-8 sm:py-16">
        {mentor && (
          <section className="flex flex-col gap-5 rounded-[28px] bg-card p-6 ring-1 ring-line sm:flex-row sm:items-center sm:p-7">
            <Portrait src={mentor.photo} name={mentorName(mentor)} shape="arch-sm" className="h-24 w-20 shrink-0" sizes="100px" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[1.5rem] leading-tight">Your public profile</p>
              <p className="mt-1 text-[0.92rem] text-ink-2">Your story, your work and what mentees can ask you about.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/account/profile"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-forest px-5 text-[0.92rem] font-semibold text-paper transition hover:bg-forest-2"
              >
                <PenLine className="h-4 w-4" /> Edit profile
              </Link>
              <Link
                href={`/mentors/${mentor.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[0.92rem] font-semibold text-forest ring-1 ring-line-2 transition hover:ring-ink/25"
              >
                View <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        <Panel icon={Mail} title="Email" subtitle="Where we send session requests and messages, and what you sign in with.">
          <EmailForm email={user.email} />
        </Panel>

        <Panel icon={KeyRound} title="Password">
          <PasswordForm />
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] bg-card p-6 ring-1 ring-line sm:p-7">
      <div className="mb-5">
        <h2 className="flex items-center gap-2.5 text-[1.05rem] font-semibold">
          <Icon className="h-[18px] w-[18px] text-gold" /> {title}
        </h2>
        {subtitle && <p className="mt-1 text-[0.85rem] text-ink-3">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
