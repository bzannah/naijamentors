# Naija Mentors

**It takes a village to raise a generation.** · [naijamentors.com](https://naijamentors.com)

Naija Mentors connects young British-Nigerians aged 11 to 30 with accomplished mentors from their own community: doctors, engineers, barristers, founders and more. Mentees browse mentors, see their real availability, request a free 45-minute video session, and talk to the mentor in a built-in inbox. A mentorship guide sets clear expectations for mentors, mentees and parents, and a small admin area lets the Naija Mentors team verify mentors before they show as verified.

**Who books.** Mentees aged 18 to 30 have their own account and book for themselves. Under-18s (11 to 17) are booked by a parent or guardian, who sees every message. The ages live in `src/lib/mentees.ts`.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Nothing else is needed: without a `DATABASE_URL`, Naija Mentors runs an **embedded Postgres** ([PGlite](https://pglite.dev)) stored in `data/pglite/`. The first request creates it, applies the migrations and loads the [mentor roster](#adding-mentors). Emails are printed to the terminal instead of sent.

To use a real Postgres server instead (recommended once you're working on data or queries):

```bash
createdb naijamentors                              # or Docker, Neon, Supabase…
echo 'DATABASE_URL=postgres://localhost:5432/naijamentors' >> .env.local
npm run db:migrate                                 # apply migrations and load the mentor roster
npm run dev
```

### Signing in locally

There is no demo data: the database holds real mentors only. To try things out:

```bash
ADMIN_PASSWORD=choose-one npm run db:create-admin -- you@example.com "Your Name"   # the admin area at /admin
npm run mentors:invite -- terry-osayawe                                           # sign in as a mentor
```

Mentees and parents can sign up at `/signup` as usual. To start over (every account, request and message is wiped, then the roster is loaded again):

```bash
npm run db:reset
```

With the embedded database, stop `npm run dev` before running any `db:*` or `mentors:*` command: only one process can open it at a time.

## Configuration

All settings are environment variables. Copy `.env.example` to `.env.local` for local overrides; in production set them in your host's dashboard. Nothing is required in development. In production (`NODE_ENV=production`) a missing required value throws a clear error the first time it's needed, instead of falling back to the insecure development defaults. `next build` needs none of them.

| Variable | Production | What it does |
| --- | --- | --- |
| `DATABASE_URL` | **Required** | `postgres://…` for a Postgres server. Defaults to `pglite://data/pglite` (the embedded database) in development |
| `SESSION_SECRET` | **Required** | Signs the session cookie. At least 32 random characters: `openssl rand -base64 48`. Changing it signs everyone out |
| `APP_URL` | **Required** | Public address, e.g. `https://naijamentors.com`. Used for links in emails and the email logo |
| `SAFEGUARDING_EMAIL` | Recommended | The safeguarding lead's inbox, shown on the guide, the session room, the footer and in every email. Defaults to `safeguarding@naijamentors.com`, so make sure that mailbox exists |
| `RESEND_API_KEY` | Recommended | Sends email through [Resend](https://resend.com). Without it emails are only logged |
| `EMAIL_FROM` | With Resend | Sender, e.g. `Naija Mentors <hello@naijamentors.com>`. The domain must be verified in Resend |
| `EMAIL_REPLY_TO` | Optional | Where replies to notification emails go |
| `CRON_SECRET` | **Required** for the digest | Protects `/api/cron/message-digest` |
| `DATABASE_POOL_MAX` | Optional | Connections per server instance (default 10) |

## Database

Postgres, accessed through [Drizzle ORM](https://orm.drizzle.team). Every page and server action goes through two files:

- `src/lib/db/schema.ts`: the tables (`users`, `mentors`, `conversations`, `sessions`, `messages`), indexes and constraints
- `src/lib/queries.ts` (reads) and `src/app/actions.ts` (writes)

The domain types in `src/lib/types.ts` are unchanged; `src/lib/db/mappers.ts` converts rows to and from them. Timestamps are `timestamptz` columns that the app reads and writes as ISO strings. A partial unique index on `sessions (mentor_id, start)` for pending and accepted sessions guarantees two people can never book the same slot, even if they press the button at the same moment.

A few columns predate adult mentees and keep their original SQL names, mapped to clearer names in code: `users.children` is `mentees` (everyone an account books for), `parent_id` is `accountId` (the mentee-side account, a parent or an adult mentee), and `school_year` is `stage` (a school year for under-18s, a life stage for adults).

The connection is chosen by `DATABASE_URL` (`src/lib/db/index.ts`): `postgres://` uses [postgres.js](https://github.com/porsager/postgres) with prepared statements off, so it works behind PgBouncer and the Supabase and Neon poolers; `pglite://<dir>` opens the embedded database.

| Command | What it does |
| --- | --- |
| `npm run db:migrate` | Apply pending migrations from `drizzle/`, then sync the [mentor roster](#adding-mentors). Run this on every deploy |
| `npm run mentors:sync` | Sync the mentor roster on its own |
| `npm run mentors:invite -- [slug…]` | Issue temporary passwords and print the message to send each mentor. With no slugs: every roster mentor still on a placeholder email |
| `npm run db:reset` | Wipe every table and load the roster again. Only runs on the embedded database unless you add `-- --force`. **Never run it against production** |
| `npm run db:create-admin -- <email> [name]` | Create an admin account. Uses `ADMIN_PASSWORD` if set, otherwise prints a generated password |
| `npm run db:generate` | After editing `schema.ts`, write a new migration to `drizzle/`. Commit it with the schema change |
| `npm run db:studio` | Browse the data in Drizzle Studio (needs a `postgres://` URL) |

Earlier versions shipped fictional demo accounts on `…@naijamentors.demo` addresses. Migration `0002_remove-demo-data` deletes them, with their mentor profiles, conversations, sessions and messages, the next time `db:migrate` runs. Real accounts are untouched.

## Adding mentors

Real mentors are added by the team and handed over to them. The mechanism works the same for every new batch:

1. **Add them to the roster.** One file per mentor in `src/data/mentors/` (copy an existing one; `RosterMentor` in `src/lib/roster.ts` documents every field), listed in `src/data/mentors/index.ts`. Keep the details to what their public profiles say, and list those pages in `sources`. If you have a photo, save it as `public/mentors/<slug>.jpg` and set `photo`.
2. **Deploy.** `npm run db:migrate` syncs the roster: each new mentor gets a profile (marked *verification in progress*, with no bookable times yet) and a sign-in account on a placeholder email, `<slug>@invite.naijamentors.com`. Nothing is ever sent to placeholder addresses.
3. **Send them their sign-in details.** On `/admin`, press **Create sign-in details** on their card. It issues a temporary password and shows a ready-to-paste message with the email, password and links. (Or run `npm run mentors:invite`, which prints the same message for everyone still on a placeholder.) The password is shown once; issuing new details makes the old ones stop working.
4. **They take over.** Signing in with a temporary password leads straight to `/account/setup`, where they choose their own email and password. They then land on their dashboard, add the times they're free, and can edit everything on their profile at `/account/profile`.
5. **Verify them** on `/admin` once their DBS, identity and references are done, as for any mentor.

Until a mentor swaps the placeholder for their own email, their profile follows the roster file, so corrections there go live on the next deploy. Once they've signed in, the profile is theirs and the sync leaves it alone, apart from the photo, which the team keeps managing in the roster. The sync never deletes anyone.

The same temporary-password step is how the team lets anyone back in: **Reset password** on `/admin` (or `npm run mentors:invite -- <slug>`) issues a new one, and the mentor chooses their own on next sign-in. Everyone can change their email and password at `/account`.

## Email

Notifications live in `src/lib/notifications.ts` and go through a small `Mailer` interface (`src/lib/email/mailer.ts`). With `RESEND_API_KEY` set they're sent by Resend; otherwise they're printed to the server console, so you can follow every flow locally. To use another provider, add a `Mailer` and return it from `getMailer()`. Emails share one branded layout (`src/lib/email/layout.ts`) with an HTML and a plain-text version.

| When | Who hears about it |
| --- | --- |
| A mentee or parent requests a session | The mentor |
| The mentor accepts or declines | Whoever asked, with the mentor's note and, on acceptance, a link to the session room |
| Either side cancels | The other side |
| An admin approves a mentor | The mentor |
| Messages sit unread for 10 minutes | The recipient, in one **digest** per person listing each conversation |

Event emails are sent right after the response with Next.js `after()`, so a slow or failing email provider never blocks or breaks the action. Each email carries an idempotency key, so a repeated send isn't delivered twice.

The digest runs on a schedule. Call it every 15 to 60 minutes:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://naijamentors.com/api/cron/message-digest
```

On Vercel, add a cron to `vercel.json` (Vercel sends the `CRON_SECRET` header for you):

```json
{ "crons": [{ "path": "/api/cron/message-digest", "schedule": "*/30 * * * *" }] }
```

Or run it from any scheduler with access to the database: `npm run email:digest`. It's safe to run as often as you like: each person is only emailed about messages newer than their last digest, and only text messages count (requests and status changes have their own emails).

## Admin and mentor verification

Accounts have one of four roles: `mentee` (18 to 30, books for themselves), `parent` (books for children aged 11 to 17), `mentor` or `admin`. Admins sign in normally and land on `/admin`; the dashboard and inbox redirect them there.

New mentors apply at `/become-a-mentor`. Their profile goes live straight away marked **verification in progress**, with status `pending`. On `/admin` the team ticks the three checks (enhanced DBS, identity, references) as they complete; **Approve & publish** becomes available once all three are ticked and flips the mentor to `active`, which shows the verified badge and emails the mentor. **Review again** moves a live mentor back to pending, for example while a DBS renewal is in progress; their checks are kept so they can be updated and approved again. The server enforces that a live mentor holds all three checks.

Create the first real admin account after deploying:

```bash
npm run db:create-admin -- safeguarding@naijamentors.com "Naija Mentors Team"
```

## Deploying

1. Create a Postgres database and set `DATABASE_URL`, `SESSION_SECRET`, `APP_URL`, `SAFEGUARDING_EMAIL`, `RESEND_API_KEY`, `EMAIL_FROM` and `CRON_SECRET`.
2. `npm run build`, then `npm run db:migrate` as a release step before `npm start`. It also brings in any new mentors from the roster.
3. `npm run db:create-admin -- <email> <name>` once. (The old demo admin is removed with the rest of the demo data.)
4. Schedule the message digest (see [Email](#email)).

## What's in it

| Page | Path | Notes |
| --- | --- | --- |
| Landing | `/` | Hero, how it works, featured mentors, fields, proverbs, safety, mentor call to action |
| Directory | `/mentors` | Search, field chips, language / region / age / "available this week" filters, sorting |
| Mentor profile | `/mentors/[slug]` | Story, "ask me about", credentials, verification, live booking panel |
| Booking | profile panel | Pick a day and time from the mentor's weekly availability, choose a child, add a note, confirm safeguarding |
| Inbox | `/inbox`, `/inbox/[id]` | Two-pane messaging, session request cards, accept / decline with a note, cancel, live refresh every 5s |
| Session room | `/sessions/[id]` | Countdown, agenda, checklist, suggested questions, join button that opens 15 minutes before |
| Calendar | `/api/sessions/[id]/ics` | "Add to calendar" download with a 30-minute reminder |
| Dashboard | `/dashboard` | Mentee or parent view (next session, requests, profile or children) or mentor view (requests, stats, weekly availability editor) |
| The guide | `/guide` | Principles, expectations for mentors / mentees / parents, first-session agenda, safeguarding, the pledge |
| Brand | `/brand` | The logo story, logo family, colour, type, voice and downloadable assets |
| Become a mentor | `/become-a-mentor` | Four-step application with photo upload; creates a live profile marked "verification in progress" |
| Admin | `/admin` | Verification checks, approve and publish, send a mentor back for review, issue sign-in details |
| Account setup | `/account/setup` | After signing in with a temporary password: choose your own email (if you were set up with a placeholder) and password |
| Account settings | `/account` | Change your email or password |
| Edit profile | `/account/profile` | Mentors edit everything on their public profile except the photo |
| Message digest | `/api/cron/message-digest` | Scheduled job that emails unread-message digests |
| Auth | `/signin`, `/signup` | Sign-up as a mentee (18 to 30, with age and stage) or a parent (with optional child details); signed, httpOnly session cookie |

## Brand

The name is **Naija Mentors**: two words, both capitalised. The line is **It takes a village.** The full brand book, with the logo story and every asset to download, is at `/brand`.

The mark is one continuous line that climbs (a mentor), reaches back down and rises again (a young person, whose head is gold). Together they draw the N of Naija. Continued, the same line becomes the **village line**, a row of people used in the footer.

- `public/brand/` holds the logo masters: horizontal, reversed, one-colour and stacked logos, the mark, the app icon and the seal, as SVG with PNG exports, plus the email logo and manifest icons
- `src/app/favicon.ico`, `icon.svg`, `apple-icon.png` and `opengraph-image.png` are picked up by Next.js automatically
- `src/lib/logo.ts` has the mark geometry and the outlined wordmark (Fraunces at opsz 96, weight 460, SOFT 100), so the logo never waits for a web font. `src/components/Logo.tsx` renders it; `VillageLine` lives in `src/components/Patterns.tsx`

## How it's built

- **Next.js 16** (App Router, Server Actions, `after()`) with **React 19** and **Tailwind CSS v4**
- **Postgres** through **Drizzle ORM**, with an embedded PGlite database for zero-setup development
- **Email** through Resend behind a `Mailer` interface, with a console fallback
- **Design system** in `src/app/globals.css`: warm paper, forest green, bronze gold, terracotta and Adire indigo; Fraunces for display type, Instrument Sans for UI; arch-framed portraits, Adire and aso-oke motifs
- **Times** are always handled in UK time (`src/lib/time.ts`), including the switch to and from BST
- **Video** links are Jitsi Meet rooms generated when a mentor accepts a request

```
drizzle/          SQL migrations (generated by drizzle-kit, committed)
scripts/db.ts     migrate, sync, invite, reset, create-admin, digest
public/mentors/   mentor photos added by the team
src/
  app/            routes, server actions (actions.ts), admin area, account pages
  components/     header, footer, portraits, patterns, mentor card, UI kit
  data/mentors/   the mentor roster, one file per mentor
  lib/
    db/           schema, connection, row mappers
    email/        mailer and email layout
    env.ts        every environment variable in one place
    roster.ts     syncs the roster into the database
    accounts.ts   placeholder emails and temporary passwords
    notifications.ts, queries.ts, auth.ts, time.ts, fields.ts
```

## Before going live

The data, email, verification and configuration pieces are production-ready. Still to do before a public launch:

- **Photo uploads** are written to `public/uploads` on the server's disk, which doesn't survive redeploys or work on serverless hosts. Move them to object storage (S3, R2, Vercel Blob)
- **Pending mentors can already receive requests**, as in the prototype. Decide whether unverified mentors should be hidden or unbookable until approved
- A dedicated video provider (Daily, Whereby or similar) instead of public Jitsi rooms
- A real safeguarding inbox in `SAFEGUARDING_EMAIL` and a named safeguarding lead
- Email verification and rate limiting on sign-in
- Mentor photos: profiles without one show a monogram. Add photos to `public/mentors/` and the roster (see [Adding mentors](#adding-mentors))
- Self-service password reset by email. Until then the team issues temporary passwords from `/admin`
