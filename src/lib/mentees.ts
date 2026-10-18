import type { Role } from "./types";

/*
  Who Naija Mentors is for: young British-Nigerians from 11 to 30.
  Under-18s are booked by a parent or guardian, who sees every message.
  From 18, mentees have their own account and book for themselves.
*/
export const MENTEE_AGES = { min: 11, adult: 18, max: 30 } as const;

/** Where an adult mentee is right now. Under-18s are described by their school year instead. */
export const STAGES = [
  "Finishing sixth form or college",
  "At university",
  "On an apprenticeship",
  "Recently graduated",
  "Early in my career",
  "Changing direction",
];

/** Accounts that request sessions: parents for their children, and mentees aged 18+ for themselves. */
export function canBook(role: Role) {
  return role === "parent" || role === "mentee";
}

/** Age at the start of the school year → English school year. */
export function schoolYearForAge(age: number) {
  return `Year ${Math.min(13, Math.max(7, age - 4))}`;
}

/** The overall span of a mentor's age groups, e.g. ["14–16", "19–24"] → "14–24". */
export function ageSpan(groups: string[]) {
  const bounds = groups.flatMap((g) => g.split("–").map(Number)).filter(Number.isFinite);
  return bounds.length ? `${Math.min(...bounds)}–${Math.max(...bounds)}` : "";
}
