"use client";

import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, Search, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { del, get, post, put, type PageData } from "@/lib/api";
import { cn } from "@/lib/utils";

interface UserRow {
  id: number;
  username: string;
  realName: string;
  studentId?: string | null;
  email: string;
  phone?: string | null;
  userType: string;
  status: number;
  violationCount: number;
}

const PAGE_SIZE = 10;

const USER_TYPES = [
  { value: "", label: "全部类型" },
  { value: "student", label: "学生" },
  { value: "teacher", label: "教师" },
  { value: "admin", label: "管理员" },
];

function typeLabel(t: string) {
  const m: Record<string, string> = {
    student: "学生",
    teacher: "教师",
    admin: "管理员",
    super_admin: "超级管理员",
  };
  return m[t] ?? t;
}

function typeVariant(t: string): React.ComponentProps<typeof Badge>["variant"] {
  if (t === "teacher") return "default";
  if (t === "admin" || t === "super_admin") return "warning";
  return "secondary";
}

export default function AdminUsersPage() {
  const [userType, setUserType] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [addForm, setAddForm] = useState({
    username: "",
    password: "",
    realName: "",
    email: "",
    studentId: "",
    userType: "student",
  });

  const [editForm, setEditForm] = useState({
    realName: "",
    email: "",
    phone: "",
    studentId: "",
    userType: "student",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const statusParam =
        statusFilter === "" ? undefined : Number(statusFilter);
      const res = await get<PageData<UserRow>>("/user/list", {
        page,
        pageSize: PAGE_SIZE,
        userType: userType || undefined,
        status: statusParam,
        usernameOrRealNameOrStudentId: search.trim() || undefined,
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
  }, [page, userType, statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [userType, statusFilter, search]);

  function openEdit(u: UserRow) {
    setEditing(u);
    setEditForm({
      realName: u.realName,
      email: u.email,
      phone: u.phone ?? "",
      studentId: u.studentId ?? "",
      userType: u.userType,
    });
    setEditOpen(true);
  }

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const res = await post("/user/add", {
        username: addForm.username.trim(),
        password: addForm.password,
        realName: addForm.realName.trim(),
        email: addForm.email.trim(),
        studentId: addForm.studentId.trim() || undefined,
        userType: addForm.userType,
      });
      if (res.code === 1) {
        setMsg("用户已创建");
        setAddOpen(false);
        setAddForm({
          username: "",
          password: "",
          realName: "",
          email: "",
          studentId: "",
          userType: "student",
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
      const res = await put("/user/info", {
        id: editing.id,
        username: editing.username,
        realName: editForm.realName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || null,
        studentId: editForm.studentId.trim() || null,
        userType: editForm.userType,
      });
      if (res.code === 1) {
        setMsg("资料已更新");
        setEditOpen(false);
        load();
      } else setErr(res.msg || "保存失败");
    } catch {
      setErr("保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function setUserStatus(u: UserRow, next: number) {
    setErr(null);
    try {
      const res = await post("/user/status", { userId: u.id, status: next });
      if (res.code === 1) {
        setMsg(next === 1 ? "已启用" : "已禁用");
        load();
      } else setErr(res.msg || "操作失败");
    } catch {
      setErr("操作失败");
    }
  }

  async function removeUser(u: UserRow) {
    if (!confirm(`确定删除用户「${u.username}」？此操作不可恢复。`)) return;
    setErr(null);
    try {
      const res = await del("/user", { ids: [u.id] });
      if (res.code === 1) {
        setMsg("已删除");
        load();
      } else setErr(res.msg || "删除失败");
    } catch {
      setErr("删除失败");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            用户管理
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            检索、创建与账号状态维护
          </p>
        </div>
        <Button type="button" className="shadow-[var(--shadow-sm)]" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          新增用户
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
          <CardTitle className="text-base font-medium">筛选</CardTitle>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <select
              className="h-10 min-w-[8rem] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              {USER_TYPES.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="h-10 min-w-[8rem] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="1">正常</option>
              <option value="0">禁用</option>
            </select>
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <Input
                className="h-10 pl-9"
                placeholder="用户名 / 姓名 / 学号"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="border-y border-[var(--color-divider)] bg-[var(--color-bg-tertiary)]/60 text-[var(--color-text-secondary)]">
                <tr>
                  <th className="px-4 py-3 font-medium">用户名</th>
                  <th className="px-4 py-3 font-medium">姓名</th>
                  <th className="px-4 py-3 font-medium">学号</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">违约次数</th>
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
                  rows.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-[var(--color-divider)]/80 transition-colors hover:bg-[var(--color-bg-secondary)]/50 last:border-0"
                    >
                      <td className="px-4 py-3.5 font-medium text-[var(--color-text)]">
                        {u.username}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text)]">{u.realName}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[var(--color-text-secondary)]">
                        {u.studentId ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={typeVariant(u.userType)}>
                          {typeLabel(u.userType)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-medium",
                            u.status === 1
                              ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                              : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                          )}
                        >
                          {u.status === 1 ? "正常" : "禁用"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-[var(--color-text-secondary)]">
                        {u.violationCount}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[var(--color-primary)]"
                            onClick={() => openEdit(u)}
                          >
                            <Pencil className="size-3.5" />
                            编辑
                          </Button>
                          {u.status === 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setUserStatus(u, 0)}
                            >
                              <ShieldOff className="size-3.5" />
                              禁用
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setUserStatus(u, 1)}
                            >
                              <ShieldCheck className="size-3.5" />
                              启用
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[var(--color-danger)]"
                            onClick={() => removeUser(u)}
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
            <Dialog.Title className="text-lg font-semibold">新增用户</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-[var(--color-text-secondary)]">
              创建后可使用用户名与密码登录
            </Dialog.Description>
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
                <label className="text-sm font-medium">初始密码</label>
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
                <label className="text-sm font-medium">学号</label>
                <Input
                  value={addForm.studentId}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, studentId: e.target.value }))
                  }
                  placeholder="选填"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">类型</label>
                <select
                  className="flex h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
                  value={addForm.userType}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, userType: e.target.value }))
                  }
                >
                  <option value="student">学生</option>
                  <option value="teacher">教师</option>
                </select>
              </div>
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
            <Dialog.Title className="text-lg font-semibold">编辑用户</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {editing ? `ID ${editing.id} · ${editing.username}` : ""}
            </Dialog.Description>
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
                  placeholder="选填"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">学号</label>
                <Input
                  value={editForm.studentId}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, studentId: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">类型</label>
                <select
                  className="flex h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
                  value={editForm.userType}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, userType: e.target.value }))
                  }
                >
                  <option value="student">学生</option>
                  <option value="teacher">教师</option>
                  <option value="admin">管理员</option>
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
