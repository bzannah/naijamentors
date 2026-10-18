import { count, sql } from "drizzle-orm";
import { SEED_MENTORS } from "../data/mentors";
import type { Database } from "./db";
import { fromConversation, fromMentor, fromMessage, fromSession, fromUser } from "./db/mappers";
import { conversations, mentors as mentorsTable, messages as messagesTable, sessions as sessionsTable, users } from "./db/schema";
import { hashPassword } from "./password";
import { upcomingSlots } from "./time";
import type { Conversation, Db, Message, Mentor, Session, User } from "./types";

export const DEMO_PASSWORD = "village-demo";
export const DEMO_PARENT_EMAIL = "funmi@naijamentors.demo";
export const DEMO_MENTEE_EMAIL = "bukky@naijamentors.demo";
export const DEMO_MENTOR_EMAIL = "chiamaka@mentor.naijamentors.demo";
export const DEMO_ADMIN_EMAIL = "admin@naijamentors.demo";

export function mentorEmail(m: Pick<Mentor, "firstName">) {
  return `${m.firstName.toLowerCase()}@mentor.naijamentors.demo`;
}

export function meetingUrl(mentor: Pick<Mentor, "firstName">, mentee: string, id: string) {
  const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");
  return `https://meet.jit.si/NaijaMentors-${clean(mentor.firstName)}-${clean(mentee)}-${id.slice(-6)}`;
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

  const chiamaka = mentors.find((m) => m.slug === "chiamaka-obi")!;
  const tunde = mentors.find((m) => m.slug === "tunde-adebayo")!;
  const temi = mentors.find((m) => m.slug === "temi-ogunleye")!;

  const chiSlots = upcomingSlots(chiamaka.availability, new Set(), { now, leadHours: 30 });
  const tundeSlots = upcomingSlots(tunde.availability, new Set(), { now, leadHours: 30 });
  const temiSlots = upcomingSlots(temi.availability, new Set(), { now, leadHours: 30 });

  const conversations: Conversation[] = [];
  const messages: Message[] = [];
  const sessions: Session[] = [];
  let n = 0;
  const msg = (m: Omit<Message, "id">) => messages.push({ id: `msg_seed_${++n}`, ...m });

  // 1. Funmi ↔ Dr. Chiamaka: accepted, upcoming
  {
    const c: Conversation = {
      id: "c_funmi_chiamaka",
      accountId: "u_funmi",
      mentorId: chiamaka.id,
      menteeName: "Tobi",
      menteeAge: 15,
      stage: "Year 11",
      createdAt: iso(-3 * D),
      updatedAt: iso(-5 * H),
      lastRead: { account: iso(-20 * H), mentor: iso(-5 * H) },
    };
    const s: Session = {
      id: "s_tobi_1",
      conversationId: c.id,
      mentorId: chiamaka.id,
      accountId: c.accountId,
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
      accountId: "u_funmi",
      mentorId: tunde.id,
      menteeName: "David",
      menteeAge: 13,
      stage: "Year 8",
      createdAt: iso(-7 * H),
      updatedAt: iso(-7 * H),
      lastRead: { account: iso(-7 * H), mentor: iso(-30 * D) },
    };
    const s: Session = {
      id: "s_david_1",
      conversationId: c.id,
      mentorId: tunde.id,
      accountId: c.accountId,
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
      accountId: "u_chinedu",
      mentorId: chiamaka.id,
      menteeName: "Somto",
      menteeAge: 16,
      stage: "Year 12",
      createdAt: iso(-26 * H),
      updatedAt: iso(-26 * H),
      lastRead: { account: iso(-26 * H), mentor: iso(-30 * D) },
    };
    const s: Session = {
      id: "s_somto_1",
      conversationId: c.id,
      mentorId: chiamaka.id,
      accountId: c.accountId,
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
      accountId: "u_halima",
      mentorId: chiamaka.id,
      menteeName: "Amina",
      menteeAge: 14,
      stage: "Year 10",
      createdAt: iso(-16 * D),
      updatedAt: iso(-8 * D),
      lastRead: { account: iso(-8 * D), mentor: iso(-8 * D) },
    };
    const s: Session = {
      id: "s_amina_1",
      conversationId: c.id,
      mentorId: chiamaka.id,
      accountId: c.accountId,
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

  // 5. Bukky ↔ Tunde: an adult mentee's confirmed session
  {
    const c: Conversation = {
      id: "c_bukky_tunde",
      accountId: "u_bukky",
      mentorId: tunde.id,
      menteeName: "Bukola",
      menteeAge: 23,
      stage: "Recently graduated",
      createdAt: iso(-6 * D),
      updatedAt: iso(-26 * H),
      lastRead: { account: iso(-26 * H), mentor: iso(-26 * H) },
    };
    const s: Session = {
      id: "s_bukky_1",
      conversationId: c.id,
      mentorId: tunde.id,
      accountId: c.accountId,
      start: tundeSlots[1].start,
      durationMin: 45,
      topic: "Landing a first software role",
      goals: "I graduated in Computer Science in July and I've sent 40 applications with two interviews. I'd love an honest look at my CV and some advice on technical interviews.",
      status: "accepted",
      createdAt: iso(-6 * D),
      respondedAt: iso(-5 * D),
    };
    s.meetingUrl = meetingUrl(tunde, "Bukola", "s_bukky_1c4e7a");
    conversations.push(c);
    sessions.push(s);
    msg({
      conversationId: c.id,
      senderId: "u_bukky",
      kind: "request",
      sessionId: s.id,
      body: "Hi Tunde, I graduated in Computer Science from Manchester in July. I've sent about 40 applications for junior developer roles and had two interviews, both ending at the technical round. Could we look at my CV and talk about how to prepare? Thank you for doing this.",
      createdAt: iso(-6 * D),
    });
    msg({ conversationId: c.id, senderId: "system", kind: "system", sessionId: s.id, body: "accepted", createdAt: iso(-5 * D) });
    msg({
      conversationId: c.id,
      senderId: tunde.userId,
      kind: "text",
      body: "Hi Bukola, congratulations on graduating! Two technical rounds from 40 applications is better than you think. Send over your CV here before we meet, and bring one problem from an interview that tripped you up. We'll work through it together.",
      createdAt: iso(-5 * D + 30 * 60_000),
    });
    msg({
      conversationId: c.id,
      senderId: "u_bukky",
      kind: "text",
      body: "Thank you so much! I've just updated it and I'll bring the linked-list question that got me last time 😅",
      createdAt: iso(-26 * H),
    });
  }

  // 6. Bukky ↔ Temi: pending, exploring a change of direction
  {
    const c: Conversation = {
      id: "c_bukky_temi",
      accountId: "u_bukky",
      mentorId: temi.id,
      menteeName: "Bukola",
      menteeAge: 23,
      stage: "Recently graduated",
      createdAt: iso(-9 * H),
      updatedAt: iso(-9 * H),
      lastRead: { account: iso(-9 * H), mentor: iso(-30 * D) },
    };
    const s: Session = {
      id: "s_bukky_2",
      conversationId: c.id,
      mentorId: temi.id,
      accountId: c.accountId,
      start: temiSlots[0].start,
      durationMin: 45,
      topic: "UX & product design",
      goals: "I enjoyed the design side of my final-year project more than the coding. I'd like to understand whether product design could be a path for me.",
      status: "pending",
      createdAt: iso(-9 * H),
    };
    conversations.push(c);
    sessions.push(s);
    msg({
      conversationId: c.id,
      senderId: "u_bukky",
      kind: "request",
      sessionId: s.id,
      body: "Hi Temi, I'm a recent Computer Science graduate. My favourite part of my final-year project was designing how people would actually use the app. I'm wondering whether product design could be a path for me, and how people move into it from tech.",
      createdAt: iso(-9 * H),
    });
  }

  // 7. Kunle ↔ Dr. Chiamaka: a medical student's request waiting on the mentor
  {
    const c: Conversation = {
      id: "c_kunle_chiamaka",
      accountId: "u_kunle",
      mentorId: chiamaka.id,
      menteeName: "Kunle",
      menteeAge: 21,
      stage: "At university",
      createdAt: iso(-14 * H),
      updatedAt: iso(-14 * H),
      lastRead: { account: iso(-14 * H), mentor: iso(-30 * D) },
    };
    const s: Session = {
      id: "s_kunle_1",
      conversationId: c.id,
      mentorId: chiamaka.id,
      accountId: c.accountId,
      start: chiSlots[2].start,
      durationMin: 45,
      topic: "Life as a junior doctor",
      goals: "I'm in third year at King's and leaning towards paediatrics. I'd love to understand foundation training and how to make myself a strong applicant.",
      status: "pending",
      createdAt: iso(-14 * H),
    };
    conversations.push(c);
    sessions.push(s);
    msg({
      conversationId: c.id,
      senderId: "u_kunle",
      kind: "request",
      sessionId: s.id,
      body: "Good evening Dr. Obi. I'm a third-year medical student at King's and I'm drawn to paediatrics. Nobody in my family is in medicine, so I'd really value hearing how you chose your specialty and what I should be doing now to prepare for foundation training.",
      createdAt: iso(-14 * H),
    });
  }

  return {
    version: 1,
    users: [...admins, ...parents, ...adults, ...mentorUsers],
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
