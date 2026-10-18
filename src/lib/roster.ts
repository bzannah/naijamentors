import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { ROSTER } from "../data/mentors";
import { isPlaceholderEmail, placeholderEmail } from "./accounts";
import { newId, type Database } from "./db";
import { mentors, users } from "./db/schema";
import { hashPassword } from "./password";
import type { FieldKey } from "./types";

/*
  The mentor roster: real mentors the Naija Mentors team adds on their behalf, one file each in
  src/data/mentors. `syncRoster` writes it into the database and is safe to run any number of times
  (it runs with every `npm run db:migrate`, and whenever the embedded development database opens).

  - A new entry gets a mentor profile and a sign-in account with a placeholder email. The team then issues
    a temporary password from /admin (or `npm run mentors:invite`) and sends both to the mentor.
  - Until the mentor signs in and swaps the placeholder for their own email, the profile follows the
    roster, so corrections made here go live on the next sync.
  - Once they have, the profile is theirs to edit at /account/profile and the roster only manages their photo.
  - Nothing is ever deleted, and verification stays with the admin checks at /admin.
*/

export type RosterMentor = {
  /** The profile address, /mentors/<slug>. Don't change it once it's live: it is how sync finds the mentor. */
  slug: string;
  honorific?: string;
  firstName: string;
  lastName: string;
  role: string;
  org: string;
  field: FieldKey;
  city: string;
  /** UK region for the directory filter, e.g. "London" or "West Midlands". */
  region: string;
  /** e.g. "Kanuri · Borno roots". Defaults to "Nigerian heritage". */
  heritage?: string;
  /** Defaults to English. */
  languages?: string[];
  /** Years in the field. Leave out when unknown; the profile then doesn't mention it. */
  years?: number;
  education?: { title: string; place: string }[];
  /** Up to four short tags shown on their card. */
  specialities: string[];
  /** Up to six topics, shown as "Ask me about". */
  askMeAbout: string[];
  headline: string;
  bio: string;
  story?: string[];
  quote?: string;
  /** An image in public/mentors, e.g. "/mentors/ibrahim-labaran-ali.jpg". Managed here even after the mentor takes over. */
  photo?: string;
  /** Defaults to 17–30. */
  ageGroups?: string[];
  /** Where the details came from, so whoever checks them later can see what they're based on. */
  sources: string[];
};

export type SyncResult = { added: string[]; refreshed: string[]; claimed: string[] };

const displayName = (r: Pick<RosterMentor, "honorific" | "firstName" | "lastName">) =>
  `${r.honorific ? r.honorific + " " : ""}${r.firstName} ${r.lastName}`;

/** The profile fields the roster owns until the mentor takes over. */
function profileFields(r: RosterMentor) {
  return {
    honorific: r.honorific ?? null,
    firstName: r.firstName,
    lastName: r.lastName,
    role: r.role,
    org: r.org,
    field: r.field,
    city: r.city,
    region: r.region,
    heritage: r.heritage ?? "Nigerian heritage",
    languages: r.languages ?? ["English"],
    years: r.years ?? 0,
    education: r.education ?? [],
    specialities: r.specialities,
    askMeAbout: r.askMeAbout,
    headline: r.headline,
    bio: r.bio,
    story: r.story ?? [],
    quote: r.quote ?? "",
    photo: r.photo ?? null,
    ageGroups: r.ageGroups ?? ["17–18", "19–24", "25–30"],
  } satisfies Partial<typeof mentors.$inferInsert>;
}

export async function syncRoster(db: Database, roster: RosterMentor[] = ROSTER): Promise<SyncResult> {
  const result: SyncResult = { added: [], refreshed: [], claimed: [] };
  const slugs = new Set<string>();
  for (const r of roster) {
    if (slugs.has(r.slug)) throw new Error(`The mentor roster lists "${r.slug}" twice.`);
    slugs.add(r.slug);
  }

  for (const r of roster) {
    const fields = profileFields(r);
    await db.transaction(async (tx) => {
      const [found] = await tx
        .select({ id: mentors.id, userId: mentors.userId, email: users.email })
        .from(mentors)
        .innerJoin(users, eq(users.id, mentors.userId))
        .where(eq(mentors.slug, r.slug))
        .limit(1);

      if (!found) {
        const userId = newId("u");
        const mentorId = newId("m");
        const now = new Date().toISOString();
        // Nobody knows this password: the team issues a temporary one to send to the mentor.
        await tx.insert(users).values({
          id: userId,
          role: "mentor",
          name: displayName(r),
          email: placeholderEmail(r.slug),
          passwordHash: hashPassword(randomBytes(24).toString("base64url")),
          temporaryPassword: true,
          createdAt: now,
          mentorId,
          city: r.city,
        });
        const mentor: typeof mentors.$inferInsert = {
          ...fields,
          id: mentorId,
          slug: r.slug,
          userId,
          sessionLength: 45,
          // Mentors add the times they're free once they've signed in, so nobody can book them before then.
          availability: [],
          replies: "New to Naija Mentors",
          joined: now,
          status: "pending",
        };
        await tx.insert(mentors).values(mentor);
        result.added.push(r.slug);
        return;
      }

      if (isPlaceholderEmail(found.email)) {
        await tx.update(mentors).set(fields).where(eq(mentors.id, found.id));
        await tx.update(users).set({ name: displayName(r), city: r.city }).where(eq(users.id, found.userId));
        result.refreshed.push(r.slug);
        return;
      }

      // The mentor runs their own profile now. Only the photo is still ours to manage.
      if (r.photo) await tx.update(mentors).set({ photo: r.photo }).where(eq(mentors.id, found.id));
      result.claimed.push(r.slug);
    });
  }
  return result;
}
