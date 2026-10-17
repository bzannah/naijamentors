import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

// `drizzle-kit generate` only needs the schema. `push` / `studio` need a real postgres:// URL.
const url = process.env.DATABASE_URL ?? "";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  ...(url.startsWith("postgres") ? { dbCredentials: { url } } : {}),
});
