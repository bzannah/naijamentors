"use server";

import fs from "node:fs";
import path from "node:path";
import { and, eq, gt, inArray, like, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { endSession, findUserByEmail, getCurrentUser, homeFor, startSession } from "@/lib/auth";
import { getDb, isUniqueViolation, newId } from "@/lib/db";
import { fromMentor } from "@/lib/db/mappers";
import { conversations, mentors, messages, sessions, users } from "@/lib/db/schema";
import { FIELDS } from "@/lib/fields";
import { notifySessionCancelled, notifySessionRequested, notifySessionResponded } from "@/lib/notifications";
import { canBook, MENTEE_AGES, schoolYearForAge, STAGES } from "@/lib/mentees";
import { hashPassword, verifyPassword } from "@/lib/password";
import { accessibleConversation, getMentorById, slotsFor } from "@/lib/queries";
import { DEMO_MENTEE_EMAIL, DEMO_PARENT_EMAIL, meetingUrl } from "@/lib/seed";
import type { FieldKey, Mentee, Mentor, WeeklySlot } from "@/lib/types";

export type FormState = { error?: string; field?: string } | undefined;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function safeNext(next: string, fallback: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function refreshAll() {
  revalidatePath("/", "layout");
}

/* ---------------- Auth ---------------- */

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That email and password don't match. Try again, or use a demo account below." };
  }
  await startSession(user.id);
  refreshAll();
  redirect(safeNext(str(fd, "next"), canBook(user.role) ? "/mentors" : homeFor(user.role)));
}

export async function demoSignIn(fd: FormData) {
  const who = str(fd, "who");
  const email = who === "mentee" ? DEMO_MENTEE_EMAIL : DEMO_PARENT_EMAIL;
  const user = await findUserByEmail(email);
  if (!user) redirect("/signin");
  await startSession(user.id);
  refreshAll();
  redirect(safeNext(str(fd, "next"), "/dashboard"));
}

/** Mentees aged 18+ sign up for themselves; parents and guardians sign up for 11 to 17-year-olds. */
export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  const role = str(fd, "as") === "mentee" ? "mentee" : "parent";
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const city = str(fd, "city");

  if (name.length < 2) return { error: "Please tell us your name.", field: "name" };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address.", field: "email" };
  if (password.length < 8) return { error: "Your password needs at least 8 characters.", field: "password" };

  let mentees: Mentee[] = [];
  if (role === "mentee") {
    const age = Number(str(fd, "age"));
    const stage = str(fd, "stage");
    if (!age || age < MENTEE_AGES.adult || age > MENTEE_AGES.max)
      return {
        error: `Mentee accounts are for ages ${MENTEE_AGES.adult} to ${MENTEE_AGES.max}. Under 18? Ask a parent or guardian to join for you.`,
        field: "age",
      };
    if (!STAGES.includes(stage)) return { error: "Tell us where you are right now.", field: "stage" };
    mentees = [{ name: name.split(/\s+/)[0], age, stage }];
  } else {
    const childName = str(fd, "childName");
    const childAge = Number(str(fd, "childAge"));
    if (childName && childAge) {
      if (childAge < MENTEE_AGES.min || childAge >= MENTEE_AGES.adult)
        return { error: "Parent accounts are for children aged 11 to 17. From 18, young people join with their own account.", field: "childAge" };
      mentees = [{ name: childName, age: childAge, stage: schoolYearForAge(childAge) }];
    }
  }

  const taken = { error: "There's already an account with that email. Try signing in.", field: "email" };
  if (await findUserByEmail(email)) return taken;

  const id = newId("u");
  try {
    await (await getDb()).insert(users).values({
      id,
      role,
      name,
      email,
      city: city || null,
      passwordHash: hashPassword(password),
      mentees,
    });
  } catch (err) {
    if (isUniqueViolation(err, "users_email_key")) return taken;
    throw err;
  }
  await startSession(id);
  refreshAll();
  redirect(safeNext(str(fd, "next"), "/mentors?welcome=1"));
}

export async function signOut() {
  await endSession();
  refreshAll();
  redirect("/");
}

/* ---------------- Requests & messaging ---------------- */

export async function requestSession(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "signin" };
  if (!canBook(user.role)) return { error: "Sessions are requested from mentee and parent accounts." };

  const mentorId = str(fd, "mentorId");
  const start = str(fd, "start");
  const topic = str(fd, "topic");
  const message = str(fd, "message");
  const consent = fd.get("consent") === "on";
  const self = user.role === "mentee";

  let mentee: Mentee;
  if (self) {
    // Adults book for themselves, as described on their account.
    const me = user.mentees?.[0];
    if (!me) return { error: "We're missing your age and stage. Please contact us so we can fix your account." };
    mentee = me;
  } else {
    const name = str(fd, "menteeName");
    const age = Number(str(fd, "menteeAge"));
    if (!name) return { error: "Please tell us your child's first name.", field: "menteeName" };
    if (!age || age < MENTEE_AGES.min || age >= MENTEE_AGES.adult)
      return { error: "Parent accounts book for 11 to 17-year-olds. From 18, young people book with their own account.", field: "menteeAge" };
    mentee = { name, age, stage: schoolYearForAge(age) };
  }
  if (!topic) return { error: "Choose what you'd like the session to focus on.", field: "topic" };
  if (message.length < 20)
    return {
      error: `Add a short note so the mentor knows a little about ${self ? "you" : "your child"} (at least 20 characters).`,
      field: "message",
    };
  if (!consent) return { error: "Please confirm the safeguarding commitments.", field: "consent" };

  const mentor = await getMentorById(mentorId);
  if (!mentor) return { error: "We couldn't find that mentor." };
  const slotTaken = { error: "That time was just taken. Please pick another slot.", field: "start" };
  if (!(await slotsFor(mentor, 20)).some((s) => s.start === start)) return slotTaken;

  const now = new Date().toISOString();
  const sessionId = newId("s");
  let conversationId: string;
  try {
    conversationId = await (await getDb()).transaction(async (tx) => {
      let [conv] = await tx
        .select({ id: conversations.id })
        .from(conversations)
        .where(
          and(
            eq(conversations.accountId, user.id),
            eq(conversations.mentorId, mentor.id),
            sql`lower(${conversations.menteeName}) = ${mentee.name.toLowerCase()}`,
          ),
        )
        .limit(1);
      if (!conv) {
        [conv] = await tx
          .insert(conversations)
          .values({
            id: newId("c"),
            accountId: user.id,
            mentorId: mentor.id,
            menteeName: mentee.name,
            menteeAge: mentee.age,
            stage: mentee.stage,
            createdAt: now,
            updatedAt: now,
            lastReadAccount: now,
            lastReadMentor: new Date(0).toISOString(),
          })
          .returning({ id: conversations.id });
      }
      // The unique index on live (mentor, start) pairs rejects a slot someone else grabbed a moment ago.
      await tx.insert(sessions).values({
        id: sessionId,
        conversationId: conv.id,
        mentorId: mentor.id,
        accountId: user.id,
        start,
        durationMin: mentor.sessionLength,
        topic,
        goals: message,
        status: "pending",
        createdAt: now,
      });
      await tx.insert(messages).values({
        id: newId("msg"),
        conversationId: conv.id,
        senderId: user.id,
        kind: "request",
        body: message,
        sessionId,
        createdAt: now,
      });
      await tx.update(conversations).set({ updatedAt: now, lastReadAccount: now }).where(eq(conversations.id, conv.id));
      return conv.id;
    });
  } catch (err) {
    if (isUniqueViolation(err, "sessions_live_slot_key")) return slotTaken;
    throw err;
  }

  after(() => notifySessionRequested(sessionId));
  refreshAll();
  redirect(`/inbox/${conversationId}?sent=1`);
}

export async function sendMessage(conversationId: string, body: string) {
  const user = await getCurrentUser();
  const text = body.trim();
  if (!user || !text) return { ok: false };
  const c = await accessibleConversation(user, conversationId);
  if (!c) return { ok: false };
  const now = new Date().toISOString();
  await (await getDb()).transaction(async (tx) => {
    await tx.insert(messages).values({ id: newId("msg"), conversationId, senderId: user.id, kind: "text", body: text.slice(0, 4000), createdAt: now });
    await tx
      .update(conversations)
      .set(user.role === "mentor" ? { updatedAt: now, lastReadMentor: now } : { updatedAt: now, lastReadAccount: now })
      .where(eq(conversations.id, conversationId));
  });
  refreshAll();
  return { ok: true };
}

export async function respondToSession(sessionId: string, decision: "accept" | "decline", note?: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "mentor") return { ok: false };
  const db = await getDb();
  const [found] = await db
    .select({ s: sessions, mentor: mentors, menteeName: conversations.menteeName })
    .from(sessions)
    .innerJoin(mentors, eq(mentors.id, sessions.mentorId))
    .innerJoin(conversations, eq(conversations.id, sessions.conversationId))
    .where(and(eq(sessions.id, sessionId), eq(mentors.userId, user.id)))
    .limit(1);
  if (!found || found.s.status !== "pending") return { ok: false };

  const now = new Date().toISOString();
  const status = decision === "accept" ? "accepted" : "declined";
  const text = note?.trim().slice(0, 4000);
  const ok = await db.transaction(async (tx) => {
    // Only flips a request that is still pending, so a double click can't respond twice.
    const updated = await tx
      .update(sessions)
      .set({
        status,
        respondedAt: now,
        ...(status === "accepted" ? { meetingUrl: meetingUrl(found.mentor, found.menteeName, newId("r")) } : {}),
      })
      .where(and(eq(sessions.id, sessionId), eq(sessions.status, "pending")))
      .returning({ id: sessions.id });
    if (!updated.length) return false;
    const conversationId = found.s.conversationId;
    await tx.insert(messages).values({ id: newId("msg"), conversationId, senderId: "system", kind: "system", sessionId, body: status, createdAt: now });
    if (text) await tx.insert(messages).values({ id: newId("msg"), conversationId, senderId: user.id, kind: "text", body: text, createdAt: now });
    await tx.update(conversations).set({ updatedAt: now, lastReadMentor: now }).where(eq(conversations.id, conversationId));
    return true;
  });

  if (ok) after(() => notifySessionResponded(sessionId, text));
  refreshAll();
  return { ok };
}

export async function cancelSession(sessionId: string) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") return { ok: false };
  const db = await getDb();
  const [s] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  if (!s || !(await accessibleConversation(user, s.conversationId))) return { ok: false };

  const now = new Date().toISOString();
  const ok = await db.transaction(async (tx) => {
    const updated = await tx
      .update(sessions)
      .set({ status: "cancelled", respondedAt: now })
      .where(and(eq(sessions.id, sessionId), inArray(sessions.status, ["pending", "accepted"])))
      .returning({ id: sessions.id });
    if (!updated.length) return false;
    await tx.insert(messages).values({
      id: newId("msg"),
      conversationId: s.conversationId,
      senderId: "system",
      kind: "system",
      sessionId,
      body: `cancelled:${user.role}`,
      createdAt: now,
    });
    await tx.update(conversations).set({ updatedAt: now }).where(eq(conversations.id, s.conversationId));
    return true;
  });

  if (ok) after(() => notifySessionCancelled(sessionId, user.role === "mentor" ? "mentor" : "account"));
  refreshAll();
  return { ok };
}

export async function markRead(conversationId: string) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") return;
  if (!(await accessibleConversation(user, conversationId))) return;
  const lastRead = user.role === "mentor" ? conversations.lastReadMentor : conversations.lastReadAccount;
  // Only write when there's something newer than the last read marker.
  const updated = await (await getDb())
    .update(conversations)
    .set(user.role === "mentor" ? { lastReadMentor: new Date().toISOString() } : { lastReadAccount: new Date().toISOString() })
    .where(
      and(
        eq(conversations.id, conversationId),
        sql`exists (select 1 from ${messages} where ${messages.conversationId} = ${conversations.id} and ${gt(messages.createdAt, lastRead)})`,
      ),
    )
    .returning({ id: conversations.id });
  if (updated.length) refreshAll();
}

/* ---------------- Mentor tools ---------------- */

export async function updateAvailability(slots: WeeklySlot[]) {
  const user = await getCurrentUser();
  if (!user || user.role !== "mentor") return { ok: false };
  const clean = slots
    .filter((s) => Number.isInteger(s.day) && s.day >= 0 && s.day <= 6 && /^\d{2}:\d{2}$/.test(s.time))
    .slice(0, 40);
  await (await getDb()).update(mentors).set({ availability: clean }).where(eq(mentors.userId, user.id));
  refreshAll();
  return { ok: true };
}

const LIST = (s: string) =>
  s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

export async function applyAsMentor(_: FormState, fd: FormData): Promise<FormState> {
  const firstName = str(fd, "firstName");
  const lastName = str(fd, "lastName");
  const honorific = str(fd, "honorific");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const role = str(fd, "role");
  const org = str(fd, "org");
  const field = str(fd, "field") as FieldKey;
  const city = str(fd, "city");
  const heritage = str(fd, "heritage");
  const years = Number(str(fd, "years")) || 1;
  const bio = str(fd, "bio");
  const headline = str(fd, "headline");
  const quote = str(fd, "quote");
  const languages = LIST(str(fd, "languages"));
  const specialities = LIST(str(fd, "specialities")).slice(0, 4);
  const askMeAbout = LIST(str(fd, "askMeAbout")).slice(0, 6);
  const ageGroups = fd.getAll("ageGroups").map(String);
  const education = str(fd, "education");
  let availability: WeeklySlot[] = [];
  try {
    availability = JSON.parse(str(fd, "availability") || "[]");
  } catch {}

  if (!firstName || !lastName) return { error: "Please add your full name.", field: "firstName" };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address.", field: "email" };
  if (password.length < 8) return { error: "Choose a password with at least 8 characters.", field: "password" };
  if (!role || !org) return { error: "Tell mentees what you do and where.", field: "role" };
  if (!FIELDS.some((f) => f.key === field)) return { error: "Pick the field that best describes your work.", field: "field" };
  if (bio.length < 60) return { error: "Your bio helps people choose. Please write at least a couple of sentences.", field: "bio" };
  if (fd.get("pledge") !== "on") return { error: "Please accept the mentor pledge.", field: "pledge" };

  const emailTaken = { error: "There's already an account with that email.", field: "email" };
  if (await findUserByEmail(email)) return emailTaken;

  const db = await getDb();
  const base = `${firstName}-${lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
  const used = new Set(
    (await db.select({ slug: mentors.slug }).from(mentors).where(or(eq(mentors.slug, base), like(mentors.slug, `${base}-%`)))).map((r) => r.slug),
  );
  let slug = base;
  for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;

  const userId = newId("u");
  const mentorId = newId("m");

  let photo: string | undefined;
  const file = fd.get("photo");
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return { error: "Your photo must be an image.", field: "photo" };
    const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const dir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    const name = `${slug}-${mentorId.slice(-6)}.${ext}`;
    fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    photo = `/uploads/${name}`;
  }

  const now = new Date().toISOString();
  const mentor: Mentor = {
    id: mentorId,
    slug,
    userId,
    honorific: honorific || undefined,
    firstName,
    lastName,
    role,
    org,
    field,
    city: city || "United Kingdom",
    region: city || "United Kingdom",
    heritage: heritage || "Nigerian heritage",
    languages: languages.length ? languages : ["English"],
    years,
    education: education ? [{ title: education, place: "" }] : [],
    specialities: specialities.length ? specialities : [FIELDS.find((f) => f.key === field)!.short],
    askMeAbout,
    headline: headline || bio.split(". ")[0],
    bio,
    story: [],
    quote: quote || "",
    photo,
    sessionLength: 45,
    ageGroups: ageGroups.length ? ageGroups : ["17–18", "19–24"],
    availability,
    verified: { dbs: false, id: false, references: false },
    replies: "New to Naija Mentors",
    joined: now,
    status: "pending",
  };

  try {
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        role: "mentor",
        name: `${honorific ? honorific + " " : ""}${firstName} ${lastName}`,
        email,
        passwordHash: hashPassword(password),
        createdAt: now,
        mentorId,
        city: city || null,
      });
      await tx.insert(mentors).values(fromMentor(mentor));
    });
  } catch (err) {
    if (isUniqueViolation(err, "users_email_key")) return emailTaken;
    if (isUniqueViolation(err, "mentors_slug_key")) return { error: "Something went wrong saving your profile. Please try again." };
    throw err;
  }

  await startSession(userId);
  refreshAll();
  redirect("/dashboard?welcome=mentor");
}
