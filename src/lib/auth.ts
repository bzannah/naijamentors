import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb } from "./db";
import type { Role, User } from "./types";

const COOKIE = "village_session";
const SECRET = process.env.SESSION_SECRET ?? "village-dev-secret-change-me-in-production";
const MAX_AGE = 60 * 60 * 24 * 30;

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
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

export async function getCurrentUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const userId = verify(store.get(COOKIE)?.value);
  if (!userId) return null;
  const user = readDb().users.find((u) => u.id === userId);
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function requireUser(role?: Role, next?: string): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  if (role && user.role !== role) redirect("/dashboard");
  return user;
}
