"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { get, post } from "@/lib/api";
import { useAuthStore, type User } from "@/stores/auth-store";

interface CaptchaPayload {
  captchaId: string;
  imageBase64: string;
}

interface LoginPayload {
  token: string;
  user: {
    id: number;
    username: string;
    realName: string;
    studentId?: string | null;
    email: string;
    phone?: string | null;
    grade?: string | null;
    major?: string | null;
    userType: string;
    avatarUrl?: string | null;
    status: number;
    violationCount: number;
    banUntil?: string | null;
  };
}

function getSafeRedirectPath(raw: string | null): string {
  if (raw == null || raw === "") return "/";
  const p = raw.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return "/";
  return p;
}

function mapToUser(u: LoginPayload["user"]): User {
  return {
    id: u.id,
    username: u.username,
    realName: u.realName,
    studentId: u.studentId ?? undefined,
    email: u.email,
    phone: u.phone ?? undefined,
    grade: u.grade ?? undefined,
    major: u.major ?? undefined,
    userType: u.userType as User["userType"],
    avatarUrl: u.avatarUrl ?? undefined,
    status: u.status,
    violationCount: u.violationCount,
    banUntil: u.banUntil ?? undefined,
  };
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaSrc, setCaptchaSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCaptcha = useCallback(async () => {
    try {
      const res = await get<CaptchaPayload>("/user/captcha");
      if (res.code === 1 && res.data) {
        setCaptchaSrc(
          res.data.imageBase64.startsWith("data:")
            ? res.data.imageBase64
            : `data:image/png;base64,${res.data.imageBase64}`
        );
      }
    } catch {
      setCaptchaSrc(null);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await post<LoginPayload>("/user/login", {
        username,
        password,
        captcha,
      });
      if (res.code !== 1 || !res.data) {
        setError(res.msg || "登录失败");
        loadCaptcha();
        setLoading(false);
        return;
      }
      const { token, user } = res.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }
      setAuth(token, mapToUser(user));
      const next = getSafeRedirectPath(searchParams.get("redirect"));
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "网络错误");
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)] md:flex-row">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative hidden min-h-[40vh] flex-1 flex-col justify-end p-10 md:flex md:min-h-screen md:justify-center md:p-14"
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#2563eb] via-[#6366f1] to-[#7c3aed]"
          aria-hidden
        />
        <div className="glass-dark absolute inset-0 opacity-40" aria-hidden />
        <div className="relative z-10 max-w-md text-white">
          <div className="mb-6 flex size-14 items-center justify-center rounded-[var(--radius-2xl)] bg-white/15 backdrop-blur-md">
            <Music2 className="size-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            夹心 Room
          </h1>
          <p className="mt-3 text-lg text-white/85">
            高校琴房智能预约平台
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="flex flex-1 items-center justify-center px-4 py-12 md:px-12 md:py-0"
      >
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              欢迎回来
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              登录后即可预约琴房并管理行程
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <p className="rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-[var(--color-text)]">
                用户名
              </label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[var(--color-text)]">
                密码
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="captcha" className="text-sm font-medium text-[var(--color-text)]">
                验证码
              </label>
              <div className="flex gap-3">
                <Input
                  id="captcha"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  placeholder="图形验证码"
                  className="flex-1"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={loadCaptcha}
                  className="relative h-10 w-[120px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                  aria-label="刷新验证码"
                >
                  {captchaSrc ? (
                    <img src={captchaSrc} alt="验证码" className="size-full object-cover" />
                  ) : (
                    <span className="text-xs text-[var(--color-text-tertiary)]">点击刷新</span>
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
              {loading ? "登录中…" : "登录"}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            还没有账号？{" "}
            <Link href="/register" className="font-medium text-[var(--color-primary)] hover:underline">
              立即注册
            </Link>
            <span className="mx-2 text-[var(--color-text-quaternary)]">·</span>
            <Link href="/forgot-password" className="font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:underline">
              忘记密码
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-text-secondary)]">
          加载中…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
