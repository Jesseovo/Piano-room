"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Info, MapPin, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { get, post } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface RoomType {
  id: number;
  typeName: string;
}

interface RoomDetail {
  id: number;
  roomNumber: string;
  name: string;
  floor?: number | null;
  capacity: number;
  status: number;
  description?: string | null;
  roomType?: RoomType | null;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  conflictReason?: string;
}

export default function ReservationCreatePage() {
  const params = useParams();
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const roomIdParam = String(params.roomId ?? "");

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selected, setSelected] = useState<TimeSlot | null>(null);
  const [attendees, setAttendees] = useState(1);
  const [remarks, setRemarks] = useState("");
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoom = useCallback(async () => {
    setLoadingRoom(true);
    try {
      const res = await get<RoomDetail>(`/room/${roomIdParam}`);
      if (res.code === 1 && res.data) setRoom(res.data);
      else setRoom(null);
    } catch {
      setRoom(null);
    } finally {
      setLoadingRoom(false);
    }
  }, [roomIdParam]);

  const loadSlots = useCallback(async () => {
    if (!roomIdParam) return;
    setLoadingSlots(true);
    try {
      const res = await get<TimeSlot[]>("/reservations/availability", {
        roomId: roomIdParam,
        date,
      });
      if (res.code === 1 && Array.isArray(res.data)) setSlots(res.data);
      else setSlots([]);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [roomIdParam, date]);

  useEffect(() => {
    if (!isLoggedIn && typeof window !== "undefined") {
      router.replace(`/login?redirect=/reservations/create/${roomIdParam}`);
    }
  }, [isLoggedIn, router, roomIdParam]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  function slotLabel(s: TimeSlot) {
    try {
      const st = parseISO(s.startTime);
      const et = parseISO(s.endTime);
      return `${format(st, "HH:mm")} – ${format(et, "HH:mm")}`;
    } catch {
      return "—";
    }
  }

  const canSubmit = useMemo(() => {
    return (
      room &&
      title.trim() &&
      purpose.trim() &&
      selected?.available &&
      attendees >= 1
    );
  }, [room, title, purpose, selected, attendees]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!room || !selected || !selected.available || !canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await post<{ id: number }>("/reservations", {
        roomId: room.id,
        title: title.trim(),
        purpose: purpose.trim(),
        startTime: selected.startTime,
        endTime: selected.endTime,
        attendees,
        remarks: remarks.trim(),
      });
      if (res.code === 1 && res.data?.id) {
        router.push(`/reservations/${res.data.id}`);
        return;
      }
      setError(res.msg || "预约失败");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="container-app py-24 text-center text-sm text-[var(--color-text-secondary)]">
        正在跳转登录…
      </div>
    );
  }

  if (loadingRoom) {
    return (
      <div className="container-app py-24 text-center text-sm text-[var(--color-text-secondary)]">
        加载中…
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container-app py-24 text-center">
        <p className="text-[var(--color-text-secondary)]">未找到该琴房</p>
        <Button asChild className="mt-4">
          <Link href="/rooms">返回列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] pb-16 pt-8">
      <div className="container-app">
        <nav className="mb-8 flex flex-wrap items-center gap-1 text-sm text-[var(--color-text-secondary)]">
          <Link href="/" className="hover:text-[var(--color-primary)]">
            首页
          </Link>
          <ChevronRight className="size-4" />
          <Link href="/rooms" className="hover:text-[var(--color-primary)]">
            琴房
          </Link>
          <ChevronRight className="size-4" />
          <Link href={`/rooms/${room.id}`} className="hover:text-[var(--color-primary)]">
            {room.name}
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-[var(--color-text)]">新建预约</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6 lg:col-span-3"
          >
            <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <CardHeader>
                <CardTitle className="text-xl">填写预约</CardTitle>
                <CardDescription>
                  已选择琴房{" "}
                  <span className="font-medium text-[var(--color-text)]">{room.name}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error ? (
                    <p className="rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
                      {error}
                    </p>
                  ) : null}

                  <div className="space-y-2">
                    <label htmlFor="res-title" className="text-sm font-medium text-[var(--color-text)]">
                      预约标题
                    </label>
                    <Input
                      id="res-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="例如：钢琴专业课练习"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="res-purpose" className="text-sm font-medium text-[var(--color-text)]">
                      用途说明
                    </label>
                    <textarea
                      id="res-purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      required
                      rows={3}
                      placeholder="简要说明练习内容或课程用途"
                      className="flex min-h-[88px] w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-quaternary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="res-date" className="text-sm font-medium text-[var(--color-text)]">
                        日期
                      </label>
                      <Input
                        id="res-date"
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          setSelected(null);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="res-attendees" className="text-sm font-medium text-[var(--color-text)]">
                        人数
                      </label>
                      <Input
                        id="res-attendees"
                        type="number"
                        min={1}
                        max={room.capacity}
                        value={attendees}
                        onChange={(e) => setAttendees(Math.max(1, Number(e.target.value) || 1))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-[var(--color-text)]">时段</span>
                    {loadingSlots ? (
                      <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
                        加载时段…
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {slots.map((s) => {
                          const active =
                            selected?.startTime === s.startTime &&
                            selected?.endTime === s.endTime;
                          return (
                            <button
                              key={`${s.startTime}-${s.endTime}`}
                              type="button"
                              disabled={!s.available}
                              onClick={() => s.available && setSelected(s)}
                              title={s.conflictReason || undefined}
                              className={cn(
                                "rounded-[var(--radius-md)] border px-2 py-3 text-center text-sm font-medium transition-all",
                                !s.available &&
                                  "cursor-not-allowed border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] text-[var(--color-text-quaternary)]",
                                s.available &&
                                  "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-sm)]",
                                s.available &&
                                  active &&
                                  "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]"
                              )}
                            >
                              {slotLabel(s)}
                              {!s.available ? (
                                <span className="mt-1 block text-[10px] font-normal text-[var(--color-text-tertiary)]">
                                  不可用
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="res-remarks" className="text-sm font-medium text-[var(--color-text)]">
                      备注（选填）
                    </label>
                    <Input
                      id="res-remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="需要管理员留意的事项"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full sm:max-w-xs"
                    disabled={!canSubmit || submitting}
                  >
                    {submitting ? "提交中…" : "提交预约"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
            className="space-y-6 lg:col-span-2"
          >
            <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="size-5 text-[var(--color-primary)]" />
                  琴房信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {room.roomType ? (
                    <Badge variant="secondary">{room.roomType.typeName}</Badge>
                  ) : null}
                  <Badge variant={room.status === 1 ? "success" : "warning"}>
                    {room.status === 1 ? "可用" : "维护中"}
                  </Badge>
                </div>
                <p className="text-base font-semibold text-[var(--color-text)]">{room.name}</p>
                <p className="text-[var(--color-text-secondary)]">
                  {room.roomNumber}
                  {room.floor != null ? ` · ${room.floor} 层` : ""} · 最多 {room.capacity} 人
                </p>
                {room.description ? (
                  <p className="leading-relaxed text-[var(--color-text-secondary)]">{room.description}</p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="size-5 text-[var(--color-accent-green)]" />
                  预约规则
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
                  <li className="flex gap-2">
                    <Clock className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" />
                    请在预约时段开始前完成签到，超时可能影响信用记录。
                  </li>
                  <li className="flex gap-2">
                    <Info className="mt-0.5 size-4 shrink-0 text-[var(--color-accent-teal)]" />
                    同一时段不可重复占用；取消请提前在「我的预约」操作。
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--color-accent-purple)]" />
                    请保持琴房整洁，轻声关门，遇设备问题联系管理员。
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
