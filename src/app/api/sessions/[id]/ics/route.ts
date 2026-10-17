import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { mentorName, sessionById } from "@/lib/queries";

export const dynamic = "force-dynamic";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

export async function GET(request: Request, ctx: RouteContext<"/api/sessions/[id]/ics">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return new Response("Please sign in", { status: 401 });
  const s = await sessionById(user, id);
  if (!s || s.status !== "accepted") return new Response("Not found", { status: 404 });

  const start = new Date(s.start);
  const end = new Date(start.getTime() + s.durationMin * 60000);
  const room = new URL(`/sessions/${s.id}`, request.url).toString();
  const title = `${BRAND.name}: ${s.menteeName} × ${mentorName(s.mentor)}`;
  const description = [s.topic, "", `Session room: ${room}`, s.meetingUrl ? `Video link: ${s.meetingUrl}` : ""].join("\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${BRAND.name}//Mentorship//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${s.id}@village`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(description)}`,
    `LOCATION:${esc(s.meetingUrl ?? room)}`,
    `URL:${room}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(title)} starts in 30 minutes`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="village-session-${s.menteeName.toLowerCase()}.ics"`,
    },
  });
}
