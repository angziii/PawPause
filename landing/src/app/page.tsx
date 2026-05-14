import PetChaseLanding from "./PetChaseLanding";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pawpause.vercel.app";
const repoUrl = "https://github.com/angziii/PawPause";
const latestReleaseUrl = `${repoUrl}/releases/latest`;
const petdexUrl = "https://github.com/crafter-station/petdex";
const hermesAgentUrl = "https://github.com/NousResearch/hermes-agent";
const wcagPauseUrl = "https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html";
const appleNotificationsUrl = "https://developer.apple.com/design/human-interface-guidelines/managing-notifications";
const microsoftNotificationsUrl =
  "https://learn.microsoft.com/en-us/windows/apps/develop/notifications/app-notifications/app-notifications-ux-guidance";
const faqs = [
  {
    question: "What is PawPause?",
    answer:
      "PawPause is a pixel desktop companion for macOS and Windows. It stays on screen as a small animated companion and nudges you about breaks, hydration, focus, and local coding-agent activity.",
  },
  {
    question: "Does PawPause need an account?",
    answer:
      "No. PawPause is local-first, so settings, stats, imported companions, and focus history stay on your machine by default.",
  },
  {
    question: "Which AI coding tools can PawPause react to?",
    answer:
      "PawPause v1.0.6 includes local activity nudges for Codex, Claude Code, OpenCode, DeepSeek TUI, and Hermes Agent workflows.",
  },
  {
    question: "Where can I download PawPause?",
    answer:
      "The current release is available from the PawPause GitHub Releases page with macOS Apple Silicon, macOS Intel, and Windows installer targets.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PawPause",
    url: siteUrl,
    logo: `${siteUrl}/social-preview.png`,
    sameAs: [repoUrl],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "PawPause - Pixel desktop companion for macOS and Windows",
    url: siteUrl,
    description:
      "PawPause is a pixel desktop companion for macOS and Windows that supports breaks, hydration, focus sessions, and local AI coding-agent activity nudges.",
    isPartOf: {
      "@type": "WebSite",
      name: "PawPause",
      url: siteUrl,
    },
    about: {
      "@type": "SoftwareApplication",
      name: "PawPause",
      applicationCategory: "ProductivityApplication",
      operatingSystem: "macOS, Windows",
      softwareVersion: "1.0.6",
      url: siteUrl,
      downloadUrl: latestReleaseUrl,
      codeRepository: repoUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  },
];

function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function Home() {
  return (
    <>
      <JsonLd />
      <PetChaseLanding />

      <section className="answer-band" id="what-is-pawpause" aria-labelledby="what-is-pawpause-title">
        <div className="answer-band__inner">
          <p className="section-kicker">Direct answer</p>
          <h2 id="what-is-pawpause-title">What is PawPause?</h2>
          <p className="lede">
            PawPause is a pixel desktop companion for macOS and Windows. It keeps a small animated
            companion on screen and gives local nudges for breaks, hydration, focus sessions, and
            AI coding-agent activity.
          </p>
          <p>
            A desktop companion refers to a lightweight app that stays visible while you work and
            uses ambient prompts instead of a full task dashboard. PawPause is defined as a
            local-first productivity companion because settings, stats, imported companions, and
            focus history stay on your machine by default.
          </p>
        </div>
      </section>

      <section className="answer-band answer-band--grid" id="facts" aria-labelledby="facts-title">
        <div className="answer-band__inner">
          <p className="section-kicker">Extractable facts</p>
          <h2 id="facts-title">PawPause v1.0.6 at a glance</h2>
          <div className="fact-grid">
            <article>
              <span>3</span>
              <h3>Installer targets</h3>
              <p>
                PawPause v1.0.6 lists macOS Apple Silicon, macOS Intel, and Windows 64-bit
                downloads in the project release notes.
              </p>
            </article>
            <article>
              <span>10</span>
              <h3>Bundled companion previews</h3>
              <p>
                The landing page renders ten companion sprites, including Duo, Lil Finder, Pingu,
                Clippy, and Wall-E.
              </p>
            </article>
            <article>
              <span>9</span>
              <h3>Interface languages</h3>
              <p>
                The app copy covers English, Chinese, Japanese, Korean, French, German, Russian,
                Arabic, and Spanish.
              </p>
            </article>
          </div>
          <p className="method-note">
            Method note: these counts were checked from the public PawPause repository and release
            copy on <time dateTime="2026-05-13">May 13, 2026</time>.
          </p>
        </div>
      </section>

      <section className="answer-band" id="trust" aria-labelledby="trust-title">
        <div className="answer-band__inner">
          <p className="section-kicker">Trust and citations</p>
          <h2 id="trust-title">Why the page describes nudges, motion, and local control carefully</h2>
          <p>
            PawPause uses small animated prompts, so its public copy is grounded near recognized
            notification and accessibility references. The <a href={wcagPauseUrl}>W3C WCAG 2.2
            Pause, Stop, Hide guidance</a> describes when moving or auto-updating information needs a
            way to "pause, stop, or hide" it. <a href={appleNotificationsUrl}>Apple notification
            guidance</a> frames notifications around timely information, and{" "}
            <a href={microsoftNotificationsUrl}>Microsoft notification UX guidance</a> recommends
            designing notifications with "clear intent."
          </p>
          <p>
            PawPause also links to its <a href={repoUrl}>GitHub source repository</a>,{" "}
            <a href={latestReleaseUrl}>current release downloads</a>, and the{" "}
            <a href={petdexUrl}>PetDex project</a> that inspired its companion package compatibility.
            Hermes activity support targets the{" "}
            <a href={hermesAgentUrl}>NousResearch Hermes Agent project</a>.
          </p>
        </div>
      </section>

      <section className="answer-band" id="faq" aria-labelledby="faq-title">
        <div className="answer-band__inner">
          <p className="section-kicker">FAQ</p>
          <h2 id="faq-title">Common questions about PawPause</h2>
          <div className="faq-list">
            {faqs.map((faq) => (
              <article key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer" aria-label="PawPause site links">
        <div>
          <strong>PawPause</strong>
          <p>Pixel desktop companion for macOS and Windows.</p>
        </div>
        <nav aria-label="Related PawPause pages">
          <a href="/about">About</a>
          <a href="/support">Support</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </footer>
    </>
  );
}
