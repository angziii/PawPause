import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pawpause.vercel.app";
const title = "PawPause - Pixel desktop companion for macOS and Windows";
const description =
  "PawPause is a pixel desktop companion for macOS and Windows with breaks, hydration, focus stats, low-battery reminders, and live Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes activity nudges.";
const socialImage = "/x-card-preview.png";
const socialImageAlt = "PawPause landing page preview";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "PawPause",
    "pixel desktop companion",
    "desktop pet app",
    "break reminder",
    "hydration reminder",
    "focus companion",
    "AI coding agent notifications",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "PawPause",
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: socialImageAlt,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: socialImageAlt,
        type: "image/png",
      },
    ],
  },
  other: {
    "twitter:url": siteUrl,
    "twitter:domain": "pawpause.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
