"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, getCurrentUser, startSession } from "@/lib/auth";
import { mutate, newId, readDb } from "@/lib/db";
import { FIELDS } from "@/lib/fields";
import { hashPassword, verifyPassword } from "@/lib/password";
import { canAccess, slotsFor } from "@/lib/queries";
import { DEMO_MENTOR_EMAIL, DEMO_PARENT_EMAIL, meetingUrl } from "@/lib/seed";
import type { FieldKey, Mentor, WeeklySlot } from "@/lib/types";

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
  const user = readDb().users.find((u) => u.email.toLowerCase() === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That email and password don't match. Try again, or use a demo account below." };
  }
  await startSession(user.id);
  refreshAll();
  redirect(safeNext(str(fd, "next"), user.role === "mentor" ? "/dashboard" : "/mentors"));
}

export async function demoSignIn(fd: FormData) {
  const who = str(fd, "who");
  const email = who === "mentor" ? DEMO_MENTOR_EMAIL : DEMO_PARENT_EMAIL;
  const user = readDb().users.find((u) => u.email === email);
  if (!user) redirect("/signin");
  await startSession(user.id);
  refreshAll();
  redirect(safeNext(str(fd, "next"), "/dashboard"));
}

export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const childName = str(fd, "childName");
  const childAge = Number(str(fd, "childAge"));
  const city = str(fd, "city");

  if (name.length < 2) return { error: "Please tell us your name.", field: "name" };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address.", field: "email" };
  if (password.length < 8) return { error: "Your password needs at least 8 characters.", field: "password" };
  if (readDb().users.some((u) => u.email.toLowerCase() === email)) {
    return { error: "There's already an account with that email. Try signing in.", field: "email" };
  }

  const id = newId("u");
  mutate((db) => {
    db.users.push({
      id,
      role: "parent",
      name,
      email,
      city: city || undefined,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      children:
        childName && childAge
          ? [{ name: childName, age: childAge, schoolYear: schoolYearForAge(childAge) }]
          : [],
    });
  });
  await startSession(id);
  refreshAll();
  redirect(safeNext(str(fd, "next"), "/mentors?welcome=1"));
}

export async function signOut() {
  await endSession();
  refreshAll();
  redirect("/");
}

function schoolYearForAge(age: number) {
  // Age at the start of the school year → English school year.
  const year = Math.min(13, Math.max(7, age - 4));
  return `Year ${year}`;
}

/* ---------------- Requests & messaging ---------------- */

export async function requestSession(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "signin" };
  if (user.role !== "parent") return { error: "Only parent accounts can request sessions." };

  const mentorId = str(fd, "mentorId");
  const start = str(fd, "start");
  const menteeName = str(fd, "menteeName");
  const menteeAge = Number(str(fd, "menteeAge"));
  const topic = str(fd, "topic");
  const message = str(fd, "message");
  const consent = fd.get("consent") === "on";

  if (!menteeName) return { error: "Please tell us your child's first name.", field: "menteeName" };
  if (!menteeAge || menteeAge < 11 || menteeAge > 18)
    return { error: "Village mentors work with young people aged 11 to 18.", field: "menteeAge" };
  if (!topic) return { error: "Choose what you'd like the session to focus on.", field: "topic" };
  if (message.length < 20)
    return { error: "Add a short note so the mentor knows a little about your child (at least 20 characters).", field: "message" };
  if (!consent) return { error: "Please confirm the safeguarding commitments.", field: "consent" };

  const db = readDb();
  const mentor = db.mentors.find((m) => m.id === mentorId);
  if (!mentor) return { error: "We couldn't find that mentor." };
  if (!slotsFor(db, mentor, 20).some((s) => s.start === start)) {
    return { error: "That time was just taken. Please pick another slot.", field: "start" };
  }

  const now = new Date().toISOString();
  const conversationId = mutate((db) => {
    let conv = db.conversations.find(
      (c) => c.parentId === user.id && c.mentorId === mentor.id && c.menteeName.toLowerCase() === menteeName.toLowerCase(),
    );
    if (!conv) {
      conv = {
        id: newId("c"),
        parentId: user.id,
        mentorId: mentor.id,
        menteeName,
        menteeAge,
        schoolYear: schoolYearForAge(menteeAge),
        createdAt: now,
        updatedAt: now,
        lastRead: { parent: now, mentor: new Date(0).toISOString() },
      };
      db.conversations.push(conv);
    }
    const sessionId = newId("s");
    db.sessions.push({
      id: sessionId,
      conversationId: conv.id,
      mentorId: mentor.id,
      parentId: user.id,
      start,
      durationMin: mentor.sessionLength,
      topic,
      goals: message,
      status: "pending",
      createdAt: now,
    });
    db.messages.push({
      id: newId("msg"),
      conversationId: conv.id,
      senderId: user.id,
      kind: "request",
      body: message,
      sessionId,
      createdAt: now,
    });
    conv.updatedAt = now;
    conv.lastRead.parent = now;
    return conv.id;
  });

  refreshAll();
  redirect(`/inbox/${conversationId}?sent=1`);
}

export async function sendMessage(conversationId: string, body: string) {
  const user = await getCurrentUser();
  const text = body.trim();
  if (!user || !text) return { ok: false };
  const ok = mutate((db) => {
    const c = db.conversations.find((x) => x.id === conversationId);
    if (!c || !canAccess(user, c, db)) return false;
    const now = new Date().toISOString();
    db.messages.push({ id: newId("msg"), conversationId, senderId: user.id, kind: "text", body: text.slice(0, 4000), createdAt: now });
    c.updatedAt = now;
    if (user.role === "parent") c.lastRead.parent = now;
    else c.lastRead.mentor = now;
    return true;
  });
  refreshAll();
  return { ok };
}

export async function respondToSession(sessionId: string, decision: "accept" | "decline", note?: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "mentor") return { ok: false };
  const ok = mutate((db) => {
    const s = db.sessions.find((x) => x.id === sessionId);
    const mentor = db.mentors.find((m) => m.id === s?.mentorId);
    if (!s || !mentor || mentor.userId !== user.id || s.status !== "pending") return false;
    const c = db.conversations.find((x) => x.id === s.conversationId)!;
    const now = new Date().toISOString();
    s.status = decision === "accept" ? "accepted" : "declined";
    s.respondedAt = now;
    if (decision === "accept") s.meetingUrl = meetingUrl(mentor, c.menteeName, newId("r"));
    db.messages.push({
      id: newId("msg"),
      conversationId: c.id,
      senderId: "system",
      kind: "system",
      sessionId: s.id,
      body: s.status,
      createdAt: now,
    });
    if (note?.trim()) {
      db.messages.push({ id: newId("msg"), conversationId: c.id, senderId: user.id, kind: "text", body: note.trim(), createdAt: now });
    }
    c.updatedAt = now;
    c.lastRead.mentor = now;
    return true;
  });
  refreshAll();
  return { ok };
}

export async function cancelSession(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const ok = mutate((db) => {
    const s = db.sessions.find((x) => x.id === sessionId);
    const c = db.conversations.find((x) => x.id === s?.conversationId);
    if (!s || !c || !canAccess(user, c, db)) return false;
    if (s.status !== "pending" && s.status !== "accepted") return false;
    const now = new Date().toISOString();
    s.status = "cancelled";
    s.respondedAt = now;
    db.messages.push({ id: newId("msg"), conversationId: c.id, senderId: "system", kind: "system", sessionId: s.id, body: `cancelled:${user.role}`, createdAt: now });
    c.updatedAt = now;
    return true;
  });
  refreshAll();
  return { ok };
}

export async function markRead(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  let changed = false;
  mutate((db) => {
    const c = db.conversations.find((x) => x.id === conversationId);
    if (!c || !canAccess(user, c, db)) return;
    const latest = db.messages.filter((m) => m.conversationId === c.id).at(-1)?.createdAt;
    const key = user.role === "parent" ? "parent" : "mentor";
    if (latest && latest > c.lastRead[key]) {
      c.lastRead[key] = new Date().toISOString();
      changed = true;
    }
  });
  if (changed) refreshAll();
}

/* ---------------- Mentor tools ---------------- */

export async function updateAvailability(slots: WeeklySlot[]) {
  const user = await getCurrentUser();
  if (!user || user.role !== "mentor") return { ok: false };
  const clean = slots
    .filter((s) => Number.isInteger(s.day) && s.day >= 0 && s.day <= 6 && /^\d{2}:\d{2}$/.test(s.time))
    .slice(0, 40);
  mutate((db) => {
    const m = db.mentors.find((x) => x.userId === user.id);
    if (m) m.availability = clean;
  });
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
  if (!role || !org) return { error: "Tell families what you do and where.", field: "role" };
  if (!FIELDS.some((f) => f.key === field)) return { error: "Pick the field that best describes your work.", field: "field" };
  if (bio.length < 60) return { error: "Your bio helps parents choose. Please write at least a couple of sentences.", field: "bio" };
  if (fd.get("pledge") !== "on") return { error: "Please accept the Village mentor pledge.", field: "pledge" };

  const db = readDb();
  if (db.users.some((u) => u.email.toLowerCase() === email)) {
    return { error: "There's already an account with that email.", field: "email" };
  }

  const base = `${firstName}-${lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
  let slug = base;
  for (let i = 2; db.mentors.some((m) => m.slug === slug); i++) slug = `${base}-${i}`;

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
    ageGroups: ageGroups.length ? ageGroups : ["14–16", "17–18"],
    availability,
    verified: { dbs: false, id: false, references: false },
    replies: "New to Village",
    joined: now,
    status: "pending",
  };

  mutate((db) => {
    db.users.push({
      id: userId,
      role: "mentor",
      name: `${honorific ? honorific + " " : ""}${firstName} ${lastName}`,
      email,
      passwordHash: hashPassword(password),
      createdAt: now,
      mentorId,
      city,
    });
    db.mentors.push(mentor);
  });

  await startSession(userId);
  refreshAll();
  redirect("/dashboard?welcome=mentor");
}
