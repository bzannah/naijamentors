# Village

**It takes a village to raise a child.**

Village connects British-Nigerian teenagers with accomplished mentors from their own community: doctors, engineers, barristers, founders and more. Parents browse mentors, see their real availability, request a free 45-minute video session, and talk to the mentor in a built-in inbox. A mentorship guide sets clear expectations for mentors, teens and parents.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The database seeds itself with 24 sample mentors and a few conversations the first time a page loads.

### Demo accounts

The sign-in page has one-click buttons for both sides of the platform. All demo accounts use the password `village-demo`.

| Role | Email | What you'll see |
| --- | --- | --- |
| Parent | `funmi@village.demo` | Mum of Tobi (15) and David (13). One confirmed session with Dr. Chiamaka, one pending request with Tunde |
| Mentor | `chiamaka@mentor.village.demo` | A pending request from Somto's dad to accept or decline, an upcoming session, and a past one |
| Any mentor | `<firstname>@mentor.village.demo` | e.g. `tunde@mentor.village.demo` |

To start the demo over (all requests, messages and new accounts are wiped):

```bash
npm run reset
```

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
| Auth | `/signin`, `/signup` | Parent sign-up with optional child details; signed, httpOnly session cookie |

## How it's built

- **Next.js 16** (App Router, Server Actions) with **React 19** and **Tailwind CSS v4**
- **Design system** in `src/app/globals.css`: warm paper, forest green, bronze gold, terracotta and Adire indigo; Fraunces for display type, Instrument Sans for UI; arch-framed portraits, Adire and aso-oke motifs
- **Data** lives in a small JSON file store (`data/db.json`) behind `readDb()` / `mutate()` in `src/lib/db.ts`, so it can be swapped for Postgres without touching the pages
- **Times** are always handled in UK time (`src/lib/time.ts`), including the switch to and from BST
- **Video** links are Jitsi Meet rooms generated when a mentor accepts a request

```
src/
  app/            routes, server actions (actions.ts)
  components/     header, footer, portraits, patterns, mentor card, UI kit
  data/mentors.ts sample mentor profiles
  lib/            auth, db, queries, seed, time, fields
```

## Before going live

This is a working prototype. For a real launch you'd want:

- A real database (Postgres) and email notifications for new requests and replies
- A dedicated video provider (Daily, Whereby or similar) instead of public Jitsi rooms
- An admin area for the verification workflow: ID, references and enhanced DBS checks
- A real safeguarding inbox in place of `safeguarding@village.demo`, plus a named safeguarding lead
- `SESSION_SECRET` set in the environment
- Real mentor photos: the sample portraits are free-licence Unsplash images, and the people and credentials in `src/data/mentors.ts` are fictional
