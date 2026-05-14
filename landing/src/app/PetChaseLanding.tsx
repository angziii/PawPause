"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const repoUrl = "https://github.com/angziii/PawPause";
const latestReleaseUrl = `${repoUrl}/releases/latest`;
const petdexUrl = "https://petdex.crafter.run/zh";
const latestVersion = "v1.0.6";
const starNudgeDurationMs = 8000;
const starNudgeDurationSeconds = starNudgeDurationMs / 1000;
const brandedAgentNames = ["Claude Code", "DeepSeek TUI", "OpenCode", "Hermes", "Codex"];
const brandedAgentPattern = /(Claude Code|DeepSeek TUI|OpenCode|Hermes|Codex)/g;

const links = [
  { id: "download", href: latestReleaseUrl, primary: true },
  { id: "github", href: repoUrl },
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
  downloadTitle: string;
  downloadSubtitle: string;
  downloadAll: string;
  closeDownload: string;
  starNudge: string;
  starNudgeCountdown: string;
  starNudgeAria: string;
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

const downloadOptions = [
  {
    title: "macOS Apple Silicon",
    meta: "M1 / M2 / M3 / M4 · DMG",
    href: `${repoUrl}/releases/download/${latestVersion}/PawPause-1.0.6-mac-arm64.dmg`,
  },
  {
    title: "macOS Intel",
    meta: "Intel Mac · DMG",
    href: `${repoUrl}/releases/download/${latestVersion}/PawPause-1.0.6-mac-x64.dmg`,
  },
  {
    title: "Windows",
    meta: "64-bit · EXE",
    href: `${repoUrl}/releases/download/${latestVersion}/PawPause-1.0.6-win-x64.exe`,
  },
  {
    title: "More builds",
    meta: "ZIP files and release notes",
    href: latestReleaseUrl,
  },
];

const copies: Record<Language, LandingCopy> = {
  "zh-CN": {
    languageLabel: "语言",
    nav: { download: "下载", github: "GitHub", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "让电子宠物住进桌面：提醒休息、喝水、保持专注、低电量充电提醒，也能在 Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes 工作时给你动态提示。",
    localFirst: "本地优先，不需要账号。",
    petdexLine1: "兼容 Codex 宠物格式，",
    petdexLine2: "可前往 PetDex 社区下载。",
    bubbles: "v1.0.6 新增低电量提醒、连续陪伴天数、GitHub 风格专注热力图、可调气泡时间和更多跑动方向。",
    release: "Latest release: v1.0.6",
    downloadTitle: "选择安装包",
    downloadSubtitle: "根据你的系统下载最新版本。",
    downloadAll: "查看全部 Release",
    closeDownload: "关闭下载弹窗",
    starNudge: "在 GitHub 点个星星支持我们吧。",
    starNudgeCountdown: "{seconds} 秒后收回",
    starNudgeAria: "打开 GitHub 给 PawPause 点星",
    prompts: [
      "Codex 正在思考",
      "Claude Code 正在调用工具",
      "OpenCode 正在执行脚本",
      "DeepSeek TUI 正在推理",
      "Hermes 正在执行脚本",
      "需要你做个选择",
      "需要权限才能继续",
      "有结果需要你确认",
      "休息一下，走一分钟",
      "喝口水再继续",
      "工具结果回来了",
    ],
  },
  en: {
    languageLabel: "Language",
    nav: { download: "Download", github: "GitHub", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "PawPause is a pixel desktop companion for macOS and Windows. It helps with breaks, water, focus, low-battery charging nudges, and live Codex, Claude Code, OpenCode, DeepSeek TUI, and Hermes activity.",
    localFirst: "Local first. No account needed.",
    petdexLine1: "Compatible with the Codex pet format.",
    petdexLine2: "Download more from PetDex.",
    bubbles: "v1.0.6 adds low-battery alerts, companion streak days, a GitHub-style focus heatmap, adjustable bubbles, and richer pet movement.",
    release: "Latest release: v1.0.6",
    downloadTitle: "Choose an installer",
    downloadSubtitle: "Download the latest build for your system.",
    downloadAll: "View all releases",
    closeDownload: "Close download dialog",
    starNudge: "Star us on GitHub to support PawPause.",
    starNudgeCountdown: "Retracts in {seconds}s",
    starNudgeAria: "Open GitHub to star PawPause",
    prompts: [
      "Codex is thinking",
      "Claude Code is using a tool",
      "OpenCode is running a script",
      "DeepSeek TUI is reasoning",
      "Hermes is running a script",
      "Needs you to choose",
      "Permission needed",
      "Results need review",
      "Take a one-minute walk",
      "Drink some water",
      "Tool results are back",
    ],
  },
  ja: {
    languageLabel: "言語",
    nav: { download: "入手", github: "GitHub", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "休憩・水分補給・集中を支え、Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes の作業状況も知らせるピクセル相棒です。",
    localFirst: "ローカル優先。アカウント不要。",
    petdexLine1: "Codex ペット形式に対応。",
    petdexLine2: "追加キャラクターは PetDex コミュニティから入手できます。",
    bubbles: "v1.0.6 では低電量通知、相棒の日数、集中ヒートマップ、吹き出し時間設定、移動方向の追加に対応しました。",
    release: "Latest release: v1.0.6",
    downloadTitle: "インストーラを選択",
    downloadSubtitle: "お使いの環境向けの最新版をダウンロード。",
    downloadAll: "すべてのリリースを見る",
    closeDownload: "ダウンロードダイアログを閉じる",
    starNudge: "GitHub で星をつけて応援してください。",
    starNudgeCountdown: "{seconds}秒で戻ります",
    starNudgeAria: "GitHub を開いて PawPause に星をつける",
    prompts: [
      "Codex が考えています",
      "Claude Code がツールを使用中",
      "OpenCode がスクリプトを実行中",
      "DeepSeek TUI が推論中",
      "Hermes がスクリプトを実行中",
      "選択が必要です",
      "権限が必要です",
      "結果の確認が必要です",
      "1分歩きましょう",
      "水を飲みましょう",
      "ツール結果が戻りました",
    ],
  },
  ko: {
    languageLabel: "언어",
    nav: { download: "다운로드", github: "GitHub", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "휴식, 물 마시기, 집중을 돕고 Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes 작업 상태도 알려주는 픽셀 동반자입니다.",
    localFirst: "로컬 우선. 계정이 필요 없어요.",
    petdexLine1: "Codex 펫 형식과 호환됩니다.",
    petdexLine2: "PetDex 커뮤니티에서 더 받을 수 있어요.",
    bubbles: "v1.0.6은 저전력 알림, 함께한 날, 집중 히트맵, 말풍선 시간 설정, 더 많은 이동 방향을 추가합니다.",
    release: "Latest release: v1.0.6",
    downloadTitle: "설치 파일 선택",
    downloadSubtitle: "시스템에 맞는 최신 버전을 다운로드하세요.",
    downloadAll: "모든 릴리스 보기",
    closeDownload: "다운로드 창 닫기",
    starNudge: "GitHub에서 별을 눌러 응원해 주세요.",
    starNudgeCountdown: "{seconds}초 후 접힘",
    starNudgeAria: "GitHub에서 PawPause에 별 주기",
    prompts: [
      "Codex 생각 중",
      "Claude Code 도구 사용 중",
      "OpenCode 스크립트 실행 중",
      "DeepSeek TUI 추론 중",
      "Hermes 스크립트 실행 중",
      "선택이 필요해요",
      "권한이 필요해요",
      "결과 확인이 필요해요",
      "1분만 걸어봐요",
      "물을 마셔요",
      "도구 결과가 돌아왔어요",
    ],
  },
  es: {
    languageLabel: "Idioma",
    nav: { download: "Descargar", github: "GitHub", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "Una mascota pixel para pausas, agua, concentración y avisos en vivo de Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes.",
    localFirst: "Primero local. Sin cuenta.",
    petdexLine1: "Compatible con el formato de mascotas de Codex.",
    petdexLine2: "Descarga más en PetDex.",
    bubbles: "v1.0.6 agrega alerta de batería baja, días de compañía, mapa de enfoque, duración de globos y más direcciones.",
    release: "Latest release: v1.0.6",
    downloadTitle: "Elige un instalador",
    downloadSubtitle: "Descarga la version mas reciente para tu sistema.",
    downloadAll: "Ver todas las versiones",
    closeDownload: "Cerrar dialogo de descarga",
    starNudge: "Danos una estrella en GitHub para apoyarnos.",
    starNudgeCountdown: "Se cierra en {seconds}s",
    starNudgeAria: "Abrir GitHub para dar una estrella a PawPause",
    prompts: [
      "Codex está pensando",
      "Claude Code usa una herramienta",
      "OpenCode ejecuta un script",
      "DeepSeek TUI está razonando",
      "Hermes ejecuta un script",
      "Necesita que elijas",
      "Necesita permiso",
      "Revisa los resultados",
      "Camina un minuto",
      "Bebe agua",
      "Volvieron los resultados",
    ],
  },
  fr: {
    languageLabel: "Langue",
    nav: { download: "Télécharger", github: "GitHub", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "Un compagnon pixel pour les pauses, l'eau, la concentration et les alertes Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes.",
    localFirst: "Local d'abord. Aucun compte requis.",
    petdexLine1: "Compatible avec le format de compagnon Codex.",
    petdexLine2: "Télécharge d'autres personnages sur PetDex.",
    bubbles: "v1.0.6 ajoute l'alerte batterie faible, les jours ensemble, la carte de concentration, la durée des bulles et plus de directions.",
    release: "Latest release: v1.0.6",
    downloadTitle: "Choisir un installateur",
    downloadSubtitle: "Telecharge la derniere version pour ton systeme.",
    downloadAll: "Voir toutes les versions",
    closeDownload: "Fermer la fenetre de telechargement",
    starNudge: "Ajoute une étoile sur GitHub pour nous soutenir.",
    starNudgeCountdown: "Se replie dans {seconds}s",
    starNudgeAria: "Ouvrir GitHub pour ajouter une étoile à PawPause",
    prompts: [
      "Codex réfléchit",
      "Claude Code utilise un outil",
      "OpenCode exécute un script",
      "DeepSeek TUI raisonne",
      "Hermes exécute un script",
      "Un choix est nécessaire",
      "Autorisation requise",
      "Résultats à vérifier",
      "Marche une minute",
      "Bois de l'eau",
      "Les résultats de l'outil sont là",
    ],
  },
  de: {
    languageLabel: "Sprache",
    nav: { download: "Download", github: "GitHub", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "Ein Pixel-Begleiter für Pausen, Wasser, Fokus und Live-Hinweise von Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes.",
    localFirst: "Lokal zuerst. Kein Konto nötig.",
    petdexLine1: "Kompatibel mit dem Codex-Pet-Format.",
    petdexLine2: "Weitere Figuren gibt es bei PetDex.",
    bubbles: "v1.0.6 bringt Akkuwarnungen, Begleittage, Fokus-Heatmap, einstellbare Blasen und mehr Bewegungsrichtungen.",
    release: "Latest release: v1.0.6",
    downloadTitle: "Installer wahlen",
    downloadSubtitle: "Lade die neueste Version fur dein System herunter.",
    downloadAll: "Alle Versionen ansehen",
    closeDownload: "Download-Dialog schliessen",
    starNudge: "Gib uns auf GitHub einen Stern zur Unterstützung.",
    starNudgeCountdown: "Zieht sich in {seconds}s zurück",
    starNudgeAria: "GitHub öffnen, um PawPause einen Stern zu geben",
    prompts: [
      "Codex denkt nach",
      "Claude Code nutzt ein Tool",
      "OpenCode führt ein Skript aus",
      "DeepSeek TUI denkt nach",
      "Hermes führt ein Skript aus",
      "Eine Auswahl ist nötig",
      "Berechtigung nötig",
      "Ergebnisse prüfen",
      "Geh eine Minute",
      "Trink Wasser",
      "Tool-Ergebnisse sind zurück",
    ],
  },
  ru: {
    languageLabel: "Язык",
    nav: { download: "Скачать", github: "GitHub", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "Пиксельный помощник для пауз, воды, фокуса и статусов Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes.",
    localFirst: "Локально в первую очередь. Аккаунт не нужен.",
    petdexLine1: "Совместим с форматом питомцев Codex.",
    petdexLine2: "Больше персонажей есть в PetDex.",
    bubbles: "v1.0.6 добавляет предупреждение о батарее, дни вместе, карту фокуса, время подсказок и новые направления.",
    release: "Latest release: v1.0.6",
    downloadTitle: "Выберите установщик",
    downloadSubtitle: "Скачайте последнюю версию для вашей системы.",
    downloadAll: "Все релизы",
    closeDownload: "Закрыть окно загрузки",
    starNudge: "Поставьте звезду на GitHub, чтобы поддержать нас.",
    starNudgeCountdown: "Свернется через {seconds} с",
    starNudgeAria: "Открыть GitHub и поставить звезду PawPause",
    prompts: [
      "Codex думает",
      "Claude Code использует инструмент",
      "OpenCode запускает скрипт",
      "DeepSeek TUI рассуждает",
      "Hermes запускает скрипт",
      "Нужно выбрать",
      "Нужно разрешение",
      "Проверь результаты",
      "Пройдись минуту",
      "Выпей воды",
      "Результаты инструмента готовы",
    ],
  },
  ar: {
    dir: "rtl",
    languageLabel: "اللغة",
    nav: { download: "تنزيل", github: "GitHub", petdex: "PetDex" },
    eyebrow: "Interactive desktop companion",
    hero: "رفيق بكسل للتوقفات وشرب الماء والتركيز وتنبيهات Codex / Claude Code / OpenCode / DeepSeek TUI / Hermes الحية.",
    localFirst: "محلي أولا. لا تحتاج حسابا.",
    petdexLine1: "متوافق مع تنسيق حيوانات Codex.",
    petdexLine2: "حمّل المزيد من مجتمع PetDex.",
    bubbles: "يضيف v1.0.6 تنبيه البطارية وأيام الرفقة وخريطة التركيز ومدة الفقاعات واتجاهات حركة أكثر.",
    release: "Latest release: v1.0.6",
    downloadTitle: "اختر المثبت",
    downloadSubtitle: "حمّل أحدث نسخة لنظامك.",
    downloadAll: "عرض كل الإصدارات",
    closeDownload: "إغلاق نافذة التنزيل",
    starNudge: "ادعمنا بنجمة على GitHub.",
    starNudgeCountdown: "ينسحب خلال {seconds} ث",
    starNudgeAria: "افتح GitHub لمنح PawPause نجمة",
    prompts: [
      "Codex يفكر",
      "Claude Code يستخدم أداة",
      "OpenCode يشغل نصا",
      "DeepSeek TUI يفكر",
      "Hermes يشغل نصا",
      "يحتاج اختيارك",
      "يحتاج إذنا",
      "راجع النتائج",
      "امش دقيقة واحدة",
      "اشرب بعض الماء",
      "عادت نتائج الأداة",
    ],
  },
};

const PROMPT_COUNT = copies["zh-CN"].prompts.length;

function renderBrandedText(text: string): ReactNode[] {
  return text.split(brandedAgentPattern).map((part, index) =>
    brandedAgentNames.includes(part) ? (
      <span className="logo-word" key={`${part}-${index}`}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

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
  const topbarRef = useRef<HTMLElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isStarNudgeVisible, setIsStarNudgeVisible] = useState(false);
  const [starNudgeSeconds, setStarNudgeSeconds] = useState(starNudgeDurationSeconds);
  const [starCountLabel, setStarCountLabel] = useState("...");
  const [activePet, setActivePet] = useState<{ slug: string; promptIndex: number } | null>(null);
  const copy = copies[language];
  const starNudgeCountdown = copy.starNudgeCountdown.replace("{seconds}", String(starNudgeSeconds));
  const [petdexPrefix, petdexSuffix] = copy.petdexLine2.split("PetDex");
  const primaryMobileLinks = links.filter((link) => link.id === "github" || link.id === "petdex");
  const secondaryMobileLinks = links.filter((link) => link.id !== "github" && link.id !== "petdex");

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = copy.dir ?? "ltr";
  }, [copy.dir, language]);

  useEffect(() => {
    return () => {
      if (reactionTimer.current) window.clearTimeout(reactionTimer.current);
    };
  }, []);

  useEffect(() => {
    const duration = starNudgeDurationMs;
    const startedAt = Date.now();
    setIsStarNudgeVisible(true);
    setStarNudgeSeconds(starNudgeDurationSeconds);

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((duration - (Date.now() - startedAt)) / 1000));
      setStarNudgeSeconds(remaining);

      if (remaining <= 0) {
        setIsStarNudgeVisible(false);
        window.clearInterval(timer);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let timer: number | null = null;

    const loadStars = async () => {
      try {
        const response = await fetch("https://api.github.com/repos/angziii/PawPause", {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) return;
        const data = (await response.json()) as { stargazers_count?: number };
        const count = data.stargazers_count;
        if (isCancelled || typeof count !== "number") return;
        const label = new Intl.NumberFormat("en", { notation: "compact" }).format(count);
        setStarCountLabel(label);
      } catch {
        if (!isCancelled) setStarCountLabel("...");
      }
      if (!isCancelled) {
        timer = window.setTimeout(loadStars, 60000);
      }
    };

    void loadStars();
    return () => {
      isCancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isLanguageMenuOpen && !isMobileNavOpen) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (topbarRef.current && !topbarRef.current.contains(target)) {
        setIsMobileNavOpen(false);
        setIsLanguageMenuOpen(false);
        return;
      }
      if (isLanguageMenuOpen && languageMenuRef.current && !languageMenuRef.current.contains(target)) {
        setIsLanguageMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
        setIsLanguageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isLanguageMenuOpen, isMobileNavOpen]);

  useEffect(() => {
    if (!isDownloadOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDownloadOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isDownloadOpen]);

  const openDownloadDialog = () => {
    setIsDownloadOpen(true);
    setIsMobileNavOpen(false);
    setIsLanguageMenuOpen(false);
  };

  const renderLanguagePicker = (extraClassName = "") => (
    <div className={`language-picker ${extraClassName}`.trim()} ref={languageMenuRef}>
      <button
        type="button"
        className="language-trigger"
        aria-haspopup="listbox"
        aria-expanded={isLanguageMenuOpen}
        aria-label={copy.languageLabel}
        onClick={() => setIsLanguageMenuOpen((open) => !open)}
      >
        <span>{copy.languageLabel}</span>
        <span className="language-current">
          {languageOptions.find((option) => option.value === language)?.label ?? language}
        </span>
        <span className={isLanguageMenuOpen ? "language-caret is-open" : "language-caret"}>▾</span>
      </button>
      <ul
        className={isLanguageMenuOpen ? "language-menu is-open" : "language-menu"}
        role="listbox"
        aria-label={copy.languageLabel}
      >
        {languageOptions.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              role="option"
              aria-selected={option.value === language}
              className={option.value === language ? "language-option is-active" : "language-option"}
              onClick={() => {
                setLanguage(resolveLanguage(option.value));
                setIsLanguageMenuOpen(false);
                setIsMobileNavOpen(false);
              }}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

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
      <a
        aria-hidden={!isStarNudgeVisible}
        aria-label={copy.starNudgeAria}
        className={isStarNudgeVisible ? "star-nudge is-visible" : "star-nudge"}
        href={repoUrl}
        rel="noreferrer"
        target="_blank"
        tabIndex={isStarNudgeVisible ? 0 : -1}
      >
        <span className="star-nudge__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path
              d="M12 .5a12 12 0 0 0-3.79 23.39c.6.1.82-.25.82-.57l-.01-2.01c-3.34.72-4.04-1.42-4.04-1.42-.55-1.37-1.33-1.73-1.33-1.73-1.1-.74.08-.73.08-.73 1.21.09 1.85 1.22 1.85 1.22 1.08 1.82 2.83 1.3 3.52.99.11-.77.42-1.3.77-1.59-2.67-.3-5.47-1.31-5.47-5.82 0-1.28.46-2.33 1.22-3.15-.12-.3-.53-1.52.11-3.16 0 0 .99-.31 3.24 1.2a11.3 11.3 0 0 1 5.9 0c2.25-1.51 3.24-1.2 3.24-1.2.64 1.64.23 2.86.11 3.16.76.82 1.22 1.87 1.22 3.15 0 4.52-2.8 5.51-5.48 5.81.43.37.82 1.09.82 2.2l-.01 3.26c0 .32.22.68.83.57A12 12 0 0 0 12 .5Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="star-nudge__body">
          <span className="star-nudge__message">{copy.starNudge}</span>
          <span className="star-nudge__countdown" aria-live="polite">
            {starNudgeCountdown}
          </span>
        </span>
        <span className="star-nudge__meter" aria-hidden="true" />
      </a>
      <section className="hero-stage" aria-label="PawPause interactive pet playground">
        <nav className="topbar" aria-label="PawPause links" ref={topbarRef}>
          <div className="desktop-nav-links">
            {links.map((link) =>
              link.id === "download" ? (
                <button
                  aria-haspopup="dialog"
                  className="nav-link nav-link--primary"
                  key={link.id}
                  onClick={openDownloadDialog}
                  type="button"
                >
                  {copy.nav[link.id]}
                </button>
              ) : (
                <a
                  className="nav-link"
                  href={link.href}
                  key={link.id}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.id === "github" ? `${copy.nav[link.id]} stars ${starCountLabel}` : undefined}
                >
                {link.id === "github" ? (
                  <span className="github-inline-stars" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="github-inline-logo" focusable="false">
                      <path
                        d="M12 .5a12 12 0 0 0-3.79 23.39c.6.1.82-.25.82-.57l-.01-2.01c-3.34.72-4.04-1.42-4.04-1.42-.55-1.37-1.33-1.73-1.33-1.73-1.1-.74.08-.73.08-.73 1.21.09 1.85 1.22 1.85 1.22 1.08 1.82 2.83 1.3 3.52.99.11-.77.42-1.3.77-1.59-2.67-.3-5.47-1.31-5.47-5.82 0-1.28.46-2.33 1.22-3.15-.12-.3-.53-1.52.11-3.16 0 0 .99-.31 3.24 1.2a11.3 11.3 0 0 1 5.9 0c2.25-1.51 3.24-1.2 3.24-1.2.64 1.64.23 2.86.11 3.16.76.82 1.22 1.87 1.22 3.15 0 4.52-2.8 5.51-5.48 5.81.43.37.82 1.09.82 2.2l-.01 3.26c0 .32.22.68.83.57A12 12 0 0 0 12 .5Z"
                        fill="currentColor"
                      />
                    </svg>
                    <svg viewBox="0 0 24 24" className="github-inline-star-icon" focusable="false">
                      <path
                        d="M12 3.2 14.89 9l6.41.93-4.65 4.52 1.1 6.39L12 17.8l-5.75 3.04 1.1-6.39L2.7 9.93 9.11 9 12 3.2Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>{starCountLabel}</span>
                  </span>
                ) : (
                  copy.nav[link.id]
                )}
                </a>
              ),
            )}
            {renderLanguagePicker()}
          </div>
          <div className="mobile-nav">
            <div className="mobile-nav-row">
              {primaryMobileLinks.map((link) => (
                <a
                  className={
                    link.primary
                      ? "nav-link nav-link--primary"
                      : link.id === "github"
                        ? "nav-link mobile-star-link"
                        : "nav-link"
                  }
                  href={link.href}
                  key={link.id}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.id === "github" ? (
                    <span className="github-inline-stars" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="github-inline-logo" focusable="false">
                        <path
                          d="M12 .5a12 12 0 0 0-3.79 23.39c.6.1.82-.25.82-.57l-.01-2.01c-3.34.72-4.04-1.42-4.04-1.42-.55-1.37-1.33-1.73-1.33-1.73-1.1-.74.08-.73.08-.73 1.21.09 1.85 1.22 1.85 1.22 1.08 1.82 2.83 1.3 3.52.99.11-.77.42-1.3.77-1.59-2.67-.3-5.47-1.31-5.47-5.82 0-1.28.46-2.33 1.22-3.15-.12-.3-.53-1.52.11-3.16 0 0 .99-.31 3.24 1.2a11.3 11.3 0 0 1 5.9 0c2.25-1.51 3.24-1.2 3.24-1.2.64 1.64.23 2.86.11 3.16.76.82 1.22 1.87 1.22 3.15 0 4.52-2.8 5.51-5.48 5.81.43.37.82 1.09.82 2.2l-.01 3.26c0 .32.22.68.83.57A12 12 0 0 0 12 .5Z"
                          fill="currentColor"
                        />
                      </svg>
                      <svg viewBox="0 0 24 24" className="github-inline-star-icon" focusable="false">
                        <path
                          d="M12 3.2 14.89 9l6.41.93-4.65 4.52 1.1 6.39L12 17.8l-5.75 3.04 1.1-6.39L2.7 9.93 9.11 9 12 3.2Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>{starCountLabel}</span>
                    </span>
                  ) : (
                    copy.nav[link.id]
                  )}
                </a>
              ))}
              <button
                type="button"
                className={isMobileNavOpen ? "mobile-nav-toggle is-open" : "mobile-nav-toggle"}
                aria-label="Toggle more links"
                aria-expanded={isMobileNavOpen}
                onClick={() => {
                  setIsMobileNavOpen((open) => !open);
                  setIsLanguageMenuOpen(false);
                }}
              >
                ▾
              </button>
            </div>
            <div className={isMobileNavOpen ? "mobile-nav-panel is-open" : "mobile-nav-panel"}>
              {secondaryMobileLinks.map((link) =>
                link.id === "download" ? (
                  <button
                    aria-haspopup="dialog"
                    className="mobile-panel-link mobile-panel-button"
                    key={link.id}
                    onClick={openDownloadDialog}
                    type="button"
                  >
                    {copy.nav[link.id]}
                  </button>
                ) : (
                  <a
                    className="mobile-panel-link"
                    href={link.href}
                    key={link.id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {copy.nav[link.id]}
                  </a>
                ),
              )}
              {renderLanguagePicker("language-picker--panel")}
            </div>
          </div>
        </nav>

        <div className="hero-copy">
          <h1>PawPause</h1>
          <p className="hero-text">{renderBrandedText(copy.hero)}</p>
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
                  {renderBrandedText(copy.prompts[activePet?.promptIndex ?? (index * 2) % copy.prompts.length])}
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
        <div className="footer-brand">
          <span>PawPause by angziii</span>
          <span>{copy.release}</span>
        </div>
        <nav className="footer-links" aria-label="PawPause trust and support links">
          <a href="/about">About</a>
          <a href="/support">Support</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </footer>

      {isDownloadOpen ? (
        <div className="download-layer" role="presentation" onMouseDown={() => setIsDownloadOpen(false)}>
          <div
            aria-labelledby="download-title"
            aria-modal="true"
            className="download-dialog"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label={copy.closeDownload}
              className="download-close"
              onClick={() => setIsDownloadOpen(false)}
              type="button"
            >
              ×
            </button>
            <div className="download-dialog__header">
              <p>{latestVersion}</p>
              <h2 id="download-title">{copy.downloadTitle}</h2>
              <span>{copy.downloadSubtitle}</span>
            </div>
            <div className="download-options">
              {downloadOptions.map((option) => (
                <a
                  className="download-option"
                  href={option.href}
                  key={option.title}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{option.title}</span>
                  <small>{option.meta}</small>
                </a>
              ))}
            </div>
            <a className="download-all" href={latestReleaseUrl} target="_blank" rel="noreferrer">
              {copy.downloadAll}
            </a>
          </div>
        </div>
      ) : null}
    </main>
  );
}
