import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { isPlaceholderEmail } from "@/lib/accounts";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { mentorForUser } from "@/lib/queries";
import { SetupForm } from "../AccountForms";

export const metadata: Metadata = { title: "Set up your account" };

export default async function SetupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (!user.temporaryPassword) redirect(homeFor(user.role));
  const firstTime = isPlaceholderEmail(user.email);
  const mentor = await mentorForUser(user);
  const first = mentor ? `${mentor.honorific ? mentor.honorific + " " : ""}${mentor.firstName}` : user.name.split(" ")[0];

  return (
    <AuthShell quote={{ text: "An elder cannot be in the marketplace and let a newborn’s head hang crooked.", by: "Yoruba proverb" }}>
      <p className="eyebrow text-clay">{firstTime ? "Welcome to Naija Mentors" : "One more step"}</p>
      <h1 className="font-display mt-3 text-[3rem] leading-[1] tracking-[-0.04em]">
        {firstTime ? (
          <>
            Make it <em className="text-forest-3">yours,</em> {first}
          </>
        ) : (
          <>
            Choose a new <em className="text-forest-3">password</em>
          </>
        )}
      </h1>
      <p className="mt-4 text-ink-2">
        {firstTime
          ? `The Naija Mentors team set up this account for you${mentor ? " and started your profile from your public work" : ""}. Choose the email and password you'll use from now on${mentor ? ", then check your profile and add the times you're free" : ""}.`
          : "You signed in with a temporary password. Choose your own to carry on."}
      </p>
      <SetupForm askEmail={firstTime} />
    </AuthShell>
  );
}
