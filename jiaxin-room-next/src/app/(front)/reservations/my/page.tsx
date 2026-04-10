"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { get, put } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "approved" | "completed" | "cancelled";

interface ReservationRow {
  id: number;
  roomId: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  room?: { id: number; name: string; roomNumber: string } | null;
}

interface PageRows {
  total: number;
  rows: ReservationRow[];
}

interface ReservationStats {
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  totalPracticeMinutes: number;
}

const filters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "approved", label: "已批准" },
  { key: "completed", label: "已完成" },
  { key: "cancelled", label: "已取消" },
];

function statusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge variant="success">已批准</Badge>;
    case "completed":
      return <Badge variant="secondary">已完成</Badge>;
    case "cancelled":
      return <Badge variant="danger">已取消</Badge>;
    case "occupied":
      return <Badge variant="warning">使用中</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function MyReservationsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await get<ReservationStats>("/user/my-stats");
      if (res.code === 1 && res.data) setStats(res.data);
    } catch {
      setStats(null);
    }
  }, []);

  const loadList = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await get<PageRows>("/reservations/list", {
        userId: user.id,
        page: 1,
        pageSize: 50,
        status: filter === "all" ? undefined : filter,
      });
      if (res.code === 1 && res.data?.rows) setRows(res.data.rows);
      else setRows([]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login?redirect=/reservations/my");
      return;
    }
    loadStats();
  }, [isLoggedIn, router, loadStats]);

  useEffect(() => {
    if (user?.id) loadList();
  }, [user?.id, loadList]);

  const practiceHours = useMemo(() => {
    const m = stats?.totalPracticeMinutes ?? 0;
    return (m / 60).toFixed(1);
  }, [stats]);

  async function cancelReservation(id: number) {
    if (!confirm("确定取消该预约？")) return;
    setCancellingId(id);
    try {
      const res = await put(`/reservations/${id}/cancel`, { remarks: "用户取消" });
      if (res.code === 1) {
        await loadList();
        await loadStats();
      }
    } finally {
      setCancellingId(null);
    }
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="container-app py-24 text-center text-sm text-[var(--color-text-secondary)]">
        正在跳转登录…
      </div>
    );
  }

  return (
    <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] pb-20 pt-8">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            我的预约
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            管理练琴行程与签到记录
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Card className="border-[var(--color-border-light)] bg-gradient-to-br from-[var(--color-primary-light)] to-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-[var(--color-text-secondary)]">
                <Clock className="size-5 text-[var(--color-primary)]" />
                累计练习时长
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                {practiceHours}
                <span className="ml-1 text-lg font-normal text-[var(--color-text-secondary)]">小时</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-[var(--color-text-secondary)]">
                <CheckCircle2 className="size-5 text-[var(--color-accent-green)]" />
                已完成次数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                {stats?.completedReservations ?? "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)] sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-[var(--color-text-secondary)]">
                <CalendarClock className="size-5 text-[var(--color-accent-purple)]" />
                预约总数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                {stats?.totalReservations ?? "—"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-[var(--radius-full)] border px-4 py-1.5 text-sm font-medium transition-all",
                filter === f.key
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-[var(--color-text-secondary)]">加载中…</p>
        ) : rows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-white/80 py-20 text-center"
          >
            <div className="mb-4 flex size-24 items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--color-bg-secondary)] text-4xl">
              🎹
            </div>
            <p className="text-lg font-medium text-[var(--color-text)]">暂无预约记录</p>
            <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">
              去琴房列表挑选时段，开启你的练琴时光吧。
            </p>
            <Button asChild className="mt-6">
              <Link href="/rooms">浏览琴房</Link>
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <ul className="space-y-4">
              {rows.map((r, i) => (
                <motion.li
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {statusBadge(r.status)}
                          <span className="text-xs text-[var(--color-text-tertiary)]">#{r.id}</span>
                        </div>
                        <p className="text-lg font-semibold text-[var(--color-text)]">
                          {r.room?.name ?? `琴房 #${r.roomId}`}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {(() => {
                            try {
                              const a = parseISO(r.startTime);
                              const b = parseISO(r.endTime);
                              return `${format(a, "yyyy-MM-dd HH:mm")} – ${format(b, "HH:mm")}`;
                            } catch {
                              return "—";
                            }
                          })()}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">{r.title}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:shrink-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/reservations/${r.id}`}>
                            详情
                            <ChevronRight className="size-4" />
                          </Link>
                        </Button>
                        {r.status === "approved" ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={cancellingId === r.id}
                            onClick={() => cancelReservation(r.id)}
                          >
                            {cancellingId === r.id ? "取消中…" : "取消预约"}
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
