import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { databaseUrl } from "../env";
import * as schema from "./schema";

/*
  Postgres via Drizzle.

  DATABASE_URL=postgres://…   a real Postgres server (production, or a local one).
  DATABASE_URL=pglite://dir   an embedded Postgres (PGlite) stored on disk. This is the default in
                              development, so `npm run dev` works without installing anything. The
                              embedded database migrates and seeds itself the first time it opens.
*/

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

type Handle = { db: Database; close: () => Promise<void>; embedded: boolean };

// Survives hot reloads in dev so we keep a single connection pool / embedded instance.
const g = globalThis as unknown as { __nmDb?: Promise<Handle> };

async function connect(): Promise<Handle> {
  const url = databaseUrl();

  if (url.startsWith("pglite:")) {
    const dir = url.slice("pglite:".length).replace(/^\/\//, "") || "data/pglite";
    const dataDir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), dir);
    const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
      import("@electric-sql/pglite"),
      import("drizzle-orm/pglite"),
      import("drizzle-orm/pglite/migrator"),
    ]);
    fs.mkdirSync(dataDir, { recursive: true });
    const client = await PGlite.create({ dataDir });
    const db = drizzle({ client, schema });
    await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
    const handle: Handle = { db: db as unknown as Database, close: () => client.close(), embedded: true };
    // Fresh embedded database: fill it with the demo data so the app is explorable straight away.
    const { seedDatabase } = await import("../seed");
    await seedDatabase(handle.db, { onlyIfEmpty: true });
    return handle;
  }

  const [{ default: postgres }, { drizzle }] = await Promise.all([import("postgres"), import("drizzle-orm/postgres-js")]);
  const client = postgres(url, {
    max: Number(process.env.DATABASE_POOL_MAX) || 10,
    // Safe behind transaction-mode poolers (PgBouncer, Supabase, Neon).
    prepare: false,
    onnotice: () => {},
  });
  const db = drizzle({ client, schema });
  return { db: db as unknown as Database, close: () => client.end(), embedded: false };
}

async function handle() {
  g.__nmDb ??= connect().catch((err) => {
    g.__nmDb = undefined;
    throw err;
  });
  return g.__nmDb;
}

/** The app's database. Connects lazily on first use. */
export async function getDb(): Promise<Database> {
  return (await handle()).db;
}

/** Close the connection (used by CLI scripts so the process can exit). */
export async function closeDb() {
  if (!g.__nmDb) return;
  const h = await g.__nmDb;
  g.__nmDb = undefined;
  await h.close();
}

export function newId(prefix: string) {
  return `${prefix}_${randomBytes(6).toString("hex")}`;
}

/** True when a write failed on a unique constraint, optionally a specific one. */
export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  for (let e = err as { code?: string; constraint_name?: string; constraint?: string; cause?: unknown } | undefined; e; e = e.cause as typeof e) {
    if (e.code === "23505") return !constraint || e.constraint_name === constraint || e.constraint === constraint;
  }
  return false;
}
