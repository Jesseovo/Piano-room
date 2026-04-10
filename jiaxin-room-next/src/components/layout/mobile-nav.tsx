"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, HelpCircle, Home, Music, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useIsMobile } from "@/hooks/use-mobile";

const guestTabs = [
  { href: "/", label: "首页", icon: Home },
  { href: "/rooms", label: "琴房", icon: Music },
  { href: "/help", label: "帮助", icon: HelpCircle },
];

const loggedInTabs = [
  { href: "/", label: "首页", icon: Home },
  { href: "/rooms", label: "预约", icon: Music },
  { href: "/reservations/my", label: "我的", icon: Calendar },
  { href: "/profile", label: "我", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!isMobile) return null;

  const tabs = isLoggedIn ? loggedInTabs : guestTabs;

  return (
    <nav
      className="glass safe-bottom fixed bottom-0 left-0 right-0 z-50 flex h-[var(--mobile-nav-height)] items-stretch border-t border-[var(--color-border-light)] md:hidden"
      aria-label="主导航"
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              active
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            <Icon
              className={cn("size-5", active && "text-[var(--color-primary)]")}
              strokeWidth={active ? 2.25 : 2}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
