"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { mentors } from "@/lib/db/schema";
import { notifyMentorApproved } from "@/lib/notifications";

export type Check = "dbs" | "id" | "references";
export type AdminResult = { ok: boolean; error?: string };

const patchFor = (check: Check, on: boolean) =>
  check === "dbs" ? { verifiedDbs: on } : check === "id" ? { verifiedId: on } : { verifiedReferences: on };

async function isAdmin() {
  return (await getCurrentUser())?.role === "admin";
}

function refresh() {
  revalidatePath("/", "layout");
}

/**
 * Tick or untick one verification check.
 * A live mentor must hold all three, so unticking one sends them back to review.
 */
export async function setMentorCheck(mentorId: string, check: Check, on: boolean): Promise<AdminResult> {
  if (!(await isAdmin())) return { ok: false, error: "Only the Naija Mentors team can do that." };
  if (!["dbs", "id", "references"].includes(check) || typeof on !== "boolean") return { ok: false, error: "Unknown check." };

  const updated = await (await getDb())
    .update(mentors)
    .set({ ...patchFor(check, on), ...(on ? {} : { status: "pending" as const, approvedAt: null }) })
    .where(eq(mentors.id, mentorId))
    .returning({ id: mentors.id });
  refresh();
  return { ok: updated.length > 0 };
}

/** Publish a pending mentor as verified. Requires all three checks. */
export async function approveMentor(mentorId: string): Promise<AdminResult> {
  if (!(await isAdmin())) return { ok: false, error: "Only the Naija Mentors team can do that." };
  const updated = await (await getDb())
    .update(mentors)
    .set({ status: "active", approvedAt: new Date().toISOString() })
    .where(
      and(
        eq(mentors.id, mentorId),
        eq(mentors.status, "pending"),
        eq(mentors.verifiedDbs, true),
        eq(mentors.verifiedId, true),
        eq(mentors.verifiedReferences, true),
      ),
    )
    .returning({ id: mentors.id });
  if (!updated.length) return { ok: false, error: "Tick the DBS, ID and references checks first." };
  after(() => notifyMentorApproved(mentorId));
  refresh();
  return { ok: true };
}

/** Take a live mentor back into review, e.g. while a DBS renewal is pending. Their checks are kept. */
export async function returnToReview(mentorId: string): Promise<AdminResult> {
  if (!(await isAdmin())) return { ok: false, error: "Only the Naija Mentors team can do that." };
  const updated = await (await getDb())
    .update(mentors)
    .set({ status: "pending", approvedAt: null })
    .where(and(eq(mentors.id, mentorId), eq(mentors.status, "active")))
    .returning({ id: mentors.id });
  refresh();
  return { ok: updated.length > 0 };
}
