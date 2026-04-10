"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { get, put, type PageData } from "@/lib/api";

interface UserBrief {
  id?: number;
  username?: string;
  realName?: string;
}

interface RoomBrief {
  id?: number;
  name?: string;
}

interface ReservationRow {
  id: number;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  user?: UserBrief | null;
  room?: RoomBrief | null;
}

const PAGE_SIZE = 10;

const STATUS_OPTS = [
  { value: "", label: "全部状态" },
  { value: "approved", label: "已通过" },
  { value: "occupied", label: "进行中" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" },
];

function statusLabel(s: string) {
  const m: Record<string, string> = {
    approved: "已通过",
    occupied: "进行中",
    completed: "已完成",
    cancelled: "已取消",
  };
  return m[s] ?? s;
}

function statusVariant(s: string): React.ComponentProps<typeof Badge>["variant"] {
  switch (s) {
    case "completed":
      return "success";
    case "cancelled":
      return "secondary";
    case "occupied":
      return "warning";
    default:
      return "default";
  }
}

export default function AdminReservationsPage() {
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await get<PageData<ReservationRow>>("/reservations/list", {
        page,
        pageSize: PAGE_SIZE,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (res.code === 1 && res.data) {
        setTotal(Number(res.data.total));
        setRows(res.data.rows ?? []);
      } else {
        setErr(res.msg || "加载失败");
        setRows([]);
        setTotal(0);
      }
    } catch {
      setErr("网络错误");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, status, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [status, startDate, endDate]);

  const filteredRows = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter((r) => {
      const u = `${r.user?.username ?? ""} ${r.user?.realName ?? ""}`.toLowerCase();
      const room = (r.room?.name ?? "").toLowerCase();
      const title = (r.title ?? "").toLowerCase();
      return u.includes(k) || room.includes(k) || title.includes(k);
    });
  }, [rows, keyword]);

  const displayRows = keyword.trim() ? filteredRows : rows;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function cancelReservation(r: ReservationRow) {
    if (r.status === "cancelled") return;
    if (!confirm(`确定取消预约 #${r.id}？`)) return;
    setBusyId(r.id);
    setErr(null);
    try {
      const res = await put(`/reservations/${r.id}/cancel`, {
        remarks: "管理员取消",
      });
      if (res.code === 1) {
        setMsg("已取消");
        load();
      } else setErr(res.msg || "取消失败");
    } catch {
      setErr("取消失败");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
          预约管理
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          筛选状态与日期区间，支持关键词过滤当前页结果
        </p>
      </motion.div>

      {msg ? (
        <p className="rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success)]">
          {msg}
        </p>
      ) : null}
      {err ? (
        <p className="rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {err}
        </p>
      ) : null}

      <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">筛选</CardTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Input
              type="date"
              className="h-10"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              className="h-10"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Input
              className="h-10"
              placeholder="关键词（用户 / 琴房 / 标题）"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-y border-[var(--color-divider)] bg-[var(--color-bg-tertiary)]/60 text-[var(--color-text-secondary)]">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">用户</th>
                  <th className="px-4 py-3 font-medium">琴房</th>
                  <th className="px-4 py-3 font-medium">时间</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <Loader2 className="mx-auto size-6 animate-spin text-[var(--color-primary)]" />
                    </td>
                  </tr>
                ) : displayRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                    >
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  displayRows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[var(--color-divider)]/80 transition-colors hover:bg-[var(--color-bg-secondary)]/50 last:border-0"
                    >
                      <td className="px-4 py-3.5 font-mono text-xs text-[var(--color-text)]">
                        #{r.id}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text)]">
                        {r.user?.realName || r.user?.username || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text-secondary)]">
                        {r.room?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text-secondary)] tabular-nums">
                        {r.startTime && r.endTime
                          ? `${format(new Date(r.startTime), "MM-dd HH:mm")} – ${format(
                              new Date(r.endTime),
                              "HH:mm"
                            )}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={statusVariant(r.status)}>
                          {statusLabel(r.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            r.status === "cancelled" || busyId === r.id
                          }
                          onClick={() => cancelReservation(r)}
                        >
                          {busyId === r.id ? "处理中…" : "取消"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--color-divider)] px-4 py-3 sm:flex-row">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {keyword.trim()
                ? `当前页匹配 ${displayRows.length} 条（共 ${total} 条记录）`
                : `共 ${total} 条 · 第 ${page} / ${totalPages} 页`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading || !!keyword.trim()}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading || !!keyword.trim()}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
