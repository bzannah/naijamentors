import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { getCurrentUser } from "@/lib/auth";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "";
  if (await getCurrentUser()) redirect(next || "/dashboard");

  return (
    <AuthShell quote={{ text: "Haƙuri maganin duniya. Patience is the medicine of the world.", by: "Hausa proverb" }}>
      <p className="eyebrow text-clay">Welcome back</p>
      <h1 className="font-display mt-3 text-[3rem] leading-[1] tracking-[-0.04em]">
        Sign in to the <em className="text-forest-3">village</em>
      </h1>
      <p className="mt-4 text-ink-2">Pick up where you left off: messages, sessions and your mentors.</p>
      <SignInForm next={next} />
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
