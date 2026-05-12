import type { Metadata } from "next";
import { InfoPage, repoUrl } from "../info-page";

export const metadata: Metadata = {
  title: "About PawPause",
  description:
    "About PawPause, the local-first pixel desktop companion for breaks, hydration, focus, and coding-agent activity nudges.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="About PawPause"
      description="PawPause is a pixel desktop companion for macOS and Windows."
    >
      <h2>Product intent</h2>
      <p>
        PawPause keeps a small animated companion on screen so reminders feel ambient instead of
        like another dashboard. It supports break nudges, hydration reminders, focus protection,
        companion imports, and local activity prompts for coding-agent workflows.
      </p>
      <h2>Project source</h2>
      <p>
        PawPause is maintained in the public <a href={repoUrl}>PawPause GitHub repository</a>, where
        visitors can review source code, release notes, and issue history.
      </p>
    </InfoPage>
  );
}
