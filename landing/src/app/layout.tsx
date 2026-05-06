import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "PawPause - Pixel desktop companion",
  description:
    "A pixel desktop companion for breaks, water, focus, and live Codex / Claude Code activity nudges.",
  openGraph: {
    title: "PawPause - Pixel desktop companion",
    description:
      "A pixel desktop companion for breaks, water, focus, and live Codex / Claude Code activity nudges.",
    images: ["/social-preview.png"],
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
