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

PawPause は macOS / Windows 向けのピクセルデスクトップ相棒です。画面上に小さな相棒を常駐させ、休憩、水分補給、集中をやさしく促し、PetDex 形式のキャラクターをインポートできます。

ローカルファーストです：設定、統計、インポートした相棒、集中履歴はあなたのマシン上に保存されます。

## 機能

- 透明、最前面、ドラッグ可能なピクセル相棒
- 休憩リマインダーと任意の画面ブロック休憩
- 水分補給リマインダーと履歴統計
- macOS のアクティブウィンドウ検出による気晴らし通知
- Codex / Claude Code / OpenCode のローカル完了通知
- `pet.json + spritesheet.webp/png` パッケージのインポート
- `~/.codex/pets` の PetDex キャラクターを自動読み込み
- 9 言語 UI とシステムのダークモード対応

## インストール

[Releases](https://github.com/angziii/PawPause/releases) からダウンロードしてください。

| ファイル | プラットフォーム |
| --- | --- |
| `PawPause-x.x.x-mac-arm64.dmg` | macOS Apple Silicon |
| `PawPause-x.x.x-mac-x64.dmg` | macOS Intel |
| `PawPause-x.x.x-win-x64.exe` | Windows 64-bit |

## ソースから実行

```bash
git clone https://github.com/angziii/PawPause.git
cd PawPause
corepack enable
corepack pnpm install
corepack pnpm dev
```

リポジトリを小さく保つため、大きなキャラクター素材パックは含めていません。ローカルでインポートまたは PetDex からインストールしてください。
