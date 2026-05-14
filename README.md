<p align="center">
  <img src="docs/social-preview.gif" alt="PawPause" width="800" />
</p>

<h1 align="center">PawPause</h1>

<p align="center">
  A pixel desktop companion that helps you pause, hydrate, and stay focused.
</p>

<p align="center">
  It is local-first: settings, stats, imported companions, and focus history stay on your machine.
</p>

<p align="center">
  <a href="docs/GLOSSARY.md">Glossary / 术语表</a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="docs/readme/README.zh-CN.md">中文</a> ·
  <a href="docs/readme/README.ja.md">日本語</a> ·
  <a href="docs/readme/README.ko.md">한국어</a> ·
  <a href="docs/readme/README.fr.md">Français</a> ·
  <a href="docs/readme/README.de.md">Deutsch</a> ·
  <a href="docs/readme/README.ru.md">Русский</a> ·
  <a href="docs/readme/README.ar.md">العربية</a> ·
  <a href="docs/readme/README.es.md">Español</a>
</p>

<p align="center">
  <a href="https://github.com/angziii/PawPause/releases">
    <img alt="Downloads" src="https://img.shields.io/github/downloads/angziii/PawPause/total?style=flat-square&amp;label=downloads&amp;logo=github" />
  </a>
  <img alt="Electron" src="https://img.shields.io/badge/Electron-vite-47848f?style=flat-square&amp;logo=electron&amp;logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&amp;logo=react&amp;logoColor=111111" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
</p>

PawPause is a macOS and Windows desktop companion. It keeps a small pixel friend on your screen, nudges you to take breaks, reminds you to drink water, helps protect focus sessions, and supports PetDex-style companion imports.

## Features

- **Pixel companion**: transparent, always-on-top, draggable desktop companion with animated states.
- **Break intervention**: optional screen-block break mode when a reminder is easy to ignore.
- **Hydration reminders**: water reminders with daily and historical stats.
- **Focus mode**: macOS active-window detection can trigger full-screen distraction nudges for blocked apps or keywords.
- **Agent activity alerts**: local Codex, Claude Code, OpenCode, DeepSeek TUI, and Hermes events can trigger completion, failure, review-needed, and progress nudges.
- **Pet imports**: import `pet.json + spritesheet.webp/png` folders or zip packages in the app.
- **PetDex compatibility**: PawPause reads companions installed to `~/.codex/pets`.
- **Multilingual UI**: English, Chinese, Japanese, Korean, French, German, Russian, Arabic, and Spanish.
- **Dark mode**: settings and companion UI adapt to system appearance.

## Install

Download installers from [Releases](https://github.com/angziii/PawPause/releases):

| File | Platform |
| --- | --- |
| `PawPause-x.x.x-mac-arm64.dmg` | macOS Apple Silicon |
| `PawPause-x.x.x-mac-x64.dmg` | macOS Intel |
| `PawPause-x.x.x-win-x64.exe` | Windows 64-bit |

On macOS, distraction detection and Agent window recognition require Accessibility permission.

## Updates

Windows packaged builds check GitHub Releases for updates from inside PawPause. When an update is available, PawPause asks before downloading it and asks again before restarting to install it. You can also check manually from the tray menu.

Release builds are produced by GitHub Actions. The release workflow signs and notarizes macOS artifacts, builds the Windows installer, and uploads installer artifacts plus Windows update metadata to the GitHub release.

## Agent Integration

PawPause can react when local coding agents are working, waiting for review, finished, or failed. Enable **Agent activity alerts** in Settings, then use the matching setup below.

| Agent | Setup | What PawPause Watches |
| --- | --- | --- |
| Codex | No plugin needed | Local Codex session JSONL files |
| Claude Code | No plugin needed | Local Claude project/session files |
| DeepSeek TUI | No plugin needed | `~/.deepseek/sessions` and `~/.deepseek/audit.log` |
| OpenCode | Install the PawPause OpenCode hook | JSONL events from the hook |
| Hermes | Install the PawPause Hermes hook | JSONL events from the hook, plus Hermes session fallback |

### OpenCode

```bash
mkdir -p ~/.config/opencode/plugins
curl -fsSL https://raw.githubusercontent.com/angziii/PawPause/v1.0.7/integrations/opencode/pawpause-agent-hook.js \
  -o ~/.config/opencode/plugins/pawpause-agent-hook.js
```

The hook writes to `~/.local/share/pawpause/agent-events/opencode.jsonl`. Override it with `PAWPAUSE_AGENT_EVENTS` if needed.

### Hermes

```bash
mkdir -p ~/.hermes/plugins/pawpause-agent-hook
curl -fsSL https://raw.githubusercontent.com/angziii/PawPause/v1.0.7/integrations/hermes/pawpause-agent-hook/__init__.py \
  -o ~/.hermes/plugins/pawpause-agent-hook/__init__.py
curl -fsSL https://raw.githubusercontent.com/angziii/PawPause/v1.0.7/integrations/hermes/pawpause-agent-hook/plugin.yaml \
  -o ~/.hermes/plugins/pawpause-agent-hook/plugin.yaml
```

Then enable it in `~/.hermes/config.yaml`:

```yaml
plugins:
  enabled:
    - pawpause-agent-hook
```

The Hermes hook writes to `~/.local/share/pawpause/agent-events/hermes.jsonl` on Linux/macOS. When Hermes runs inside WSL and PawPause runs on Windows, the hook automatically writes to the Windows user's `%APPDATA%\PawPause\agent-events\hermes.jsonl`, so the Windows app can read the events. Override it with `PAWPAUSE_HERMES_AGENT_EVENTS` if needed.

### Paste This To Your Agent

If you want an agent to connect itself to PawPause, paste this:

```text
Please connect this local agent to PawPause v1.0.7.

- If this is Codex, Claude Code, or DeepSeek TUI, no plugin is needed. Just make sure PawPause is running and Agent activity alerts are enabled.
- If this is OpenCode, install https://raw.githubusercontent.com/angziii/PawPause/v1.0.7/integrations/opencode/pawpause-agent-hook.js into ~/.config/opencode/plugins/pawpause-agent-hook.js.
- If this is Hermes, create ~/.hermes/plugins/pawpause-agent-hook, download __init__.py and plugin.yaml from https://github.com/angziii/PawPause/tree/v1.0.7/integrations/hermes/pawpause-agent-hook, and enable pawpause-agent-hook in ~/.hermes/config.yaml.
- If Hermes is running inside WSL while PawPause is running on Windows, use the v1.0.7 Hermes hook. It automatically writes events to the Windows %APPDATA%\PawPause\agent-events\hermes.jsonl path so PawPause can see them.

After installing a hook, restart the agent.
```

## Import Companions

### From PawPause

1. Open the PawPause settings window.
2. Go to the companion page.
3. Import a folder or zip containing `pet.json` and `spritesheet.webp` or `spritesheet.png`.

### From PetDex

```bash
npx petdex install trump
```

PawPause scans `~/.codex/pets` automatically, so installed companions usually appear without restarting.

## Run From Source

```bash
git clone https://github.com/angziii/PawPause.git
cd PawPause
corepack enable
corepack pnpm install
corepack pnpm dev
```

## Build

```bash
corepack pnpm typecheck
corepack pnpm build
corepack pnpm dist:mac
corepack pnpm dist:win
```

## Project Structure

```text
src/main/       Electron main process: windows, tray, timers, focus detection, imports
src/preload/    IPC bridge between Electron and React
src/renderer/   React UI for the companion and settings windows
src/shared/     Types, defaults, i18n, PetDex state mapping
landing/        PawPause landing page deployed to pawpause.vercel.app
docs/readme/    Localized README pages
```

Large companion asset packs are intentionally not committed to keep the repository small. Import or install companions locally instead.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=angziii/PawPause&type=Date)](https://www.star-history.com/#angziii/PawPause&Date)

## License

Source code is released under the [MIT License](LICENSE). Companion assets may have separate licensing; see [ASSET_LICENSE.md](ASSET_LICENSE.md).

## Acknowledgements

PawPause is built with appreciation for:

- [PawPal](https://github.com/zebangeth/PawPal), the original Electron desktop companion foundation.
- [PetDex](https://github.com/crafter-station/petdex), the inspiration for the pixel companion package format.
