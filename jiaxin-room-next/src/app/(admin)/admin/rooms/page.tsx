"use client";

import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { del, get, post, put, type PageData } from "@/lib/api";
import { cn } from "@/lib/utils";

interface RoomType {
  id: number;
  typeName: string;
}

interface RoomRow {
  id: number;
  roomNumber: string;
  name: string;
  floor?: number | null;
  capacity: number;
  roomTypeId?: number | null;
  status: number;
  description?: string | null;
  roomType?: { typeName?: string } | null;
}

const PAGE_SIZE = 10;

function roomStatusLabel(s: number) {
  return s === 1 ? "可用" : "停用";
}

function roomStatusVariant(s: number): React.ComponentProps<typeof Badge>["variant"] {
  return s === 1 ? "success" : "secondary";
}

export default function AdminRoomsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [types, setTypes] = useState<RoomType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoomRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    roomNumber: "",
    name: "",
    floor: "" as string,
    capacity: "1",
    roomTypeId: "" as string,
    status: "1",
    description: "",
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadTypes = useCallback(async () => {
    try {
      const res = await get<RoomType[]>("/classType/all");
      if (res.code === 1 && Array.isArray(res.data)) setTypes(res.data);
    } catch {
      setTypes([]);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await get<PageData<RoomRow>>("/room", {
        page,
        pageSize: PAGE_SIZE,
        roomNumberOrName: q.trim() || undefined,
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
  }, [page, q]);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({
      roomNumber: "",
      name: "",
      floor: "",
      capacity: "1",
      roomTypeId: "",
      status: "1",
      description: "",
    });
    setDialogOpen(true);
  }

  function openEdit(r: RoomRow) {
    setEditing(r);
    setForm({
      roomNumber: r.roomNumber,
      name: r.name,
      floor: r.floor != null ? String(r.floor) : "",
      capacity: String(r.capacity ?? 1),
      roomTypeId: r.roomTypeId != null ? String(r.roomTypeId) : "",
      status: String(r.status),
      description: r.description ?? "",
    });
    setDialogOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    const floorNum = form.floor.trim() === "" ? undefined : Number(form.floor);
    const cap = Math.max(1, Number(form.capacity) || 1);
    const rt =
      form.roomTypeId.trim() === "" ? undefined : Number(form.roomTypeId);
    const body: Record<string, unknown> = {
      roomNumber: form.roomNumber.trim(),
      name: form.name.trim(),
      floor: floorNum,
      capacity: cap,
      roomTypeId: rt,
      status: Number(form.status) as 0 | 1,
      description: form.description.trim() || null,
    };
    try {
      if (editing) {
        body.id = editing.id;
        const res = await put("/room", body);
        if (res.code === 1) {
          setMsg("已保存");
          setDialogOpen(false);
          load();
        } else setErr(res.msg || "保存失败");
      } else {
        const res = await post<RoomRow>("/room", body);
        if (res.code === 1) {
          setMsg("已创建");
          setDialogOpen(false);
          setPage(1);
          load();
        } else setErr(res.msg || "创建失败");
      }
    } catch {
      setErr("请求失败");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(r: RoomRow) {
    if (!confirm(`确定删除琴房「${r.name}」？`)) return;
    setErr(null);
    try {
      const res = await del(`/room/${r.id}`);
      if (res.code === 1) {
        setMsg("已删除");
        load();
      } else setErr(res.msg || "删除失败");
    } catch {
      setErr("删除失败");
    }
  }

  useEffect(() => {
    setPage(1);
  }, [q]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            琴房管理
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            维护编号、类型与可用状态
          </p>
        </div>
        <Button
          type="button"
          className="shadow-[var(--shadow-sm)]"
          onClick={openCreate}
        >
          <Plus className="size-4" />
          新增琴房
        </Button>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-medium">琴房列表</CardTitle>
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <Input
                className="h-10 pl-9"
                placeholder="搜索编号或名称…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-y border-[var(--color-divider)] bg-[var(--color-bg-tertiary)]/60 text-[var(--color-text-secondary)]">
                <tr>
                  <th className="px-4 py-3 font-medium">编号</th>
                  <th className="px-4 py-3 font-medium">名称</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">楼层</th>
                  <th className="px-4 py-3 font-medium">容量</th>
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
                      <td className="px-4 py-3.5 font-medium tabular-nums text-[var(--color-text)]">
                        {r.roomNumber}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text)]">
                        {r.name}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text-secondary)]">
                        {r.roomType?.typeName ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-[var(--color-text-secondary)]">
                        {r.floor ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-[var(--color-text-secondary)]">
                        {r.capacity}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={roomStatusVariant(r.status)}>
                          {roomStatusLabel(r.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[var(--color-primary)]"
                            onClick={() => openEdit(r)}
                          >
                            <Pencil className="size-3.5" />
                            编辑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[var(--color-danger)]"
                            onClick={() => onDelete(r)}
                          >
                            <Trash2 className="size-3.5" />
                            删除
                          </Button>
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

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[1px]" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-[51] w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2",
              "rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-lg)]",
              "focus:outline-none"
            )}
          >
            <Dialog.Title className="text-lg font-semibold text-[var(--color-text)]">
              {editing ? "编辑琴房" : "新增琴房"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-[var(--color-text-secondary)]">
              填写基础信息，保存后立即生效
            </Dialog.Description>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">编号</label>
                <Input
                  required
                  value={form.roomNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, roomNumber: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">名称</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">楼层</label>
                  <Input
                    inputMode="numeric"
                    placeholder="选填"
                    value={form.floor}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, floor: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">容量</label>
                  <Input
                    required
                    inputMode="numeric"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, capacity: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">类型</label>
                <select
                  className="flex h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  value={form.roomTypeId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, roomTypeId: e.target.value }))
                  }
                >
                  <option value="">未指定</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.typeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">状态</label>
                <select
                  className="flex h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="1">可用</option>
                  <option value="0">停用</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">备注</label>
                <textarea
                  className="min-h-[80px] w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-quaternary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  placeholder="选填"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "保存中…" : "保存"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
