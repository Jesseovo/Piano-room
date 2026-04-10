"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Mail, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { get, post } from "@/lib/api";

type Step = 1 | 2;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [againPassword, setAgainPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await get<{ email: string; sent: boolean }>("/user/email/code", { email });
      if (res.code === 1) {
        setStep(2);
      } else {
        setError(res.msg || "发送失败");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== againPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (newPassword.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    setLoading(true);
    try {
      const res = await post("/user/reset-password-by-email", {
        email: email.trim(),
        emailCode: code.trim(),
        newPassword,
        againPassword,
      });
      if (res.code === 1) {
        router.push("/login");
        return;
      }
      setError(res.msg || "重置失败");
    } catch {
      setError(
        "邮箱重置接口暂未开放或不可用。若你已登录，请到「个人资料 → 修改密码」；也可联系管理员协助。"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#5b21b6]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-32 top-20 size-96 rounded-full bg-[var(--color-primary)]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 size-80 rounded-full bg-[var(--color-accent-pink)]/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center text-white">
          <div className="mb-4 flex size-14 items-center justify-center rounded-[var(--radius-2xl)] bg-white/10 backdrop-blur-md">
            <Music2 className="size-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">找回密码</h1>
          <p className="mt-2 text-sm text-white/75">夹心 Room · 安全验证后设置新密码</p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={
                  step >= s
                    ? "flex size-9 items-center justify-center rounded-[var(--radius-full)] bg-white text-sm font-semibold text-[#312e81] shadow-[var(--shadow-md)]"
                    : "flex size-9 items-center justify-center rounded-[var(--radius-full)] border border-white/25 bg-white/5 text-sm font-medium text-white/60"
                }
              >
                {s}
              </div>
              {s === 1 ? (
                <div className="h-px w-8 bg-white/25" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>

        <div className="rounded-[var(--radius-xl)] border border-white/15 bg-white/90 p-8 shadow-[var(--shadow-xl)] backdrop-blur-xl">
          {error ? (
            <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          ) : null}

          {step === 1 ? (
            <form onSubmit={sendCode} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="fp-email" className="text-sm font-medium text-[var(--color-text)]">
                  注册邮箱
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-quaternary)]" />
                  <Input
                    id="fp-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.edu.cn"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="h-11 w-full gap-2 text-base" disabled={loading}>
                {loading ? "发送中…" : "发送验证码"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-5">
              <p className="text-sm text-[var(--color-text-secondary)]">
                验证码已发送至{" "}
                <span className="font-medium text-[var(--color-text)]">{email}</span>
              </p>
              <div className="space-y-2">
                <label htmlFor="fp-code" className="text-sm font-medium text-[var(--color-text)]">
                  邮箱验证码
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-quaternary)]" />
                  <Input
                    id="fp-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="请输入验证码"
                    className="pl-10"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="fp-new" className="text-sm font-medium text-[var(--color-text)]">
                  新密码
                </label>
                <Input
                  id="fp-new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="fp-again" className="text-sm font-medium text-[var(--color-text)]">
                  确认新密码
                </label>
                <Input
                  id="fp-again"
                  type="password"
                  value={againPassword}
                  onChange={(e) => setAgainPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                  }}
                >
                  上一步
                </Button>
                <Button type="submit" className="h-11 flex-[2] text-base" disabled={loading}>
                  {loading ? "提交中…" : "重置密码"}
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            想起密码了？{" "}
            <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
              返回登录
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
