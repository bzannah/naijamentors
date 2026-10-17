import { readDb } from "./db";
import { upcomingSlots } from "./time";
import type { SafeUser } from "./auth";
import type { Conversation, Db, Mentor, Message, Session, User } from "./types";

export function mentorName(m: Pick<Mentor, "honorific" | "firstName" | "lastName">) {
  return `${m.honorific ? m.honorific + " " : ""}${m.firstName} ${m.lastName}`;
}

export function bookedStarts(db: Db, mentorId: string) {
  return new Set(
    db.sessions
      .filter((s) => s.mentorId === mentorId && (s.status === "pending" || s.status === "accepted"))
      .map((s) => s.start),
  );
}

export function slotsFor(db: Db, mentor: Mentor, days = 14) {
  return upcomingSlots(mentor.availability, bookedStarts(db, mentor.id), { days });
}

export type MentorListing = Mentor & { nextSlot: string | null; slotCount: number };

export function listMentors(): MentorListing[] {
  const db = readDb();
  return db.mentors.map((m) => {
    const slots = slotsFor(db, m);
    return { ...m, nextSlot: slots[0]?.start ?? null, slotCount: slots.length };
  });
}

export function getMentorBySlug(slug: string) {
  const db = readDb();
  const mentor = db.mentors.find((m) => m.slug === slug);
  if (!mentor) return null;
  return { mentor, slots: slotsFor(db, mentor, 20) };
}

export function getMentorById(id: string) {
  return readDb().mentors.find((m) => m.id === id) ?? null;
}

function userById(db: Db, id: string): User | undefined {
  return db.users.find((u) => u.id === id);
}

export function canAccess(user: SafeUser, c: Conversation, db: Db) {
  if (user.role === "parent") return c.parentId === user.id;
  const mentor = db.mentors.find((m) => m.id === c.mentorId);
  return mentor?.userId === user.id;
}

function unreadFor(user: SafeUser, c: Conversation, msgs: Message[]) {
  const since = user.role === "parent" ? c.lastRead.parent : c.lastRead.mentor;
  return msgs.filter((m) => m.createdAt > since && m.senderId !== user.id && m.kind !== "system").length;
}

export type Counterpart = { name: string; photo?: string; subtitle: string; href?: string };

function counterpart(db: Db, user: SafeUser, c: Conversation): Counterpart {
  if (user.role === "parent") {
    const m = db.mentors.find((x) => x.id === c.mentorId)!;
    return { name: mentorName(m), photo: m.photo, subtitle: m.role, href: `/mentors/${m.slug}` };
  }
  const p = userById(db, c.parentId);
  return {
    name: p?.name ?? "Parent",
    subtitle: `Parent of ${c.menteeName}, ${c.menteeAge} · ${c.schoolYear}`,
  };
}

export type ConversationSummary = {
  conversation: Conversation;
  other: Counterpart;
  last?: Message;
  unread: number;
  session?: Session;
};

export function conversationsFor(user: SafeUser): ConversationSummary[] {
  const db = readDb();
  return db.conversations
    .filter((c) => canAccess(user, c, db))
    .map((c) => {
      const msgs = db.messages.filter((m) => m.conversationId === c.id);
      const sessions = db.sessions.filter((s) => s.conversationId === c.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return {
        conversation: c,
        other: counterpart(db, user, c),
        last: msgs.at(-1),
        unread: unreadFor(user, c, msgs),
        session: sessions[0],
      };
    })
    .sort((a, b) => b.conversation.updatedAt.localeCompare(a.conversation.updatedAt));
}

export function unreadTotal(user: SafeUser) {
  const db = readDb();
  return db.conversations
    .filter((c) => canAccess(user, c, db))
    .reduce((n, c) => n + unreadFor(user, c, db.messages.filter((m) => m.conversationId === c.id)), 0);
}

export type Thread = {
  conversation: Conversation;
  mentor: Mentor;
  parent: Pick<User, "id" | "name" | "city">;
  messages: Message[];
  sessions: Record<string, Session>;
  other: Counterpart;
  names: Record<string, string>;
};

export function threadFor(user: SafeUser, id: string): Thread | null {
  const db = readDb();
  const c = db.conversations.find((x) => x.id === id);
  if (!c || !canAccess(user, c, db)) return null;
  const mentor = db.mentors.find((m) => m.id === c.mentorId)!;
  const parent = userById(db, c.parentId)!;
  const sessions = Object.fromEntries(db.sessions.filter((s) => s.conversationId === c.id).map((s) => [s.id, s]));
  return {
    conversation: c,
    mentor,
    parent: { id: parent.id, name: parent.name, city: parent.city },
    messages: db.messages.filter((m) => m.conversationId === c.id),
    sessions,
    other: counterpart(db, user, c),
    names: { [parent.id]: parent.name, [mentor.userId]: mentorName(mentor) },
  };
}

export type SessionView = Session & { mentor: Mentor; parentName: string; menteeName: string; menteeAge: number; schoolYear: string };

export function sessionsFor(user: SafeUser): SessionView[] {
  const db = readDb();
  const mine = db.sessions.filter((s) => {
    const c = db.conversations.find((x) => x.id === s.conversationId);
    return c && canAccess(user, c, db);
  });
  return mine
    .map((s) => {
      const c = db.conversations.find((x) => x.id === s.conversationId)!;
      return {
        ...s,
        mentor: db.mentors.find((m) => m.id === s.mentorId)!,
        parentName: userById(db, s.parentId)?.name ?? "Parent",
        menteeName: c.menteeName,
        menteeAge: c.menteeAge,
        schoolYear: c.schoolYear,
      };
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function sessionById(user: SafeUser, id: string): SessionView | null {
  return sessionsFor(user).find((s) => s.id === id) ?? null;
}

export function mentorForUser(user: SafeUser) {
  if (user.role !== "mentor" || !user.mentorId) return null;
  return getMentorById(user.mentorId);
}
