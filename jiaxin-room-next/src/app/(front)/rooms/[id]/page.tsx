"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { get, post } from "@/lib/api";
import { cn } from "@/lib/utils";

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
  facilities?: Record<string, unknown> | null;
  roomType?: RoomType | null;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  conflictReason?: string;
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selected, setSelected] = useState<TimeSlot | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [quickBookError, setQuickBookError] = useState<string | null>(null);

  const facilityEntries = useMemo(() => {
    const f = room?.facilities;
    if (!f || typeof f !== "object") return [] as string[];
    return Object.entries(f).map(([k, v]) => `${k}${v !== true && v != null ? `：${String(v)}` : ""}`);
  }, [room]);

  const loadRoom = useCallback(async () => {
    setLoadingRoom(true);
    try {
      const res = await get<RoomDetail>(`/room/${id}`);
      if (res.code === 1 && res.data) setRoom(res.data);
      else setRoom(null);
    } catch {
      setRoom(null);
    } finally {
      setLoadingRoom(false);
    }
  }, [id]);

  const loadSlots = useCallback(async () => {
    if (!id) return;
    setLoadingSlots(true);
    try {
      const res = await get<TimeSlot[]>("/reservations/availability", {
        roomId: id,
        date,
      });
      if (res.code === 1 && Array.isArray(res.data)) {
        setSlots(res.data);
      } else {
        setSlots([]);
      }
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [id, date]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  async function quickBook() {
    if (!room || !selected || !selected.available) return;
    setBooking(true);
    setQuickBookError(null);
    try {
      const res = await post("/reservations/quick", {
        roomId: room.id,
        startTime: selected.startTime,
        endTime: selected.endTime,
        attendees: 1,
        remarks: "",
      });
      if (res.code === 1) {
        router.push("/reservations/my");
      } else {
        const msg = res.msg || "预约失败";
        setQuickBookError(msg);
        window.alert(msg);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "网络错误";
      setQuickBookError(msg);
      window.alert(msg);
    } finally {
      setBooking(false);
    }
  }

  function slotLabel(s: TimeSlot) {
    try {
      const st = parseISO(s.startTime);
      const et = parseISO(s.endTime);
      return `${format(st, "HH:mm")} – ${format(et, "HH:mm")}`;
    } catch {
      return "—";
    }
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
            琴房列表
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-[var(--color-text)]">{room.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-3xl">🎹</span>
                  {room.roomType ? (
                    <Badge variant="secondary">{room.roomType.typeName}</Badge>
                  ) : null}
                  <Badge variant={room.status === 1 ? "success" : "warning"}>
                    {room.status === 1 ? "可用" : "不可用"}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{room.name}</CardTitle>
                <p className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                  <MapPin className="size-4 shrink-0" />
                  {room.roomNumber}
                  {room.floor != null ? ` · ${room.floor} 层` : ""} · 可容纳{" "}
                  {room.capacity} 人
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {room.description ? (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                      简介
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {room.description}
                    </p>
                  </div>
                ) : null}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                    设施
                  </h3>
                  {facilityEntries.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {facilityEntries.map((line) => (
                        <li key={line}>
                          <Badge variant="outline" className="font-normal">
                            {line}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--color-text-tertiary)]">暂无设施信息</p>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                    使用须知
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[var(--color-text-secondary)]">
                    <li>请在预约时段内签到使用</li>
                    <li>保持环境整洁，轻声关门</li>
                    <li>如遇设备问题请联系管理员</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-6 lg:col-span-3">
            <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <CardHeader>
                <CardTitle className="text-lg">选择日期与时段</CardTitle>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <label className="text-sm text-[var(--color-text-secondary)]" htmlFor="slot-date">
                    日期
                  </label>
                  <input
                    id="slot-date"
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setSelected(null);
                      setQuickBookError(null);
                    }}
                    className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingSlots ? (
                  <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
                    加载时段…
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {slots.map((s) => {
                      const active =
                        selected?.startTime === s.startTime &&
                        selected?.endTime === s.endTime;
                      return (
                        <button
                          key={`${s.startTime}-${s.endTime}`}
                          type="button"
                          disabled={!s.available}
                          onClick={() => {
                            if (!s.available) return;
                            setQuickBookError(null);
                            setSelected(s);
                          }}
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
                              已约满
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
                <Button
                  className="mt-6 h-11 w-full sm:max-w-xs"
                  disabled={!selected?.available || booking}
                  onClick={quickBook}
                >
                  {booking ? "提交中…" : "快速预约"}
                </Button>
                {quickBookError ? (
                  <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
                    {quickBookError}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
