"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { get, type PageData } from "@/lib/api";

interface LogRow {
  id: number;
  username: string;
  operationModule?: string | null;
  operationType?: string | null;
  operationDesc?: string | null;
  requestIp?: string | null;
  status?: number | null;
  createdAt: string;
}

const PAGE_SIZE = 10;

export default function AdminLogsPage() {
  const [username, setUsername] = useState("");
  const [module, setModule] = useState("");
  const [opType, setOpType] = useState("");
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const statusParam =
        status === "" ? undefined : Number(status);
      const res = await get<PageData<LogRow>>("/operationLogs/page", {
        page,
        pageSize: PAGE_SIZE,
        username: username.trim() || undefined,
        operationModule: module.trim() || undefined,
        operationType: opType.trim() || undefined,
        status: statusParam,
        startTime: startDate ? `${startDate} 00:00:00` : undefined,
        endTime: endDate ? `${endDate} 23:59:59` : undefined,
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
  }, [page, username, module, opType, status, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [username, module, opType, status, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
          操作日志
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          审计后台关键操作
        </p>
      </motion.div>

      {err ? (
        <p className="rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {err}
        </p>
      ) : null}

      <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">筛选</CardTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="用户名"
              className="h-10"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder="模块"
              className="h-10"
              value={module}
              onChange={(e) => setModule(e.target.value)}
            />
            <Input
              placeholder="类型"
              className="h-10"
              value={opType}
              onChange={(e) => setOpType(e.target.value)}
            />
            <select
              className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">全部结果</option>
              <option value="1">成功</option>
              <option value="0">失败</option>
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-y border-[var(--color-divider)] bg-[var(--color-bg-tertiary)]/60 text-[var(--color-text-secondary)]">
                <tr>
                  <th className="px-4 py-3 font-medium">操作人</th>
                  <th className="px-4 py-3 font-medium">模块</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">描述</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">时间</th>
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
                      <td className="px-4 py-3.5 font-medium text-[var(--color-text)]">
                        {r.username}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text-secondary)]">
                        {r.operationModule ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text-secondary)]">
                        {r.operationType ?? "—"}
                      </td>
                      <td className="max-w-[280px] truncate px-4 py-3.5 text-[var(--color-text-secondary)]">
                        {r.operationDesc ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[var(--color-text-tertiary)]">
                        {r.requestIp ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        {r.status === 1 ? (
                          <Badge variant="success">成功</Badge>
                        ) : r.status === 0 ? (
                          <Badge variant="danger">失败</Badge>
                        ) : (
                          <span className="text-[var(--color-text-tertiary)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-[var(--color-text-secondary)]">
                        {r.createdAt
                          ? format(new Date(r.createdAt), "yyyy-MM-dd HH:mm:ss")
                          : "—"}
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
