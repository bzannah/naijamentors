# Village

**It takes a village to raise a child.**

Village connects British-Nigerian teenagers with accomplished mentors from their own community: doctors, engineers, barristers, founders and more. Parents browse mentors, see their real availability, request a free 45-minute video session, and talk to the mentor in a built-in inbox. A mentorship guide sets clear expectations for mentors, teens and parents, and a small admin area lets the Village team verify mentors before they show as verified.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Nothing else is needed: without a `DATABASE_URL`, Village runs an **embedded Postgres** ([PGlite](https://pglite.dev)) stored in `data/pglite/`. The first request creates it, applies the migrations and loads 24 sample mentors and a few conversations. Emails are printed to the terminal instead of sent.

To use a real Postgres server instead (recommended once you're working on data or queries):

```bash
createdb village                                   # or Docker, Neon, Supabase…
echo 'DATABASE_URL=postgres://localhost:5432/village' >> .env.local
npm run db:setup                                   # apply migrations and load the demo data
npm run dev
```

### Demo accounts

The sign-in page has one-click buttons for the parent and mentor demos. Every demo account uses the password `village-demo`.

| Role | Email | What you'll see |
| --- | --- | --- |
| Parent | `funmi@village.demo` | Mum of Tobi (15) and David (13). One confirmed session with Dr. Chiamaka, one pending request with Tunde |
| Mentor | `chiamaka@mentor.village.demo` | A pending request from Somto's dad to accept or decline, an upcoming session, and a past one |
| Any mentor | `<firstname>@mentor.village.demo` | e.g. `tunde@mentor.village.demo` |
| Admin | `admin@village.demo` | The verification area at `/admin` |

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
| `APP_URL` | **Required** | Public address, e.g. `https://village.example.org`. Used for links in emails |
| `SAFEGUARDING_EMAIL` | Recommended | The safeguarding lead's inbox, shown on the guide, the session room, the footer and in every email. Defaults to `safeguarding@village.demo` |
| `RESEND_API_KEY` | Recommended | Sends email through [Resend](https://resend.com). Without it emails are only logged |
| `EMAIL_FROM` | With Resend | Sender, e.g. `Village <hello@village.example.org>`. The domain must be verified in Resend |
| `EMAIL_REPLY_TO` | Optional | Where replies to notification emails go |
| `CRON_SECRET` | **Required** for the digest | Protects `/api/cron/message-digest` |
| `DATABASE_POOL_MAX` | Optional | Connections per server instance (default 10) |

## Database

Postgres, accessed through [Drizzle ORM](https://orm.drizzle.team). Every page and server action goes through two files:

- `src/lib/db/schema.ts`: the tables (`users`, `mentors`, `conversations`, `sessions`, `messages`), indexes and constraints
- `src/lib/queries.ts` (reads) and `src/app/actions.ts` (writes)

The domain types in `src/lib/types.ts` are unchanged; `src/lib/db/mappers.ts` converts rows to and from them. Timestamps are `timestamptz` columns that the app reads and writes as ISO strings. A partial unique index on `sessions (mentor_id, start)` for pending and accepted sessions guarantees two families can never book the same slot, even if they press the button at the same moment.

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

The demo data comes from `src/lib/seed.ts` (`buildSeed()` builds it, `seedDatabase()` writes it) and the fictional profiles in `src/data/mentors.ts`.

## Email

Notifications live in `src/lib/notifications.ts` and go through a small `Mailer` interface (`src/lib/email/mailer.ts`). With `RESEND_API_KEY` set they're sent by Resend; otherwise they're printed to the server console, so you can follow every flow locally. To use another provider, add a `Mailer` and return it from `getMailer()`. Emails share one branded layout (`src/lib/email/layout.ts`) with an HTML and a plain-text version.

| When | Who hears about it |
| --- | --- |
| A parent requests a session | The mentor |
| The mentor accepts or declines | The parent, with the mentor's note and, on acceptance, a link to the session room |
| Either side cancels | The other side |
| An admin approves a mentor | The mentor |
| Messages sit unread for 10 minutes | The recipient, in one **digest** per person listing each conversation |

Event emails are sent right after the response with Next.js `after()`, so a slow or failing email provider never blocks or breaks the action. Each email carries an idempotency key, so a repeated send isn't delivered twice.

The digest runs on a schedule. Call it every 15 to 60 minutes:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://village.example.org/api/cron/message-digest
```

On Vercel, add a cron to `vercel.json` (Vercel sends the `CRON_SECRET` header for you):

```json
{ "crons": [{ "path": "/api/cron/message-digest", "schedule": "*/30 * * * *" }] }
```

Or run it from any scheduler with access to the database: `npm run email:digest`. It's safe to run as often as you like: each person is only emailed about messages newer than their last digest, and only text messages count (requests and status changes have their own emails).

## Admin and mentor verification

Accounts have one of three roles: `parent`, `mentor` or `admin`. Admins sign in normally and land on `/admin`; the dashboard and inbox redirect them there.

New mentors apply at `/become-a-mentor`. Their profile goes live straight away marked **verification in progress**, with status `pending`. On `/admin` the team ticks the three checks (enhanced DBS, identity, references) as they complete; **Approve & publish** becomes available once all three are ticked and flips the mentor to `active`, which shows the verified badge and emails the mentor. **Review again** moves a live mentor back to pending, for example while a DBS renewal is in progress; their checks are kept so they can be updated and approved again. The server enforces that a live mentor holds all three checks.

Create the first real admin account after deploying:

```bash
npm run db:create-admin -- safeguarding@village.example.org "Village Team"
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
| Dashboard | `/dashboard` | Parent view (next session, requests, children) or mentor view (requests, stats, weekly availability editor) |
| The guide | `/guide` | Principles, expectations for mentors / teens / parents, first-session agenda, safeguarding, the pledge |
| Become a mentor | `/become-a-mentor` | Four-step application with photo upload; creates a live profile marked "verification in progress" |
| Admin | `/admin` | Verification checks, approve and publish, send a mentor back for review |
| Message digest | `/api/cron/message-digest` | Scheduled job that emails unread-message digests |
| Auth | `/signin`, `/signup` | Parent sign-up with optional child details; signed, httpOnly session cookie |

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
- Real mentor photos: the sample portraits are free-licence Unsplash images, and the people and credentials in `src/data/mentors.ts` are fictional
