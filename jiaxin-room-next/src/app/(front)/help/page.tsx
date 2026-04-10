"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  ListOrdered,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FaqCategory = "预约相关" | "签到相关" | "违约相关" | "账号相关";

interface FaqItem {
  q: string;
  a: string;
  cat: FaqCategory;
}

const faqs: FaqItem[] = [
  {
    cat: "预约相关",
    q: "如何预约琴房？",
    a: "在「琴房列表」选择房间与日期，挑选可用时段后提交预约；也可在房间详情页使用快速预约。预约成功后可在「我的预约」查看。",
  },
  {
    cat: "预约相关",
    q: "可以修改已提交的预约吗？",
    a: "如需调整时间，请先取消当前预约（在批准状态下），再重新选择时段提交。具体规则以学校管理部门为准。",
  },
  {
    cat: "预约相关",
    q: "预约时段以什么为准？",
    a: "时段以系统服务器时间为准，展示为本地日期与小时格。跨日预约请注意日界线。",
  },
  {
    cat: "签到相关",
    q: "签到与签退如何操作？",
    a: "在预约详情页可执行签到、签退。请在预约时段内完成签到；结束练习后及时签退，以便统计练习时长。",
  },
  {
    cat: "签到相关",
    q: "忘记签到会怎样？",
    a: "未按时签到可能被视为爽约并影响信用记录，具体规则见学校琴房管理规定。",
  },
  {
    cat: "违约相关",
    q: "哪些行为可能构成违约？",
    a: "如频繁取消、未签到占用、超时滞留等，可能被记录违约；多次违约或触发惩罚规则。",
  },
  {
    cat: "违约相关",
    q: "违约后如何恢复？",
    a: "请遵守后续预约与签到要求，必要时联系管理员说明情况；部分限制会在期限结束后自动解除。",
  },
  {
    cat: "账号相关",
    q: "忘记密码怎么办？",
    a: "可使用登录页的「忘记密码」流程；若已登录，可在「个人资料」中修改密码。",
  },
  {
    cat: "账号相关",
    q: "如何更新个人资料与头像？",
    a: "前往「个人资料」页编辑基本信息并上传头像，保存后即可生效。",
  },
];

const steps = [
  "使用学校账号登录夹心 Room。",
  "在首页或琴房列表浏览可用房间，进入详情选择日期与时段。",
  "填写预约标题与用途，确认人数与备注后提交。",
  "在「我的预约」跟踪状态；赴约前在详情页签到，结束后签退。",
];

export default function HelpPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(faqs[0]?.q ?? null);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return faqs;
    return faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(k) ||
        f.a.toLowerCase().includes(k) ||
        f.cat.includes(k)
    );
  }, [q]);

  const byCat = useMemo(() => {
    const m = new Map<FaqCategory, FaqItem[]>();
    for (const f of filtered) {
      const arr = m.get(f.cat) ?? [];
      arr.push(f);
      m.set(f.cat, arr);
    }
    return m;
  }, [filtered]);

  const categories: FaqCategory[] = ["预约相关", "签到相关", "违约相关", "账号相关"];

  return (
    <div className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] pb-20 pt-8">
      <div className="container-app max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]">
            <HelpCircle className="size-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            帮助中心
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            常见问题与使用指南，快速上手夹心 Room
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mb-10"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[var(--color-text-quaternary)]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索问题，例如：签到、取消、密码…"
            className="h-12 rounded-[var(--radius-lg)] pl-11 text-base shadow-[var(--shadow-sm)]"
          />
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-10"
        >
          {categories.map((cat, ci) => {
            const items = byCat.get(cat);
            if (!items?.length) return null;
            return (
              <div key={cat}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  {cat}
                </h2>
                <div className="space-y-2">
                  {items.map((item, ii) => (
                    <motion.div
                      key={item.q}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ci * 0.04 + ii * 0.02 }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpen((v) => (v === item.q ? null : item.q))}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 rounded-[var(--radius-lg)] border bg-[var(--color-surface)] px-4 py-4 text-left text-[var(--color-text)] shadow-[var(--shadow-xs)] transition-all",
                          open === item.q
                            ? "border-[var(--color-primary)]/40 shadow-[var(--shadow-md)]"
                            : "border-[var(--color-border-light)] hover:border-[var(--color-primary)]/25"
                        )}
                      >
                        <span className="font-medium">{item.q}</span>
                        <ChevronDown
                          className={cn(
                            "mt-0.5 size-5 shrink-0 text-[var(--color-text-tertiary)] transition-transform",
                            open === item.q && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {open === item.q ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-4 pt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                              {item.a}
                            </p>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.section>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
            没有匹配的问题，试试其他关键词。
          </p>
        ) : null}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-14"
        >
          <Card className="border-[var(--color-border-light)] bg-gradient-to-br from-white to-[var(--color-primary-pale)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ListOrdered className="size-6 text-[var(--color-primary)]" />
                使用步骤
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-sm font-semibold text-white shadow-[var(--shadow-sm)]">
                      {i + 1}
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-[var(--color-text)]">{s}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
