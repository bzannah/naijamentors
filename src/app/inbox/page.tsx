import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { AdirePattern } from "@/components/Patterns";

export const metadata: Metadata = { title: "Messages" };

export default function InboxIndex() {
  return (
    <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-paper-2/40 md:flex">
      <AdirePattern className="text-gold opacity-[0.1]" size={44} />
      <div className="relative max-w-sm px-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-card text-forest-3 shadow-soft ring-1 ring-line">
          <MessagesSquare className="h-7 w-7" strokeWidth={1.6} />
        </span>
        <p className="font-display mt-6 text-[1.8rem] leading-tight">Every great mentorship starts with hello.</p>
        <p className="mt-3 text-[0.95rem] text-ink-2">Choose a conversation to read it, reply, or manage a session.</p>
      </div>
    </div>
  );
}
