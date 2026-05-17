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

PawPause — пиксельный настольный компаньон для macOS и Windows. Он остается на экране, напоминает о перерывах и воде, помогает сохранять фокус и поддерживает персонажей в формате PetDex.

Он работает по принципу local-first: настройки, статистика, импортированные компаньоны и история фокуса остаются на вашем компьютере.

## Возможности

- Прозрачный, закрепленный поверх окон и перетаскиваемый пиксельный компаньон
- Напоминания о перерывах и опциональная блокировка экрана
- Напоминания о воде и историческая статистика
- Пользовательские ежедневные напоминания с настраиваемым временем показа отсчета и опциональным увеличением персонажа при сигнале
- Определение отвлечений на macOS по приложениям или ключевым словам
- Локальные уведомления Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes о завершении или необходимости ревью
- Импорт пакетов `pet.json + spritesheet.webp/png`
- Автоматическое чтение PetDex-персонажей из `~/.codex/pets`
- Интерфейс на 9 языках и системная темная тема

## Установка

Скачайте установщики в [Releases](https://github.com/angziii/PawPause/releases).

| Файл | Платформа |
| --- | --- |
| `PawPause-x.x.x-mac-arm64.dmg` | macOS Apple Silicon |
| `PawPause-x.x.x-mac-x64.dmg` | macOS Intel |
| `PawPause-x.x.x-win-x64.exe` | Windows 64-bit |

## Hermes (WSL) ↔ PawPause (Windows)

Если Hermes работает в WSL, а PawPause работает в Windows, Hermes должен писать события в путь, который видит Windows-приложение. Новый Hermes hook делает это автоматически, но если уведомления все еще не появляются, зафиксируйте путь в WSL-плагине.

```bash
nano ~/.hermes/plugins/pawpause-agent-hook/__init__.py
```

Замените всю функцию `_output_file()` на:

```python
def _output_file() -> Path:
    # WSL -> Windows PawPause fallback.
    return Path("/mnt/c/Users/Administrator/.local/share/pawpause/agent-events/hermes.jsonl")
```

Если имя пользователя Windows не `Administrator`, замените его на реальное имя. Затем выполните в WSL:

```bash
mkdir -p /mnt/c/Users/Administrator/.local/share/pawpause/agent-events
```

После этого перезапустите Hermes.

## Запуск из исходников

```bash
git clone https://github.com/angziii/PawPause.git
cd PawPause
corepack enable
corepack pnpm install
corepack pnpm dev
```

Крупные пакеты персонажей не входят в репозиторий, чтобы он оставался небольшим. Импортируйте их локально или установите через PetDex.
