"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import {
  BarChart3,
  Camera,
  Loader2,
  Lock,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api, { get, put, type ApiResult } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface UserInfoVO {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone?: string | null;
  grade?: string | null;
  major?: string | null;
  avatarUrl?: string | null;
  userType: string;
}

interface ReservationStats {
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  violationCount: number;
  totalPracticeMinutes: number;
}

function avatarSrc(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `/api${url.startsWith("/") ? url : `/${url}`}`;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const [tab, setTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ReservationStats | null>(null);

  const [realName, setRealName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  const [major, setMajor] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [againPassword, setAgainPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await get<UserInfoVO>("/user/getUserInfo");
      if (res.code === 1 && res.data) {
        const u = res.data;
        setRealName(u.realName);
        setEmail(u.email);
        setPhone(u.phone ?? "");
        setGrade(u.grade ?? "");
        setMajor(u.major ?? "");
        setAvatarUrl(u.avatarUrl ?? null);
        updateUser({
          realName: u.realName,
          email: u.email,
          phone: u.phone ?? undefined,
          grade: u.grade ?? undefined,
          major: u.major ?? undefined,
          avatarUrl: u.avatarUrl ?? undefined,
        });
        const st = await get<ReservationStats>("/user/my-stats");
        if (st.code === 1 && st.data) setStats(st.data);
      }
    } catch {
      setErr("加载失败");
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      router.replace("/login?redirect=/admin/profile");
      return;
    }
    load();
  }, [isLoggedIn, isAdmin, router, load]);

  async function saveBasic(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await put("/user/info", {
        id: user.id,
        realName: realName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        grade: grade.trim() || null,
        major: major.trim() || null,
        avatarUrl: avatarUrl || null,
        username: user.username,
        userType: user.userType,
      });
      if (res.code === 1) {
        setMsg("资料已保存");
        updateUser({
          realName: realName.trim(),
          email: email.trim(),
          phone: phone || undefined,
          grade: grade || undefined,
          major: major || undefined,
          avatarUrl: avatarUrl || undefined,
        });
      } else setErr(res.msg || "保存失败");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "网络错误");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await put("/user/password", {
        id: user.id,
        oldPassword,
        newPassword,
        againPassword,
      });
      if (res.code === 1) {
        setMsg("密码已更新");
        setOldPassword("");
        setNewPassword("");
        setAgainPassword("");
      } else setErr(res.msg || "修改失败");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "网络错误");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const raw = await api.post("upload", { body: formData }).json<ApiResult<{ url: string }>>();
      if (raw.code === 1 && raw.data?.url) {
        setAvatarUrl(raw.data.url);
        setMsg("头像已上传，请保存基本信息以生效");
      } else setErr(raw.msg || "上传失败");
    } catch {
      setErr("上传失败");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (!isLoggedIn || !user || !isAdmin) {
    return (
      <div className="py-24 text-center text-sm text-[var(--color-text-secondary)]">
        正在跳转登录…
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--color-text-secondary)]">
        <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const hours = stats ? (stats.totalPracticeMinutes / 60).toFixed(1) : "—";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] text-2xl font-semibold text-[var(--color-primary)] shadow-[var(--shadow-sm)]">
              {avatarSrc(avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc(avatarUrl)!}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-10 opacity-80" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-white text-[var(--color-primary)] shadow-[var(--shadow-sm)]">
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </label>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
              管理后台 · 个人中心
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              {realName || user.username}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {user.username} · {user.userType === "super_admin" ? "超级管理员" : "管理员"}
            </p>
          </div>
        </div>
      </motion.div>

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="mb-6 flex flex-wrap gap-2 border-b border-[var(--color-border-light)] pb-1">
          {[
            { id: "basic", label: "基本信息", icon: UserRound },
            { id: "password", label: "修改密码", icon: Lock },
            { id: "stats", label: "预约统计", icon: BarChart3 },
          ].map((t) => (
            <Tabs.Trigger
              key={t.id}
              value={t.id}
              className={cn(
                "flex items-center gap-2 rounded-t-[var(--radius-md)] px-4 py-2.5 text-sm font-medium transition-all",
                "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
                "data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] data-[state=active]:text-[var(--color-primary)]"
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {msg ? (
          <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success)]">
            {msg}
          </p>
        ) : null}
        {err ? (
          <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {err}
          </p>
        ) : null}

        <Tabs.Content value="basic" asChild>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>联系方式与展示信息</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveBasic} className="max-w-lg space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">真实姓名</label>
                    <Input value={realName} onChange={(e) => setRealName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">邮箱</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">手机</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="选填" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">年级</label>
                      <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="选填" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">专业</label>
                      <Input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="选填" />
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    头像上传后请点击保存，以同步到账户。
                  </p>
                  <Button type="submit" className="h-11" disabled={saving}>
                    {saving ? "保存中…" : "保存更改"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Tabs.Content>

        <Tabs.Content value="password" asChild>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle>修改密码</CardTitle>
                <CardDescription>定期更换密码以保护账号安全</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={savePassword} className="max-w-lg space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">当前密码</label>
                    <Input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">新密码</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">确认新密码</label>
                    <Input
                      type="password"
                      value={againPassword}
                      onChange={(e) => setAgainPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="h-11" disabled={saving}>
                    {saving ? "提交中…" : "更新密码"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Tabs.Content>

        <Tabs.Content value="stats" asChild>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-[var(--color-text-secondary)]">
                  累计练习时长
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                  {hours}
                  <span className="ml-1 text-base font-normal text-[var(--color-text-secondary)]">小时</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-[var(--color-text-secondary)]">
                  预约总数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                  {stats?.totalReservations ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-[var(--color-text-secondary)]">
                  已完成
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                  {stats?.completedReservations ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-[var(--color-text-secondary)]">
                  已取消
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                  {stats?.cancelledReservations ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-[var(--color-text-secondary)]">
                  违约次数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                  {stats?.violationCount ?? "—"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
