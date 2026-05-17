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

PawPause는 macOS / Windows용 픽셀 데스크톱 동반자입니다. 화면 위에 작은 동반자를 띄워 휴식, 물 마시기, 집중을 도와주고 PetDex 형식 캐릭터를 가져올 수 있습니다.

로컬 우선입니다. 설정, 통계, 가져온 동반자, 집중 기록은 기기에만 저장됩니다.

## 기능

- 투명하고 항상 위에 있으며 드래그 가능한 픽셀 동반자
- 휴식 알림과 선택 가능한 화면 차단 휴식
- 물 마시기 알림과 기록 통계
- 사용자 지정 매일 알림: 카운트다운을 미리 표시할 시간과 알림 시 확대 비율 설정
- macOS 활성 창 감지를 통한 방해 알림
- Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes 로컬 세션 완료 알림
- `pet.json + spritesheet.webp/png` 패키지 가져오기
- `~/.codex/pets`의 PetDex 캐릭터 자동 감지
- 9개 언어 UI와 시스템 다크 모드 지원

## 설치

[Releases](https://github.com/angziii/PawPause/releases)에서 설치 파일을 다운로드하세요.

| 파일 | 플랫폼 |
| --- | --- |
| `PawPause-x.x.x-mac-arm64.dmg` | macOS Apple Silicon |
| `PawPause-x.x.x-mac-x64.dmg` | macOS Intel |
| `PawPause-x.x.x-win-x64.exe` | Windows 64-bit |

## Hermes(WSL) ↔ PawPause(Windows)

Hermes가 WSL에서 실행되고 PawPause가 Windows에서 실행되는 경우, Hermes 이벤트 파일은 Windows 쪽에서도 읽을 수 있는 경로에 써야 합니다. 최신 Hermes hook은 자동으로 처리하지만, 알림이 계속 오지 않으면 WSL plugin에서 경로를 고정하세요.

```bash
nano ~/.hermes/plugins/pawpause-agent-hook/__init__.py
```

`_output_file()` 전체를 다음으로 바꿉니다.

```python
def _output_file() -> Path:
    # WSL -> Windows PawPause fallback.
    return Path("/mnt/c/Users/Administrator/.local/share/pawpause/agent-events/hermes.jsonl")
```

Windows 사용자 이름이 `Administrator`가 아니면 실제 사용자 이름으로 바꿔 주세요. 그다음 WSL에서 실행합니다.

```bash
mkdir -p /mnt/c/Users/Administrator/.local/share/pawpause/agent-events
```

마지막으로 Hermes를 다시 시작하세요.

## 소스에서 실행

```bash
git clone https://github.com/angziii/PawPause.git
cd PawPause
corepack enable
corepack pnpm install
corepack pnpm dev
```

저장소 크기를 작게 유지하기 위해 큰 캐릭터 리소스 팩은 포함하지 않습니다. 로컬에서 가져오거나 PetDex로 설치하세요.
