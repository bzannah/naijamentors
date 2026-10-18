/*
  Database and maintenance commands. Run through npm, e.g. `npm run db:migrate`.

    migrate                      apply pending migrations in ./drizzle, then sync the mentor roster
    sync                         add new roster mentors and refresh profiles nobody has taken over yet
    invite [slug…]               issue temporary passwords for roster mentors and print what to send them
                                 (default: everyone still on a placeholder email)
    reset [--force]              wipe every table and load the roster again (development only)
    create-admin <email> <name>  create an admin account (password from ADMIN_PASSWORD, or generated)
    digest                       email unread-message digests now

  Reads .env / .env.local the same way Next.js does. With the embedded database (pglite://…),
  stop `npm run dev` first: only one process can open it at a time.
*/
import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const { closeDb, getDb, isUniqueViolation, newId, MIGRATIONS_DIR } = await import("../src/lib/db");
  const { appUrl, databaseUrl } = await import("../src/lib/env");
  const { syncRoster } = await import("../src/lib/roster");
  const embedded = databaseUrl().startsWith("pglite:");

  const report = (r: Awaited<ReturnType<typeof syncRoster>>) => {
    const list = (slugs: string[]) => (slugs.length ? `: ${slugs.join(", ")}` : "");
    console.log(`✓ Mentor roster synced. ${r.added.length} added${list(r.added)}.`);
    if (r.refreshed.length) console.log(`  ${r.refreshed.length} not yet taken over by the mentor, kept in step with the roster.`);
    if (r.claimed.length) console.log(`  ${r.claimed.length} managed by the mentor themselves${list(r.claimed)}.`);
    if (r.added.length) console.log("  Issue their sign-in details from /admin, or run `npm run mentors:invite`.");
  };

  try {
    switch (command) {
      case "migrate": {
        if (embedded) {
          // Opening the embedded database applies migrations and syncs the roster.
          await getDb();
          console.log("✓ Database is up to date.");
        } else {
          const { migrate } = await import("drizzle-orm/postgres-js/migrator");
          await migrate((await getDb()) as never, { migrationsFolder: MIGRATIONS_DIR });
          console.log("✓ Database is up to date.");
          report(await syncRoster(await getDb()));
        }
        break;
      }

      case "sync": {
        report(await syncRoster(await getDb()));
        break;
      }

      case "invite": {
        const { eq } = await import("drizzle-orm");
        const { issueTemporaryPassword, isPlaceholderEmail, signInMessage } = await import("../src/lib/accounts");
        const { mentors, users } = await import("../src/lib/db/schema");
        const { ROSTER } = await import("../src/data/mentors");
        const db = await getDb();
        const rows = await db
          .select({ slug: mentors.slug, honorific: mentors.honorific, firstName: mentors.firstName, name: users.name, email: users.email, userId: users.id })
          .from(mentors)
          .innerJoin(users, eq(users.id, mentors.userId));
        const unknown = args.filter((s) => !rows.some((r) => r.slug === s));
        if (unknown.length) throw new Error(`No mentor with the profile address ${unknown.join(", ")}. Run \`npm run mentors:sync\` first?`);
        const roster = new Set(ROSTER.map((r) => r.slug));
        const targets = args.length ? rows.filter((r) => args.includes(r.slug)) : rows.filter((r) => roster.has(r.slug) && isPlaceholderEmail(r.email));
        if (!targets.length) {
          console.log("· Every roster mentor has already chosen their own email. Name someone to reset their password: `npm run mentors:invite -- <slug>`.");
          break;
        }
        for (const t of targets) {
          const password = await issueTemporaryPassword(db, t.userId);
          if (!password) continue;
          const greetingName = t.honorific ? `${t.honorific} ${t.firstName}` : t.firstName;
          console.log(`\n${"─".repeat(64)}\n${t.name}\n${"─".repeat(64)}`);
          console.log(signInMessage({ greetingName, email: t.email, password, appUrl: appUrl(), profilePath: `/mentors/${t.slug}` }));
        }
        console.log(`\n✓ Issued ${targets.length} temporary password${targets.length === 1 ? "" : "s"}. Any earlier ones for these accounts no longer work.`);
        break;
      }

      case "reset": {
        if (!embedded && !args.includes("--force")) {
          throw new Error("This deletes every account, conversation and session. It only runs on the embedded development database unless you add --force.");
        }
        const { sql } = await import("drizzle-orm");
        const db = await getDb();
        await db.execute(sql`truncate table messages, sessions, conversations, mentors, users restart identity cascade`);
        console.log("✓ Database emptied.");
        report(await syncRoster(db));
        break;
      }

      case "create-admin": {
        const [email, ...nameParts] = args;
        const name = nameParts.join(" ").trim() || "Naija Mentors Team";
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Usage: npm run db:create-admin -- <email> [full name]");
        const { hashPassword } = await import("../src/lib/password");
        const { users } = await import("../src/lib/db/schema");
        const password = process.env.ADMIN_PASSWORD || randomBytes(12).toString("base64url");
        try {
          await (await getDb()).insert(users).values({
            id: newId("u"),
            role: "admin",
            name,
            email: email.toLowerCase(),
            passwordHash: hashPassword(password),
          });
        } catch (err) {
          if (isUniqueViolation(err)) throw new Error(`There's already an account with ${email}.`);
          throw err;
        }
        console.log(`✓ Admin account created for ${email}.`);
        if (!process.env.ADMIN_PASSWORD) console.log(`  Password: ${password}\n  Sign in at /signin and keep this somewhere safe.`);
        break;
      }

      case "digest": {
        const { sendMessageDigests } = await import("../src/lib/notifications");
        const result = await sendMessageDigests();
        console.log(`✓ Sent ${result.sent} digest${result.sent === 1 ? "" : "s"}.`);
        break;
      }

      default:
        console.log("Commands: migrate | sync | invite [slug…] | reset [--force] | create-admin <email> [name] | digest");
        process.exitCode = command ? 1 : 0;
    }
  } finally {
    await closeDb();
  }
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
