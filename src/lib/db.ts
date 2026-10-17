import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { buildSeed } from "./seed";
import type { Db } from "./types";

/*
  A tiny JSON-file store. Good enough for a prototype and trivial to swap for Postgres:
  every read and write in the app goes through readDb() / mutate().
*/

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function load(): Db {
  if (!fs.existsSync(DB_PATH)) {
    const seeded = buildSeed();
    persist(seeded);
    return seeded;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8")) as Db;
}

function persist(db: Db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

export function readDb(): Db {
  return load();
}

export function mutate<T>(fn: (db: Db) => T): T {
  const db = load();
  const result = fn(db);
  persist(db);
  return result;
}

export function newId(prefix: string) {
  return `${prefix}_${randomBytes(6).toString("hex")}`;
}
