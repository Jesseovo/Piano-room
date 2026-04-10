"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Settings,
  User,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
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

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  superOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "琴房管理", icon: Building2 },
  { href: "/admin/reservations", label: "预约管理", icon: CalendarDays },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/statistics", label: "数据统计", icon: Activity },
  { href: "/admin/maintenance", label: "维修管理", icon: Wrench },
  { href: "/admin/logs", label: "操作日志", icon: ClipboardList },
  { href: "/admin/admins", label: "管理员管理", icon: UserCog, superOnly: true },
  { href: "/admin/settings", label: "系统设置", icon: Settings },
  { href: "/admin/profile", label: "个人中心", icon: User },
];

function breadcrumbLabel(pathname: string) {
  const hit = navItems.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  return hit?.label ?? "管理后台";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isSuperAdmin, isLoggedIn, isAdmin } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      const redirect = encodeURIComponent(pathname || "/admin/dashboard");
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isLoggedIn, isAdmin, pathname, router]);

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-secondary)]">
        正在验证权限…
      </div>
    );
  }

  const initials =
    user?.realName?.slice(0, 1) || user?.username?.slice(0, 1) || "?";

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-secondary)]">
      <aside
        className={cn(
          "sticky top-0 flex h-screen flex-col border-r border-[var(--color-border-light)] bg-white transition-[width] duration-300 ease-[var(--ease-spring)]",
          collapsed ? "w-[72px]" : "w-60"
        )}
      >
        <div className="flex h-[var(--header-height)] items-center justify-between border-b border-[var(--color-border-light)] px-3">
          {!collapsed ? (
            <Link
              href="/admin/dashboard"
              className="truncate text-sm font-semibold text-[var(--color-text)]"
            >
              夹心 Room 管理
            </Link>
          ) : (
            <span className="sr-only">夹心 Room 管理</span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {navItems
            .filter((item) => !item.superOnly || isSuperAdmin)
            .map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </Link>
              );
            })}
        </nav>
        <div className="border-t border-[var(--color-border-light)] p-2">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]",
              collapsed && "justify-center px-0"
            )}
          >
            <ChevronLeft className="size-5 rotate-180" />
            {!collapsed ? "返回前台" : null}
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[var(--header-height)] items-center justify-between gap-4 border-b border-[var(--color-border-light)] bg-white/90 px-6 backdrop-blur-md">
          <div className="min-w-0 text-sm text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-text-tertiary)]">管理后台</span>
            <span className="mx-2 text-[var(--color-border)]">/</span>
            <span className="font-medium text-[var(--color-text)]">
              {breadcrumbLabel(pathname)}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex max-w-[14rem] items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]/80 py-1 pl-1 pr-3 text-left text-sm transition-colors hover:bg-[var(--color-bg-secondary)]"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-semibold text-[var(--color-primary)]">
                  {initials}
                </div>
                <span className="truncate font-medium text-[var(--color-text)]">
                  {user?.realName || user?.username || "管理员"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="z-[100] min-w-[10rem] rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-1 shadow-[var(--shadow-lg)]"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-[var(--color-text-tertiary)]">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--color-divider)]" />
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/profile"
                  className="flex cursor-pointer rounded-[var(--radius-sm)] px-2 py-2 outline-none hover:bg-[var(--color-bg-secondary)]"
                >
                  个人中心
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  className="flex cursor-pointer rounded-[var(--radius-sm)] px-2 py-2 outline-none hover:bg-[var(--color-bg-secondary)]"
                >
                  返回前台
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--color-divider)]" />
              <DropdownMenuItem
                className="cursor-pointer rounded-[var(--radius-sm)] px-2 py-2 text-[var(--color-danger)] focus:bg-[var(--color-danger-bg)] focus:outline-none"
                onSelect={() => logout()}
              >
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
