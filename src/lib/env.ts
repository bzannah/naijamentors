/*
  Server-side configuration. Everything is read lazily so `next build` never needs production secrets,
  and a missing value fails loudly the first time it's actually used. See README → Configuration.
*/

const isProd = process.env.NODE_ENV === "production";

function value(name: string) {
  const v = process.env[name]?.trim();
  return v ? v : undefined;
}

function required(name: string, devFallback: string) {
  const v = value(name);
  if (v) return v;
  if (isProd) throw new Error(`${name} is not set. Add it to the environment (see README → Configuration).`);
  return devFallback;
}

/** postgres://… for a real server, or pglite://<dir> for the embedded development database. */
export function databaseUrl() {
  return required("DATABASE_URL", "pglite://data/pglite");
}

const DEV_SECRET = "village-dev-secret-change-me-in-production";

/** Signs session cookies. At least 32 characters in production. */
export function sessionSecret() {
  const v = required("SESSION_SECRET", DEV_SECRET);
  if (isProd && v.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");
  return v;
}

/** Where families and mentors report a concern. Shown across the site. */
export function safeguardingEmail() {
  return value("SAFEGUARDING_EMAIL") ?? "safeguarding@village.demo";
}

/** Public origin used for links in emails, e.g. https://village.org.uk */
export function appUrl() {
  return required("APP_URL", "http://localhost:3000").replace(/\/$/, "");
}

export const email = {
  resendApiKey: () => value("RESEND_API_KEY"),
  from: () => value("EMAIL_FROM") ?? "Village <hello@village.demo>",
  replyTo: () => value("EMAIL_REPLY_TO"),
};

/** Shared secret for scheduled jobs such as the message digest. */
export function cronSecret() {
  return value("CRON_SECRET");
}
