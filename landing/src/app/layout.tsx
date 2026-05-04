import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "PawPause - 桌面像素小伙伴",
  description:
    "一个住在你桌面上的像素小伙伴，提醒你休息、喝水、保持专注。支持 macOS 和 Windows。",
  openGraph: {
    title: "PawPause - 桌面像素小伙伴",
    description:
      "一个住在你桌面上的像素小伙伴，提醒你休息、喝水、保持专注。",
    images: ["/social-preview.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
