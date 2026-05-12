import type { Metadata } from "next";
import { InfoPage, assetLicenseUrl, licenseUrl, releasesUrl } from "../info-page";

export const metadata: Metadata = {
  title: "PawPause Terms",
  description:
    "Terms and licensing notes for PawPause downloads and companion assets.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="PawPause Terms"
      description="PawPause terms are anchored to the project's public licensing and release materials."
    >
      <h2>Software license</h2>
      <p>
        PawPause source code is released under the <a href={licenseUrl}>MIT License</a>. Downloaded
        builds are published through <a href={releasesUrl}>GitHub Releases</a>.
      </p>
      <h2>Companion assets</h2>
      <p>
        Companion artwork or imported packages may have separate licensing. Review the project{" "}
        <a href={assetLicenseUrl}>asset license notes</a> and any license included with a companion
        package.
      </p>
    </InfoPage>
  );
}
