import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { getCurrentUser } from "@/lib/auth";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = { title: "Join the village" };

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "";
  if (await getCurrentUser()) redirect(next || "/dashboard");

  return (
    <AuthShell quote={{ text: "Ora na-azụ nwa. It is the community that raises a child.", by: "Igbo proverb" }}>
      <p className="eyebrow text-clay">Free, always</p>
      <h1 className="font-display mt-3 text-[3rem] leading-[1] tracking-[-0.04em]">
        Join the <em className="text-forest-3">village</em>
      </h1>
      <p className="mt-4 text-ink-2">
        Create a free account to request sessions and message mentors who have walked the road you&rsquo;re on.
      </p>
      <SignUpForm next={next} initial={sp.as === "parent" ? "parent" : "mentee"} />
      <p className="mt-8 text-center text-[0.92rem] text-ink-2">
        Already joined?{" "}
        <Link href={`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4">
          Sign in
        </Link>
        <br />
        Want to mentor instead?{" "}
        <Link href="/become-a-mentor" className="font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4">
          Apply here
        </Link>
      </p>
    </AuthShell>
  );
}
