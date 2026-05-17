<p align="center">
  <img src="docs/social-preview.gif" alt="PawPause" width="800" />
</p>

<h1 align="center">PawPause</h1>

<p align="center">
  A local-first pixel companion for breaks, focus, hydration, and agent activity nudges.
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
- **Custom reminders**: daily reminders with pet countdowns that appear only shortly before they are due, plus optional due-time pet enlargement.
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

## OpenCode Agent Hook

PawPause can consume OpenCode lifecycle events through a small OpenCode plugin:

```bash
mkdir -p ~/.config/opencode/plugins
cp integrations/opencode/pawpause-agent-hook.js ~/.config/opencode/plugins/
```

The plugin writes JSONL events to `~/.local/share/pawpause/agent-events/opencode.jsonl`. You can override that path with `PAWPAUSE_AGENT_EVENTS`.

## DeepSeek TUI Activity

PawPause also watches local DeepSeek TUI activity without a plugin. It reads recent session updates from `~/.deepseek/sessions` and approval events from `~/.deepseek/audit.log`, so normal chats, tool use, completion, failures, and permission prompts can move the companion.

## Hermes Agent Hook

PawPause can consume Hermes Agent lifecycle events through a small Hermes plugin:

```bash
mkdir -p ~/.hermes/plugins
cp -R integrations/hermes/pawpause-agent-hook ~/.hermes/plugins/
```

Then enable it in `~/.hermes/config.yaml`:

```yaml
plugins:
  enabled:
    - pawpause-agent-hook
```

The plugin writes JSONL events to `~/.local/share/pawpause/agent-events/hermes.jsonl`. You can override that path with `PAWPAUSE_HERMES_AGENT_EVENTS`.

If the plugin is not installed, PawPause still watches recent Hermes session files in `~/.hermes/sessions` as a local fallback, so normal chat turns can trigger progress and completion nudges.

### Hermes in WSL + PawPause on Windows

If Hermes runs inside WSL and PawPause runs on Windows, Hermes must write events to a path that the Windows app also watches. The current PawPause Hermes hook handles this automatically, but if your Hermes process does not load environment variables correctly or PawPause still does not react, hardcode the event path in the WSL plugin.

In WSL, edit the plugin:

```bash
nano ~/.hermes/plugins/pawpause-agent-hook/__init__.py
```

Replace the whole `_output_file()` function with:

```python
def _output_file() -> Path:
    # WSL -> Windows PawPause fallback.
    return Path("/mnt/c/Users/Administrator/.local/share/pawpause/agent-events/hermes.jsonl")
```

If the Windows username is not `Administrator`, replace it in the path:

```text
/mnt/c/Users/<WindowsUserName>/.local/share/pawpause/agent-events/hermes.jsonl
```

Then create the directory from WSL:

```bash
mkdir -p /mnt/c/Users/Administrator/.local/share/pawpause/agent-events
```

Finally, restart Hermes. The key point is that Hermes writes from WSL into the mounted Windows user directory, and PawPause reads the same event file from Windows.

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
