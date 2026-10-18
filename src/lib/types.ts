export type Role = "parent" | "mentee" | "mentor" | "admin";

/** A recurring weekly slot in UK time. day: 0 = Sunday … 6 = Saturday. */
export type WeeklySlot = { day: number; time: string };

export type FieldKey =
  | "medicine"
  | "law"
  | "tech"
  | "engineering"
  | "finance"
  | "enterprise"
  | "creative"
  | "education"
  | "public"
  | "sport";

export type Mentor = {
  id: string;
  slug: string;
  userId: string;
  honorific?: string;
  firstName: string;
  lastName: string;
  role: string;
  org: string;
  field: FieldKey;
  city: string;
  region: string;
  heritage: string;
  languages: string[];
  years: number;
  education: { title: string; place: string }[];
  specialities: string[];
  askMeAbout: string[];
  headline: string;
  bio: string;
  story: string[];
  quote: string;
  photo?: string;
  sessionLength: number;
  ageGroups: string[];
  availability: WeeklySlot[];
  verified: { dbs: boolean; id: boolean; references: boolean };
  replies: string;
  joined: string;
  status: "active" | "pending";
  /** When an admin approved the mentor. */
  approvedAt?: string;
};

/**
 * Someone an account books sessions for: a parent's child (11–17), or an adult mentee (18–30) themselves.
 * stage is the school year for under-18s ("Year 11") and a life stage for adults ("Early in my career").
 */
export type Mentee = { name: string; age: number; stage: string };

export type User = {
  id: string;
  role: Role;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  mentorId?: string;
  city?: string;
  mentees?: Mentee[];
};

export type Conversation = {
  id: string;
  /** The account on the mentee's side: a parent booking for their child, or an adult mentee themselves. */
  accountId: string;
  mentorId: string;
  menteeName: string;
  menteeAge: number;
  stage: string;
  createdAt: string;
  updatedAt: string;
  lastRead: { account: string; mentor: string };
};

export type SessionStatus = "pending" | "accepted" | "declined" | "cancelled";

export type Session = {
  id: string;
  conversationId: string;
  mentorId: string;
  accountId: string;
  start: string;
  durationMin: number;
  topic: string;
  goals: string;
  status: SessionStatus;
  meetingUrl?: string;
  createdAt: string;
  respondedAt?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: "text" | "request" | "system";
  body: string;
  sessionId?: string;
  createdAt: string;
};

export type Db = {
  version: number;
  users: User[];
  mentors: Mentor[];
  conversations: Conversation[];
  messages: Message[];
  sessions: Session[];
};
