import Link from "next/link";

const quickLinks = [
  { href: "/rooms", label: "预约琴房" },
  { href: "/reservations/my", label: "我的预约" },
  { href: "/help", label: "帮助中心" },
  { href: "/login", label: "登录 / 注册" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
      <div className="container-app py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
              夹心 Room
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)]">
              高校琴房智能预约平台。简洁、可靠，让每一次练琴都可预期。
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              © {new Date().getFullYear()} 夹心 Room. All rights reserved.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
              快速链接
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
              联系我们
            </h3>
            <ul className="space-y-2.5 text-sm text-[var(--color-text-secondary)]">
              <li>邮箱：support@jiaxin-room.edu.cn</li>
              <li>工作时间：周一至周五 9:00 — 18:00</li>
              <li>地址：校园艺术中心 · 琴房管理办公室</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
