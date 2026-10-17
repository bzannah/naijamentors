import type { MentorCardData } from "@/components/MentorCard";
import { mentorName, type MentorListing } from "./queries";
import { dateKey, fmtDateShort, fmtTime, fmtWeekday } from "./time";

/** "Today 6:30pm", "Tomorrow 7pm", "Thu 6:30pm" within a week, otherwise "Thu 29 Oct". */
export function fmtNext(iso: string, now = Date.now()) {
  const k = dateKey(iso);
  if (k === dateKey(now)) return `Today ${fmtTime(iso)}`;
  if (k === dateKey(now + 86400_000)) return `Tomorrow ${fmtTime(iso)}`;
  if (new Date(iso).getTime() - now < 6 * 86400_000) return `${fmtWeekday(iso)} ${fmtTime(iso)}`;
  return fmtDateShort(iso);
}

export function toCard(m: MentorListing): MentorCardData {
  return {
    slug: m.slug,
    name: mentorName(m),
    role: m.role,
    org: m.org,
    field: m.field,
    city: m.city,
    heritage: m.heritage,
    languages: m.languages,
    specialities: m.specialities,
    photo: m.photo,
    nextLabel: m.nextSlot ? fmtNext(m.nextSlot) : null,
    verified: m.verified.dbs && m.verified.id,
    pending: m.status === "pending",
  };
}
