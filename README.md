# Naija Mentors

**It takes a village to raise a generation.** · [naijamentors.com](https://naijamentors.com)

Naija Mentors connects young British-Nigerians aged 11 to 30 with accomplished mentors from their own community: doctors, engineers, barristers, founders and more. Mentees browse mentors, see their real availability, request a free 45-minute video session, and talk to the mentor in a built-in inbox. A mentorship guide sets clear expectations for mentors, mentees and parents, and a small admin area lets the Naija Mentors team verify mentors before they show as verified.

**Who books.** Mentees aged 18 to 30 have their own account and book for themselves. Under-18s (11 to 17) are booked by a parent or guardian, who sees every message. The ages live in `src/lib/mentees.ts`.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Nothing else is needed: without a `DATABASE_URL`, Naija Mentors runs an **embedded Postgres** ([PGlite](https://pglite.dev)) stored in `data/pglite/`. The first request creates it, applies the migrations and loads the mentors and a few demo accounts. Emails are printed to the terminal instead of sent.

To use a real Postgres server instead (recommended once you're working on data or queries):

```bash
createdb naijamentors                              # or Docker, Neon, Supabase…
echo 'DATABASE_URL=postgres://localhost:5432/naijamentors' >> .env.local
npm run db:setup                                   # apply migrations and load the demo data
npm run dev
```

### Demo accounts

The sign-in page has one-click buttons for the mentee and parent demos (each one appears once its account exists). Every demo account uses the password `village-demo`. The demo families start with empty inboxes: the seeded mentors are real people, so the seed doesn't invent conversations with them.

| Role | Email | What you'll see |
| --- | --- | --- |
| Mentee (18+) | `bukky@naijamentors.demo` | Bukola, 23, a recent graduate |
| Parent | `funmi@naijamentors.demo` | Mum of Tobi (15) and David (13) |
| Admin | `admin@naijamentors.demo` | The verification area at `/admin` |

To start the demo over (all requests, messages and new accounts are wiped):

```bash
npm run db:reset
```

With the embedded database, stop `npm run dev` before running any `db:*` command: only one process can open it at a time.

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
| `npm run db:migrate` | Apply pending migrations from `drizzle/`. Run this on every deploy |
| `npm run db:seed` | Load the demo data into an empty database |
| `npm run db:setup` | `db:migrate` then `db:seed` |
| `npm run db:reset` | Wipe every table and load the demo data again. **Never run it against production** |
| `npm run db:create-admin -- <email> [name]` | Create an admin account. Uses `ADMIN_PASSWORD` if set, otherwise prints a generated password |
| `npm run db:generate` | After editing `schema.ts`, write a new migration to `drizzle/`. Commit it with the schema change |
| `npm run db:studio` | Browse the data in Drizzle Studio (needs a `postgres://` URL) |

The demo data comes from `src/lib/seed.ts` (`buildSeed()` builds it, `seedDatabase()` writes it) and the mentor profiles in `src/data/mentors.ts`.

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
2. `npm run build`, then `npm run db:migrate` as a release step before `npm start`.
3. `npm run db:create-admin -- <email> <name>` once.
4. Schedule the message digest (see [Email](#email)).
5. Don't run `db:seed` in production unless you want the demo accounts there.

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
| Admin | `/admin` | Verification checks, approve and publish, send a mentor back for review |
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
scripts/db.ts     migrate, seed, reset, create-admin, digest
src/
  app/            routes, server actions (actions.ts), admin area
  components/     header, footer, portraits, patterns, mentor card, UI kit
  data/mentors.ts sample mentor profiles
  lib/
    db/           schema, connection, row mappers
    email/        mailer and email layout
    env.ts        every environment variable in one place
    notifications.ts, queries.ts, auth.ts, seed.ts, time.ts, fields.ts
```

## Before going live

The data, email, verification and configuration pieces are production-ready. Still to do before a public launch:

- **Photo uploads** are written to `public/uploads` on the server's disk, which doesn't survive redeploys or work on serverless hosts. Move them to object storage (S3, R2, Vercel Blob)
- **Pending mentors can already receive requests**, as in the prototype. Decide whether unverified mentors should be hidden or unbookable until approved
- A dedicated video provider (Daily, Whereby or similar) instead of public Jitsi rooms
- A real safeguarding inbox in `SAFEGUARDING_EMAIL` and a named safeguarding lead
- Password reset, email verification and rate limiting on sign-in
- Real mentor details: the seven mentors in `src/data/mentors.ts` have real first names and photos, but their surnames, roles, bios and credentials are still placeholders. Their seeded accounts also use the demo password, so give each one their own email and password before launch
