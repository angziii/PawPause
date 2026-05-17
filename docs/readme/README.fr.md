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

PawPause est un compagnon de bureau pixel art pour macOS et Windows. Il reste sur ton écran, te rappelle de faire des pauses et de boire de l'eau, protège tes sessions de concentration et prend en charge les personnages au format PetDex.

Il est local-first : les réglages, statistiques, compagnons importés et historique de concentration restent sur ta machine.

## Fonctionnalités

- Compagnon pixel transparent, toujours au premier plan et déplaçable
- Rappels de pause et mode optionnel de blocage d'écran
- Rappels d'hydratation avec statistiques historiques
- Rappels quotidiens personnalisés avec compte à rebours configurable et agrandissement optionnel du compagnon à l'alerte
- Détection des distractions sur macOS par app ou mot-clé
- Alertes locales Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes quand une session se termine ou demande une revue
- Import de paquets `pet.json + spritesheet.webp/png`
- Lecture automatique des personnages PetDex dans `~/.codex/pets`
- Interface en 9 langues et mode sombre système

## Installation

Télécharge les installateurs depuis [Releases](https://github.com/angziii/PawPause/releases).

| Fichier | Plateforme |
| --- | --- |
| `PawPause-x.x.x-mac-arm64.dmg` | macOS Apple Silicon |
| `PawPause-x.x.x-mac-x64.dmg` | macOS Intel |
| `PawPause-x.x.x-win-x64.exe` | Windows 64-bit |

## Hermes (WSL) ↔ PawPause (Windows)

Si Hermes tourne dans WSL et PawPause tourne sous Windows, Hermes doit écrire ses événements dans un chemin lisible par l'application Windows. Le hook Hermes récent le fait automatiquement, mais si les notifications n'apparaissent toujours pas, fixe le chemin directement dans le plugin WSL.

```bash
nano ~/.hermes/plugins/pawpause-agent-hook/__init__.py
```

Remplace toute la fonction `_output_file()` par :

```python
def _output_file() -> Path:
    # WSL -> Windows PawPause fallback.
    return Path("/mnt/c/Users/Administrator/.local/share/pawpause/agent-events/hermes.jsonl")
```

Si le nom d'utilisateur Windows n'est pas `Administrator`, remplace cette partie par le vrai nom. Puis exécute dans WSL :

```bash
mkdir -p /mnt/c/Users/Administrator/.local/share/pawpause/agent-events
```

Redémarre ensuite Hermes.

## Lancer depuis les sources

```bash
git clone https://github.com/angziii/PawPause.git
cd PawPause
corepack enable
corepack pnpm install
corepack pnpm dev
```

Les gros packs de personnages ne sont pas inclus afin de garder le dépôt léger. Importe-les localement ou installe-les avec PetDex.
