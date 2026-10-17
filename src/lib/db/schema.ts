import { sql } from "drizzle-orm";
import { bigint, boolean, customType, index, integer, jsonb, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import type { Child, FieldKey, Role, SessionStatus, WeeklySlot } from "../types";

/*
  Postgres schema for Village. Mirrors the entities in src/lib/types.ts; the row → domain
  mapping lives in ./mappers.ts so pages keep working with the plain types.
*/

/**
 * timestamptz that reads and writes ISO-8601 strings, which is what the rest of the app uses.
 * Millisecond precision so values round-trip exactly through Date#toISOString().
 */
const isoTimestamp = customType<{ data: string; driverData: string | Date }>({
  dataType: () => "timestamp(3) with time zone",
  toDriver: (value) => value,
  fromDriver: (value) => new Date(value).toISOString(),
});

const at = (name: string) => isoTimestamp(name).notNull();

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    role: text("role").$type<Role>().notNull(),
    name: text("name").notNull(),
    // Always stored lower-case.
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: at("created_at").default(sql`now()`),
    // Points at mentors.id. Not a foreign key because mentors.user_id already points back here.
    mentorId: text("mentor_id"),
    city: text("city"),
    children: jsonb("children").$type<Child[]>().notNull().default([]),
    // Last time this user was sent an unread-messages digest.
    digestSentAt: isoTimestamp("digest_sent_at"),
  },
  (t) => [uniqueIndex("users_email_key").on(t.email)],
);

export const mentors = pgTable(
  "mentors",
  {
    // Directory order: the order mentors joined the platform.
    seq: bigint("seq", { mode: "number" }).generatedAlwaysAsIdentity(),
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    honorific: text("honorific"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    role: text("role").notNull(),
    org: text("org").notNull(),
    field: text("field").$type<FieldKey>().notNull(),
    city: text("city").notNull(),
    region: text("region").notNull(),
    heritage: text("heritage").notNull(),
    languages: jsonb("languages").$type<string[]>().notNull().default([]),
    years: integer("years").notNull(),
    education: jsonb("education").$type<{ title: string; place: string }[]>().notNull().default([]),
    specialities: jsonb("specialities").$type<string[]>().notNull().default([]),
    askMeAbout: jsonb("ask_me_about").$type<string[]>().notNull().default([]),
    headline: text("headline").notNull(),
    bio: text("bio").notNull(),
    story: jsonb("story").$type<string[]>().notNull().default([]),
    quote: text("quote").notNull().default(""),
    photo: text("photo"),
    sessionLength: integer("session_length").notNull().default(45),
    ageGroups: jsonb("age_groups").$type<string[]>().notNull().default([]),
    availability: jsonb("availability").$type<WeeklySlot[]>().notNull().default([]),
    verifiedDbs: boolean("verified_dbs").notNull().default(false),
    verifiedId: boolean("verified_id").notNull().default(false),
    verifiedReferences: boolean("verified_references").notNull().default(false),
    replies: text("replies").notNull(),
    joined: at("joined").default(sql`now()`),
    status: text("status").$type<"active" | "pending">().notNull().default("pending"),
    // Set when an admin approves the mentor.
    approvedAt: isoTimestamp("approved_at"),
  },
  (t) => [uniqueIndex("mentors_slug_key").on(t.slug), uniqueIndex("mentors_user_id_key").on(t.userId), index("mentors_status_idx").on(t.status)],
);

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    parentId: text("parent_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mentorId: text("mentor_id")
      .notNull()
      .references(() => mentors.id, { onDelete: "cascade" }),
    menteeName: text("mentee_name").notNull(),
    menteeAge: integer("mentee_age").notNull(),
    schoolYear: text("school_year").notNull(),
    createdAt: at("created_at").default(sql`now()`),
    updatedAt: at("updated_at").default(sql`now()`),
    lastReadParent: at("last_read_parent").default(sql`now()`),
    lastReadMentor: at("last_read_mentor").default(sql`'epoch'`),
  },
  (t) => [index("conversations_parent_idx").on(t.parentId), index("conversations_mentor_idx").on(t.mentorId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    mentorId: text("mentor_id")
      .notNull()
      .references(() => mentors.id, { onDelete: "cascade" }),
    parentId: text("parent_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    start: at("start"),
    durationMin: integer("duration_min").notNull(),
    topic: text("topic").notNull(),
    goals: text("goals").notNull(),
    status: text("status").$type<SessionStatus>().notNull(),
    meetingUrl: text("meeting_url"),
    createdAt: at("created_at").default(sql`now()`),
    respondedAt: isoTimestamp("responded_at"),
  },
  (t) => [
    index("sessions_conversation_idx").on(t.conversationId),
    index("sessions_parent_idx").on(t.parentId),
    // A mentor can only hold one live booking per slot. This is what stops two parents grabbing the same time.
    uniqueIndex("sessions_live_slot_key")
      .on(t.mentorId, t.start)
      .where(sql`${t.status} in ('pending', 'accepted')`),
  ],
);

export const messages = pgTable(
  "messages",
  {
    // Insertion order. Messages written in the same instant (a decision and its note) keep their order.
    seq: bigint("seq", { mode: "number" }).generatedAlwaysAsIdentity(),
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    // A user id, or "system" for status updates.
    senderId: text("sender_id").notNull(),
    kind: text("kind").$type<"text" | "request" | "system">().notNull(),
    body: text("body").notNull(),
    sessionId: text("session_id").references(() => sessions.id, { onDelete: "set null" }),
    createdAt: at("created_at").default(sql`now()`),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId, t.seq)],
);

export type UserRow = typeof users.$inferSelect;
export type MentorRow = typeof mentors.$inferSelect;
export type ConversationRow = typeof conversations.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;
