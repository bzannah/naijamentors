import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { mentorName, threadFor } from "@/lib/queries";
import { dateKey, fmtDateLong, fmtDayNum, fmtMonth, fmtRelativeDay, fmtTime, fmtWeekday } from "@/lib/time";
import { ThreadView, type SessionCardData, type ThreadMessage } from "./ThreadView";

export const metadata: Metadata = { title: "Conversation" };

export default async function ThreadPage({ params, searchParams }: PageProps<"/inbox/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(undefined, `/inbox/${id}`);
  const t = threadFor(user, id);
  if (!t) notFound();

  const now = Date.now();
  const messages: ThreadMessage[] = t.messages.map((m) => ({
    id: m.id,
    kind: m.kind,
    senderId: m.senderId,
    body: m.body,
    sessionId: m.sessionId,
    createdAt: m.createdAt,
    time: fmtTime(m.createdAt),
    dayKey: dateKey(m.createdAt),
    dayLabel: fmtRelativeDay(m.createdAt, now),
  }));

  const sessions: Record<string, SessionCardData> = Object.fromEntries(
    Object.values(t.sessions).map((s) => {
      const start = new Date(s.start).getTime();
      const end = start + s.durationMin * 60000;
      return [
        s.id,
        {
          id: s.id,
          status: s.status,
          topic: s.topic,
          goals: s.goals,
          meetingUrl: s.meetingUrl,
          dateLong: fmtDateLong(s.start),
          relDay: fmtRelativeDay(s.start, now),
          time: fmtTime(s.start),
          wd: fmtWeekday(s.start),
          dn: fmtDayNum(s.start),
          mo: fmtMonth(s.start),
          endTime: fmtTime(new Date(end)),
          joinable: now >= start - 15 * 60000 && now <= end + 15 * 60000,
          past: now > end,
        },
      ];
    }),
  );

  const m = t.mentor;
  return (
    <ThreadView
      key={t.conversation.id}
      conversationId={t.conversation.id}
      viewer={{ id: user.id, role: user.role }}
      header={t.other}
      mentee={{ name: t.conversation.menteeName, age: t.conversation.menteeAge, schoolYear: t.conversation.schoolYear }}
      mentor={{ userId: m.userId, firstName: m.firstName, displayName: mentorName(m), short: `${m.honorific ? m.honorific + " " : ""}${m.firstName}`, replies: m.replies }}
      parent={{ id: t.parent.id, firstName: t.parent.name.split(" ")[0], name: t.parent.name, city: t.parent.city }}
      messages={messages}
      sessions={sessions}
      justSent={sp.sent === "1"}
    />
  );
}
