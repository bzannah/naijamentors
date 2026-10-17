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
  - request accepted / declined  → the parent
  - session cancelled            → whoever didn't cancel it
  - mentor approved by an admin  → the mentor
  - unread messages              → a digest, sent by a scheduled job (see sendMessageDigests)
  Each function loads what it needs by id, so it can run after the response has been sent.
*/

const parentUser = alias(users, "parent_user");
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
      parent: { name: parentUser.name, email: parentUser.email },
      mentorEmail: mentorUser.email,
    })
    .from(sessions)
    .innerJoin(conversations, eq(conversations.id, sessions.conversationId))
    .innerJoin(mentors, eq(mentors.id, sessions.mentorId))
    .innerJoin(parentUser, eq(parentUser.id, sessions.parentId))
    .innerJoin(mentorUser, eq(mentorUser.id, mentors.userId))
    .where(eq(sessions.id, sessionId))
    .limit(1);
  if (!row) return null;
  const mentor = toMentor(row.m);
  return { ...row, mentor, mentorName: mentorName(mentor) };
}

async function send(to: string, subject: string, content: EmailContent, idempotencyKey?: string) {
  const { html, text } = renderEmail(content);
  return deliver({ to, subject, html, text, idempotencyKey });
}

export async function notifySessionRequested(sessionId: string) {
  const x = await sessionContext(sessionId);
  if (!x) return;
  const { s, c, parent } = x;
  await send(
    x.mentorEmail,
    `New request: ${c.menteeName} would like to meet you`,
    {
      preheader: `${parent.name} has requested a ${s.durationMin}-minute session on ${fmtDateLong(s.start)}.`,
      eyebrow: "New session request",
      heading: `${c.menteeName}, ${c.menteeAge}, would like to meet you`,
      paragraphs: [
        `${parent.name} has asked for a ${s.durationMin}-minute video session with you. Please accept or decline within 48 hours so the family can plan.`,
      ],
      quote: { text: s.goals, by: `${parent.name}, parent of ${c.menteeName}` },
      details: [
        ["When", when(s.start)],
        ["Topic", s.topic],
        ["Mentee", `${c.menteeName}, ${c.menteeAge} · ${c.schoolYear}`],
      ],
      cta: { label: "Review the request", href: link(`/inbox/${c.id}`) },
      footnote: "Sessions always take place on video with a parent nearby. Never share personal contact details.",
    },
    `request-${s.id}`,
  );
}

export async function notifySessionResponded(sessionId: string, note?: string) {
  const x = await sessionContext(sessionId);
  if (!x || (x.s.status !== "accepted" && x.s.status !== "declined")) return;
  const { s, c, mentor, parent } = x;
  const quote = note ? { text: note, by: x.mentorName } : undefined;

  if (s.status === "accepted") {
    await send(
      parent.email,
      `Confirmed: ${c.menteeName} meets ${x.mentorName}`,
      {
        preheader: `${when(s.start)}. The video room opens 15 minutes before.`,
        eyebrow: "Session confirmed",
        heading: `It’s confirmed. ${c.menteeName} meets ${shortName(mentor)}.`,
        paragraphs: [
          `Hello ${firstName(parent.name)}, ${x.mentorName} has accepted your request. The session room has the video link, a short agenda and a checklist for ${c.menteeName}.`,
        ],
        quote,
        details: [
          ["When", when(s.start)],
          ["Length", `${s.durationMin} minutes`],
          ["Topic", s.topic],
        ],
        cta: { label: "Open the session room", href: link(`/sessions/${s.id}`) },
        footnote: "Please be nearby for the start of the call. You can add the session to your calendar from the session room.",
      },
      `accepted-${s.id}`,
    );
    return;
  }

  await send(
    parent.email,
    `${x.mentorName} can’t take ${c.menteeName}’s session`,
    {
      preheader: `Pick another time or meet another mentor.`,
      eyebrow: "Request declined",
      heading: `${shortName(mentor)} can’t make this one`,
      paragraphs: [
        `Hello ${firstName(parent.name)}, ${x.mentorName} isn’t able to take the session on ${fmtDateLong(s.start)}. Mentors are busy professionals and this happens. It isn’t a reflection on ${c.menteeName}.`,
        `You can choose another time from ${mentor.firstName}’s availability, or meet someone else in the village.`,
      ],
      quote,
      cta: { label: `See ${mentor.firstName}’s other times`, href: link(`/mentors/${mentor.slug}`) },
    },
    `declined-${s.id}`,
  );
}

export async function notifySessionCancelled(sessionId: string, by: "parent" | "mentor") {
  const x = await sessionContext(sessionId);
  if (!x || x.s.status !== "cancelled") return;
  const { s, c, parent } = x;
  const toMentor = by === "parent";
  const who = toMentor ? parent.name : x.mentorName;
  const whoShort = toMentor ? firstName(parent.name) : shortName(x.mentor);
  await send(
    toMentor ? x.mentorEmail : parent.email,
    `Cancelled: ${c.menteeName}’s session on ${fmtDateLong(s.start)}`,
    {
      preheader: `${who} cancelled the session planned for ${when(s.start)}.`,
      eyebrow: "Session cancelled",
      heading: `${whoShort} has cancelled the session`,
      paragraphs: [
        toMentor
          ? `${parent.name} has cancelled ${c.menteeName}’s session with you. That time is open again for other families.`
          : `Hello ${firstName(parent.name)}, ${x.mentorName} has had to cancel ${c.menteeName}’s session. You can message them to find another time.`,
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
      preheader: "Your profile now shows as verified to every family on Village.",
      eyebrow: "Verification complete",
      heading: `You’re verified, ${shortName(m)}.`,
      paragraphs: [
        "We’ve completed your enhanced DBS check, identity check and references. Your profile now carries the verified badge, and families can see it straight away.",
        m.availability.length
          ? "Keep your weekly availability up to date so families can book times that really work for you."
          : "Add a few weekly times from your dashboard so families can book you.",
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
  menteeName: string;
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

  const [forParents, forMentors] = await Promise.all([
    db
      .select({
        recipientId: parentUser.id,
        email: parentUser.email,
        name: parentUser.name,
        conversationId: conversations.id,
        menteeName: conversations.menteeName,
        m: { honorific: mentors.honorific, firstName: mentors.firstName, lastName: mentors.lastName },
        body: messages.body,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .innerJoin(parentUser, eq(parentUser.id, conversations.parentId))
      .innerJoin(mentors, eq(mentors.id, conversations.mentorId))
      .where(base(conversations.lastReadParent, parentUser))
      .orderBy(asc(messages.seq)),
    db
      .select({
        recipientId: mentorUser.id,
        email: mentorUser.email,
        name: mentorUser.name,
        conversationId: conversations.id,
        menteeName: conversations.menteeName,
        from: parentUser.name,
        body: messages.body,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .innerJoin(mentors, eq(mentors.id, conversations.mentorId))
      .innerJoin(mentorUser, eq(mentorUser.id, mentors.userId))
      .innerJoin(parentUser, eq(parentUser.id, conversations.parentId))
      .where(base(conversations.lastReadMentor, mentorUser))
      .orderBy(asc(messages.seq)),
  ]);

  const pending: Pending[] = [
    ...forParents.map(({ m, ...r }) => ({ ...r, from: mentorName({ ...m, honorific: m.honorific ?? undefined }) })),
    ...forMentors,
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
      `${total === 1 ? "A new message" : `${total} new messages`} waiting for you on Village`,
      {
        preheader: `${list.at(-1)!.from}: ${list.at(-1)!.body.slice(0, 90)}`,
        eyebrow: "Your messages",
        heading: total === 1 ? "You have a new message" : `You have ${total} new messages`,
        paragraphs: [`Hello ${firstName(name)}, here’s what’s waiting in your Village inbox.`],
        items: [...threads.values()].map((t) => {
          const last = t.at(-1)!;
          return {
            title: last.from,
            meta: `${t.length} new · about ${last.menteeName}`,
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
