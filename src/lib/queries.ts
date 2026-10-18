import { and, asc, count, desc, eq, gt, inArray, ne, notInArray, sql, type SQL } from "drizzle-orm";
import { cache } from "react";
import { getDb, type Database } from "./db";
import { toConversation, toMentor, toMessage, toSession } from "./db/mappers";
import { conversations, mentors, messages, sessions, users } from "./db/schema";
import { canBook } from "./mentees";
import { upcomingSlots } from "./time";
import type { SafeUser } from "./auth";
import type { Conversation, Mentor, Message, Role, Session, User } from "./types";

export function mentorName(m: Pick<Mentor, "honorific" | "firstName" | "lastName">) {
  return `${m.honorific ? m.honorific + " " : ""}${m.firstName} ${m.lastName}`;
}

/* ---------------- Availability ---------------- */

const LIVE = ["pending", "accepted"] as const;

/** Upcoming starts that are already requested or confirmed, per mentor. */
async function bookedStarts(db: Database, mentorIds?: string[]) {
  const rows = await db
    .select({ mentorId: sessions.mentorId, start: sessions.start })
    .from(sessions)
    .where(
      and(
        inArray(sessions.status, [...LIVE]),
        gt(sessions.start, new Date().toISOString()),
        mentorIds ? inArray(sessions.mentorId, mentorIds) : undefined,
      ),
    );
  const map = new Map<string, Set<string>>();
  for (const r of rows) map.set(r.mentorId, (map.get(r.mentorId) ?? new Set()).add(r.start));
  return map;
}

/** Open slots for one mentor, read fresh (used when validating a booking). */
export async function slotsFor(mentor: Mentor, days = 14) {
  const booked = await bookedStarts(await getDb(), [mentor.id]);
  return upcomingSlots(mentor.availability, booked.get(mentor.id) ?? new Set(), { days });
}

/* ---------------- Mentors ---------------- */

export type MentorListing = Mentor & { nextSlot: string | null; slotCount: number };

export const listMentors = cache(async (): Promise<MentorListing[]> => {
  const db = await getDb();
  const [rows, booked] = await Promise.all([db.select().from(mentors).orderBy(asc(mentors.seq)), bookedStarts(db)]);
  return rows.map((row) => {
    const m = toMentor(row);
    const slots = upcomingSlots(m.availability, booked.get(m.id) ?? new Set(), { days: 14 });
    return { ...m, nextSlot: slots[0]?.start ?? null, slotCount: slots.length };
  });
});

export const getMentorBySlug = cache(async (slug: string) => {
  const db = await getDb();
  const [row] = await db.select().from(mentors).where(eq(mentors.slug, slug)).limit(1);
  if (!row) return null;
  const mentor = toMentor(row);
  return { mentor, slots: await slotsFor(mentor, 20) };
});

export async function getMentorById(id: string) {
  const [row] = await (await getDb()).select().from(mentors).where(eq(mentors.id, id)).limit(1);
  return row ? toMentor(row) : null;
}

export const mentorForUser = cache(async (user: Pick<SafeUser, "id" | "role">) => {
  if (user.role !== "mentor") return null;
  const [row] = await (await getDb()).select().from(mentors).where(eq(mentors.userId, user.id)).limit(1);
  return row ? toMentor(row) : null;
});

/* ---------------- Access ---------------- */

/** SQL condition: conversations this user is a party to. Admins aren't party to any. */
function accessible(db: Database, user: Pick<SafeUser, "id" | "role">): SQL {
  if (canBook(user.role)) return eq(conversations.accountId, user.id);
  if (user.role === "mentor")
    return inArray(conversations.mentorId, db.select({ id: mentors.id }).from(mentors).where(eq(mentors.userId, user.id)));
  return sql`false`;
}

/** Load a conversation if the user may see it. */
export async function accessibleConversation(user: Pick<SafeUser, "id" | "role">, id: string): Promise<Conversation | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), accessible(db, user)))
    .limit(1);
  return row ? toConversation(row) : null;
}

/** The thread between an account and a mentor, if one exists. */
export async function conversationBetween(accountId: string, mentorId: string): Promise<Conversation | null> {
  const [row] = await (await getDb())
    .select()
    .from(conversations)
    .where(and(eq(conversations.accountId, accountId), eq(conversations.mentorId, mentorId)))
    .orderBy(asc(conversations.createdAt))
    .limit(1);
  return row ? toConversation(row) : null;
}

/* ---------------- Inbox ---------------- */

export type Counterpart = { name: string; photo?: string; subtitle: string; href?: string };

/** The mentee-side account of a conversation: a parent, or an adult mentee speaking for themselves. */
export type Account = { name: string; role: Role };

function counterpart(user: SafeUser, c: Conversation, m: Mentor, account: Account | null): Counterpart {
  if (user.role !== "mentor") return { name: mentorName(m), photo: m.photo, subtitle: m.role, href: `/mentors/${m.slug}` };
  if (account?.role === "mentee") return { name: account.name, subtitle: `${c.menteeAge} · ${c.stage}` };
  return {
    name: account?.name ?? "Parent",
    subtitle: `Parent of ${c.menteeName}, ${c.menteeAge} · ${c.stage}`,
  };
}

/** Messages the user hasn't read yet, per conversation. Their own messages and status updates don't count. */
async function unreadCounts(db: Database, user: SafeUser, where: SQL) {
  const lastRead = user.role === "mentor" ? conversations.lastReadMentor : conversations.lastReadAccount;
  const rows = await db
    .select({ id: messages.conversationId, n: count() })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .where(and(where, gt(messages.createdAt, lastRead), ne(messages.senderId, user.id), ne(messages.kind, "system")))
    .groupBy(messages.conversationId);
  return new Map(rows.map((r) => [r.id, r.n]));
}

export type ConversationSummary = {
  conversation: Conversation;
  other: Counterpart;
  last?: Message;
  unread: number;
  session?: Session;
};

export const conversationsFor = cache(async (user: SafeUser): Promise<ConversationSummary[]> => {
  const db = await getDb();
  const rows = await db
    .select({ c: conversations, m: mentors, account: { name: users.name, role: users.role } })
    .from(conversations)
    .innerJoin(mentors, eq(mentors.id, conversations.mentorId))
    .leftJoin(users, eq(users.id, conversations.accountId))
    .where(accessible(db, user))
    .orderBy(desc(conversations.updatedAt));
  if (!rows.length) return [];

  const ids = rows.map((r) => r.c.id);
  const [lasts, unread, latest] = await Promise.all([
    db
      .selectDistinctOn([messages.conversationId])
      .from(messages)
      .where(inArray(messages.conversationId, ids))
      .orderBy(messages.conversationId, desc(messages.seq)),
    unreadCounts(db, user, inArray(conversations.id, ids)),
    db
      .selectDistinctOn([sessions.conversationId])
      .from(sessions)
      .where(inArray(sessions.conversationId, ids))
      .orderBy(sessions.conversationId, desc(sessions.createdAt)),
  ]);
  const lastBy = new Map(lasts.map((m) => [m.conversationId, toMessage(m)]));
  const sessionBy = new Map(latest.map((s) => [s.conversationId, toSession(s)]));

  return rows.map(({ c: row, m, account }) => {
    const conversation = toConversation(row);
    return {
      conversation,
      other: counterpart(user, conversation, toMentor(m), account),
      last: lastBy.get(row.id),
      unread: unread.get(row.id) ?? 0,
      session: sessionBy.get(row.id),
    };
  });
});

export const unreadTotal = cache(async (user: SafeUser) => {
  if (user.role === "admin") return 0;
  const db = await getDb();
  let total = 0;
  for (const n of (await unreadCounts(db, user, accessible(db, user))).values()) total += n;
  return total;
});

export type Thread = {
  conversation: Conversation;
  mentor: Mentor;
  account: Pick<User, "id" | "name" | "city" | "role">;
  messages: Message[];
  sessions: Record<string, Session>;
  other: Counterpart;
  names: Record<string, string>;
};

export async function threadFor(user: SafeUser, id: string): Promise<Thread | null> {
  const db = await getDb();
  const [row] = await db
    .select({ c: conversations, m: mentors, a: { id: users.id, name: users.name, city: users.city, role: users.role } })
    .from(conversations)
    .innerJoin(mentors, eq(mentors.id, conversations.mentorId))
    .innerJoin(users, eq(users.id, conversations.accountId))
    .where(and(eq(conversations.id, id), accessible(db, user)))
    .limit(1);
  if (!row) return null;

  const [msgs, sess] = await Promise.all([
    db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.seq)),
    db.select().from(sessions).where(eq(sessions.conversationId, id)),
  ]);
  const conversation = toConversation(row.c);
  const mentor = toMentor(row.m);
  const account = { id: row.a.id, name: row.a.name, city: row.a.city ?? undefined, role: row.a.role };
  return {
    conversation,
    mentor,
    account,
    messages: msgs.map(toMessage),
    sessions: Object.fromEntries(sess.map((s) => [s.id, toSession(s)])),
    other: counterpart(user, conversation, mentor, account),
    names: { [account.id]: account.name, [mentor.userId]: mentorName(mentor) },
  };
}

/* ---------------- Sessions ---------------- */

export type SessionView = Session & {
  mentor: Mentor;
  /** Who requested it: a parent, or the mentee themselves. */
  account: Account;
  menteeName: string;
  menteeAge: number;
  stage: string;
};

async function sessionViews(user: SafeUser, extra?: SQL): Promise<SessionView[]> {
  const db = await getDb();
  const rows = await db
    .select({
      s: sessions,
      m: mentors,
      accountName: users.name,
      accountRole: users.role,
      menteeName: conversations.menteeName,
      menteeAge: conversations.menteeAge,
      stage: conversations.stage,
    })
    .from(sessions)
    .innerJoin(conversations, eq(conversations.id, sessions.conversationId))
    .innerJoin(mentors, eq(mentors.id, sessions.mentorId))
    .leftJoin(users, eq(users.id, sessions.accountId))
    .where(and(accessible(db, user), extra))
    .orderBy(asc(sessions.start));
  return rows.map(({ s, m, accountName, accountRole, ...c }) => ({
    ...toSession(s),
    mentor: toMentor(m),
    account: { name: accountName ?? "Parent", role: accountRole ?? "parent" },
    ...c,
  }));
}

export const sessionsFor = cache((user: SafeUser) => sessionViews(user));

export async function sessionById(user: SafeUser, id: string): Promise<SessionView | null> {
  return (await sessionViews(user, eq(sessions.id, id)))[0] ?? null;
}

/** Start time of any session. The landing page uses the demo session to show a real countdown. */
export async function sessionStart(id: string) {
  const [row] = await (await getDb()).select({ start: sessions.start }).from(sessions).where(eq(sessions.id, id)).limit(1);
  return row?.start;
}

/* ---------------- Admin ---------------- */

export type MentorReview = Mentor & { email: string; sessionCount: number };

/** Every mentor with their sign-in email and how many live or past sessions they hold. Pending first. */
export async function mentorsForReview(): Promise<MentorReview[]> {
  const db = await getDb();
  const sessionCount = db
    .select({ mentorId: sessions.mentorId, n: count().as("n") })
    .from(sessions)
    .where(notInArray(sessions.status, ["declined", "cancelled"]))
    .groupBy(sessions.mentorId)
    .as("sc");
  const rows = await db
    .select({ m: mentors, email: users.email, n: sessionCount.n })
    .from(mentors)
    .innerJoin(users, eq(users.id, mentors.userId))
    .leftJoin(sessionCount, eq(sessionCount.mentorId, mentors.id))
    .orderBy(sql`${mentors.status} = 'pending' desc`, desc(mentors.joined));
  return rows.map(({ m, email, n }) => ({ ...toMentor(m), email, sessionCount: Number(n ?? 0) }));
}
