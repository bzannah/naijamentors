import type { Conversation, Mentor, Message, Session, User } from "../types";
import type { ConversationRow, MentorRow, MessageRow, SessionRow, UserRow, mentors, users } from "./schema";

/*
  Database rows ↔ the plain domain types in src/lib/types.ts.
  Rows use null for "absent"; the domain uses optional fields.
*/

const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

export function toUser(r: UserRow): User {
  return {
    id: r.id,
    role: r.role,
    name: r.name,
    email: r.email,
    passwordHash: r.passwordHash,
    temporaryPassword: r.temporaryPassword,
    createdAt: r.createdAt,
    mentorId: opt(r.mentorId),
    city: opt(r.city),
    mentees: r.mentees.map(({ name, age, stage, schoolYear }) => ({ name, age, stage: stage ?? schoolYear ?? "" })),
  };
}

export function fromUser(u: User): typeof users.$inferInsert {
  return {
    id: u.id,
    role: u.role,
    name: u.name,
    email: u.email.toLowerCase(),
    passwordHash: u.passwordHash,
    temporaryPassword: u.temporaryPassword ?? false,
    createdAt: u.createdAt,
    mentorId: u.mentorId ?? null,
    city: u.city ?? null,
    mentees: u.mentees ?? [],
  };
}

export function toMentor(r: MentorRow): Mentor {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { seq, verifiedDbs, verifiedId, verifiedReferences, honorific, photo, approvedAt, ...rest } = r;
  return {
    ...rest,
    honorific: opt(honorific),
    photo: opt(photo),
    approvedAt: opt(approvedAt),
    verified: { dbs: verifiedDbs, id: verifiedId, references: verifiedReferences },
  };
}

export function fromMentor(m: Mentor): typeof mentors.$inferInsert {
  const { verified, honorific, photo, approvedAt, ...rest } = m;
  return {
    ...rest,
    honorific: honorific ?? null,
    photo: photo ?? null,
    approvedAt: approvedAt ?? null,
    verifiedDbs: verified.dbs,
    verifiedId: verified.id,
    verifiedReferences: verified.references,
  };
}

export function toConversation(r: ConversationRow): Conversation {
  const { lastReadAccount, lastReadMentor, ...rest } = r;
  return { ...rest, lastRead: { account: lastReadAccount, mentor: lastReadMentor } };
}

export function fromConversation(c: Conversation): ConversationRow {
  const { lastRead, ...rest } = c;
  return { ...rest, lastReadAccount: lastRead.account, lastReadMentor: lastRead.mentor };
}

export function toSession(r: SessionRow): Session {
  return { ...r, meetingUrl: opt(r.meetingUrl), respondedAt: opt(r.respondedAt) };
}

export function fromSession(s: Session): SessionRow {
  return { ...s, meetingUrl: s.meetingUrl ?? null, respondedAt: s.respondedAt ?? null };
}

export function toMessage(r: MessageRow): Message {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { seq, sessionId, ...rest } = r;
  return { ...rest, sessionId: opt(sessionId) };
}

export function fromMessage(m: Message): Omit<MessageRow, "seq"> {
  return { ...m, sessionId: m.sessionId ?? null };
}
