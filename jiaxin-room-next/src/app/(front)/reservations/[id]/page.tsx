"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock,
  LogIn,
  LogOut,
  MapPin,
  XCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { get, post, put } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ReservationDetail {
  id: number;
  userId: number;
  roomId: number;
  title: string;
  purpose: string;
  startTime: string;
  endTime: string;
  attendees: number;
  status: string;
  signStartTime?: string | null;
  signEndTime?: string | null;
  remarks?: string | null;
  createdAt?: string;
  room?: { id: number; name: string; roomNumber: string; floor?: number | null } | null;
}

function statusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge variant="success">已批准</Badge>;
    case "completed":
      return <Badge variant="secondary">已完成</Badge>;
    case "cancelled":
      return <Badge variant="danger">已取消</Badge>;
    case "occupied":
      return <Badge variant="warning">使用中</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");

  const [data, setData] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<ReservationDetail>(`/reservations/${id}`);
      if (res.code === 1 && res.data) setData(res.data);
      else setData(null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel() {
    if (!data || data.status !== "approved") return;
    if (!confirm("确定取消该预约？")) return;
    setBusy("cancel");
    try {
      const res = await put(`/reservations/${data.id}/cancel`, { remarks: "用户取消" });
      if (res.code === 1) await load();
    } finally {
      setBusy(null);
    }
  }

  async function handleSignIn() {
    if (!data) return;
    setBusy("in");
    try {
      const res = await post(`/reservations/${data.id}/sign-in`);
      if (res.code === 1) await load();
    } finally {
      setBusy(null);
    }
  }

  async function handleSignOut() {
    if (!data) return;
    setBusy("out");
    try {
      const res = await post(`/reservations/${data.id}/sign-out`);
      if (res.code === 1) await load();
    } finally {
      setBusy(null);
    }
  }

  function formatTs(s?: string | null) {
    if (!s) return "—";
    try {
      return format(parseISO(s), "yyyy-MM-dd HH:mm:ss");
    } catch {
      return "—";
    }
  }

  if (loading) {
    return (
      <div className="container-app py-24 text-center text-sm text-[var(--color-text-secondary)]">
        加载中…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-app py-24 text-center">
        <p className="text-[var(--color-text-secondary)]">未找到该预约</p>
        <Button asChild className="mt-4">
          <Link href="/reservations/my">返回我的预约</Link>
        </Button>
      </div>
    );
  }

  const rangeLabel = (() => {
    try {
      const a = parseISO(data.startTime);
      const b = parseISO(data.endTime);
      return `${format(a, "yyyy-MM-dd HH:mm")} – ${format(b, "HH:mm")}`;
    } catch {
      return "—";
    }
  })();

  const timeline = [
    {
      key: "created",
      label: "预约创建",
      time: data.createdAt ? formatTs(data.createdAt) : "—",
      done: true,
      icon: Calendar,
    },
    {
      key: "approved",
      label: "预约生效",
      time: data.status === "cancelled" ? "已取消" : "已批准",
      done: data.status !== "cancelled",
      icon: CheckCircle2,
    },
    {
      key: "signin",
      label: "签到",
      time: formatTs(data.signStartTime),
      done: !!data.signStartTime,
      icon: LogIn,
    },
    {
      key: "signout",
      label: "签退",
      time: formatTs(data.signEndTime),
      done: !!data.signEndTime,
      icon: LogOut,
    },
    {
      key: "end",
      label: "结束",
      time: data.status === "completed" ? "已完成" : data.status === "cancelled" ? "已取消" : "待完成",
      done: data.status === "completed" || data.status === "cancelled",
      icon: data.status === "cancelled" ? XCircle : CircleDot,
    },
  ];

  return (
    <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] pb-20 pt-8">
      <div className="container-app max-w-3xl">
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          <ArrowLeft className="size-4" />
          返回
        </motion.button>

        <nav className="mb-8 flex flex-wrap items-center gap-1 text-sm text-[var(--color-text-secondary)]">
          <Link href="/" className="hover:text-[var(--color-primary)]">
            首页
          </Link>
          <ChevronRight className="size-4" />
          <Link href="/reservations/my" className="hover:text-[var(--color-primary)]">
            我的预约
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-[var(--color-text)]">预约详情</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {statusBadge(data.status)}
                <span className="text-sm text-[var(--color-text-tertiary)]">#{data.id}</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                {data.title}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Clock className="size-4 shrink-0" />
                {rangeLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.status === "approved" ? (
                <>
                  <Button
                    variant="destructive"
                    disabled={busy !== null}
                    onClick={handleCancel}
                  >
                    {busy === "cancel" ? "处理中…" : "取消预约"}
                  </Button>
                  <Button variant="outline" disabled={busy !== null} onClick={handleSignIn}>
                    <LogIn className="size-4" />
                    {busy === "in" ? "签到中…" : "签到"}
                  </Button>
                  <Button disabled={busy !== null} onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    {busy === "out" ? "签退中…" : "签退"}
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
            <CardHeader>
              <CardTitle className="text-lg">预约信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] p-4">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                      琴房
                    </p>
                    <p className="font-medium text-[var(--color-text)]">
                      {data.room?.name ?? `房间 #${data.roomId}`}
                    </p>
                    {data.room?.roomNumber ? (
                      <p className="text-[var(--color-text-secondary)]">{data.room.roomNumber}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] p-4">
                  <Calendar className="mt-0.5 size-5 shrink-0 text-[var(--color-accent-purple)]" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                      时段
                    </p>
                    <p className="font-medium text-[var(--color-text)]">{rangeLabel}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-[var(--color-text-tertiary)]">用途</p>
                <p className="leading-relaxed text-[var(--color-text)]">{data.purpose}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-[var(--color-text-tertiary)]">人数</p>
                  <p className="text-[var(--color-text)]">{data.attendees} 人</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-[var(--color-text-tertiary)]">备注</p>
                  <p className="text-[var(--color-text)]">{data.remarks?.trim() || "—"}</p>
                </div>
              </div>

              <div className="grid gap-3 border-t border-[var(--color-border-light)] pt-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-[var(--color-text-tertiary)]">签到时间</p>
                  <p className="font-mono text-sm text-[var(--color-text)]">
                    {formatTs(data.signStartTime)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-[var(--color-text-tertiary)]">签退时间</p>
                  <p className="font-mono text-sm text-[var(--color-text)]">
                    {formatTs(data.signEndTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
            <CardHeader>
              <CardTitle className="text-lg">状态时间线</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-0">
                {timeline.map((step, i) => (
                  <li key={step.key} className="flex gap-4 pb-8 last:pb-0">
                    <div className="relative flex flex-col items-center">
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-[var(--radius-md)] border",
                          step.done
                            ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                            : "border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] text-[var(--color-text-quaternary)]"
                        )}
                      >
                        <step.icon className="size-5" />
                      </span>
                      {i < timeline.length - 1 ? (
                        <span
                          className="absolute top-10 h-[calc(100%-0.5rem)] w-px bg-[var(--color-border-light)]"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="font-medium text-[var(--color-text)]">{step.label}</p>
                      <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{step.time}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
