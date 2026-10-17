"use client";

import { usePathname } from "next/navigation";

/** The inbox is a full-height app view, so it skips the marketing footer. */
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/inbox")) return null;
  return <>{children}</>;
}
