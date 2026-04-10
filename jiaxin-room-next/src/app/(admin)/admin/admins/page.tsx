"use client";

import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { del, get, post, put, type PageData } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface AdminRow {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone?: string | null;
  userType: string;
  status: number;
}

const PAGE_SIZE = 10;

function typeLabel(t: string) {
  return t === "super_admin" ? "超级管理员" : "管理员";
}

export default function AdminAdminsPage() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [addForm, setAddForm] = useState({
    username: "",
    password: "",
    realName: "",
    email: "",
    phone: "",
  });

  const [editForm, setEditForm] = useState({
    realName: "",
    email: "",
    phone: "",
    password: "",
    userType: "admin" as "admin" | "super_admin",
  });

  const load = useCallback(async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await get<PageData<AdminRow>>("/admins/list", {
        page,
        pageSize: PAGE_SIZE,
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
  }, [page, isSuperAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit(a: AdminRow) {
    setEditing(a);
    setEditForm({
      realName: a.realName,
      email: a.email,
      phone: a.phone ?? "",
      password: "",
      userType: a.userType === "super_admin" ? "super_admin" : "admin",
    });
    setEditOpen(true);
  }

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const res = await post("/admins", {
        username: addForm.username.trim(),
        password: addForm.password,
        realName: addForm.realName.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim() || null,
      });
      if (res.code === 1) {
        setMsg("管理员已创建");
        setAddOpen(false);
        setAddForm({
          username: "",
          password: "",
          realName: "",
          email: "",
          phone: "",
        });
        load();
      } else setErr(res.msg || "创建失败");
    } catch {
      setErr("创建失败");
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setErr(null);
    try {
      const body: Record<string, unknown> = {
        id: editing.id,
        username: editing.username,
        realName: editForm.realName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || null,
        userType: editForm.userType,
      };
      if (editForm.password.trim()) {
        body.password = editForm.password.trim();
      }
      const res = await put("/admins", body);
      if (res.code === 1) {
        setMsg("已更新");
        setEditOpen(false);
        load();
      } else setErr(res.msg || "保存失败");
    } catch {
      setErr("保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(a: AdminRow) {
    const next = a.status === 1 ? 0 : 1;
    setErr(null);
    try {
      const res = await post(`/admins/status/${next}`, { id: a.id });
      if (res.code === 1) {
        setMsg("状态已更新");
        load();
      } else setErr(res.msg || "操作失败");
    } catch {
      setErr("操作失败");
    }
  }

  async function remove(a: AdminRow) {
    if (!confirm(`确定删除管理员「${a.username}」？`)) return;
    setErr(null);
    try {
      const res = await del(`/admins/${a.id}`);
      if (res.code === 1) {
        setMsg("已删除");
        load();
      } else setErr(res.msg || "删除失败");
    } catch {
      setErr("删除失败");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!isSuperAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg"
      >
        <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>管理员管理</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--color-text-secondary)]">
            仅超级管理员可访问此页面。如需权限，请联系系统超级管理员。
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            管理员管理
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            新增、编辑与停用后台账号
          </p>
        </div>
        <Button type="button" className="shadow-[var(--shadow-sm)]" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          新增管理员
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
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-y border-[var(--color-divider)] bg-[var(--color-bg-tertiary)]/60 text-[var(--color-text-secondary)]">
                <tr>
                  <th className="px-4 py-3 font-medium">用户名</th>
                  <th className="px-4 py-3 font-medium">姓名</th>
                  <th className="px-4 py-3 font-medium">邮箱</th>
                  <th className="px-4 py-3 font-medium">类型</th>
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
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-[var(--color-text-tertiary)]"
                    >
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  rows.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-[var(--color-divider)]/80 transition-colors hover:bg-[var(--color-bg-secondary)]/50 last:border-0"
                    >
                      <td className="px-4 py-3.5 font-medium text-[var(--color-text)]">
                        {a.username}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text)]">{a.realName}</td>
                      <td className="px-4 py-3.5 text-[var(--color-text-secondary)]">{a.email}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={a.userType === "super_admin" ? "warning" : "secondary"}>
                          {typeLabel(a.userType)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            a.status === 1
                              ? "text-[var(--color-success)]"
                              : "text-[var(--color-text-tertiary)]"
                          )}
                        >
                          {a.status === 1 ? "正常" : "停用"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(a)}
                          >
                            <Pencil className="size-3.5" />
                            编辑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(a)}
                          >
                            <Power className="size-3.5" />
                            {a.status === 1 ? "停用" : "启用"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[var(--color-danger)]"
                            onClick={() => remove(a)}
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

      <Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[1px]" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-[51] w-[min(100%-2rem,26rem)] -translate-x-1/2 -translate-y-1/2",
              "max-h-[min(90vh,40rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-lg)]"
            )}
          >
            <Dialog.Title className="text-lg font-semibold">新增管理员</Dialog.Title>
            <form onSubmit={submitAdd} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">用户名</label>
                <Input
                  required
                  value={addForm.username}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, username: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">密码</label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={addForm.password}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">姓名</label>
                <Input
                  required
                  value={addForm.realName}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, realName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">邮箱</label>
                <Input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">手机</label>
                <Input
                  value={addForm.phone}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="选填"
                />
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                新建账号默认为管理员；可在编辑中调整为超级管理员。
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "提交中…" : "创建"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[1px]" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-[51] w-[min(100%-2rem,26rem)] -translate-x-1/2 -translate-y-1/2",
              "max-h-[min(90vh,40rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-lg)]"
            )}
          >
            <Dialog.Title className="text-lg font-semibold">编辑管理员</Dialog.Title>
            <form onSubmit={submitEdit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">姓名</label>
                <Input
                  required
                  value={editForm.realName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, realName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">邮箱</label>
                <Input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">手机</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">新密码</label>
                <Input
                  type="password"
                  placeholder="不修改请留空"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">类型</label>
                <select
                  className="flex h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
                  value={editForm.userType}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      userType: e.target.value as "admin" | "super_admin",
                    }))
                  }
                >
                  <option value="admin">管理员</option>
                  <option value="super_admin">超级管理员</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
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
