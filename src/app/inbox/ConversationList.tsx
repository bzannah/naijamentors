"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/Portrait";
import { cn } from "@/lib/cn";
import type { SessionStatus } from "@/lib/types";

export type ListItem = {
  id: string;
  name: string;
  photo?: string;
  subtitle: string;
  preview: string;
  ago: string;
  unread: number;
  status?: SessionStatus;
};

const STATUS: Record<SessionStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-gold-soft text-[#8a6a25]" },
  accepted: { label: "Confirmed", cls: "bg-mint text-forest-3" },
  declined: { label: "Declined", cls: "bg-paper-2 text-ink-3" },
  cancelled: { label: "Cancelled", cls: "bg-paper-2 text-ink-3" },
};

export function ConversationList({ items, side }: { items: ListItem[]; side: "account" | "mentor" }) {
  const pathname = usePathname();
  const activeId = pathname.split("/")[2];

  return (
    <aside
      className={cn(
        "w-full shrink-0 flex-col border-r border-line md:flex md:w-[340px] lg:w-[380px]",
        activeId ? "hidden" : "flex",
      )}
    >
      <div className="border-b border-line px-6 pt-6 pb-5">
        <h1 className="font-display text-[2rem] leading-none tracking-[-0.03em]">Messages</h1>
        <p className="mt-2 text-[0.85rem] text-ink-3">
          {side === "account" ? "Your conversations with mentors" : "Requests and messages from mentees and families"}
        </p>
      </div>
      <div className="thin-scroll flex-1 overflow-y-auto p-2.5">
        {items.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-xl">No conversations yet</p>
            <p className="mt-2 text-[0.9rem] text-ink-3">
              {side === "account" ? "Request a session with a mentor to start one." : "When someone requests a session, it'll appear here."}
            </p>
            {side === "account" && (
              <Link href="/mentors" className="mt-5 inline-flex h-10 items-center rounded-full bg-forest px-5 text-[0.88rem] font-semibold text-paper">
                Find a mentor
              </Link>
            )}
          </div>
        )}
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <Link
              key={it.id}
              href={`/inbox/${it.id}`}
              className={cn(
                "relative flex gap-3.5 rounded-2xl p-3.5 transition-colors",
                active ? "bg-paper-2" : "hover:bg-paper-2/60",
              )}
            >
              {active && <span className="absolute top-4 bottom-4 left-0 w-[3px] rounded-full bg-gold" />}
              <div className="relative">
                <Avatar src={it.photo} name={it.name} size={48} />
                {it.unread > 0 && <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-clay ring-[2.5px] ring-card" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate text-[0.95rem]", it.unread ? "font-bold" : "font-semibold")}>{it.name}</p>
                  <span className={cn("shrink-0 text-[0.75rem]", it.unread ? "font-semibold text-clay" : "text-ink-4")}>{it.ago}</span>
                </div>
                <p className="truncate text-[0.78rem] text-ink-3">{it.subtitle}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <p className={cn("min-w-0 flex-1 truncate text-[0.85rem]", it.unread ? "font-medium text-ink" : "text-ink-2")}>{it.preview}</p>
                  {it.status && (
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[0.68rem] font-bold", STATUS[it.status].cls)}>
                      {STATUS[it.status].label}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
