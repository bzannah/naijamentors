import { randomInt } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Database } from "./db";
import { users } from "./db/schema";
import { hashPassword } from "./password";

/*
  Accounts the Naija Mentors team sets up for someone else, e.g. a mentor added from the roster
  (src/data/mentors). They start with a placeholder email that no one can receive mail at, and the team
  issues a temporary password to send them. On their first sign-in they choose their own email and
  password (/account/setup). The same temporary-password step lets the team reset anyone who is locked out.
*/

/** Placeholder addresses live on a subdomain we own and never receive mail on. */
export const PLACEHOLDER_EMAIL_DOMAIN = "invite.naijamentors.com";

export function placeholderEmail(handle: string) {
  return `${handle}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}

/** True until the person has replaced the placeholder with their own address. */
export function isPlaceholderEmail(email: string) {
  return email.trim().toLowerCase().endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);
}

// No 0/O or 1/I/L, so the password survives being read out or retyped from a message.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** e.g. "K7QM-4XTP-9HRB": about 59 bits of randomness, easy to copy into a message. */
export function generateTemporaryPassword() {
  const group = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return [group(), group(), group()].join("-");
}

/** The note the team sends with a temporary password, ready to paste into an email or WhatsApp. */
export function signInMessage(x: { greetingName: string; email: string; password: string; appUrl: string; profilePath?: string }) {
  const firstTime = isPlaceholderEmail(x.email);
  return [
    `Hi ${x.greetingName},`,
    "",
    firstTime
      ? `Your Naija Mentors profile is ready${x.profilePath ? `: ${x.appUrl}${x.profilePath}` : "."}`
      : "Here is a temporary password for your Naija Mentors account.",
    "",
    `Sign in at ${x.appUrl}/signin with:`,
    `Email: ${x.email}`,
    `Temporary password: ${x.password}`,
    "",
    firstTime
      ? "You'll be asked to choose your own email and password straight away. Then please check your profile, change anything that isn't quite right, and add the times you're free to mentor."
      : "You'll be asked to choose a new password straight away.",
    "",
    firstTime ? "Thank you for joining the village." : "Thank you.",
  ].join("\n");
}

/**
 * Give an account a new temporary password and return it, so it can be sent to the person.
 * Their old password stops working, and they must choose a new one when they next sign in.
 */
export async function issueTemporaryPassword(db: Database, userId: string): Promise<string | null> {
  const password = generateTemporaryPassword();
  const updated = await db
    .update(users)
    .set({ passwordHash: hashPassword(password), temporaryPassword: true })
    .where(eq(users.id, userId))
    .returning({ id: users.id });
  return updated.length ? password : null;
}
