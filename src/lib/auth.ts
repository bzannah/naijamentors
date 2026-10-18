import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "./db";
import { toUser } from "./db/mappers";
import { users } from "./db/schema";
import { sessionSecret } from "./env";
import type { Role, User } from "./types";

const COOKIE = "nm_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 1) return null;
  const value = token.slice(0, i);
  const sig = Buffer.from(token.slice(i + 1));
  const expected = Buffer.from(sign(value));
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return null;
  return value;
}

export async function startSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export type SafeUser = Omit<User, "passwordHash">;

// One lookup per request, however many components ask.
const loadUser = cache(async (userId: string): Promise<SafeUser | null> => {
  const [row] = await (await getDb()).select().from(users).where(eq(users.id, userId)).limit(1);
  if (!row) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = toUser(row);
  return safe;
});

export async function getCurrentUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const userId = verify(store.get(COOKIE)?.value);
  if (!userId) return null;
  return loadUser(userId);
}

/** Look up an account by email for sign-in. Includes the password hash, so never pass it to the client. */
export async function findUserByEmail(email: string): Promise<User | null> {
  const [row] = await (await getDb()).select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  return row ? toUser(row) : null;
}

/** Where each kind of account lands after signing in. */
export function homeFor(role: Role) {
  return role === "admin" ? "/admin" : "/dashboard";
}

export async function requireUser(role?: Role, next?: string): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  if (role && user.role !== role) redirect(homeFor(user.role));
  return user;
}
