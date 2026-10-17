import { count, sql } from "drizzle-orm";
import { SEED_MENTORS } from "../data/mentors";
import type { Database } from "./db";
import { fromConversation, fromMentor, fromMessage, fromSession, fromUser } from "./db/mappers";
import { conversations, mentors as mentorsTable, messages as messagesTable, sessions as sessionsTable, users } from "./db/schema";
import { hashPassword } from "./password";
import { upcomingSlots } from "./time";
import type { Conversation, Db, Message, Mentor, Session, User } from "./types";

export const DEMO_PASSWORD = "village-demo";
export const DEMO_PARENT_EMAIL = "funmi@village.demo";
export const DEMO_MENTOR_EMAIL = "chiamaka@mentor.village.demo";
export const DEMO_ADMIN_EMAIL = "admin@village.demo";

export function mentorEmail(m: Pick<Mentor, "firstName">) {
  return `${m.firstName.toLowerCase()}@mentor.village.demo`;
}

export function meetingUrl(mentor: Pick<Mentor, "firstName">, mentee: string, id: string) {
  const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");
  return `https://meet.jit.si/Village-${clean(mentor.firstName)}-${clean(mentee)}-${id.slice(-6)}`;
}

/** Build a fresh database with sample mentors and a few lived-in conversations. */
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
      children: [
        { name: "Tobi", age: 15, schoolYear: "Year 11" },
        { name: "David", age: 13, schoolYear: "Year 8" },
      ],
    },
    {
      id: "u_chinedu",
      role: "parent",
      name: "Chinedu Eze",
      email: "chinedu@village.demo",
      passwordHash: pw,
      createdAt: iso(-20 * D),
      city: "Manchester",
      children: [{ name: "Somto", age: 16, schoolYear: "Year 12" }],
    },
    {
      id: "u_halima",
      role: "parent",
      name: "Halima Musa",
      email: "halima@village.demo",
      passwordHash: pw,
      createdAt: iso(-60 * D),
      city: "Birmingham",
      children: [{ name: "Amina", age: 14, schoolYear: "Year 10" }],
    },
  ];

  const admins: User[] = [
    {
      id: "u_admin",
      role: "admin",
      name: "Village Team",
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

  const chiamaka = mentors.find((m) => m.slug === "chiamaka-obi")!;
  const tunde = mentors.find((m) => m.slug === "tunde-adebayo")!;

  const chiSlots = upcomingSlots(chiamaka.availability, new Set(), { now, leadHours: 30 });
  const tundeSlots = upcomingSlots(tunde.availability, new Set(), { now, leadHours: 30 });

  const conversations: Conversation[] = [];
  const messages: Message[] = [];
  const sessions: Session[] = [];
  let n = 0;
  const msg = (m: Omit<Message, "id">) => messages.push({ id: `msg_seed_${++n}`, ...m });

  // 1. Funmi ↔ Dr. Chiamaka: accepted, upcoming
  {
    const c: Conversation = {
      id: "c_funmi_chiamaka",
      parentId: "u_funmi",
      mentorId: chiamaka.id,
      menteeName: "Tobi",
      menteeAge: 15,
      schoolYear: "Year 11",
      createdAt: iso(-3 * D),
      updatedAt: iso(-5 * H),
      lastRead: { parent: iso(-20 * H), mentor: iso(-5 * H) },
    };
    const s: Session = {
      id: "s_tobi_1",
      conversationId: c.id,
      mentorId: chiamaka.id,
      parentId: c.parentId,
      start: chiSlots[0].start,
      durationMin: 45,
      topic: "Exploring a career in medicine",
      goals: "Understand what she should be doing in Year 11 and 12 to get into medical school, and what work experience she can realistically get.",
      status: "accepted",
      createdAt: iso(-3 * D),
      respondedAt: iso(-3 * D + 2 * H),
    };
    s.meetingUrl = meetingUrl(chiamaka, "Tobi", "s_tobi_1a8f3c");
    conversations.push(c);
    sessions.push(s);
    msg({
      conversationId: c.id,
      senderId: "u_funmi",
      kind: "request",
      sessionId: s.id,
      body: "Good evening Dr. Obi. My daughter Tobi is in Year 11 and has her heart set on medicine. She's predicted 8s and 9s, but we don't know anyone in the profession and we're not sure what she should be doing now. Would you be willing to have a first chat with her?",
      createdAt: iso(-3 * D),
    });
    msg({ conversationId: c.id, senderId: "system", kind: "system", sessionId: s.id, body: "accepted", createdAt: iso(-3 * D + 2 * H) });
    msg({
      conversationId: c.id,
      senderId: chiamaka.userId,
      kind: "text",
      body: "Hello Mrs Adeyemi, thank you so much for reaching out, and well done to Tobi! I'd love to meet her. In our first session I'd like to hear what drew her to medicine, then we'll talk through work experience and the UCAT. No preparation needed, but if she has questions she should jot them down.",
      createdAt: iso(-3 * D + 2 * H + 60_000),
    });
    msg({
      conversationId: c.id,
      senderId: "u_funmi",
      kind: "text",
      body: "Thank you so much, ma. She's already started a list! I'll be in the room at the start to say hello.",
      createdAt: iso(-2 * D),
    });
    msg({
      conversationId: c.id,
      senderId: chiamaka.userId,
      kind: "text",
      body: "Perfect. The video link is on the session card above. I'm looking forward to it. Tell Tobi to bring her toughest question 😊",
      createdAt: iso(-5 * H),
    });
  }

  // 2. Funmi ↔ Tunde: pending
  {
    const c: Conversation = {
      id: "c_funmi_tunde",
      parentId: "u_funmi",
      mentorId: tunde.id,
      menteeName: "David",
      menteeAge: 13,
      schoolYear: "Year 8",
      createdAt: iso(-7 * H),
      updatedAt: iso(-7 * H),
      lastRead: { parent: iso(-7 * H), mentor: iso(-30 * D) },
    };
    const s: Session = {
      id: "s_david_1",
      conversationId: c.id,
      mentorId: tunde.id,
      parentId: c.parentId,
      start: tundeSlots[0].start,
      durationMin: 45,
      topic: "Getting started with coding",
      goals: "David spends hours on Roblox and has started asking how games are made. We'd love him to hear how a real software engineer started.",
      status: "pending",
      createdAt: iso(-7 * H),
    };
    conversations.push(c);
    sessions.push(s);
    msg({
      conversationId: c.id,
      senderId: "u_funmi",
      kind: "request",
      sessionId: s.id,
      body: "Hi Tunde, my son David (13) spends every spare minute on Roblox and recently started asking how games are actually made. I'd love for him to hear from someone who does this for real. Would you have time for a session?",
      createdAt: iso(-7 * H),
    });
  }

  // 3. Chinedu ↔ Dr. Chiamaka: pending request waiting on the mentor
  {
    const c: Conversation = {
      id: "c_chinedu_chiamaka",
      parentId: "u_chinedu",
      mentorId: chiamaka.id,
      menteeName: "Somto",
      menteeAge: 16,
      schoolYear: "Year 12",
      createdAt: iso(-26 * H),
      updatedAt: iso(-26 * H),
      lastRead: { parent: iso(-26 * H), mentor: iso(-30 * D) },
    };
    const s: Session = {
      id: "s_somto_1",
      conversationId: c.id,
      mentorId: chiamaka.id,
      parentId: c.parentId,
      start: chiSlots[1].start,
      durationMin: 45,
      topic: "Preparing for the UCAT",
      goals: "Somto takes Biology, Chemistry and Maths. He sits the UCAT this summer and is anxious about where to start.",
      status: "pending",
      createdAt: iso(-26 * H),
    };
    conversations.push(c);
    sessions.push(s);
    msg({
      conversationId: c.id,
      senderId: "u_chinedu",
      kind: "request",
      sessionId: s.id,
      body: "Good afternoon Dr. Obi. My son Somto is in Year 12 taking Biology, Chemistry and Maths. He sits the UCAT next summer and is quite anxious about it. Would you be able to give him some guidance on how to prepare? Thank you for doing this for our children.",
      createdAt: iso(-26 * H),
    });
  }

  // 4. Halima ↔ Dr. Chiamaka: a completed session with a warm follow-up
  {
    const c: Conversation = {
      id: "c_halima_chiamaka",
      parentId: "u_halima",
      mentorId: chiamaka.id,
      menteeName: "Amina",
      menteeAge: 14,
      schoolYear: "Year 10",
      createdAt: iso(-16 * D),
      updatedAt: iso(-8 * D),
      lastRead: { parent: iso(-8 * D), mentor: iso(-8 * D) },
    };
    const s: Session = {
      id: "s_amina_1",
      conversationId: c.id,
      mentorId: chiamaka.id,
      parentId: c.parentId,
      start: new Date(Math.floor((now - 10 * D) / H) * H).toISOString(),
      durationMin: 45,
      topic: "What it's like to be a paediatrician",
      goals: "Amina wants to work with children in hospital and would love to hear about your path.",
      status: "accepted",
      createdAt: iso(-16 * D),
      respondedAt: iso(-15 * D),
    };
    s.meetingUrl = meetingUrl(chiamaka, "Amina", "s_amina_1b2d9e");
    conversations.push(c);
    sessions.push(s);
    msg({
      conversationId: c.id,
      senderId: "u_halima",
      kind: "request",
      sessionId: s.id,
      body: "Salaam Dr. Obi. Amina is 14 and says she wants to be a children's doctor 'just like the lady on the website'. Would you speak with her?",
      createdAt: iso(-16 * D),
    });
    msg({ conversationId: c.id, senderId: "system", kind: "system", sessionId: s.id, body: "accepted", createdAt: iso(-15 * D) });
    msg({
      conversationId: c.id,
      senderId: "u_halima",
      kind: "text",
      body: "Thank you so much for Saturday. Amina hasn't stopped talking about it! She has already emailed the hospital about volunteering.",
      createdAt: iso(-9 * D),
    });
    msg({
      conversationId: c.id,
      senderId: chiamaka.userId,
      kind: "text",
      body: "That has made my week! Tell her I'm proud of her. Let's book a follow-up next month once she's heard back.",
      createdAt: iso(-8 * D),
    });
  }

  return {
    version: 1,
    users: [...admins, ...parents, ...mentorUsers],
    mentors,
    conversations,
    messages,
    sessions,
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
    await tx.insert(conversations).values(seed.conversations.map(fromConversation));
    await tx.insert(sessionsTable).values(seed.sessions.map(fromSession));
    // One by one so the identity column keeps the conversation order.
    for (const m of seed.messages) await tx.insert(messagesTable).values(fromMessage(m));
    return true;
  });
}
