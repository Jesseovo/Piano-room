"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { AnimatedCounter } from "@/components/pretext/animated-counter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { get } from "@/lib/api";

interface BookingOverview {
  bookedToday: number;
  availableToday: number;
}

interface PageRows<T> {
  total: number;
  rows: T[];
}

interface RoomRow {
  id: number;
  name: string;
}

interface ReservationRow {
  id: number;
  title: string;
  status: string;
  startTime: string;
  room?: { name?: string };
}

export default function AdminDashboardPage() {
  const [roomsTotal, setRoomsTotal] = useState(0);
  const [bookedToday, setBookedToday] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [completionPct, setCompletionPct] = useState(0);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [roomsRes, overviewRes, approvalRes, usersRes, listRes] =
          await Promise.all([
            get<PageRows<RoomRow>>("/room", { page: 1, pageSize: 1 }),
            get<BookingOverview>("/reports/bookingOverview"),
            get<{ approvalRate?: number }>("/reports/approvalRate"),
            get<unknown[]>("/reports/activeUsers", { limit: 200 }),
            get<PageRows<ReservationRow>>("/reservations/list", {
              page: 1,
              pageSize: 8,
            }),
          ]);
        if (cancelled) return;
        if (roomsRes.code === 1 && roomsRes.data) {
          setRoomsTotal(Number(roomsRes.data.total));
        }
        if (overviewRes.code === 1 && overviewRes.data) {
          setBookedToday(overviewRes.data.bookedToday);
        }
        if (approvalRes.code === 1 && approvalRes.data?.approvalRate != null) {
          setCompletionPct(Math.round(approvalRes.data.approvalRate * 100));
        }
        if (usersRes.code === 1 && Array.isArray(usersRes.data)) {
          setActiveUsers(usersRes.data.length);
        }
        if (listRes.code === 1 && listRes.data?.rows) {
          setReservations(listRes.data.rows);
        }
      } catch {
        setRoomsTotal(0);
        setBookedToday(0);
        setActiveUsers(0);
        setCompletionPct(0);
        setReservations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const welcomeDate = new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "full",
    weekday: "long",
  }).format(new Date());

  const stats = [
    { label: "琴房总数", value: roomsTotal },
    { label: "今日预约", value: bookedToday },
    { label: "活跃用户数", value: activeUsers },
    { label: "完成率", value: completionPct, suffix: "%" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-gradient-to-br from-white to-[var(--color-primary-pale)]/40 px-6 py-8 shadow-[var(--shadow-sm)]">
        <p className="text-sm text-[var(--color-text-secondary)]">{welcomeDate}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          欢迎回来，这是今日的运营概览
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
          数据来自实时报表。图表区域可接入 Recharts 展示趋势。
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">加载数据中…</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                <AnimatedCounter value={s.value} duration={1.2} className="inline" />
                {s.suffix ? (
                  <span className="text-3xl font-semibold">{s.suffix}</span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[var(--color-border-light)] bg-white">
          <CardHeader>
            <CardTitle className="text-base">预约趋势（占位）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 text-sm text-[var(--color-text-tertiary)]">
              Recharts 折线图区域
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border-light)] bg-white">
          <CardHeader>
            <CardTitle className="text-base">琴房使用率（占位）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 text-sm text-[var(--color-text-tertiary)]">
              Recharts 柱状图区域
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--color-border-light)] bg-white">
        <CardHeader>
          <CardTitle className="text-base">最近预约</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--color-divider)] bg-[var(--color-bg-tertiary)]/80 text-[var(--color-text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">琴房</th>
                <th className="px-4 py-3 font-medium">开始时间</th>
                <th className="px-4 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-[var(--color-text-tertiary)]">
                    暂无数据
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--color-divider)] last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                      {r.title}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {r.room?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] tabular-nums">
                      {r.startTime
                        ? format(new Date(r.startTime), "yyyy-MM-dd HH:mm")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          r.status === "completed"
                            ? "success"
                            : r.status === "cancelled"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
