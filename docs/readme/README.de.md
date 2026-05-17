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

PawPause ist ein Pixel-Desktop-Begleiter für macOS und Windows. Er bleibt auf deinem Bildschirm, erinnert an Pausen und Wasser, schützt Fokuszeiten und unterstützt Figuren im PetDex-Format.

Local-first: Einstellungen, Statistiken, importierte Begleiter und Fokusverlauf bleiben auf deinem Rechner.

## Funktionen

- Transparenter, immer sichtbarer und verschiebbarer Pixel-Begleiter
- Pausenerinnerungen und optionaler Bildschirmblock
- Wassererinnerungen mit Verlauf
- Eigene tägliche Erinnerungen mit einstellbarem Countdown-Vorlauf und optionaler Vergrößerung beim Hinweis
- macOS-Ablenkungserkennung nach App oder Schlüsselwort
- Lokale Codex / Claude-Code / OpenCode / DeepSeek TUI / Hermes-Hinweise bei Abschluss oder Review-Bedarf
- Import von `pet.json + spritesheet.webp/png` Paketen
- Automatisches Lesen von PetDex-Figuren in `~/.codex/pets`
- Oberfläche in 9 Sprachen und System-Dunkelmodus

## Installation

Lade Installer unter [Releases](https://github.com/angziii/PawPause/releases) herunter.

| Datei | Plattform |
| --- | --- |
| `PawPause-x.x.x-mac-arm64.dmg` | macOS Apple Silicon |
| `PawPause-x.x.x-mac-x64.dmg` | macOS Intel |
| `PawPause-x.x.x-win-x64.exe` | Windows 64-bit |

## Hermes (WSL) ↔ PawPause (Windows)

Wenn Hermes in WSL läuft und PawPause unter Windows, muss Hermes die Events in einen Pfad schreiben, den die Windows-App lesen kann. Der aktuelle Hermes-Hook erledigt das automatisch. Falls trotzdem keine Hinweise erscheinen, setze den Pfad im WSL-Plugin fest.

```bash
nano ~/.hermes/plugins/pawpause-agent-hook/__init__.py
```

Ersetze die gesamte Funktion `_output_file()` durch:

```python
def _output_file() -> Path:
    # WSL -> Windows PawPause fallback.
    return Path("/mnt/c/Users/Administrator/.local/share/pawpause/agent-events/hermes.jsonl")
```

Wenn der Windows-Benutzername nicht `Administrator` ist, ersetze diesen Teil durch den echten Benutzernamen. Danach in WSL ausführen:

```bash
mkdir -p /mnt/c/Users/Administrator/.local/share/pawpause/agent-events
```

Starte Hermes anschließend neu.

## Aus dem Quellcode starten

```bash
git clone https://github.com/angziii/PawPause.git
cd PawPause
corepack enable
corepack pnpm install
corepack pnpm dev
```

Große Figurenpakete werden nicht mitgeliefert, damit das Repository klein bleibt. Importiere sie lokal oder installiere sie mit PetDex.
