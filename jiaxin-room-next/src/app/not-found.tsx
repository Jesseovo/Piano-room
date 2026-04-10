"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedText } from "@/components/pretext/animated-text";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[var(--color-bg-secondary)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-[min(90vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 size-64 rounded-full bg-[var(--color-accent-purple)]/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 220 }}
        className="relative z-10 text-center"
      >
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-[var(--color-text-tertiary)]">
          Oops
        </p>
        <div className="mb-4 text-[clamp(4rem,18vw,8rem)] font-bold leading-none tracking-tight text-[var(--color-primary)]">
          <AnimatedText text="404" animation="bounce" />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-lg font-medium text-[var(--color-text)]"
        >
          页面走丢了
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mt-2 max-w-sm text-sm text-[var(--color-text-secondary)]"
        >
          链接可能已过期，或页面已被移动。不如先回首页看看？
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <Button asChild size="lg" className="gap-2 rounded-[var(--radius-full)] px-8 shadow-[var(--shadow-primary)]">
            <Link href="/">
              <Home className="size-5" />
              返回首页
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
