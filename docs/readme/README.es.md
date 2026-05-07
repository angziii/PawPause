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

PawPause es un compañero de escritorio pixel art para macOS y Windows. Vive en tu pantalla, te recuerda descansar y beber agua, ayuda a proteger tus sesiones de enfoque y admite personajes con formato PetDex.

Es local-first: los ajustes, estadísticas, compañeros importados e historial de enfoque se quedan en tu equipo.

## Funciones

- Compañero pixelado transparente, siempre visible y arrastrable
- Recordatorios de descanso y modo opcional de bloqueo de pantalla
- Recordatorios de agua con estadísticas históricas
- Detección de distracciones en macOS por app o palabra clave
- Alertas locales de Codex / Claude Code al terminar o requerir revisión
- Importación de paquetes `pet.json + spritesheet.webp/png`
- Lectura automática de personajes PetDex en `~/.codex/pets`
- Interfaz en 9 idiomas y modo oscuro del sistema

## Instalación

Descarga instaladores desde [Releases](https://github.com/angziii/PawPause/releases).

| Archivo | Plataforma |
| --- | --- |
| `PawPause-x.x.x-mac-arm64.dmg` | macOS Apple Silicon |
| `PawPause-x.x.x-mac-x64.dmg` | macOS Intel |
| `PawPause-x.x.x-win-x64.exe` | Windows 64-bit |

## Ejecutar desde código fuente

```bash
git clone https://github.com/angziii/PawPause.git
cd PawPause
corepack enable
corepack pnpm install
corepack pnpm dev
```

Los paquetes grandes de personajes no se incluyen para mantener el repositorio pequeño. Impórtalos localmente o instálalos con PetDex.
