import type { Mentor } from "./types";

/** A Jitsi Meet room for an accepted session, hard to guess from the outside. */
export function meetingUrl(mentor: Pick<Mentor, "firstName">, mentee: string, id: string) {
  const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");
  return `https://meet.jit.si/NaijaMentors-${clean(mentor.firstName)}-${clean(mentee)}-${id.slice(-6)}`;
}
