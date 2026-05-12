import Link from "next/link";
import type { ReactNode } from "react";

export const repoUrl = "https://github.com/angziii/PawPause";
export const releasesUrl = `${repoUrl}/releases`;
export const issuesUrl = `${repoUrl}/issues`;
export const licenseUrl = `${repoUrl}/blob/main/LICENSE`;
export const assetLicenseUrl = `${repoUrl}/blob/main/ASSET_LICENSE.md`;

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function InfoPage({ eyebrow, title, description, children }: InfoPageProps) {
  return (
    <main className="info-page">
      <Link className="info-page__home" href="/">
        PawPause
      </Link>
      <article className="info-page__article">
        <p className="section-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="info-page__lede">{description}</p>
        <div className="info-page__body">{children}</div>
      </article>
      <nav className="info-page__nav" aria-label="PawPause site links">
        <Link href="/about">About</Link>
        <Link href="/support">Support</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </main>
  );
}
