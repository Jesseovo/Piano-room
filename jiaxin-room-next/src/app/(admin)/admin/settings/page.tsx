"use client";

import { useCallback, useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { get, post } from "@/lib/api";
import { cn } from "@/lib/utils";

interface BasicSetting {
  systemName: string;
  description: string;
  copyright: string;
  slotStartHour: number;
  slotEndHour: number;
  slotDurationMinutes: number;
}

interface ReservationSetting {
  maxAdvanceDays: number;
  signInGrace: number;
  maxNoShow: number;
}

interface SecuritySetting {
  tokenExpireHours: number;
  minPasswordLength: number;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [basic, setBasic] = useState<BasicSetting>({
    systemName: "",
    description: "",
    copyright: "",
    slotStartHour: 8,
    slotEndHour: 22,
    slotDurationMinutes: 60,
  });

  const [reservation, setReservation] = useState<ReservationSetting>({
    maxAdvanceDays: 7,
    signInGrace: 15,
    maxNoShow: 3,
  });

  const [security, setSecurity] = useState<SecuritySetting>({
    tokenExpireHours: 24,
    minPasswordLength: 6,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [b, r, s] = await Promise.all([
        get<BasicSetting>("/system/settings/basic"),
        get<ReservationSetting>("/system/settings/reservation"),
        get<SecuritySetting>("/system/settings/security"),
      ]);
      if (b.code === 1 && b.data) setBasic((prev) => ({ ...prev, ...b.data }));
      if (r.code === 1 && r.data) setReservation((prev) => ({ ...prev, ...r.data }));
      if (s.code === 1 && s.data) setSecurity((prev) => ({ ...prev, ...s.data }));
    } catch {
      setErr("加载设置失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveBasic(e: React.FormEvent) {
    e.preventDefault();
    setSaving("basic");
    setMsg(null);
    setErr(null);
    try {
      const res = await post("/system/settings/basic", basic);
      if (res.code === 1) setMsg("基础设置已保存");
      else setErr(res.msg || "保存失败");
    } catch {
      setErr("保存失败");
    } finally {
      setSaving(null);
    }
  }

  async function saveReservation(e: React.FormEvent) {
    e.preventDefault();
    setSaving("reservation");
    setMsg(null);
    setErr(null);
    try {
      const res = await post("/system/settings/reservation", reservation);
      if (res.code === 1) setMsg("预约设置已保存");
      else setErr(res.msg || "保存失败");
    } catch {
      setErr("保存失败");
    } finally {
      setSaving(null);
    }
  }

  async function saveSecurity(e: React.FormEvent) {
    e.preventDefault();
    setSaving("security");
    setMsg(null);
    setErr(null);
    try {
      const res = await post("/system/settings/security", security);
      if (res.code === 1) setMsg("安全设置已保存");
      else setErr(res.msg || "保存失败");
    } catch {
      setErr("保存失败");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
          系统设置
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          分模块保存，互不影响
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

      <Tabs.Root defaultValue="basic" className="space-y-6">
        <Tabs.List className="flex flex-wrap gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-1 shadow-[var(--shadow-sm)]">
          {[
            { id: "basic", label: "基础设置" },
            { id: "reservation", label: "预约设置" },
            { id: "security", label: "安全设置" },
          ].map((t) => (
            <Tabs.Trigger
              key={t.id}
              value={t.id}
              className={cn(
                "rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors",
                "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
                "data-[state=active]:bg-[var(--color-primary-light)] data-[state=active]:text-[var(--color-primary)]"
              )}
            >
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="basic">
          <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>基础设置</CardTitle>
              <CardDescription>系统名称、版权与开放时段</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveBasic} className="max-w-xl space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">系统名称</label>
                  <Input
                    value={basic.systemName}
                    onChange={(e) =>
                      setBasic((b) => ({ ...b, systemName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">简介</label>
                  <textarea
                    className="min-h-[88px] w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
                    value={basic.description}
                    onChange={(e) =>
                      setBasic((b) => ({ ...b, description: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">版权信息</label>
                  <Input
                    value={basic.copyright}
                    onChange={(e) =>
                      setBasic((b) => ({ ...b, copyright: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">开始小时</label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={basic.slotStartHour}
                      onChange={(e) =>
                        setBasic((b) => ({
                          ...b,
                          slotStartHour: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">结束小时</label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={basic.slotEndHour}
                      onChange={(e) =>
                        setBasic((b) => ({
                          ...b,
                          slotEndHour: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">时段时长（分钟）</label>
                    <Input
                      type="number"
                      min={15}
                      step={5}
                      value={basic.slotDurationMinutes}
                      onChange={(e) =>
                        setBasic((b) => ({
                          ...b,
                          slotDurationMinutes: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
                <Button type="submit" disabled={saving === "basic"}>
                  {saving === "basic" ? "保存中…" : "保存基础设置"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="reservation">
          <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>预约设置</CardTitle>
              <CardDescription>提前预约、签到宽限与爽约规则</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveReservation} className="max-w-xl space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">最长提前预约（天）</label>
                  <Input
                    type="number"
                    min={1}
                    value={reservation.maxAdvanceDays}
                    onChange={(e) =>
                      setReservation((r) => ({
                        ...r,
                        maxAdvanceDays: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">签到宽限（分钟）</label>
                  <Input
                    type="number"
                    min={0}
                    value={reservation.signInGrace}
                    onChange={(e) =>
                      setReservation((r) => ({
                        ...r,
                        signInGrace: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">最大爽约次数</label>
                  <Input
                    type="number"
                    min={0}
                    value={reservation.maxNoShow}
                    onChange={(e) =>
                      setReservation((r) => ({
                        ...r,
                        maxNoShow: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <Button type="submit" disabled={saving === "reservation"}>
                  {saving === "reservation" ? "保存中…" : "保存预约设置"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="security">
          <Card className="border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>令牌与密码策略</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveSecurity} className="max-w-xl space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Token 有效期（小时）</label>
                  <Input
                    type="number"
                    min={1}
                    value={security.tokenExpireHours}
                    onChange={(e) =>
                      setSecurity((s) => ({
                        ...s,
                        tokenExpireHours: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">最小密码长度</label>
                  <Input
                    type="number"
                    min={6}
                    value={security.minPasswordLength}
                    onChange={(e) =>
                      setSecurity((s) => ({
                        ...s,
                        minPasswordLength: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <Button type="submit" disabled={saving === "security"}>
                  {saving === "security" ? "保存中…" : "保存安全设置"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
