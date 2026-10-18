"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Menu, MessageCircle, ShieldCheck, UserRound, X } from "lucide-react";
import { signOut } from "@/app/actions";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/types";
import { Logo } from "./Logo";
import { Avatar } from "./Portrait";
import { ButtonLink } from "./ui/Button";
import { AsoOke } from "./Patterns";

type HeaderUser = { name: string; role: Role; photo?: string; profileHref?: string } | null;

const ACCOUNT_LABEL: Record<Role, string> = {
  admin: "Naija Mentors team",
  mentor: "Mentor account",
  mentee: "Mentee account",
  parent: "Parent account",
};

const NAV = [
  { href: "/mentors", label: "Find a mentor" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/guide", label: "The guide" },
  { href: "/become-a-mentor", label: "Become a mentor" },
];

export function HeaderClient({ user, unread }: { user: HeaderUser; unread: number }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [menu]);

  const isActive = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-[background,box-shadow,border-color] duration-500",
          scrolled || open ? "glass border-b border-line shadow-[0_8px_30px_-20px_rgb(23_20_15/0.25)]" : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-3 px-5 sm:gap-6 sm:px-8">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[0.92rem] font-medium transition-colors",
                  isActive(item.href) ? "text-forest" : "text-ink-2 hover:text-ink",
                )}
              >
                {item.label}
                {isActive(item.href) && <span className="absolute inset-x-4 -bottom-0.5 h-[2px] rounded-full bg-gold" />}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {user.role !== "admin" && (
                  <Link
                    href="/inbox"
                    aria-label={`Inbox${unread ? `, ${unread} unread` : ""}`}
                    className={cn(
                      "relative flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition hover:bg-ink/5 hover:text-ink",
                      pathname.startsWith("/inbox") && "bg-ink/5 text-ink",
                    )}
                  >
                    <MessageCircle className="h-[21px] w-[21px]" strokeWidth={1.8} />
                    {unread > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-clay px-1 text-[0.65rem] font-bold text-paper ring-2 ring-paper animate-pop">
                        {unread}
                      </span>
                    )}
                  </Link>
                )}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenu((v) => !v)}
                    aria-expanded={menu}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 rounded-full py-1 pr-2.5 pl-1 transition hover:bg-ink/5"
                  >
                    <Avatar src={user.photo} name={user.name} size={36} />
                    <ChevronDown className={cn("hidden h-4 w-4 text-ink-3 transition-transform sm:block", menu && "rotate-180")} />
                  </button>
                  {menu && (
                    <div
                      role="menu"
                      className="animate-pop absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl bg-card shadow-lift ring-1 ring-line"
                    >
                      <div className="border-b border-line px-4 py-3.5">
                        <p className="truncate text-[0.95rem] font-semibold">{user.name}</p>
                        <p className="text-[0.8rem] text-ink-3">{ACCOUNT_LABEL[user.role]}</p>
                      </div>
                      <div className="p-1.5">
                        {user.role === "admin" ? (
                          <MenuLink href="/admin" icon={<ShieldCheck className="h-4 w-4" />}>Mentor verification</MenuLink>
                        ) : (
                          <>
                            <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</MenuLink>
                            <MenuLink href="/inbox" icon={<MessageCircle className="h-4 w-4" />}>
                              Messages {unread > 0 && <span className="ml-auto rounded-full bg-clay-soft px-2 text-xs font-bold text-clay">{unread}</span>}
                            </MenuLink>
                          </>
                        )}
                        {user.profileHref && (
                          <MenuLink href={user.profileHref} icon={<UserRound className="h-4 w-4" />}>My public profile</MenuLink>
                        )}
                        <form action={signOut}>
                          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.9rem] text-ink-2 transition hover:bg-paper-2 hover:text-ink">
                            <LogOut className="h-4 w-4" /> Sign out
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <ButtonLink href="/signin" variant="ghost" size="sm" className="max-sm:hidden">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/mentors" size="sm" className="max-sm:hidden">
                  Find a mentor
                </ButtonLink>
              </>
            )}
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-ink/5 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 top-[72px] z-40 flex flex-col bg-paper lg:hidden">
          <nav className="flex flex-1 flex-col gap-1 px-6 pt-8" aria-label="Mobile">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-display animate-fade-up border-b border-line py-4 text-[2rem] leading-tight"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-3 px-6 pb-10">
            {user ? (
              <ButtonLink href={user.role === "admin" ? "/admin" : "/dashboard"} className="flex-1" size="lg">
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/signin" variant="secondary" size="lg" className="flex-1">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/signup" size="lg" className="flex-1">
                  Join the village
                </ButtonLink>
              </>
            )}
          </div>
          <AsoOke />
        </div>
      )}
    </>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} role="menuitem" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] text-ink-2 transition hover:bg-paper-2 hover:text-ink">
      {icon}
      {children}
    </Link>
  );
}
