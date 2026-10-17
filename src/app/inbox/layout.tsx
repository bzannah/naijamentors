import { requireUser } from "@/lib/auth";
import { conversationsFor } from "@/lib/queries";
import { fmtAgo } from "@/lib/time";
import { ConversationList, type ListItem } from "./ConversationList";

export default async function InboxLayout({ children }: LayoutProps<"/inbox">) {
  const user = await requireUser(undefined, "/inbox");
  const items: ListItem[] = conversationsFor(user).map(({ conversation: c, other, last, unread, session }) => ({
    id: c.id,
    name: other.name,
    photo: other.photo,
    subtitle: user.role === "parent" ? `For ${c.menteeName} · ${other.subtitle}` : other.subtitle,
    preview: !last
      ? ""
      : last.kind === "system"
        ? systemPreview(last.body)
        : `${last.senderId === user.id ? "You: " : ""}${last.kind === "request" ? "Session request · " : ""}${last.body}`,
    ago: last ? fmtAgo(last.createdAt) : "",
    unread,
    status: session?.status,
  }));

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-1 px-0 sm:px-8 sm:py-6">
      <div className="flex h-[calc(100dvh-72px)] w-full overflow-hidden bg-card ring-line sm:h-[calc(100dvh-72px-48px)] sm:rounded-[32px] sm:shadow-soft sm:ring-1">
        <ConversationList items={items} role={user.role} />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

function systemPreview(body: string) {
  if (body === "accepted") return "Session confirmed";
  if (body === "declined") return "Session declined";
  if (body.startsWith("cancelled")) return "Session cancelled";
  return body;
}
