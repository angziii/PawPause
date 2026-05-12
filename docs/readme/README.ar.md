<div dir="rtl">

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

PawPause هو رفيق سطح مكتب بأسلوب البكسل لنظامي macOS و Windows. يبقى على شاشتك، يذكرك بالاستراحة وشرب الماء، يساعدك على التركيز، ويدعم شخصيات بتنسيق PetDex.

يعتمد على نهج local-first: تبقى الإعدادات والإحصاءات والشخصيات المستوردة وسجل التركيز على جهازك.

## الميزات

- رفيق بكسل شفاف، دائم الظهور، وقابل للسحب
- تذكيرات الاستراحة مع خيار حجب الشاشة
- تذكيرات شرب الماء مع إحصاءات تاريخية
- كشف التشتت على macOS عبر التطبيقات أو الكلمات المفتاحية
- تنبيهات محلية لجلسات Codex / Claude Code / OpenCode عند الاكتمال أو الحاجة للمراجعة
- استيراد حزم `pet.json + spritesheet.webp/png`
- قراءة شخصيات PetDex من `~/.codex/pets` تلقائيًا
- واجهة بتسع لغات ودعم الوضع الداكن للنظام

## التثبيت

حمّل المثبتات من [Releases](https://github.com/angziii/PawPause/releases).

| الملف | النظام |
| --- | --- |
| `PawPause-x.x.x-mac-arm64.dmg` | macOS Apple Silicon |
| `PawPause-x.x.x-mac-x64.dmg` | macOS Intel |
| `PawPause-x.x.x-win-x64.exe` | Windows 64-bit |

## التشغيل من المصدر

```bash
git clone https://github.com/angziii/PawPause.git
cd PawPause
corepack enable
corepack pnpm install
corepack pnpm dev
```

لا يتم تضمين حزم الشخصيات الكبيرة في المستودع للحفاظ على حجمه صغيرًا. استوردها محليًا أو ثبّتها عبر PetDex.

</div>
