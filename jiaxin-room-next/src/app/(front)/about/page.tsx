"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarClock,
  Mail,
  MapPin,
  MousePointerClick,
  Phone,
  Smartphone,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { title: "即时预约", desc: "空闲时段一目了然，几步完成预约。", icon: MousePointerClick, color: "text-[var(--color-primary)]" },
  { title: "实时查看", desc: "房间状态与时段动态更新，减少跑空。", icon: CalendarClock, color: "text-[var(--color-accent-teal)]" },
  { title: "签到管理", desc: "签到签退记录清晰，练习时长可追溯。", icon: UserCheck, color: "text-[var(--color-accent-green)]" },
  { title: "智能推荐", desc: "根据习惯与热门时段，辅助选择时间。", icon: Sparkles, color: "text-[var(--color-accent-purple)]" },
  { title: "数据统计", desc: "练习时长与预约数据汇总，进步看得见。", icon: BarChart3, color: "text-[var(--color-accent-orange)]" },
  { title: "移动优先", desc: "为手机与触控优化，随时随地预约。", icon: Smartphone, color: "text-[var(--color-accent-pink)]" },
];

export default function AboutPage() {
  return (
    <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] pb-20 pt-8">
      <div className="container-app">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-light)] bg-gradient-to-br from-[#2563eb] via-[#6366f1] to-[#a855f7] px-8 py-16 text-center text-white shadow-[var(--shadow-xl)] md:px-16"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-[var(--color-accent-teal)]/20 blur-3xl" />
          <p className="relative text-sm font-medium uppercase tracking-[0.2em] text-white/75">
            夹心 Room
          </p>
          <h1 className="relative mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            高校琴房智能预约平台
          </h1>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/90">
            Figma 的活泼色彩 × Apple 的留白与质感，为练琴场景量身打造。
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-16"
        >
          <h2 className="mb-8 text-center text-2xl font-semibold text-[var(--color-text)]">
            功能亮点
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
              >
                <Card className="h-full border-[var(--color-border-light)] bg-[var(--color-surface)]">
                  <CardContent className="p-6">
                    <div
                      className={`mb-4 flex size-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] ${f.color}`}
                    >
                      <f.icon className="size-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-20"
        >
          <h2 className="mb-8 text-center text-2xl font-semibold text-[var(--color-text)]">
            联系我们
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <Mail className="mb-3 size-8 text-[var(--color-primary)]" />
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  邮箱
                </p>
                <a
                  href="mailto:support@jiaxin-room.edu.cn"
                  className="mt-2 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] hover:underline"
                >
                  support@jiaxin-room.edu.cn
                </a>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <Phone className="mb-3 size-8 text-[var(--color-accent-green)]" />
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  电话
                </p>
                <a
                  href="tel:+861012345678"
                  className="mt-2 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] hover:underline"
                >
                  010-1234-5678
                </a>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <MapPin className="mb-3 size-8 text-[var(--color-accent-orange)]" />
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  地址
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text)]">
                  北京市海淀区学园路 1 号
                  <br />
                  艺术中心管理处
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
