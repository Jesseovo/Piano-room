"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { get } from "@/lib/api";

interface BookingOverview {
  bookedToday: number;
  availableToday: number;
}

interface DayOfWeekCount {
  dayOfWeek: number;
  count: number;
}

interface TimeSlotRow {
  timeSlot: string;
  reservationCount: number;
}

interface TypeCount {
  typeName: string;
  count: number;
}

const PIE_COLORS = [
  "var(--color-primary)",
  "#34c759",
  "#ff9f0a",
  "#ff453a",
  "#8e8e93",
];

const WEEK_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function sortTimeSlots(rows: TimeSlotRow[]) {
  return [...rows].sort((a, b) => {
    const ha = parseInt(a.timeSlot.split(":")[0] ?? "0", 10);
    const hb = parseInt(b.timeSlot.split(":")[0] ?? "0", 10);
    return ha - hb;
  });
}

export default function AdminStatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [overview, setOverview] = useState<BookingOverview | null>(null);
  const [registered, setRegistered] = useState(0);
  const [pending, setPending] = useState(0);
  const [practiceHours, setPracticeHours] = useState(0);

  const [weekly, setWeekly] = useState<DayOfWeekCount[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotRow[]>([]);
  const [statusDist, setStatusDist] = useState<Record<string, number>>({});
  const [typeUsage, setTypeUsage] = useState<TypeCount[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [
          ov,
          reg,
          pend,
          tph,
          wk,
          ts,
          st,
          tu,
        ] = await Promise.all([
          get<BookingOverview>("/reports/bookingOverview"),
          get<{ count: number }>("/reports/registeredUsers"),
          get<{ count: number }>("/reports/pendingReservations"),
          get<{ totalPracticeHours: number }>("/reports/totalPracticeHours"),
          get<DayOfWeekCount[]>("/reports/weekly"),
          get<TimeSlotRow[]>("/reports/time-slot-report"),
          get<Record<string, number>>("/reports/reservationStatusDistribution"),
          get<TypeCount[]>("/reports/typeusage"),
        ]);
        if (cancelled) return;
        if (ov.code === 1 && ov.data) setOverview(ov.data);
        if (reg.code === 1 && reg.data) setRegistered(Number(reg.data.count));
        if (pend.code === 1 && pend.data) setPending(Number(pend.data.count));
        if (tph.code === 1 && tph.data)
          setPracticeHours(Number(tph.data.totalPracticeHours));
        if (wk.code === 1 && Array.isArray(wk.data)) setWeekly(wk.data);
        if (ts.code === 1 && Array.isArray(ts.data)) setTimeSlots(ts.data);
        if (st.code === 1 && st.data) setStatusDist(st.data);
        if (tu.code === 1 && Array.isArray(tu.data)) setTypeUsage(tu.data);
      } catch {
        if (!cancelled) setErr("加载报表失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const weeklyChart = useMemo(
    () =>
      weekly.map((d) => ({
        name: WEEK_LABELS[d.dayOfWeek] ?? String(d.dayOfWeek),
        count: d.count,
      })),
    [weekly]
  );

  const slotChart = useMemo(() => sortTimeSlots(timeSlots), [timeSlots]);

  const pieData = useMemo(
    () =>
      Object.entries(statusDist).map(([name, value]) => ({
        name,
        value,
      })),
    [statusDist]
  );

  const typeChart = useMemo(
    () =>
      typeUsage.map((t) => ({
        name: t.typeName,
        count: t.count,
      })),
    [typeUsage]
  );

  const summary = [
    {
      label: "今日已预约",
      value: overview?.bookedToday ?? "—",
      sub: `空闲约 ${overview?.availableToday ?? "—"} 间`,
    },
    {
      label: "注册用户",
      value: registered,
      sub: "累计注册",
    },
    {
      label: "待开始预约",
      value: pending,
      sub: "未来时段已通过",
    },
    {
      label: "累计练习时长",
      value:
        typeof practiceHours === "number" && Number.isFinite(practiceHours)
          ? practiceHours.toFixed(1)
          : "—",
      sub: "小时（估算）",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
          数据统计
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          指标卡片与 Recharts 图表，数据来自 <code className="text-xs">/reports/*</code>
        </p>
      </motion.div>

      {err ? (
        <p className="rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {err}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
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
              {loading ? (
                <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
              ) : (
                <>
                  <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{s.sub}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">按星期分布</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border-light)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} name="预约数" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">时段热度（近一月）</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slotChart} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                  <XAxis
                    dataKey="timeSlot"
                    tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={48}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border-light)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  />
                  <Bar dataKey="reservationCount" fill="#34c759" radius={[6, 6, 0, 0]} name="预约数" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">预约状态占比</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : pieData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-tertiary)]">
                暂无数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={String(i)} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border-light)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">琴房类型使用次数</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={typeChart}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
                    tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border-light)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  />
                  <Bar dataKey="count" fill="#5856d6" radius={[0, 6, 6, 0]} name="次数" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
