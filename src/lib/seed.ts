import { count, sql } from "drizzle-orm";
import { SEED_MENTORS } from "../data/mentors";
import type { Database } from "./db";
import { fromConversation, fromMentor, fromMessage, fromSession, fromUser } from "./db/mappers";
import { conversations, mentors as mentorsTable, messages as messagesTable, sessions as sessionsTable, users } from "./db/schema";
import { hashPassword } from "./password";
import type { Db, Mentor, User } from "./types";

export const DEMO_PASSWORD = "village-demo";
export const DEMO_PARENT_EMAIL = "funmi@naijamentors.demo";
export const DEMO_MENTEE_EMAIL = "bukky@naijamentors.demo";
export const DEMO_ADMIN_EMAIL = "admin@naijamentors.demo";

export function mentorEmail(m: Pick<Mentor, "firstName">) {
  return `${m.firstName.toLowerCase()}@mentor.naijamentors.demo`;
}

export function meetingUrl(mentor: Pick<Mentor, "firstName">, mentee: string, id: string) {
  const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");
  return `https://meet.jit.si/NaijaMentors-${clean(mentor.firstName)}-${clean(mentee)}-${id.slice(-6)}`;
}

/** Build a fresh database with the mentors and a few demo families and mentees. */
export function buildSeed(now = Date.now()): Db {
  const pw = hashPassword(DEMO_PASSWORD);
  const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();
  const H = 3600_000;
  const D = 24 * H;

  const parents: User[] = [
    {
      id: "u_funmi",
      role: "parent",
      name: "Funmilayo Adeyemi",
      email: DEMO_PARENT_EMAIL,
      passwordHash: pw,
      createdAt: iso(-40 * D),
      city: "London",
      mentees: [
        { name: "Tobi", age: 15, stage: "Year 11" },
        { name: "David", age: 13, stage: "Year 8" },
      ],
    },
    {
      id: "u_chinedu",
      role: "parent",
      name: "Chinedu Eze",
      email: "chinedu@naijamentors.demo",
      passwordHash: pw,
      createdAt: iso(-20 * D),
      city: "Manchester",
      mentees: [{ name: "Somto", age: 16, stage: "Year 12" }],
    },
    {
      id: "u_halima",
      role: "parent",
      name: "Halima Musa",
      email: "halima@naijamentors.demo",
      passwordHash: pw,
      createdAt: iso(-60 * D),
      city: "Birmingham",
      mentees: [{ name: "Amina", age: 14, stage: "Year 10" }],
    },
  ];

  // Mentees aged 18+ hold their own accounts and book for themselves.
  const adults: User[] = [
    {
      id: "u_bukky",
      role: "mentee",
      name: "Bukola Ajayi",
      email: DEMO_MENTEE_EMAIL,
      passwordHash: pw,
      createdAt: iso(-12 * D),
      city: "Manchester",
      mentees: [{ name: "Bukola", age: 23, stage: "Recently graduated" }],
    },
    {
      id: "u_kunle",
      role: "mentee",
      name: "Kunle Ogunbiyi",
      email: "kunle@naijamentors.demo",
      passwordHash: pw,
      createdAt: iso(-4 * D),
      city: "London",
      mentees: [{ name: "Kunle", age: 21, stage: "At university" }],
    },
  ];

  const admins: User[] = [
    {
      id: "u_admin",
      role: "admin",
      name: "Naija Mentors Team",
      email: DEMO_ADMIN_EMAIL,
      passwordHash: pw,
      createdAt: iso(-90 * D),
    },
  ];

  const mentors = SEED_MENTORS.map((m) => ({ ...m, approvedAt: m.joined }));
  const mentorUsers: User[] = mentors.map((m) => ({
    id: m.userId,
    role: "mentor",
    name: `${m.honorific ? m.honorific + " " : ""}${m.firstName} ${m.lastName}`,
    email: mentorEmail(m),
    passwordHash: pw,
    createdAt: m.joined,
    mentorId: m.id,
    city: m.city,
  }));

  return {
    version: 1,
    users: [...admins, ...parents, ...adults, ...mentorUsers],
    mentors,
    conversations: [],
    messages: [],
    sessions: [],
  };
}

/**
 * Write the demo data into Postgres.
 * - `reset`: wipe every table first (used by `npm run db:reset`).
 * - `onlyIfEmpty`: do nothing if there are already users (used when the embedded dev database first opens).
 */
export async function seedDatabase(db: Database, { reset = false, onlyIfEmpty = false } = {}) {
  return db.transaction(async (tx) => {
    if (reset) {
      await tx.execute(sql`truncate table ${messagesTable}, ${sessionsTable}, ${conversations}, ${mentorsTable}, ${users} restart identity cascade`);
    } else if (onlyIfEmpty) {
      const [{ n }] = await tx.select({ n: count() }).from(users);
      if (n > 0) return false;
    }
    const seed = buildSeed();
    await tx.insert(users).values(seed.users.map(fromUser));
    await tx.insert(mentorsTable).values(seed.mentors.map(fromMentor));
    if (seed.conversations.length) await tx.insert(conversations).values(seed.conversations.map(fromConversation));
    if (seed.sessions.length) await tx.insert(sessionsTable).values(seed.sessions.map(fromSession));
    // One by one so the identity column keeps the conversation order.
    for (const m of seed.messages) await tx.insert(messagesTable).values(fromMessage(m));
    return true;
  });
}
