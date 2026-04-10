"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Grid3X3, LayoutList, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { get } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  status: number;
  facilities?: Record<string, unknown> | null;
  roomType?: RoomType | null;
}

interface PageRows<T> {
  total: number;
  rows: T[];
}

const statusLabels: Record<number, string> = {
  0: "停用",
  1: "可用",
  2: "维护中",
};

export default function RoomsPage() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [typeId, setTypeId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 320);
    return () => clearTimeout(t);
  }, [keyword]);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<PageRows<RoomRow>>("/room", {
        page: 1,
        pageSize: 48,
        roomTypeId: typeId ? Number(typeId) : undefined,
        status: status !== "" ? Number(status) : undefined,
        roomNumberOrName: debouncedKeyword || undefined,
      });
      if (res.code === 1 && res.data) {
        setRooms(res.data.rows);
        setTotal(res.data.total);
      }
    } catch {
      setRooms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [typeId, status, debouncedKeyword]);

  useEffect(() => {
    (async () => {
      try {
        const res = await get<RoomType[]>("/classType/all");
        if (res.code === 1 && Array.isArray(res.data)) {
          setRoomTypes(res.data);
        }
      } catch {
        setRoomTypes([]);
      }
    })();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  function facilitiesList(f?: Record<string, unknown> | null) {
    if (!f || typeof f !== "object") return [] as string[];
    return Object.keys(f).slice(0, 4);
  }

  const filters = (
    <div className="flex flex-col gap-3">
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">
          琴房类型
        </label>
        <select
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          className="flex h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
        >
          <option value="">全部类型</option>
          {roomTypes.map((rt) => (
            <option key={rt.id} value={String(rt.id)}>
              {rt.typeName}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">
          状态
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 text-sm"
        >
          <option value="">全部</option>
          <option value="1">可用</option>
          <option value="2">维护中</option>
          <option value="0">停用</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">
          搜索
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="房间号或名称"
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] pb-16 pt-8">
      <div className="container-app">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            琴房列表
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            筛选心仪房间，查看设施与实时状态
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {isMobile ? (
            <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)] p-4">
              {filters}
            </Card>
          ) : (
            <aside className="w-full shrink-0 lg:w-64">
              <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)] p-4">
                <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">筛选</p>
                {filters}
              </Card>
            </aside>
          )}

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--color-text-secondary)]">
                共 <span className="font-medium text-[var(--color-text)]">{total}</span>{" "}
                间琴房
              </p>
              <div className="flex rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-white p-0.5 shadow-[var(--shadow-xs)]">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors",
                    view === "grid"
                      ? "bg-[var(--color-bg-secondary)] text-[var(--color-primary)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
                  )}
                  aria-label="网格视图"
                >
                  <Grid3X3 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors",
                    view === "list"
                      ? "bg-[var(--color-bg-secondary)] text-[var(--color-primary)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
                  )}
                  aria-label="列表视图"
                >
                  <LayoutList className="size-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <p className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                加载中…
              </p>
            ) : rooms.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                暂无符合条件的琴房
              </p>
            ) : view === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {rooms.map((room, i) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <Card className="h-full border-[var(--color-border-light)] bg-[var(--color-surface)]">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-2xl" aria-hidden>
                            🎹
                          </span>
                          <div className="flex flex-wrap justify-end gap-1">
                            {room.roomType ? (
                              <Badge variant="secondary">{room.roomType.typeName}</Badge>
                            ) : null}
                            <Badge
                              variant={
                                room.status === 1
                                  ? "success"
                                  : room.status === 2
                                    ? "warning"
                                    : "danger"
                              }
                            >
                              {statusLabels[room.status] ?? "未知"}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-xl">{room.name}</CardTitle>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {room.roomNumber}
                          {room.floor != null ? ` · ${room.floor}F` : ""}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-1.5">
                          {facilitiesList(room.facilities as Record<string, unknown>).map(
                            (k) => (
                              <Badge key={k} variant="outline" className="font-normal">
                                {k}
                              </Badge>
                            )
                          )}
                          {facilitiesList(room.facilities as Record<string, unknown>).length ===
                          0 ? (
                            <span className="text-xs text-[var(--color-text-tertiary)]">
                              设施信息见详情
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          可容纳 {room.capacity} 人
                        </p>
                        <Button className="w-full" asChild>
                          <Link href={`/rooms/${room.id}`}>预约</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="overflow-hidden border-[var(--color-border-light)] bg-[var(--color-surface)]">
                <div className="divide-y divide-[var(--color-divider)]">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[var(--color-text)]">
                            {room.name}
                          </span>
                          {room.roomType ? (
                            <Badge variant="secondary">{room.roomType.typeName}</Badge>
                          ) : null}
                          <Badge
                            variant={
                              room.status === 1
                                ? "success"
                                : room.status === 2
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            {statusLabels[room.status] ?? ""}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {room.roomNumber} · 可容纳 {room.capacity} 人
                        </p>
                      </div>
                      <Button asChild>
                        <Link href={`/rooms/${room.id}`}>预约</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
