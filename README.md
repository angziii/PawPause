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
  <img alt="Downloads" src="https://img.shields.io/github/downloads/angziii/PawPause/total?style=flat-square&label=downloads" />
  <img alt="Electron" src="https://img.shields.io/badge/Electron-vite-47848f?style=flat-square&logo=electron&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=111111" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
</p>

PawPause is a macOS and Windows desktop companion. It keeps a small pixel friend on your screen, nudges you to take breaks, reminds you to drink water, helps protect focus sessions, and supports PetDex-style companion imports.

## v1.0.0

PawPause 1.0.0 adds production release packaging for macOS and Windows, richer multilingual agent activity messages, DeepSeek TUI-oriented agent status handling, and a smoother message bubble architecture that keeps the pet window stable while notifications appear or disappear.

## Features

- **Pixel companion**: transparent, always-on-top, draggable desktop companion with animated states.
- **Break intervention**: optional screen-block break mode when a reminder is easy to ignore.
- **Hydration reminders**: water reminders with daily and historical stats.
- **Focus mode**: macOS active-window detection can trigger full-screen distraction nudges for blocked apps or keywords.
- **Agent activity alerts**: local Codex, Claude Code, and DeepSeek TUI-style session events can trigger completion, failure, review-needed, permission-needed, tool-use, script-running, and progress nudges.
- **Pet imports**: import `pet.json + spritesheet.webp/png` folders or zip packages in the app.
- **PetDex compatibility**: PawPause reads companions installed to `~/.codex/pets`.
- **Multilingual UI**: English, Chinese, Japanese, Korean, French, German, Russian, Arabic, and Spanish.
- **Dark mode**: settings and companion UI adapt to system appearance.

## Install

Download installers from [Releases](https://github.com/angziii/PawPause/releases):

| File | Platform |
| --- | --- |
| `PawPause-1.0.0-mac-arm64.dmg` | macOS Apple Silicon |
| `PawPause-1.0.0-mac-x64.dmg` | macOS Intel |
| `PawPause-1.0.0-win-x64.exe` | Windows 64-bit |

The macOS builds are configured for Developer ID signing, Hardened Runtime, notarization, and stapled notarization tickets. Optional distraction detection and agent window recognition require Accessibility permission, and macOS may also ask for Automation permission because PawPause uses System Events to read the active app/window title.

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
corepack pnpm dist:mac:arm64
corepack pnpm dist:mac:x64
corepack pnpm dist:win
```

## Release Engineering

PawPause uses `electron-builder` for desktop packaging.

macOS release builds require a Developer ID Application certificate and Apple notarization credentials. Keep all signing material outside the repository:

- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`
- `CSC_LINK`
- `CSC_KEY_PASSWORD`

Local signing identity check:

```bash
security find-identity -v -p codesigning
```

Expected production identity:

```text
Developer ID Application: Your Name (TEAMID1234)
```

After building a macOS release, verify the generated artifacts:

```bash
codesign --verify --deep --strict --verbose=2 "dist/mac-arm64/PawPause.app"
codesign -dv --verbose=4 "dist/mac-arm64/PawPause.app"
xcrun stapler validate "dist/mac-arm64/PawPause.app"
spctl --assess --type execute --verbose=4 "dist/mac-arm64/PawPause.app"
xcrun stapler validate "dist/PawPause-1.0.0-mac-arm64.dmg"
spctl --assess --type open --verbose=4 "dist/PawPause-1.0.0-mac-arm64.dmg"
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
