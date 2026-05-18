<p align="center">
  <img src="../social-preview.png" alt="PawPause" width="800" />
</p>

<h1 align="center">PawPause</h1>

<p align="center">
  <a href="../../README.md">English</a> ·
  <a href="README.zh-CN.md">中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.ar.md">العربية</a> ·
  <a href="README.es.md">Español</a>
</p>

PawPause 是一款 macOS / Windows 桌面陪伴应用。它让像素小伙伴常驻在屏幕上，提醒你休息、喝水、保持专注，并支持导入 PetDex 风格角色。

本地优先：设置、统计、导入的伙伴和专注历史都会留在你的机器上。

## 功能

- 透明、置顶、可拖动的像素桌宠
- 休息提醒和可选挡屏休息模式
- 喝水提醒和历史统计
- 自定义每日提醒：倒计时可设置提前多久显示，到点后可按比例放大桌宠
- macOS 分心检测：命中屏蔽应用或关键词时提醒
- Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes 本地会话完成提醒
- 应用内导入 `pet.json + spritesheet.webp/png` 角色包
- 自动读取 `~/.codex/pets` 中的 PetDex 角色
- 支持九种语言和系统深色模式

## 安装

从 [Releases](https://github.com/angziii/PawPause/releases) 下载：

| 文件 | 平台 |
| --- | --- |
| `PawPause-x.x.x-mac-arm64.dmg` | macOS Apple Silicon |
| `PawPause-x.x.x-mac-x64.dmg` | macOS Intel |
| `PawPause-x.x.x-win-x64.exe` | Windows 64-bit |

macOS 上分心检测和 Agent 窗口识别需要辅助功能权限。

## Hermes（WSL）连接 PawPause（Windows）

如果 Hermes 跑在 WSL 里、PawPause 跑在 Windows 上，Hermes 写事件的路径必须映射到 Windows 也能读到的位置。Windows 版 PawPause 会监听 `%APPDATA%\PawPause\agent-events\hermes.jsonl` 和 `%LOCALAPPDATA%\PawPause\agent-events\hermes.jsonl`，所以推荐在 WSL 里把 hook 输出指到其中一个挂载路径：

```bash
export PAWPAUSE_HERMES_AGENT_EVENTS="/mnt/c/Users/<WindowsUserName>/AppData/Roaming/PawPause/agent-events/hermes.jsonl"
mkdir -p "$(dirname "$PAWPAUSE_HERMES_AGENT_EVENTS")"
```

如果 Hermes 启动时没有读取这个环境变量，可以在 WSL 里硬编码事件路径：

```bash
nano ~/.hermes/plugins/pawpause-agent-hook/__init__.py
```

把 `_output_file()` 整个替换成：

```python
def _output_file() -> Path:
    # WSL -> Windows PawPause fallback.
    return Path("/mnt/c/Users/<WindowsUserName>/AppData/Roaming/PawPause/agent-events/hermes.jsonl")
```

把 `<WindowsUserName>` 换成真实 Windows 用户名。PawPause 也会监听 Local AppData 版本：

```text
/mnt/c/Users/<WindowsUserName>/AppData/Local/PawPause/agent-events/hermes.jsonl
```

如果不装 hook、只依赖 Hermes session fallback，需要把 WSL 的 `~/.hermes/sessions` 暴露成 Windows 可见的 junction 或软连接，例如在 PowerShell 里执行：

```powershell
New-Item -ItemType Junction -Path "$env:USERPROFILE\.hermes\sessions" -Target "\\wsl.localhost\Ubuntu\home\<WslUserName>\.hermes\sessions"
```

重启 Hermes 后，PawPause 就能从 Windows 侧读到同一个事件文件或 junction。

## 从源码运行

```bash
git clone https://github.com/angziii/PawPause.git
cd PawPause
corepack enable
corepack pnpm install
corepack pnpm dev
```

大型角色资源包不会提交到仓库，以保持软件仓库体积小。请在本机导入或通过 PetDex 安装角色。
