import type { Metadata } from "next";
import { InfoPage, issuesUrl, releasesUrl, repoUrl } from "../info-page";

export const metadata: Metadata = {
  title: "PawPause Support",
  description:
    "Support paths for PawPause downloads, bug reports, and setup questions.",
  alternates: {
    canonical: "/support",
  },
};

export default function SupportPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="PawPause Support"
      description="Use the public project channels for PawPause downloads, setup help, and bug reports."
    >
      <h2>Downloads</h2>
      <p>
        Current installers are published on <a href={releasesUrl}>GitHub Releases</a> for macOS
        Apple Silicon, macOS Intel, and Windows 64-bit.
      </p>
      <h2>Bug reports and questions</h2>
      <p>
        Use <a href={issuesUrl}>GitHub Issues</a> for reproducible bugs, setup questions, and feature
        requests. The <a href={repoUrl}>repository README</a> includes source setup and build
        instructions.
      </p>
    </InfoPage>
  );
}
