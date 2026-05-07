"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const repoUrl = "https://github.com/angziii/PawPause";
const latestReleaseUrl = `${repoUrl}/releases/latest`;
const petdexUrl = "https://petdex.crafter.run/zh";

const links = [
  { id: "download", href: latestReleaseUrl, primary: true },
  { id: "github", href: repoUrl },
  { id: "releases", href: latestReleaseUrl },
  { id: "petdex", href: petdexUrl },
];

type Language = "zh-CN" | "en" | "ja" | "ko" | "es" | "fr" | "de" | "ru" | "ar";

type LandingCopy = {
  dir?: "rtl";
  languageLabel: string;
  nav: Record<(typeof links)[number]["id"], string>;
  eyebrow: string;
  hero: string;
  localFirst: string;
  petdexLine1: string;
  petdexLine2: string;
  bubbles: string;
  release: string;
  prompts: string[];
};

const languageOptions: Array<{ value: Language; label: string }> = [
  { value: "zh-CN", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ru", label: "Русский" },
  { value: "ar", label: "العربية" },
];

const copies: Record<Language, LandingCopy> = {
  "zh-CN": {
    languageLabel: "语言",
    nav: { download: "下载", github: "GitHub", releases: "版本", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "让电子宠物住进桌面：提醒休息、喝水、保持专注，也能在 Codex / Claude Code / DeepSeek TUI 工作时给你动态提示。",
    localFirst: "本地优先，不需要账号。",
    petdexLine1: "兼容 Codex 宠物格式，",
    petdexLine2: "可前往 PetDex 社区下载。",
    bubbles: "v1.0.0 提供已公证的 macOS 包和更稳的气泡体验。",
    release: "Latest release: v1.0.0",
    prompts: [
      "Codex 正在思考",
      "Claude Code 正在调用工具",
      "Agent 正在执行脚本",
      "需要你做个选择",
      "需要权限才能继续",
      "有结果需要你确认",
      "休息一下，走一分钟",
      "喝口水再继续",
      "正在整理下一步",
      "工具结果回来了",
    ],
  },
  en: {
    languageLabel: "Language",
    nav: { download: "Download", github: "GitHub", releases: "Releases", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "A pixel companion for breaks, water, focus, and live Codex, Claude Code, and DeepSeek TUI activity nudges.",
    localFirst: "Local first. No account needed.",
    petdexLine1: "Compatible with the Codex pet format.",
    petdexLine2: "Download more from PetDex.",
    bubbles: "v1.0.0 ships notarized macOS builds and steadier message bubbles.",
    release: "Latest release: v1.0.0",
    prompts: [
      "Codex is thinking",
      "Claude Code is using a tool",
      "Agent is running a script",
      "Needs you to choose",
      "Permission needed",
      "Results need review",
      "Take a one-minute walk",
      "Drink some water",
      "Sorting out the next step",
      "Tool results are back",
    ],
  },
  ja: {
    languageLabel: "言語",
    nav: { download: "入手", github: "GitHub", releases: "リリース", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "休憩・水分補給・集中を支え、Codex / Claude Code の作業状況も知らせるピクセル相棒です。",
    localFirst: "ローカル優先。アカウント不要。",
    petdexLine1: "Codex ペット形式に対応。",
    petdexLine2: "追加キャラクターは PetDex コミュニティから入手できます。",
    bubbles: "Agent・休憩・水分補給の通知が吹き出しで出ます。",
    release: "Latest release: v1.0.0",
    prompts: [
      "Codex が考えています",
      "Claude Code がツールを使用中",
      "Agent がスクリプトを実行中",
      "選択が必要です",
      "権限が必要です",
      "結果の確認が必要です",
      "1分歩きましょう",
      "水を飲みましょう",
      "次の手順を整理中",
      "ツール結果が戻りました",
    ],
  },
  ko: {
    languageLabel: "언어",
    nav: { download: "다운로드", github: "GitHub", releases: "릴리스", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "휴식, 물 마시기, 집중을 돕고 Codex / Claude Code 작업 상태도 알려주는 픽셀 동반자입니다.",
    localFirst: "로컬 우선. 계정이 필요 없어요.",
    petdexLine1: "Codex 펫 형식과 호환됩니다.",
    petdexLine2: "PetDex 커뮤니티에서 더 받을 수 있어요.",
    bubbles: "Agent, 휴식, 물 알림이 말풍선으로 떠요.",
    release: "Latest release: v1.0.0",
    prompts: [
      "Codex 생각 중",
      "Claude Code 도구 사용 중",
      "Agent 스크립트 실행 중",
      "선택이 필요해요",
      "권한이 필요해요",
      "결과 확인이 필요해요",
      "1분만 걸어봐요",
      "물을 마셔요",
      "다음 단계를 정리 중",
      "도구 결과가 돌아왔어요",
    ],
  },
  es: {
    languageLabel: "Idioma",
    nav: { download: "Descargar", github: "GitHub", releases: "Versiones", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "Una mascota pixel para pausas, agua, concentración y avisos en vivo de Codex / Claude Code.",
    localFirst: "Primero local. Sin cuenta.",
    petdexLine1: "Compatible con el formato de mascotas de Codex.",
    petdexLine2: "Descarga más en PetDex.",
    bubbles: "Los avisos de Agent, pausa y agua aparecen en burbujas.",
    release: "Latest release: v1.0.0",
    prompts: [
      "Codex está pensando",
      "Claude Code usa una herramienta",
      "Agent ejecuta un script",
      "Necesita que elijas",
      "Necesita permiso",
      "Revisa los resultados",
      "Camina un minuto",
      "Bebe agua",
      "Ordenando el siguiente paso",
      "Volvieron los resultados",
    ],
  },
  fr: {
    languageLabel: "Langue",
    nav: { download: "Télécharger", github: "GitHub", releases: "Versions", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "Un compagnon pixel pour les pauses, l'eau, la concentration et les alertes Codex / Claude Code.",
    localFirst: "Local d'abord. Aucun compte requis.",
    petdexLine1: "Compatible avec le format de compagnon Codex.",
    petdexLine2: "Télécharge d'autres personnages sur PetDex.",
    bubbles: "Les alertes Agent, pause et eau apparaissent en bulles.",
    release: "Latest release: v1.0.0",
    prompts: [
      "Codex réfléchit",
      "Claude Code utilise un outil",
      "Agent exécute un script",
      "Un choix est nécessaire",
      "Autorisation requise",
      "Résultats à vérifier",
      "Marche une minute",
      "Bois de l'eau",
      "Prépare l'étape suivante",
      "Les résultats de l'outil sont là",
    ],
  },
  de: {
    languageLabel: "Sprache",
    nav: { download: "Download", github: "GitHub", releases: "Versionen", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "Ein Pixel-Begleiter für Pausen, Wasser, Fokus und Live-Hinweise von Codex / Claude Code.",
    localFirst: "Lokal zuerst. Kein Konto nötig.",
    petdexLine1: "Kompatibel mit dem Codex-Pet-Format.",
    petdexLine2: "Weitere Figuren gibt es bei PetDex.",
    bubbles: "Agent-, Pausen- und Wasserhinweise erscheinen als Blasen.",
    release: "Latest release: v1.0.0",
    prompts: [
      "Codex denkt nach",
      "Claude Code nutzt ein Tool",
      "Agent führt ein Skript aus",
      "Eine Auswahl ist nötig",
      "Berechtigung nötig",
      "Ergebnisse prüfen",
      "Geh eine Minute",
      "Trink Wasser",
      "Nächsten Schritt sortieren",
      "Tool-Ergebnisse sind zurück",
    ],
  },
  ru: {
    languageLabel: "Язык",
    nav: { download: "Скачать", github: "GitHub", releases: "Релизы", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "Пиксельный помощник для пауз, воды, фокуса и статусов Codex / Claude Code.",
    localFirst: "Локально в первую очередь. Аккаунт не нужен.",
    petdexLine1: "Совместим с форматом питомцев Codex.",
    petdexLine2: "Больше персонажей есть в PetDex.",
    bubbles: "Agent, паузы и вода появляются в пузырях.",
    release: "Latest release: v1.0.0",
    prompts: [
      "Codex думает",
      "Claude Code использует инструмент",
      "Agent запускает скрипт",
      "Нужно выбрать",
      "Нужно разрешение",
      "Проверь результаты",
      "Пройдись минуту",
      "Выпей воды",
      "Готовит следующий шаг",
      "Результаты инструмента готовы",
    ],
  },
  ar: {
    dir: "rtl",
    languageLabel: "اللغة",
    nav: { download: "تنزيل", github: "GitHub", releases: "الإصدارات", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "رفيق بكسل للتوقفات وشرب الماء والتركيز وتنبيهات Codex / Claude Code الحية.",
    localFirst: "محلي أولا. لا تحتاج حسابا.",
    petdexLine1: "متوافق مع تنسيق حيوانات Codex.",
    petdexLine2: "حمّل المزيد من مجتمع PetDex.",
    bubbles: "تظهر تنبيهات Agent والاستراحة والماء كفقاعات.",
    release: "Latest release: v1.0.0",
    prompts: [
      "Codex يفكر",
      "Claude Code يستخدم أداة",
      "Agent يشغل نصا",
      "يحتاج اختيارك",
      "يحتاج إذنا",
      "راجع النتائج",
      "امش دقيقة واحدة",
      "اشرب بعض الماء",
      "يرتب الخطوة التالية",
      "عادت نتائج الأداة",
    ],
  },
};

const PROMPT_COUNT = copies["zh-CN"].prompts.length;

function resolveLanguage(value: string | undefined): Language {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.startsWith("zh")) return "zh-CN";
  if (normalized.startsWith("ja")) return "ja";
  if (normalized.startsWith("ko")) return "ko";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("ar")) return "ar";
  return "en";
}

type PetDefinition = {
  slug: string;
  name: string;
  asset: string;
};

const pets: PetDefinition[] = [
  { slug: "duo", name: "Duo", asset: "/pets/duo.webp" },
  { slug: "lil-finder", name: "Lil Finder", asset: "/pets/lil-finder.webp" },
  { slug: "pingu", name: "Pingu", asset: "/pets/pingu.webp" },
  { slug: "shinchan", name: "Shinchan", asset: "/pets/shinchan.webp" },
  { slug: "clippy", name: "Clippy", asset: "/pets/clippy.webp" },
  { slug: "crab-buddy", name: "Crab Buddy", asset: "/pets/crab-buddy.webp" },
  { slug: "lando", name: "Lando", asset: "/pets/lando.webp" },
  { slug: "macintosh", name: "Macintosh", asset: "/pets/macintosh.webp" },
  { slug: "wall-e", name: "Wall-E", asset: "/pets/wall-e.webp" },
  { slug: "triple-t", name: "Triple T", asset: "/pets/triple-t.webp" },
];

export default function PetChaseLanding() {
  const reactionTimer = useRef<number | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [activePet, setActivePet] = useState<{ slug: string; promptIndex: number } | null>(null);
  const copy = copies[language];
  const [petdexPrefix, petdexSuffix] = copy.petdexLine2.split("PetDex");

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = copy.dir ?? "ltr";
  }, [copy.dir, language]);

  useEffect(() => {
    return () => {
      if (reactionTimer.current) window.clearTimeout(reactionTimer.current);
    };
  }, []);

  const reactToPet = (slug: string, index: number) => {
    if (reactionTimer.current) window.clearTimeout(reactionTimer.current);
    setActivePet({
      slug,
      promptIndex: (index * 2 + Math.floor(Math.random() * PROMPT_COUNT)) % PROMPT_COUNT,
    });
    reactionTimer.current = window.setTimeout(() => setActivePet(null), 2600);
  };

  return (
    <main className="page-shell" dir={copy.dir ?? "ltr"}>
      <section className="hero-stage" aria-label="PawPause interactive pet playground">
        <nav className="topbar" aria-label="PawPause links">
          {links.map((link) => (
            <a
              className={link.primary ? "nav-link nav-link--primary" : "nav-link"}
              href={link.href}
              key={link.id}
              target="_blank"
              rel="noreferrer"
            >
              {copy.nav[link.id]}
            </a>
          ))}
          <label className="language-picker">
            <span>{copy.languageLabel}</span>
            <select
              aria-label={copy.languageLabel}
              value={language}
              onChange={(event) => setLanguage(resolveLanguage(event.target.value))}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </nav>

        <div className="hero-copy">
          <h1>PawPause</h1>
          <p className="hero-text">{copy.hero}</p>
        </div>

        <div className="pet-grid" aria-label="Interactive PawPause pets">
          {pets.map((pet, index) => {
            const isActive = activePet?.slug === pet.slug;
            return (
              <button
                aria-label={`${pet.name}: ${copy.prompts[(index * 2) % copy.prompts.length]}`}
                className={isActive ? "pet-card is-reacting" : "pet-card"}
                key={pet.slug}
                onClick={() => reactToPet(pet.slug, index)}
                type="button"
              >
                <span className={isActive ? "pet-bubble is-visible" : "pet-bubble"}>
                  {copy.prompts[activePet?.promptIndex ?? (index * 2) % copy.prompts.length]}
                </span>
                <span
                  className="pet-sprite"
                  style={{ "--pet-image": `url(${pet.asset})` } as CSSProperties}
                />
                <span className="pet-name">{pet.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="info-strip" aria-label="PawPause highlights">
        <p>{copy.localFirst}</p>
        <p>
          <span className="petdex-lines">
            <span>{copy.petdexLine1}</span>
            <span>
              {petdexPrefix}
              <a className="inline-link" href={petdexUrl} target="_blank" rel="noreferrer">
                PetDex
              </a>
              {petdexSuffix}
            </span>
          </span>
        </p>
        <p>{copy.bubbles}</p>
      </section>

      <footer className="footer">
        <span>PawPause by angziii</span>
        <span>{copy.release}</span>
      </footer>
    </main>
  );
}
