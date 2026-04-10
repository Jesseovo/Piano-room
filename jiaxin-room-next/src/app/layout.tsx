import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "夹心 Room - 高校琴房智能预约",
  description: "夹心 Room 是面向高校学生的琴房预约平台，实时查看空闲时段，一键预约练琴时光。",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico", apple: "/pwa-icon-192.png" },
  openGraph: {
    title: "夹心 Room",
    description: "高校琴房智能预约平台",
    type: "website",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0071E3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[var(--color-bg)] antialiased">
        {children}
      </body>
    </html>
  );
}
