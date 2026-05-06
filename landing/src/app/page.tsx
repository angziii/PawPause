const repoUrl = "https://github.com/angziii/PawPause";
const latestReleaseUrl = `${repoUrl}/releases/latest`;
const windowsDownloadUrl =
  `${repoUrl}/releases/latest/download/PawPause-0.1.3-win-x64.exe`;

const links = [
  { label: "Windows 下载", href: windowsDownloadUrl, primary: true },
  { label: "macOS / 其他版本", href: latestReleaseUrl },
  { label: "GitHub", href: repoUrl },
  { label: "PetDex", href: "https://petdex.crafter.run/zh" },
];

export default function Home() {
  return (
    <main className="page-shell">
      <nav className="topbar" aria-label="PawPause links">
        <a href={latestReleaseUrl} target="_blank" rel="noreferrer">
          Release
        </a>
        <a href={repoUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </nav>

      <section className="hero">
        <div className="preview" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Pixel desktop companion</p>
          <h1>PawPause</h1>
          <p className="hero-text">
            一个住在桌面上的像素小伙伴，提醒你休息、喝水、保持专注。
          </p>
          <div className="actions">
            {links.map((link) => (
              <a
                className={link.primary ? "button button-primary" : "button"}
                href={link.href}
                key={link.label}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="details" aria-label="PawPause highlights">
        <p>本地优先，不需要账号。</p>
        <p>支持 Windows，macOS 安装包可在 GitHub Releases 查看。</p>
        <p>兼容 PetDex 社区形象。</p>
      </section>

      <footer className="footer">
        <span>PawPause by angziii</span>
        <span>Latest release: v0.1.3</span>
      </footer>
    </main>
  );
}
