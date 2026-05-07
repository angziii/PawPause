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
- macOS 활성 창 감지를 통한 방해 알림
- Codex / Claude Code 로컬 세션 완료 알림
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

## 소스에서 실행

```bash
git clone https://github.com/angziii/PawPause.git
cd PawPause
corepack enable
corepack pnpm install
corepack pnpm dev
```

저장소 크기를 작게 유지하기 위해 큰 캐릭터 리소스 팩은 포함하지 않습니다. 로컬에서 가져오거나 PetDex로 설치하세요.
