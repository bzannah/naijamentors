/*
  Database and maintenance commands. Run through npm, e.g. `npm run db:migrate`.

    migrate                      apply pending migrations in ./drizzle
    seed                         load the demo data into an empty database
    reset                        wipe every table and load the demo data again
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
  const { databaseUrl } = await import("../src/lib/env");
  const embedded = databaseUrl().startsWith("pglite:");

  try {
    switch (command) {
      case "migrate": {
        if (embedded) {
          // Opening the embedded database applies migrations (and seeds it if it's brand new).
          await getDb();
        } else {
          const { migrate } = await import("drizzle-orm/postgres-js/migrator");
          await migrate((await getDb()) as never, { migrationsFolder: MIGRATIONS_DIR });
        }
        console.log("✓ Database is up to date.");
        break;
      }

      case "seed":
      case "reset": {
        const { seedDatabase } = await import("../src/lib/seed");
        const db = await getDb();
        const done = await seedDatabase(db, command === "reset" ? { reset: true } : { onlyIfEmpty: true });
        console.log(
          command === "reset"
            ? "✓ Demo data restored. Every account uses the password village-demo."
            : done
              ? "✓ Demo data loaded. Every account uses the password village-demo."
              : "· The database already has users, so nothing was seeded. Use `npm run db:reset` to start over.",
        );
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
        console.log("Commands: migrate | seed | reset | create-admin <email> [name] | digest");
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
