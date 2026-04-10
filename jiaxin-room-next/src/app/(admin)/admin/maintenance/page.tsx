"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { del, get, post, type PageData } from "@/lib/api";

interface RoomOpt {
  id: number;
  name: string;
  roomNumber: string;
}

interface MaintenanceRow {
  id: number;
  roomId: number;
  startTime: string;
  endTime: string;
  reason: string;
  maintenanceType: string;
  status: string;
  room?: { name?: string; roomNumber?: string } | null;
}

const PAGE_SIZE = 10;

const STATUSES = ["未开始", "进行中", "已完成", "已取消"];

const TYPES = ["定期维护", "设备维护", "设备升级", "其他"];

function statusVariant(s: string): React.ComponentProps<typeof Badge>["variant"] {
  if (s === "已完成") return "success";
  if (s === "已取消") return "secondary";
  if (s === "进行中") return "warning";
  return "outline";
}

export default function AdminMaintenancePage() {
  const [roomId, setRoomId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [mType, setMType] = useState<string>("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<MaintenanceRow[]>([]);
  const [rooms, setRooms] = useState<RoomOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const loadRooms = useCallback(async () => {
    try {
      const res = await get<PageData<RoomOpt & { name: string }>>("/room", {
        page: 1,
        pageSize: 200,
      });
      if (res.code === 1 && res.data?.rows) {
        setRooms(
          res.data.rows.map((r) => ({
            id: r.id,
            name: r.name,
            roomNumber: r.roomNumber,
          }))
        );
      }
    } catch {
      setRooms([]);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await get<PageData<MaintenanceRow>>("/maintenance/list", {
        page,
        pageSize: PAGE_SIZE,
        roomId: roomId || undefined,
        status: status || undefined,
        maintenanceType: mType || undefined,
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
  }, [page, roomId, status, mType]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [roomId, status, mType]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  }

  async function batchDelete() {
    if (selected.size === 0) return;
    if (!confirm(`确定删除 ${selected.size} 条维修记录？`)) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await del("/maintenance/batch", { ids: Array.from(selected) });
      if (res.code === 1) {
        setMsg("已批量删除");
        setSelected(new Set());
        load();
      } else setErr(res.msg || "删除失败");
    } catch {
      setErr("删除失败");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(r: MaintenanceRow, next: string) {
    setBusy(true);
    setErr(null);
    try {
      const res = await post("/maintenance/updateStatus", { id: r.id, status: next });
      if (res.code === 1) {
        setMsg("状态已更新");
        load();
      } else setErr(res.msg || "更新失败");
    } catch {
      setErr("更新失败");
    } finally {
      setBusy(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
          维修管理
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          筛选记录、批量删除与状态流转
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
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-medium">筛选</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={selected.size === 0 || busy}
              onClick={batchDelete}
            >
              <Trash2 className="size-4" />
              批量删除 ({selected.size})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="border-t border-[var(--color-divider)] pt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">全部琴房</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} · {r.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
              value={mType}
              onChange={(e) => setMType(e.target.value)}
            >
              <option value="">全部类型</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-y border-[var(--color-divider)] bg-[var(--color-bg-tertiary)]/60 text-[var(--color-text-secondary)]">
                <tr>
                  <th className="w-10 px-2 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-[var(--color-border)]"
                      checked={rows.length > 0 && selected.size === rows.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">琴房</th>
                  <th className="px-4 py-3 font-medium">时间范围</th>
                  <th className="px-4 py-3 font-medium">原因</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <Loader2 className="mx-auto size-6 animate-spin text-[var(--color-primary)]" />
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                    >
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[var(--color-divider)]/80 transition-colors hover:bg-[var(--color-bg-secondary)]/50 last:border-0"
                    >
                      <td className="px-2 py-3.5">
                        <input
                          type="checkbox"
                          className="rounded border-[var(--color-border)]"
                          checked={selected.has(r.id)}
                          onChange={() => toggle(r.id)}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text)]">
                        {r.room?.name ?? "—"}{" "}
                        <span className="text-[var(--color-text-tertiary)]">
                          ({r.room?.roomNumber ?? r.roomId})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-[var(--color-text-secondary)]">
                        {r.startTime && r.endTime
                          ? `${format(new Date(r.startTime), "yyyy-MM-dd HH:mm")} – ${format(
                              new Date(r.endTime),
                              "MM-dd HH:mm"
                            )}`
                          : "—"}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3.5 text-[var(--color-text-secondary)]">
                        {r.reason}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text-secondary)]">
                        {r.maintenanceType}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {r.status === "未开始" ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => updateStatus(r, "进行中")}
                            >
                              开始
                            </Button>
                          ) : null}
                          {r.status === "进行中" ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => updateStatus(r, "已完成")}
                            >
                              完成
                            </Button>
                          ) : null}
                          {r.status !== "已取消" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-[var(--color-text-secondary)]"
                              disabled={busy}
                              onClick={() => updateStatus(r, "已取消")}
                            >
                              取消
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--color-divider)] px-4 py-3 sm:flex-row">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              共 {total} 条 · 第 {page} / {totalPages} 页
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
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
