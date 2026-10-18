import { and, asc, eq, gt, lt, ne, sql } from "drizzle-orm";
import { alias, type AnyPgColumn } from "drizzle-orm/pg-core";
import { getDb } from "./db";
import { toMentor } from "./db/mappers";
import { conversations, mentors, messages, sessions, users } from "./db/schema";
import { deliver } from "./email/mailer";
import { renderEmail, type EmailContent } from "./email/layout";
import { appUrl } from "./env";
import { mentorName } from "./queries";
import { fmtDateLong, fmtTime } from "./time";

/*
  Who hears about what:
  - new session request          → the mentor
  - request accepted / declined  → the account that asked: a parent, or an adult mentee
  - session cancelled            → whoever didn't cancel it
  - mentor approved by an admin  → the mentor
  - unread messages              → a digest, sent by a scheduled job (see sendMessageDigests)
  Each function loads what it needs by id, so it can run after the response has been sent.
*/

// The mentee-side account: a parent booking for their child, or a mentee aged 18+ booking for themselves.
const accountUser = alias(users, "account_user");
const mentorUser = alias(users, "mentor_user");

const link = (path: string) => `${appUrl()}${path}`;
/** "Funmilayo", or "Dr. Chiamaka" when the name starts with a title. */
const firstName = (name: string) => {
  const [a, b] = name.split(" ");
  return a.endsWith(".") && b ? `${a} ${b}` : a;
};
/** "Dr. Chiamaka", "Tunde": how the app refers to a mentor in passing. */
const shortName = (m: { honorific?: string; firstName: string }) => (m.honorific ? `${m.honorific} ${m.firstName}` : m.firstName);
const when = (iso: string) => `${fmtDateLong(iso)} at ${fmtTime(iso)} (UK time)`;

async function sessionContext(sessionId: string) {
  const [row] = await (await getDb())
    .select({
      s: sessions,
      c: conversations,
      m: mentors,
      account: { name: accountUser.name, email: accountUser.email, role: accountUser.role },
      mentorEmail: mentorUser.email,
    })
    .from(sessions)
    .innerJoin(conversations, eq(conversations.id, sessions.conversationId))
    .innerJoin(mentors, eq(mentors.id, sessions.mentorId))
    .innerJoin(accountUser, eq(accountUser.id, sessions.accountId))
    .innerJoin(mentorUser, eq(mentorUser.id, mentors.userId))
    .where(eq(sessions.id, sessionId))
    .limit(1);
  if (!row) return null;
  const mentor = toMentor(row.m);
  return { ...row, mentor, mentorName: mentorName(mentor), self: row.account.role === "mentee" };
}

async function send(to: string, subject: string, content: EmailContent, idempotencyKey?: string) {
  const { html, text } = renderEmail(content);
  return deliver({ to, subject, html, text, idempotencyKey });
}

export async function notifySessionRequested(sessionId: string) {
  const x = await sessionContext(sessionId);
  if (!x) return;
  const { s, c, account, self } = x;
  await send(
    x.mentorEmail,
    `New request: ${c.menteeName} would like to meet you`,
    {
      preheader: `${account.name} has requested a ${s.durationMin}-minute session on ${fmtDateLong(s.start)}.`,
      eyebrow: "New session request",
      heading: `${c.menteeName}, ${c.menteeAge}, would like to meet you`,
      paragraphs: [
        self
          ? `${account.name} has asked for a ${s.durationMin}-minute video session with you. Please accept or decline within 48 hours so they can plan.`
          : `${account.name} has asked for a ${s.durationMin}-minute video session with you. Please accept or decline within 48 hours so the family can plan.`,
      ],
      quote: { text: s.goals, by: self ? account.name : `${account.name}, parent of ${c.menteeName}` },
      details: [
        ["When", when(s.start)],
        ["Topic", s.topic],
        ["Mentee", `${c.menteeName}, ${c.menteeAge} · ${c.stage}`],
      ],
      cta: { label: "Review the request", href: link(`/inbox/${c.id}`) },
      footnote: self
        ? "Sessions take place on video, here on Naija Mentors. Never share personal contact details."
        : "Sessions always take place on video with a parent nearby. Never share personal contact details.",
    },
    `request-${s.id}`,
  );
}

export async function notifySessionResponded(sessionId: string, note?: string) {
  const x = await sessionContext(sessionId);
  if (!x || (x.s.status !== "accepted" && x.s.status !== "declined")) return;
  const { s, c, mentor, account, self } = x;
  const quote = note ? { text: note, by: x.mentorName } : undefined;

  if (s.status === "accepted") {
    await send(
      account.email,
      self ? `Confirmed: you’re meeting ${x.mentorName}` : `Confirmed: ${c.menteeName} meets ${x.mentorName}`,
      {
        preheader: `${when(s.start)}. The video room opens 15 minutes before.`,
        eyebrow: "Session confirmed",
        heading: self ? `It’s confirmed. You’re meeting ${shortName(mentor)}.` : `It’s confirmed. ${c.menteeName} meets ${shortName(mentor)}.`,
        paragraphs: [
          `Hello ${firstName(account.name)}, ${x.mentorName} has accepted your request. The session room has the video link, a short agenda and a checklist for ${self ? "you" : c.menteeName}.`,
        ],
        quote,
        details: [
          ["When", when(s.start)],
          ["Length", `${s.durationMin} minutes`],
          ["Topic", s.topic],
        ],
        cta: { label: "Open the session room", href: link(`/sessions/${s.id}`) },
        footnote: self
          ? "Bring your questions. You can add the session to your calendar from the session room."
          : "Please be nearby for the start of the call. You can add the session to your calendar from the session room.",
      },
      `accepted-${s.id}`,
    );
    return;
  }

  await send(
    account.email,
    self ? `${x.mentorName} can’t take your session` : `${x.mentorName} can’t take ${c.menteeName}’s session`,
    {
      preheader: `Pick another time or meet another mentor.`,
      eyebrow: "Request declined",
      heading: `${shortName(mentor)} can’t make this one`,
      paragraphs: [
        `Hello ${firstName(account.name)}, ${x.mentorName} isn’t able to take the session on ${fmtDateLong(s.start)}. Mentors are busy professionals and this happens. It isn’t a reflection on ${self ? "you" : c.menteeName}.`,
        `You can choose another time from ${mentor.firstName}’s availability, or meet someone else in the village.`,
      ],
      quote,
      cta: { label: `See ${mentor.firstName}’s other times`, href: link(`/mentors/${mentor.slug}`) },
    },
    `declined-${s.id}`,
  );
}

export async function notifySessionCancelled(sessionId: string, by: "account" | "mentor") {
  const x = await sessionContext(sessionId);
  if (!x || x.s.status !== "cancelled") return;
  const { s, c, account, self } = x;
  const toMentor = by === "account";
  const who = toMentor ? account.name : x.mentorName;
  const whoShort = toMentor ? firstName(account.name) : shortName(x.mentor);
  const theirSession = self ? "their session" : `${c.menteeName}’s session`;
  await send(
    toMentor ? x.mentorEmail : account.email,
    `Cancelled: ${toMentor || !self ? `${c.menteeName}’s session` : "your session"} on ${fmtDateLong(s.start)}`,
    {
      preheader: `${who} cancelled the session planned for ${when(s.start)}.`,
      eyebrow: "Session cancelled",
      heading: `${whoShort} has cancelled the session`,
      paragraphs: [
        toMentor
          ? `${account.name} has cancelled ${theirSession} with you. That time is open again for someone else.`
          : `Hello ${firstName(account.name)}, ${x.mentorName} has had to cancel ${self ? "your session" : theirSession}. You can message them to find another time.`,
      ],
      details: [
        ["Was planned for", when(s.start)],
        ["Topic", s.topic],
      ],
      cta: { label: "Open the conversation", href: link(`/inbox/${c.id}`) },
    },
    `cancelled-${s.id}`,
  );
}

export async function notifyMentorApproved(mentorId: string) {
  const [row] = await (await getDb())
    .select({ m: mentors, email: users.email })
    .from(mentors)
    .innerJoin(users, eq(users.id, mentors.userId))
    .where(eq(mentors.id, mentorId))
    .limit(1);
  if (!row || row.m.status !== "active") return;
  const m = toMentor(row.m);
  await send(
    row.email,
    "You’re verified. Welcome to the village.",
    {
      preheader: "Your profile now shows as verified to everyone on Naija Mentors.",
      eyebrow: "Verification complete",
      heading: `You’re verified, ${shortName(m)}.`,
      paragraphs: [
        "We’ve completed your enhanced DBS check, identity check and references. Your profile now carries the verified badge, and mentees and families can see it straight away.",
        m.availability.length
          ? "Keep your weekly availability up to date so people can book times that really work for you."
          : "Add a few weekly times from your dashboard so mentees and families can book you.",
      ],
      cta: { label: "Go to your dashboard", href: link("/dashboard") },
      footnote: "Thank you for giving your time to the next generation.",
    },
    `approved-${m.id}-${m.approvedAt ?? ""}`,
  );
}

/* ---------------- Unread message digest ---------------- */

/** Messages have to sit unread this long before they're emailed, so live chats don't trigger email. */
const QUIET_MINUTES = 10;

type Pending = {
  recipientId: string;
  email: string;
  name: string;
  conversationId: string;
  /** Who the thread is about, when that isn't the person writing: "about Tobi". */
  about?: string;
  from: string;
  body: string;
  createdAt: string;
};

/**
 * Email everyone who has unread messages that are older than a few minutes and newer than their
 * last digest. Run it on a schedule (see README → Email). Safe to run as often as you like.
 */
export async function sendMessageDigests(now = new Date()) {
  const db = await getDb();
  const cutoff = new Date(now.getTime() - QUIET_MINUTES * 60_000).toISOString();
  const base = (lastRead: AnyPgColumn, recipient: { id: AnyPgColumn; digestSentAt: AnyPgColumn }) =>
    and(
      eq(messages.kind, "text"),
      ne(messages.senderId, recipient.id),
      gt(messages.createdAt, lastRead),
      lt(messages.createdAt, cutoff),
      sql`${messages.createdAt} > coalesce(${recipient.digestSentAt}, 'epoch')`,
    );

  const [forAccounts, forMentors] = await Promise.all([
    db
      .select({
        recipientId: accountUser.id,
        email: accountUser.email,
        name: accountUser.name,
        role: accountUser.role,
        conversationId: conversations.id,
        menteeName: conversations.menteeName,
        m: { honorific: mentors.honorific, firstName: mentors.firstName, lastName: mentors.lastName },
        body: messages.body,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .innerJoin(accountUser, eq(accountUser.id, conversations.accountId))
      .innerJoin(mentors, eq(mentors.id, conversations.mentorId))
      .where(base(conversations.lastReadAccount, accountUser))
      .orderBy(asc(messages.seq)),
    db
      .select({
        recipientId: mentorUser.id,
        email: mentorUser.email,
        name: mentorUser.name,
        conversationId: conversations.id,
        menteeName: conversations.menteeName,
        role: accountUser.role,
        from: accountUser.name,
        body: messages.body,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .innerJoin(mentors, eq(mentors.id, conversations.mentorId))
      .innerJoin(mentorUser, eq(mentorUser.id, mentors.userId))
      .innerJoin(accountUser, eq(accountUser.id, conversations.accountId))
      .where(base(conversations.lastReadMentor, mentorUser))
      .orderBy(asc(messages.seq)),
  ]);

  // Adult mentees write about themselves, so their threads don't need an "about".
  const pending: Pending[] = [
    ...forAccounts.map(({ m, role, menteeName, ...r }) => ({
      ...r,
      about: role === "mentee" ? undefined : menteeName,
      from: mentorName({ ...m, honorific: m.honorific ?? undefined }),
    })),
    ...forMentors.map(({ role, menteeName, ...r }) => ({ ...r, about: role === "mentee" ? undefined : menteeName })),
  ];
  const byRecipient = new Map<string, Pending[]>();
  for (const p of pending) byRecipient.set(p.recipientId, [...(byRecipient.get(p.recipientId) ?? []), p]);

  let sent = 0;
  for (const [recipientId, list] of byRecipient) {
    const latest = list.reduce((a, b) => (b.createdAt > a ? b.createdAt : a), list[0].createdAt);
    // Claim the digest first so two overlapping runs can't both send it.
    const claimed = await db
      .update(users)
      .set({ digestSentAt: latest })
      .where(and(eq(users.id, recipientId), sql`coalesce(${users.digestSentAt}, 'epoch') < ${latest}`))
      .returning({ id: users.id });
    if (!claimed.length) continue;

    const threads = new Map<string, Pending[]>();
    for (const p of list) threads.set(p.conversationId, [...(threads.get(p.conversationId) ?? []), p]);
    const total = list.length;
    const { email, name } = list[0];

    const ok = await send(
      email,
      `${total === 1 ? "A new message" : `${total} new messages`} waiting for you on Naija Mentors`,
      {
        preheader: `${list.at(-1)!.from}: ${list.at(-1)!.body.slice(0, 90)}`,
        eyebrow: "Your messages",
        heading: total === 1 ? "You have a new message" : `You have ${total} new messages`,
        paragraphs: [`Hello ${firstName(name)}, here’s what’s waiting in your Naija Mentors inbox.`],
        items: [...threads.values()].map((t) => {
          const last = t.at(-1)!;
          return {
            title: last.from,
            meta: last.about ? `${t.length} new · about ${last.about}` : `${t.length} new`,
            body: last.body.length > 160 ? `${last.body.slice(0, 157)}…` : last.body,
            href: link(`/inbox/${last.conversationId}`),
          };
        }),
        cta: { label: "Open your inbox", href: link("/inbox") },
        footnote: "We only email when messages have been waiting unread for a little while.",
      },
      `digest-${recipientId}-${latest}`,
    );
    if (ok) sent++;
  }
  return { sent, recipients: byRecipient.size };
}
