"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isPlaceholderEmail } from "@/lib/accounts";
import { findUserByEmail, getCurrentUser, homeFor, type SafeUser } from "@/lib/auth";
import { getDb, isUniqueViolation } from "@/lib/db";
import { mentors, users } from "@/lib/db/schema";
import { AGE_GROUPS, FIELDS, HONORIFICS, REGIONS } from "@/lib/fields";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { FieldKey } from "@/lib/types";

export type AccountState = { error?: string; field?: string; ok?: string } | undefined;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

const LIST = (s: string) =>
  s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

const EMAIL_TAKEN = { error: "There's already an account with that email.", field: "email" };

function refresh() {
  revalidatePath("/", "layout");
}

async function passwordHashOf(userId: string) {
  const [row] = await (await getDb()).select({ hash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
  return row?.hash ?? "";
}

/** A new sign-in email must be well formed, real, and not someone else's. */
async function emailProblem(email: string, user: SafeUser): Promise<AccountState> {
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address.", field: "email" };
  if (isPlaceholderEmail(email)) return { error: "Please use your own email address.", field: "email" };
  const other = await findUserByEmail(email);
  if (other && other.id !== user.id) return EMAIL_TAKEN;
}

function passwordProblem(password: string, confirm: string): AccountState {
  if (password.length < 8) return { error: "Your password needs at least 8 characters.", field: "password" };
  if (password !== confirm) return { error: "The two passwords don't match.", field: "confirm" };
}

/* ---------------- First sign-in ---------------- */

/** Someone signed in with a password the team issued: they choose their own (and their own email, if we used a placeholder). */
export async function completeSetup(_: AccountState, fd: FormData): Promise<AccountState> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (!user.temporaryPassword) redirect(homeFor(user.role));

  const placeholder = isPlaceholderEmail(user.email);
  const email = placeholder ? str(fd, "email").toLowerCase() : user.email;
  const password = str(fd, "password");
  if (placeholder) {
    const problem = await emailProblem(email, user);
    if (problem) return problem;
  }
  const problem = passwordProblem(password, str(fd, "confirm"));
  if (problem) return problem;
  if (verifyPassword(password, await passwordHashOf(user.id)))
    return { error: "Choose a new password rather than the temporary one we sent you.", field: "password" };

  try {
    await (await getDb())
      .update(users)
      .set({ email, passwordHash: hashPassword(password), temporaryPassword: false })
      .where(eq(users.id, user.id));
  } catch (err) {
    if (isUniqueViolation(err, "users_email_key")) return EMAIL_TAKEN;
    throw err;
  }
  refresh();
  redirect(user.role === "mentor" ? "/dashboard?welcome=setup" : homeFor(user.role));
}

/* ---------------- Account settings ---------------- */

async function settingsUser() {
  const user = await getCurrentUser();
  return user && !user.temporaryPassword ? user : null;
}

export async function updateEmail(_: AccountState, fd: FormData): Promise<AccountState> {
  const user = await settingsUser();
  if (!user) return { error: "Please sign in again." };
  const email = str(fd, "email").toLowerCase();
  if (email === user.email) return { ok: "That's already your email." };
  const problem = await emailProblem(email, user);
  if (problem) return problem;
  if (!verifyPassword(str(fd, "current"), await passwordHashOf(user.id))) return { error: "Your current password isn't right.", field: "current" };
  try {
    await (await getDb()).update(users).set({ email }).where(eq(users.id, user.id));
  } catch (err) {
    if (isUniqueViolation(err, "users_email_key")) return EMAIL_TAKEN;
    throw err;
  }
  refresh();
  return { ok: `Saved. You'll sign in with ${email} from now on.` };
}

export async function updatePassword(_: AccountState, fd: FormData): Promise<AccountState> {
  const user = await settingsUser();
  if (!user) return { error: "Please sign in again." };
  if (!verifyPassword(str(fd, "current"), await passwordHashOf(user.id))) return { error: "Your current password isn't right.", field: "current" };
  const password = str(fd, "password");
  const problem = passwordProblem(password, str(fd, "confirm"));
  if (problem) return problem;
  await (await getDb()).update(users).set({ passwordHash: hashPassword(password) }).where(eq(users.id, user.id));
  return { ok: "Your password has been changed." };
}

/* ---------------- Mentor profile ---------------- */

export async function updateMentorProfile(_: AccountState, fd: FormData): Promise<AccountState> {
  const user = await settingsUser();
  if (!user || user.role !== "mentor") return { error: "Only mentors have a public profile." };
  const db = await getDb();
  const [current] = await db.select({ region: mentors.region }).from(mentors).where(eq(mentors.userId, user.id)).limit(1);
  if (!current) return { error: "We couldn't find your profile. Please contact the Naija Mentors team." };

  const honorific = str(fd, "honorific");
  const firstName = str(fd, "firstName");
  const lastName = str(fd, "lastName");
  const role = str(fd, "role");
  const org = str(fd, "org");
  const field = str(fd, "field") as FieldKey;
  const city = str(fd, "city");
  const region = str(fd, "region");
  const years = str(fd, "years") ? Number(str(fd, "years")) : 0;
  const headline = str(fd, "headline");
  const bio = str(fd, "bio");
  const story = str(fd, "story")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
  const specialities = LIST(str(fd, "specialities"));
  const askMeAbout = str(fd, "askMeAbout")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  const ageGroups = fd.getAll("ageGroups").map(String);
  let education: { title: string; place: string }[] = [];
  try {
    const parsed: unknown = JSON.parse(str(fd, "education") || "[]");
    if (Array.isArray(parsed))
      education = parsed
        .map((e) => ({ title: String(e?.title ?? "").trim().slice(0, 120), place: String(e?.place ?? "").trim().slice(0, 120) }))
        .filter((e) => e.title);
  } catch {}

  if (honorific && !HONORIFICS.includes(honorific)) return { error: "Choose a title from the list.", field: "honorific" };
  if (!firstName || !lastName) return { error: "Please add your full name.", field: firstName ? "lastName" : "firstName" };
  if (!role) return { error: "Tell mentees what you do.", field: "role" };
  if (!org) return { error: "Tell mentees where you work.", field: "org" };
  if (!FIELDS.some((f) => f.key === field)) return { error: "Pick the field that best describes your work.", field: "field" };
  if (!city) return { error: "Add the town or city you're based in.", field: "city" };
  if (!REGIONS.includes(region) && region !== current.region) return { error: "Choose your region from the list.", field: "region" };
  if (!Number.isInteger(years) || years < 0 || years > 60) return { error: "Years of experience should be a whole number up to 60.", field: "years" };
  if (!specialities.length) return { error: "Add at least one thing you can help with.", field: "specialities" };
  if (specialities.length > 4) return { error: "Keep it to four things you can help with, so your card stays readable.", field: "specialities" };
  if (!headline) return { error: "Add a headline: one sentence people will remember.", field: "headline" };
  if (headline.length > 220) return { error: "Keep your headline to one sentence (220 characters at most).", field: "headline" };
  if (bio.length < 60) return { error: "Your bio helps people choose. Please write at least a couple of sentences.", field: "bio" };
  if (bio.length > 1500) return { error: "Please keep your bio under 1,500 characters. Your story has more room.", field: "bio" };
  if (story.join("").length > 5000) return { error: "Please keep your story under 5,000 characters.", field: "story" };
  if (askMeAbout.length > 6) return { error: "Keep \"Ask me about\" to six topics.", field: "askMeAbout" };
  if (education.length > 6) return { error: "List up to six qualifications.", field: "education" };
  if (!ageGroups.length || ageGroups.some((a) => !AGE_GROUPS.includes(a))) return { error: "Choose the ages you'd like to mentor.", field: "ageGroups" };

  const languages = LIST(str(fd, "languages")).slice(0, 10);
  await db.transaction(async (tx) => {
    await tx
      .update(mentors)
      .set({
        honorific: honorific || null,
        firstName: firstName.slice(0, 60),
        lastName: lastName.slice(0, 60),
        role: role.slice(0, 120),
        org: org.slice(0, 160),
        field,
        city: city.slice(0, 80),
        region,
        heritage: str(fd, "heritage").slice(0, 80) || "Nigerian heritage",
        languages: languages.length ? languages : ["English"],
        years,
        education,
        specialities: specialities.map((s) => s.slice(0, 40)),
        askMeAbout: askMeAbout.map((s) => s.slice(0, 160)),
        headline,
        bio,
        story: story.slice(0, 8),
        quote: str(fd, "quote").slice(0, 200),
        ageGroups,
      })
      .where(eq(mentors.userId, user.id));
    await tx
      .update(users)
      .set({ name: `${honorific ? honorific + " " : ""}${firstName} ${lastName}`, city })
      .where(eq(users.id, user.id));
  });
  refresh();
  return { ok: "Saved. Your public profile is up to date." };
}
