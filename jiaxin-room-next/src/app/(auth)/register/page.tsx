"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { get, post } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [studentId, setStudentId] = useState("");
  const [realName, setRealName] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendEmailCode() {
    if (!email.trim()) {
      setError("请先填写邮箱");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await get<{ sent?: boolean }>("/user/email/code", { email });
      if (res.code !== 1) {
        setError(res.msg || "发送失败");
      }
    } catch {
      setError("发送失败，请稍后重试");
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await post("/user/register", {
        username,
        studentId,
        realName,
        email,
        emailCode,
        password,
      });
      if (res.code !== 1) {
        setError(res.msg || "注册失败");
        setLoading(false);
        return;
      }
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-primary-pale)] via-[var(--color-bg)] to-[var(--color-bg-secondary)] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(0,113,227,0.08),transparent)]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-lg"
      >
        <Card className="border-[var(--color-border-light)] bg-[var(--color-surface)]/95 shadow-[var(--shadow-xl)] backdrop-blur-md">
          <CardHeader className="space-y-1 pb-6 text-center">
            <CardTitle className="text-2xl font-semibold">创建账号</CardTitle>
            <p className="text-sm text-[var(--color-text-secondary)]">
              加入夹心 Room，开始预约你的练琴时间
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? (
                <p className="rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              ) : null}
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reg-username">
                  用户名
                </label>
                <Input
                  id="reg-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="studentId">
                  学号
                </label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="选填"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="realName">
                  真实姓名
                </label>
                <Input
                  id="realName"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  邮箱
                </label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={sending}
                    onClick={sendEmailCode}
                  >
                    {sending ? "发送中" : "发送验证码"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="emailCode">
                  邮箱验证码
                </label>
                <Input
                  id="emailCode"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  placeholder="请输入邮箱中的验证码"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reg-password">
                  密码
                </label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="mt-2 h-11 w-full" disabled={loading}>
                {loading ? "提交中…" : "注册"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
              已有账号？{" "}
              <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
                返回登录
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
