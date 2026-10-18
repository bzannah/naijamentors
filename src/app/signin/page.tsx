import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { findUserByEmail, getCurrentUser } from "@/lib/auth";
import { DEMO_MENTEE_EMAIL, DEMO_PARENT_EMAIL } from "@/lib/seed";
import { SignInForm, type Demo } from "./SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "";
  if (await getCurrentUser()) redirect(next || "/dashboard");

  // Only offer the demo accounts this database actually has (they come from `npm run db:seed`).
  const demoEmails: Record<Demo, string> = { mentee: DEMO_MENTEE_EMAIL, parent: DEMO_PARENT_EMAIL };
  const demos = (
    await Promise.all(Object.entries(demoEmails).map(async ([who, email]) => ((await findUserByEmail(email)) ? (who as Demo) : null)))
  ).filter((d): d is Demo => d !== null);

  return (
    <AuthShell quote={{ text: "Haƙuri maganin duniya. Patience is the medicine of the world.", by: "Hausa proverb" }}>
      <p className="eyebrow text-clay">Welcome back</p>
      <h1 className="font-display mt-3 text-[3rem] leading-[1] tracking-[-0.04em]">
        Sign in to the <em className="text-forest-3">village</em>
      </h1>
      <p className="mt-4 text-ink-2">Pick up where you left off: messages, sessions and your mentors.</p>
      <SignInForm next={next} demos={demos} />
      <p className="mt-8 text-center text-[0.92rem] text-ink-2">
        New here?{" "}
        <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4">
          Create an account
        </Link>{" "}
        or{" "}
        <Link href="/become-a-mentor" className="font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4">
          apply to mentor
        </Link>
      </p>
    </AuthShell>
  );
}
