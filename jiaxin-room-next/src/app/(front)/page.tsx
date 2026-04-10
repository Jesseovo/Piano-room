"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  LogIn,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedText } from "@/components/pretext/animated-text";
import { AnimatedCounter } from "@/components/pretext/animated-counter";
import { Typewriter } from "@/components/pretext/typewriter";
import { get } from "@/lib/api";
import { useEffect, useState } from "react";

interface BookingOverview {
  bookedToday: number;
  availableToday: number;
}

interface HotRoom {
  roomId: number;
  roomName: string;
  buildingName: string;
  reservationCount: number;
}

const steps = [
  {
    title: "登录账号",
    desc: "使用学号或校园账号安全登录",
    icon: LogIn,
  },
  {
    title: "选择琴房",
    desc: "按楼层、设施筛选心仪房间",
    icon: Sparkles,
  },
  {
    title: "提交预约",
    desc: "选择时段并确认预约信息",
    icon: ClipboardList,
  },
  {
    title: "签到使用",
    desc: "到场签到，结束签退，记录练习时长",
    icon: CheckCircle2,
  },
];

const rules = [
  {
    title: "预约规则",
    icon: BookOpen,
    items: [
      "每位用户可同时保留有限数量的有效预约",
      "请提前规划时段，避免频繁取消占用资源",
      "高峰时段将优先保障连续练习需求",
    ],
  },
  {
    title: "使用规范",
    icon: CheckCircle2,
    items: [
      "保持琴房整洁，爱护公共设备",
      "轻声关门，尊重相邻琴房的学习环境",
      "结束离开时请关闭电源与照明",
    ],
  },
  {
    title: "违约说明",
    icon: ClipboardList,
    items: [
      "未签到或无故缺席将计入违约次数",
      "多次违约可能触发短期预约限制",
      "如有特殊情况请及时联系管理员协调",
    ],
  },
];

export default function HomePage() {
  const [hotRooms, setHotRooms] = useState<HotRoom[]>([]);
  const [stats, setStats] = useState({ totalRooms: 24, available: 0, booked: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [hotRes, overviewRes] = await Promise.all([
          get<HotRoom[]>("/room/hot-today"),
          get<BookingOverview>("/reports/bookingOverview"),
        ]);
        if (cancelled) return;
        if (hotRes.code === 1 && Array.isArray(hotRes.data)) {
          setHotRooms(hotRes.data.slice(0, 6));
        }
        if (overviewRes.code === 1 && overviewRes.data) {
          const o = overviewRes.data;
          setStats((s) => ({
            ...s,
            booked: o.bookedToday,
            available: o.availableToday,
          }));
        }
      } catch {
        setHotRooms([
          {
            roomId: 1,
            roomName: "琴房 A101",
            buildingName: "艺术楼",
            reservationCount: 12,
          },
          {
            roomId: 2,
            roomName: "琴房 B203",
            buildingName: "音乐馆",
            reservationCount: 9,
          },
          {
            roomId: 3,
            roomName: "琴房 C305",
            buildingName: "艺术楼",
            reservationCount: 7,
          },
        ]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="overflow-x-hidden">
      <section className="relative border-b border-[var(--color-border-light)] bg-gradient-to-br from-[var(--color-primary-pale)] via-[var(--color-bg)] to-[var(--color-bg-secondary)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_-20%,rgba(0,113,227,0.12),transparent)]" />
        <div className="container-app relative py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] md:text-5xl lg:text-6xl">
                  <AnimatedText text="夹心 Room" animation="bounce" />
                </h1>
                <p className="mt-4 text-lg text-[var(--color-text-secondary)] md:text-xl">
                  <Typewriter
                    text="高校琴房智能预约平台"
                    speed={42}
                    className="inline"
                  />
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/rooms">立即预约</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/help">了解更多</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { label: "总琴房数", value: stats.totalRooms },
                { label: "今日可预约", value: stats.available },
                { label: "今日已预约", value: stats.booked },
              ].map((item) => (
                <Card
                  key={item.label}
                  className="border-[var(--color-border-light)] bg-white/80 shadow-[var(--shadow-card)] backdrop-blur-sm"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-3xl font-semibold tabular-nums text-[var(--color-text)]">
                      <AnimatedCounter value={item.value} duration={1.2} />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-border-light)] bg-[var(--color-bg)] py-16 md:py-20">
        <div className="container-app">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] md:text-3xl">
                热门琴房
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                今日预约最多的练习空间
              </p>
            </div>
            <Link
              href="/rooms"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              查看全部
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hotRooms.map((room, i) => (
              <motion.div
                key={room.roomId}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <Card className="h-full border-[var(--color-border-light)] bg-[var(--color-surface)]">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-3xl" aria-hidden>
                        🎹
                      </span>
                      <Badge variant="secondary">
                        热度 {room.reservationCount}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 text-xl">{room.roomName}</CardTitle>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {room.buildingName}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <Link href={`/rooms/${room.roomId}`}>立即预约</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] py-16 md:py-20">
        <div className="container-app">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight text-[var(--color-text)] md:text-3xl">
            如何预约
          </h2>
          <div className="grid gap-8 md:grid-cols-4 md:gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center md:block md:text-left"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-[var(--radius-xl)] bg-white shadow-[var(--shadow-sm)] ring-1 ring-[var(--color-border-light)]">
                  <step.icon className="size-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-bg)] py-16 md:py-20">
        <div className="container-app">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--color-text)] md:text-3xl">
            规则与说明
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {rules.map((block) => (
              <Card
                key={block.title}
                className="border-[var(--color-border-light)] bg-[var(--color-surface)]"
              >
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-light)]">
                    <block.icon className="size-5 text-[var(--color-primary)]" />
                  </div>
                  <CardTitle className="text-lg">{block.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5 text-sm text-[var(--color-text-secondary)]">
                    {block.items.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--color-primary)]/40" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
