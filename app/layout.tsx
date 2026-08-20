import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoe Design｜个人作品集",
  description: "UI 与 HMI 设计师个人作品集",
  other: { "codex-preview": "development" },
};

// 移动端全尺寸自适应:允许缩放但默认1:1,支持安全区域
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
