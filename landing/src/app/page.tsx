import type { CSSProperties } from "react";

const PET_BASE =
  "https://raw.githubusercontent.com/angziii/PawPause/main/petdex_pets";

type PixelRunner = {
  slug: string;
  name: string;
  rowY: string;
  top: string;
  duration: string;
  delay: string;
  scale: string;
  direction: "left" | "right";
};

const runners: PixelRunner[] = [
  { slug: "boxcat", name: "Boxcat", rowY: "12.5%", top: "18%", duration: "17s", delay: "-2s", scale: "0.88", direction: "right" },
  { slug: "boba", name: "Boba", rowY: "25%", top: "35%", duration: "21s", delay: "-11s", scale: "0.74", direction: "left" },
  { slug: "byte-bunny", name: "Byte Bunny", rowY: "50%", top: "12%", duration: "9s", delay: "-5s", scale: "0.66", direction: "right" },
  { slug: "cache-capy", name: "Cache Capy", rowY: "12.5%", top: "58%", duration: "24s", delay: "-14s", scale: "0.82", direction: "right" },
  { slug: "cash-cuy", name: "Cash Cuy", rowY: "87.5%", top: "72%", duration: "19s", delay: "-7s", scale: "0.78", direction: "left" },
  { slug: "cosmo", name: "Cosmo", rowY: "50%", top: "44%", duration: "10s", delay: "-1s", scale: "0.7", direction: "right" },
  { slug: "kebo", name: "Kebo", rowY: "12.5%", top: "82%", duration: "22s", delay: "-17s", scale: "0.86", direction: "right" },
  { slug: "noir-webling", name: "Noir Webling", rowY: "25%", top: "66%", duration: "20s", delay: "-9s", scale: "0.76", direction: "left" },
  { slug: "nukey", name: "Nukey", rowY: "50%", top: "25%", duration: "11s", delay: "-3s", scale: "0.68", direction: "right" },
  { slug: "pixel-panda", name: "Pixel Panda", rowY: "12.5%", top: "48%", duration: "26s", delay: "-19s", scale: "0.9", direction: "left" },
  { slug: "prompt-penguin", name: "Prompt Penguin", rowY: "87.5%", top: "8%", duration: "18s", delay: "-12s", scale: "0.72", direction: "right" },
  { slug: "scoop", name: "Scoop", rowY: "50%", top: "76%", duration: "8s", delay: "-4s", scale: "0.64", direction: "left" },
  { slug: "socksy", name: "Socksy", rowY: "12.5%", top: "30%", duration: "23s", delay: "-15s", scale: "0.8", direction: "right" }
];

const features = [
  {
    title: "下载桌面应用",
    body: "准备好后可直接下载 macOS 和 Windows 安装包，把像素小伙伴放到桌面上。"
  },
  {
    title: "下载更多形象",
    body: "兼容 PetDex 社区形象，复制安装命令到 Terminal，PawPause 会自动发现。"
  },
  {
    title: "专注与休息",
    body: "久坐、喝水、分心和 Agent 完成提醒都由同一个小伙伴用动作和气泡表达。"
  },
  {
    title: "本地优先",
    body: "设置、统计和导入形象保存在本机，不需要账号，不依赖云端服务。"
  }
];

const downloads = [
  { title: "macOS Apple Silicon", detail: "PawPause-arm64.dmg", href: "" },
  { title: "macOS Intel", detail: "PawPause-x64.dmg", href: "" },
  { title: "Windows", detail: "PawPause.Setup.exe", href: "" }
];

function spriteStyle(runner: PixelRunner): CSSProperties {
  return {
    "--sprite": `url(${PET_BASE}/${runner.slug}/spritesheet.webp)`,
    "--row-y": runner.rowY,
    "--top": runner.top,
    "--duration": runner.duration,
    "--delay": runner.delay,
    "--scale": runner.scale
  } as CSSProperties;
}

export default function Home() {
  return (
    <main>
      <section className="hero-shell">
        <div className="pixel-sky" aria-hidden="true">
          {runners.map((runner) => (
            <div
              key={runner.slug}
              className={`runner runner--${runner.direction}`}
              style={spriteStyle(runner)}
            >
              <span className="runner__sprite" aria-label={runner.name} role="img" />
            </div>
          ))}
        </div>

        <nav className="topbar" aria-label="PawPause links">
          <a href="https://github.com/angziii/PawPause" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="#download">Download</a>
        </nav>

        <div className="hero-copy">
          <p className="eyebrow">Pixel desktop companion</p>
          <h1>PawPause</h1>
          <p className="hero-text">
            一个住在桌面上的像素小伙伴。它会提醒你休息、喝水、保持专注，也能从
            PetDex 下载更多形象。
          </p>
          <div className="hero-actions">
            <a className="pixel-button pixel-button--primary" href="#download">
              下载应用
            </a>
            <a
              className="pixel-button pixel-button--ghost"
              href="https://petdex.crafter.run/zh"
              target="_blank"
              rel="noreferrer"
            >
              浏览形象
            </a>
          </div>
        </div>
      </section>

      <section className="section features-section" id="features">
        <div className="section-heading">
          <p className="eyebrow">Features</p>
          <h2>下载、导入、陪伴、提醒</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section petdex-section">
        <div className="petdex-copy">
          <p className="eyebrow">PetDex workflow</p>
          <h2>从社区安装一个新形象</h2>
          <ol>
            <li>去 PetDex 找到喜欢的像素形象。</li>
            <li>复制它页面里的安装指令。</li>
            <li>把指令输入到 Terminal，PawPause 会自动读取。</li>
          </ol>
        </div>
        <div className="terminal-box" aria-label="Terminal example">
          <span>Terminal</span>
          <code>npx petdex install boxcat</code>
        </div>
      </section>

      <section className="section download-section" id="download">
        <div className="section-heading">
          <p className="eyebrow">Download</p>
          <h2>安装包入口先留好</h2>
        </div>
        <div className="download-grid">
          {downloads.map((download) => (
            <a className="download-card" href={download.href} key={download.title}>
              <span>{download.title}</span>
              <strong>{download.detail}</strong>
              <em>Coming soon</em>
            </a>
          ))}
        </div>
        <a
          className="release-link"
          href="https://github.com/angziii/PawPause/releases"
          target="_blank"
          rel="noreferrer"
        >
          查看 GitHub Releases
        </a>
      </section>

      <footer className="footer">
        <p>
          Thanks to{" "}
          <a href="https://github.com/crafter-station/petdex" target="_blank" rel="noreferrer">
            PetDex
          </a>{" "}
          and{" "}
          <a href="https://github.com/zebangeth/PawPal" target="_blank" rel="noreferrer">
            PawPal
          </a>
          .
        </p>
        <p>PawPause by angziii</p>
      </footer>
    </main>
  );
}
