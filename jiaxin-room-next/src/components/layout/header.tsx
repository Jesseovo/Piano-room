"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  HelpCircle,
  Home,
  LogOut,
  Music,
  Settings,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useIsMobile } from "@/hooks/use-mobile";

const nav = [
  { href: "/", label: "首页", icon: Home },
  { href: "/rooms", label: "预约琴房", icon: Music },
  { href: "/reservations/my", label: "我的预约", icon: Calendar },
  { href: "/help", label: "帮助", icon: HelpCircle },
];

export function Header() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isLoggedIn, user, logout } = useAuthStore();

  const initials =
    user?.realName?.slice(0, 1) || user?.username?.slice(0, 1) || "?";

  return (
    <header
      className={cn(
        "glass fixed left-0 right-0 top-0 z-50 flex h-[var(--header-height)] items-center border-b border-[var(--color-border-light)] shadow-[var(--shadow-xs)]"
      )}
    >
      <div className="container-app flex w-full items-center justify-between gap-4">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-[var(--color-text)] transition-opacity hover:opacity-80"
        >
          夹心 Room
        </Link>

        {!isMobile && (
          <nav className="flex flex-1 items-center justify-center gap-1 md:gap-2">
            {nav.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex shrink-0 items-center justify-end gap-2">
          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-[var(--radius-full)] py-1 pl-1 pr-2 transition-colors hover:bg-[var(--color-bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  aria-label="用户菜单"
                >
                  <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-[var(--color-border-light)] bg-[var(--color-primary-light)]">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-xs font-semibold text-[var(--color-primary)]">
                        {initials}
                      </span>
                    )}
                  </div>
                  <span className="hidden max-w-[8rem] truncate text-left text-sm font-medium text-[var(--color-text)] sm:inline">
                    {user.realName || user.username}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="z-[100] min-w-[12rem] rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-lg)]"
              >
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-[var(--color-text-tertiary)]">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[var(--color-divider)]" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2"
                  >
                    <User className="size-4" />
                    个人中心
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2"
                  >
                    <Settings className="size-4" />
                    设置
                  </Link>
                </DropdownMenuItem>
                {user.userType === "admin" || user.userType === "super_admin" ? (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/dashboard"
                      className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2"
                    >
                      <Settings className="size-4" />
                      管理后台
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator className="bg-[var(--color-divider)]" />
                <DropdownMenuItem
                  className="cursor-pointer text-[var(--color-danger)] focus:bg-[var(--color-danger-bg)] focus:text-[var(--color-danger)]"
                  onSelect={() => logout()}
                >
                  <LogOut className="size-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">注册</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
