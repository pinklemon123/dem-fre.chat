import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "论坛站点",
  description: "简洁的 Next.js 论坛示例",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
