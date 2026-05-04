<p align="center">
  <img src="docs/social-preview.png" alt="PawPause" width="800" />
</p>

<h1 align="center">PawPause</h1>

<p align="center">
  A pixel desktop companion that helps you pause, hydrate, and stay focused.
</p>

<p align="center">
  <img alt="Downloads" src="https://img.shields.io/github/downloads/angziii/PawPause/total?style=flat-square&label=downloads" />
  <img alt="Electron" src="https://img.shields.io/badge/Electron-vite-47848f?style=flat-square&logo=electron&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=111111" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
</p>

PawPause 是一款 macOS / Windows 桌面陪伴应用。它让一个像素风小伙伴常驻在你的屏幕上，通过更有存在感的方式提醒你休息、喝水、保持专注，并支持从 PetDex 生态导入各种角色形象。

它不是普通番茄钟，也不是只会待在角落里的桌宠。PawPause 的核心是把健康提醒、专注守护、桌面陪伴和可扩展角色库放在一起，让长期使用电脑的人在不被冷冰冰弹窗打断的情况下，仍然能被温柔但明确地拉回节奏。

## Features

- **Pixel companion**: 透明、置顶、可拖动的像素角色，支持 idle、run left、run right、jumping、waving、thinking、review、failed 等状态。
- **Break intervention**: 到休息时间后，角色可以放大覆盖屏幕，显示两分钟休息倒计时，让提醒不再轻易被忽略。
- **Hydration reminders**: 定时提醒喝水，并记录当天和历史完成情况。
- **Focus mode**: macOS 上可读取前台 App 和窗口标题，命中屏蔽应用或关键词时触发全屏专注提醒。
- **Agent activity alerts**: 监听本地 Codex / Claude Code 会话事件，只在完成、失败、需要接手或有新进展时提示，并切换到 thinking / review / failed / waving 等对应姿势。
- **PetDex-compatible library**: 内置多款 PetDex 风格像素角色，并支持 `pet.json + spritesheet.webp/png` 宠物包。
- **Local import without Codex**: 应用内导入会保存到 PawPause 自己的数据目录；同时兼容读取 `~/.codex/pets`。
- **PetDex CLI compatibility**: 通过 `npx petdex install <slug>` 安装到 `~/.codex/pets` 的角色会被 PawPause 自动发现。
- **Stats**: 统计休息、喝水、专注分钟和分心提醒，支持一天、一个月、全部时间范围。
- **Multilingual UI**: 支持中文、English、日本語、한국어、Español、Français、العربية、Deutsch、Русский。
- **Local-first**: 设置、统计和导入角色都保存在本机，不需要账号。

## Built-in Companions

PawPause 当前内置 13 个 PetDex 风格角色：

`boba`, `boxcat`, `byte-bunny`, `cache-capy`, `cash-cuy`, `cosmo`, `kebo`, `noir-webling`, `nukey`, `pixel-panda`, `prompt-penguin`, `scoop`, `socksy`

默认角色是 `boxcat`。你也可以在 Pet 页面选择其他角色，或导入自己的角色包。

## Import Companions

### From PawPause

1. 打开 PawPause 设置窗口。
2. 进入 Pet / 切换形象页面。
3. 点击导入，选择包含 `pet.json` 和 `spritesheet.webp` 或 `spritesheet.png` 的文件夹或 zip。

### From PetDex

1. 打开 [PetDex](https://petdex.crafter.run/zh)。
2. 找到喜欢的形象。
3. 复制页面提供的安装命令。
4. 在 Terminal 中运行命令，例如：

```bash
npx petdex install trump
```

PawPause 会自动扫描 `~/.codex/pets`，安装完成后通常不需要重启就能在 Pet 页面看到新形象。

### Package Format

PawPause 使用 PetDex 风格的像素 spritesheet：

- `pet.json`
- `spritesheet.webp` 或 `spritesheet.png`
- 推荐尺寸：`1536x1872`
- 单帧尺寸：`192x208`
- 网格：`8 x 9`

## Install

安装包发布后，可以从 [Releases](https://github.com/angziii/PawPause/releases) 下载：

| File | Platform |
| --- | --- |
| `PawPause-x.x.x-arm64.dmg` | macOS Apple Silicon |
| `PawPause-x.x.x-x64.dmg` | macOS Intel |
| `PawPause.Setup.x.x.x.exe` | Windows 64-bit |

macOS 首次打开时如果提示无法验证开发者，请在系统设置的隐私与安全性里允许打开。分心检测和 Agent 窗口识别需要授予辅助功能权限。

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
corepack pnpm dist
corepack pnpm dist:mac
corepack pnpm dist:win
```

## Project Structure

```text
src/main/       Electron main process: windows, tray, timers, focus detection, imports
src/preload/    IPC bridge between Electron and React
src/renderer/   React UI for companion window and settings window
src/shared/     Types, defaults, i18n, PetDex state mapping
petdex_pets/    Built-in PetDex-style companion packages
landing/        PawPause landing page deployed to pawpause.vercel.app
```

The reference projects originally used during research, `petdex/` and `petdex-approved/`, are intentionally not part of this app repository.

## Roadmap

- Packaged macOS and Windows installers
- More built-in companion collections
- Better multi-display positioning
- Optional startup at login
- Richer companion interactions
- Creator-friendly companion package guide

## License

Source code is released under the [MIT License](LICENSE). Companion assets may have separate licensing; see [ASSET_LICENSE.md](ASSET_LICENSE.md).

## Acknowledgements

PawPause is built with appreciation for two projects:

- [PawPal](https://github.com/zebangeth/PawPal), which provided the original Electron desktop companion foundation.
- [PetDex](https://github.com/crafter-station/petdex), which inspired the pixel companion package format and install workflow.

<details>
<summary><b>English Summary</b></summary>

PawPause is a cross-platform pixel desktop companion for macOS and Windows. It keeps a small animated companion on your screen, reminds you to take breaks and drink water, helps you stay focused, watches local Codex / Claude Code activity for actionable completion alerts, and supports PetDex-style companion packages.

You can import companions directly in PawPause, or install community companions with `npx petdex install <slug>`. PawPause scans both its own app data directory and `~/.codex/pets`.

</details>
