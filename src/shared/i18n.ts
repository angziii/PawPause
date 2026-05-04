import type { Language } from "./types";

export const LANGUAGE_OPTIONS: Array<{ value: Language; label: string }> = [
  { value: "zh-CN", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
  { value: "de", label: "Deutsch" },
  { value: "ru", label: "Русский" }
];

export function resolveLanguage(value: unknown): Language {
  return value === "en" ||
    value === "ja" ||
    value === "ko" ||
    value === "es" ||
    value === "fr" ||
    value === "ar" ||
    value === "de" ||
    value === "ru"
    ? value
    : "zh-CN";
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const CORE_I18N = {
  "zh-CN": {
    bubble: {
      woof: ["woof!", "汪！", "汪汪~"],
      breakReminder: [
        "坐太久啦，去走一分钟吧",
        "我想和你玩儿一会儿，去走一分钟吧",
        "坐了好久了……去走一分钟吧！",
        "我想玩儿了，去走一分钟吧"
      ],
      breakDone: [
        "好耶！摇尾巴~",
        "耶耶耶 好喜欢你",
        "开心！"
      ],
      breakRun: [
        (seconds: number) => `我还要玩 ${seconds} 秒！快离开屏幕~`,
        (seconds: number) => `倒计时 ${seconds} 秒，别偷偷回来哦`,
        (seconds: number) => `${seconds} 秒！`
      ],
      breakRunComplete: [
        "玩够啦，回来陪你坐会儿~",
        "回来啦！我在等你呢",
        "休息完毕，蹲好了~"
      ],
      breakIgnore: [
        "好吧……但我会担心你的",
        "呜……那你下次一定站起来",
        "好吧，我先趴着等你……"
      ],
      hydrationReminder: [
        "我有点渴了……你也喝口水吧？",
        "想喝水了！你也来一口嘛",
        "舔舔嘴……该喝水啦",
        "水碗空了！你的杯子呢？"
      ],
      hydrationDone: [
        "咕嘟咕嘟，舒服~",
        "喝饱啦！",
        "汪，水真好喝"
      ],
      focusStart: [
        (minutes: number) => `好，我帮你看着这 ${minutes} 分钟！`,
        (minutes: number) => `专心${minutes} 分钟，我盯着`
      ],
      focusWarning: [
        (rule: string) => `说好专注的，不许看 ${rule}`,
        (rule: string) => `走神啦！${rule} 不能玩`,
        (rule: string) => `你怎么在偷偷看 ${rule} 了`,
      ],
      focusComplete: [
        "专心时间到！",
        "专心结束！摇尾巴~",
      ],
      focusCancelled: [
        "好，我陪你歇会儿",
        "收工！我趴下啦"
      ],
      focusBack: [
        "好，我继续盯着~",
        "嗯！回去干活吧",
        "我也继续专心啦"
      ],
      agentDone: [
        "你的 Agent 好像完成啦，去看一眼吧",
        "Codex/Claude 那边可能收工了",
        "工作结果出来啦，看看要不要接着处理"
      ]
    },
    actions: {
      breakDone: "我站起来了",
      breakRunDone: "我回来了",
      breakSnooze: "10 分钟后提醒",
      breakMute: "今天先别管我",
      hydrationDone: "我喝水了",
      hydrationSnooze: "稍后提醒",
      focusBack: "回去工作",
      focusEnd: "结束专注"
    },
    menu: {
      showDog: "显示小伙伴",
      hideDog: "隐藏小伙伴",
      startFocusMode: "开始专注模式",
      stopFocusMode: "停止专注模式",
      demoBreakReminder: "演示：休息提醒",
      demoHydrationReminder: "演示：喝水提醒",
      demoFocusWarning: "演示：分心提醒",
      demoHappyReaction: "演示：开心反馈",
      settings: "设置",
      resetToday: "重置今日",
      quit: "退出"
    },
    settings: {
      title: "设置",
      welcomeTitle: "欢迎使用 PawPause",
      welcomeCopy:
        "PawPause 会住在菜单栏和屏幕底部，定时提醒你休息、喝水和保持专注。分心检测目前仅支持 macOS，需要在系统设置里允许辅助功能权限。",
      dismissWelcome: "知道了",
      appearance: "外观",
      quickActions: "快捷操作",
      testTools: "测试工具",
      language: "语言",
      petAppearance: "宠物形象",
      petSize: "形象大小",
      petMotion: "形象动作",
      enablePetRoam: "自动跑动",
      petRoamDirection: "跑动方向",
      petRoamDirectionBoth: "左右随机",
      petRoamDirectionLeft: "向左",
      petRoamDirectionRight: "向右",
      petRoamFrequency: "跑动频率",
      petRoamDuration: "跑动时长",
      petIdleMotionFrequency: "原地动作频率",
      importPet: "导入宠物包",
      importPetHint:
        "支持 pet.json + spritesheet.webp/png 的文件夹或 zip。应用内导入会保存到 PawPause 数据目录；现有 npx petdex install 写入的 ~/.codex/pets 也会自动读取。",
      importPetSuccess: "已导入宠物到 PawPause 数据目录",
      importPetError: "导入失败",
      screenBlock: "挡屏休息",
      enableScreenBlock: "休息时放大挡屏",
      screenBlockDuration: "挡屏时长",
      screenBlockCoverage: "挡屏比例",
      reminders: "提醒",
      enableBreakReminder: "开启休息提醒",
      breakInterval: "休息间隔",
      enableHydrationReminder: "开启喝水提醒",
      hydrationInterval: "喝水间隔",
      focus: "专注",
      focusDuration: "专注时长",
      enableAgentActivity: "Agent 完成提醒",
      enableDistractionDetection: "开启分心检测",
      detectionGrace: "检测宽限时间",
      blockedApps: "屏蔽应用",
      blockedKeywords: "屏蔽关键词",
      today: "今日",
      statsRangeDay: "一天",
      statsRangeMonth: "一个月",
      statsRangeAll: "全部",
      statsHeading: "统计",
      breaks: "休息",
      waters: "喝水",
      focusMin: "专注",
      warnings: "分心",
      minuteUnit: "分钟",
      secondUnit: "秒",
      countUnit: "次",
      addListItem: "添加…",
      removeListItem: (entry: string) => `移除 ${entry}`,
      runtime: "运行状态",
      state: "状态",
      mode: "模式",
      reminder: "提醒",
      dog: "小伙伴",
      distraction: "分心检测",
      status: "状态",
      statusIdle: "未运行",
      statusWatching: "检测中",
      statusPermissionNeeded: "需要权限",
      statusUnsupported: "当前系统不支持",
      statusError: "检测异常",
      matched: "命中",
      app: "应用",
      checked: "检查时间",
      timers: "计时器",
      break: "休息",
      water: "喝水",
      focusEnd: "专注结束",
      updated: "更新",
      demo: "演示",
      demoBreak: "休息",
      demoWater: "喝水",
      demoFocusWarning: "分心提醒",
      demoHappy: "开心",
      resetToday: "重置今日",
      startFocus: "开始专注",
      stopFocus: "停止专注",
      diagnostics: "诊断信息",
      preloadUnavailable: "Preload 不可用",
      preloadCopy:
        "Electron preload 没有注入，桌宠控制接口暂时不可用。请重启 pnpm dev，或检查 preload 路径和 sandbox 设置。",
      off: "关闭",
      now: "现在",
      never: "从未",
      none: "无",
      visible: "显示",
      hidden: "隐藏",
      idle: "空闲",
      noActiveWindowTitle: "还没有捕获到当前窗口标题。",
      detectionOffHelp: "分心检测已关闭。开启后保存，即可预览当前活动窗口。",
      detectionWaitingHelp: "正在等待第一次活动窗口检查。",
      detectionPermissionHelp:
        "需要在系统设置里允许 PawPause 获取辅助功能权限（macOS），然后重启应用或重新开启分心检测。",
      detectionUnsupportedHelp: "当前系统暂不支持活动窗口检测，分心检测会保持关闭状态。",
      detectionErrorHelp: "活动窗口检测暂时失败。请检查权限后，重新开启分心检测或重启应用。",
      detectionPreviewHelp: "正在预览当前活动窗口。开始专注后，命中规则会触发分心提醒。",
      detectionFocusHelp: "专注期间正在检测。命中屏蔽应用或关键词会触发分心提醒。",
      agentActivityHelp: "监听 Codex 和 Claude Code 的本地会话事件，只在完成、失败或需要处理时提醒。"
    },
    system: {
      unsupportedDistraction: "分心检测目前仅支持 macOS。"
    }
  },
  en: {
    bubble: {
      woof: ["woof!", "bark bark!", "arf~"],
      breakReminder: [
        "You've been sitting too long, walk for a minute!",
        "I wanna play with you~ walk for a minute!",
        "Sitting for so long… go walk for a minute!",
        "I wanna play! Walk for a minute~"
      ],
      breakDone: [
        "Yay! *tail wag*",
        "Yay yay yay I like you so much",
        "Happy!"
      ],
      breakRun: [
        (seconds: number) => `I still wanna play for ${seconds}s! Get away from the screen~`,
        (seconds: number) => `${seconds}s left, no sneaking back!`,
        (seconds: number) => `${seconds}s!`
      ],
      breakRunComplete: [
        "Done playing~ sitting back down with you",
        "I'm back! Was waiting for you~",
        "Break's over, all settled down~"
      ],
      breakIgnore: [
        "Okay… but I'll worry about you",
        "Hmm… you have to stand up next time",
        "Fine, I'll lie here and wait…"
      ],
      hydrationReminder: [
        "I'm a little thirsty… you should drink some water too?",
        "I want water! You have some too~",
        "*licks lips* …time for water~",
        "My bowl's empty! Where's your cup?"
      ],
      hydrationDone: [
        "*slurp slurp* ahh~",
        "All full!",
        "Woof, water's so good"
      ],
      focusStart: [
        (minutes: number) => `Okay, I'll keep watch for ${minutes} minutes!`,
        (minutes: number) => `Focus for ${minutes} minutes, I'm watching`
      ],
      focusWarning: [
        (rule: string) => `Hey, no ${rule}! We said we'd focus!`,
        (rule: string) => `I saw you open ${rule}~ come back!`,
        (rule: string) => `Stay away from ${rule}!`
      ],
      focusComplete: [
        "Focus time's up!",
        "Focus done! *tail wag*"
      ],
      focusCancelled: [
        "Okay, I'll keep you company for a bit",
        "All done! I'm lying down~"
      ],
      focusBack: [
        "Good, I'll keep watching~",
        "Mm! Back to work then",
        "I'll keep focusing too~"
      ],
      agentDone: [
        "Your agent looks done. Take a look?",
        "Codex or Claude may have finished.",
        "The result is ready. Want to review it?"
      ]
    },
    actions: {
      breakDone: "I stood up",
      breakRunDone: "I'm back",
      breakSnooze: "Remind in 10 min",
      breakMute: "Leave me today",
      hydrationDone: "I drank water",
      hydrationSnooze: "Remind later",
      focusBack: "Back to work",
      focusEnd: "End Focus"
    },
    menu: {
      showDog: "Show Companion",
      hideDog: "Hide Companion",
      startFocusMode: "Start Focus Mode",
      stopFocusMode: "Stop Focus Mode",
      demoBreakReminder: "Demo: Break Reminder",
      demoHydrationReminder: "Demo: Hydration Reminder",
      demoFocusWarning: "Demo: Distraction Nudge",
      demoHappyReaction: "Demo: Happy Reaction",
      settings: "Settings",
      resetToday: "Reset Today",
      quit: "Quit"
    },
    settings: {
      title: "Settings",
      welcomeTitle: "Welcome to PawPause",
      welcomeCopy:
        "PawPause lives in the menu bar and near the bottom of your screen. It reminds you to take breaks, drink water, and stay focused. Distraction detection is macOS-only and requires accessibility permissions.",
      dismissWelcome: "Got it",
      appearance: "Appearance",
      quickActions: "Quick Actions",
      testTools: "Test Tools",
      language: "Language",
      petAppearance: "Pet",
      petSize: "Pet Size",
      petMotion: "Pet Motion",
      enablePetRoam: "Auto Run",
      petRoamDirection: "Run Direction",
      petRoamDirectionBoth: "Both",
      petRoamDirectionLeft: "Left",
      petRoamDirectionRight: "Right",
      petRoamFrequency: "Run Frequency",
      petRoamDuration: "Run Duration",
      petIdleMotionFrequency: "Idle Motion Frequency",
      importPet: "Import Pet Package",
      importPetHint:
        "Supports a folder or zip with pet.json + spritesheet.webp/png. In-app imports are saved in PawPause app data; existing npx petdex install pets in ~/.codex/pets are still detected.",
      importPetSuccess: "Pet imported into PawPause app data",
      importPetError: "Import failed",
      screenBlock: "Screen Block Break",
      enableScreenBlock: "Enlarge pet during breaks",
      screenBlockDuration: "Block Duration",
      screenBlockCoverage: "Screen Coverage",
      reminders: "Reminders",
      enableBreakReminder: "Enable Break Reminder",
      breakInterval: "Break Interval",
      enableHydrationReminder: "Enable Hydration Reminder",
      hydrationInterval: "Hydration Interval",
      focus: "Focus",
      focusDuration: "Focus Duration",
      enableAgentActivity: "Agent Completion Alerts",
      enableDistractionDetection: "Enable Distraction Detection",
      detectionGrace: "Detection Grace",
      blockedApps: "Blocked Apps",
      blockedKeywords: "Blocked Keywords",
      today: "Today",
      statsRangeDay: "Day",
      statsRangeMonth: "Month",
      statsRangeAll: "All",
      statsHeading: "Stats",
      breaks: "Breaks",
      waters: "Waters",
      focusMin: "Focus",
      warnings: "Distractions",
      minuteUnit: "min",
      secondUnit: "s",
      countUnit: "",
      addListItem: "Add…",
      removeListItem: (entry: string) => `Remove ${entry}`,
      runtime: "Runtime",
      state: "State",
      mode: "Mode",
      reminder: "Reminder",
      dog: "Companion",
      distraction: "Distraction",
      status: "Status",
      statusIdle: "Idle",
      statusWatching: "Watching",
      statusPermissionNeeded: "Permission needed",
      statusUnsupported: "Unsupported",
      statusError: "Detection error",
      matched: "Matched",
      app: "App",
      checked: "Checked",
      timers: "Timers",
      break: "Break",
      water: "Water",
      focusEnd: "Focus End",
      updated: "Updated",
      demo: "Demo",
      demoBreak: "Break",
      demoWater: "Water",
      demoFocusWarning: "Distraction",
      demoHappy: "Happy",
      resetToday: "Reset Today",
      startFocus: "Start Focus",
      stopFocus: "Stop Focus",
      diagnostics: "Diagnostics",
      preloadUnavailable: "Preload unavailable",
      preloadCopy:
        "Electron preload was not injected, so the pet control API is unavailable. Restart pnpm dev, or check the preload path and sandbox settings.",
      off: "off",
      now: "now",
      never: "never",
      none: "none",
      visible: "visible",
      hidden: "hidden",
      idle: "idle",
      noActiveWindowTitle: "No active window title captured yet.",
      detectionOffHelp: "Detection is off. Enable it and Save to preview the active window.",
      detectionWaitingHelp: "Waiting for the first active-window check.",
      detectionPermissionHelp:
        "Allow PawPause accessibility permissions in System Settings (macOS), then restart the app or toggle detection again.",
      detectionUnsupportedHelp:
        "Active-window detection is not supported on this system yet, so distraction detection will stay inactive.",
      detectionErrorHelp:
        "Active-window detection failed. Check permissions, then toggle detection again or restart the app.",
      detectionPreviewHelp:
        "Previewing the active window. Start Focus to trigger distraction nudges from matched rules.",
      detectionFocusHelp:
        "Watching during Focus. Matched blocked apps or keywords will trigger a distraction nudge.",
      agentActivityHelp:
        "Watches local Codex and Claude Code session events, and only nudges on completion, failure, or review-needed items."
    },
    system: {
      unsupportedDistraction: "Distraction detection currently supports macOS only."
    }
  }
} as const;

function makeLocale(overrides: {
  bubble?: Record<string, unknown>;
  actions?: Record<string, unknown>;
  menu?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  system?: Record<string, unknown>;
}): typeof CORE_I18N.en {
  return {
    ...CORE_I18N.en,
    bubble: { ...CORE_I18N.en.bubble, ...overrides.bubble },
    actions: { ...CORE_I18N.en.actions, ...overrides.actions },
    menu: { ...CORE_I18N.en.menu, ...overrides.menu },
    settings: { ...CORE_I18N.en.settings, ...overrides.settings },
    system: { ...CORE_I18N.en.system, ...overrides.system }
  } as typeof CORE_I18N.en;
}

export const I18N = {
  ...CORE_I18N,
  ja: makeLocale({
    bubble: {
      breakReminder: ["長く座りすぎです。1分歩きましょう。"],
      breakRun: [(seconds: number) => `あと ${seconds} 秒です。画面から離れてください。`],
      focusWarning: [(rule: string) => `集中時間です。${rule} は閉じましょう。`],
      agentDone: ["Agent の作業が終わったようです。確認してください。"]
    },
    actions: {
      breakDone: "立ち上がりました",
      breakRunDone: "戻りました",
      breakSnooze: "10分後に通知",
      breakMute: "今日は通知しない",
      hydrationDone: "水を飲みました",
      hydrationSnooze: "あとで通知",
      focusBack: "作業に戻る",
      focusEnd: "集中を終了"
    },
    menu: {
      showDog: "相棒を表示",
      hideDog: "相棒を隠す",
      startFocusMode: "集中モードを開始",
      stopFocusMode: "集中モードを停止",
      settings: "設定",
      resetToday: "今日をリセット",
      quit: "終了"
    },
    settings: {
      title: "設定",
      welcomeTitle: "PawPause へようこそ",
      welcomeCopy:
        "PawPause は休憩、水分補給、集中をサポートします。気晴らし検出は macOS のアクセシビリティ権限が必要です。",
      dismissWelcome: "了解",
      appearance: "外観",
      quickActions: "クイック操作",
      testTools: "テストツール",
      language: "言語",
      petAppearance: "ペット",
      petSize: "サイズ",
      petMotion: "動き",
      enablePetRoam: "自動移動",
      petRoamDirection: "移動方向",
      petRoamDirectionBoth: "左右ランダム",
      petRoamDirectionLeft: "左",
      petRoamDirectionRight: "右",
      petRoamFrequency: "移動頻度",
      petRoamDuration: "移動時間",
      petIdleMotionFrequency: "待機動作の頻度",
      importPet: "ペットパッケージをインポート",
      importPetHint:
        "pet.json と spritesheet.webp/png を含むフォルダまたは zip に対応。アプリ内インポートは PawPause のデータフォルダに保存され、既存の ~/.codex/pets も読み込みます。",
      importPetSuccess: "ペットをインポートしました",
      importPetError: "インポート失敗",
      screenBlock: "画面ブロック休憩",
      enableScreenBlock: "休憩時にペットを拡大",
      screenBlockDuration: "ブロック時間",
      screenBlockCoverage: "画面カバー率",
      reminders: "リマインダー",
      enableBreakReminder: "休憩リマインダー",
      breakInterval: "休憩間隔",
      enableHydrationReminder: "水分補給リマインダー",
      hydrationInterval: "水分補給間隔",
      focus: "集中",
      focusDuration: "集中時間",
      enableAgentActivity: "Agent 完了通知",
      enableDistractionDetection: "気晴らし検出",
      statsHeading: "統計",
      dog: "相棒",
      breaks: "休憩",
      waters: "水分",
      focusMin: "集中",
      warnings: "気晴らし",
      minuteUnit: "分",
      secondUnit: "秒",
      countUnit: "回",
      startFocus: "集中開始",
      stopFocus: "集中停止"
    },
    system: { unsupportedDistraction: "気晴らし検出は現在 macOS のみ対応しています。" }
  }),
  ko: makeLocale({
    bubble: {
      breakReminder: ["오래 앉아 있었어요. 1분만 걸어봐요."],
      breakRun: [(seconds: number) => `${seconds}초 남았어요. 화면에서 잠깐 떨어져요.`],
      focusWarning: [(rule: string) => `집중 시간이에요. ${rule}은 닫아주세요.`],
      agentDone: ["Agent 작업이 끝난 것 같아요. 확인해보세요."]
    },
    actions: {
      breakDone: "일어났어요",
      breakRunDone: "돌아왔어요",
      breakSnooze: "10분 뒤 알림",
      breakMute: "오늘은 알리지 않기",
      hydrationDone: "물을 마셨어요",
      hydrationSnooze: "나중에 알림",
      focusBack: "작업으로 돌아가기",
      focusEnd: "집중 종료"
    },
    menu: {
      showDog: "동반자 보이기",
      hideDog: "동반자 숨기기",
      startFocusMode: "집중 모드 시작",
      stopFocusMode: "집중 모드 중지",
      settings: "설정",
      resetToday: "오늘 초기화",
      quit: "종료"
    },
    settings: {
      title: "설정",
      language: "언어",
      appearance: "외형",
      petAppearance: "펫",
      petSize: "크기",
      petMotion: "움직임",
      enablePetRoam: "자동 이동",
      importPet: "펫 패키지 가져오기",
      importPetHint:
        "pet.json 및 spritesheet.webp/png가 있는 폴더나 zip을 지원합니다. 앱 가져오기는 PawPause 데이터 폴더에 저장하고 기존 ~/.codex/pets도 읽습니다.",
      importPetSuccess: "펫을 가져왔습니다",
      reminders: "알림",
      focus: "집중",
      statsHeading: "통계",
      dog: "동반자",
      breaks: "휴식",
      waters: "물",
      focusMin: "집중",
      warnings: "방해",
      minuteUnit: "분",
      secondUnit: "초",
      countUnit: "회",
      startFocus: "집중 시작",
      stopFocus: "집중 중지"
    },
    system: { unsupportedDistraction: "방해 감지는 현재 macOS만 지원합니다." }
  }),
  es: makeLocale({
    bubble: {
      breakReminder: ["Llevas mucho tiempo sentado. Camina un minuto."],
      breakRun: [(seconds: number) => `Quedan ${seconds}s. Aléjate de la pantalla.`],
      focusWarning: [(rule: string) => `Es hora de concentrarse. Cierra ${rule}.`],
      agentDone: ["Tu Agent parece haber terminado. Revísalo."]
    },
    actions: {
      breakDone: "Me levanté",
      breakRunDone: "Ya volví",
      breakSnooze: "Recordar en 10 min",
      breakMute: "No hoy",
      hydrationDone: "Bebí agua",
      hydrationSnooze: "Recordar después",
      focusBack: "Volver al trabajo",
      focusEnd: "Terminar enfoque"
    },
    menu: {
      showDog: "Mostrar compañero",
      hideDog: "Ocultar compañero",
      settings: "Ajustes",
      resetToday: "Reiniciar hoy",
      quit: "Salir"
    },
    settings: {
      title: "Ajustes",
      language: "Idioma",
      appearance: "Apariencia",
      petAppearance: "Mascota",
      petSize: "Tamaño",
      petMotion: "Movimiento",
      dog: "Compañero",
      importPet: "Importar paquete de mascota",
      importPetHint:
        "Admite carpeta o zip con pet.json y spritesheet.webp/png. La importación guarda en los datos de PawPause y también lee ~/.codex/pets.",
      importPetSuccess: "Mascota importada",
      reminders: "Recordatorios",
      focus: "Enfoque",
      statsHeading: "Estadísticas",
      breaks: "Descansos",
      waters: "Agua",
      focusMin: "Enfoque",
      warnings: "Distracciones",
      minuteUnit: "min",
      secondUnit: "s",
      countUnit: ""
    },
    system: { unsupportedDistraction: "La detección de distracciones solo admite macOS por ahora." }
  }),
  fr: makeLocale({
    bubble: {
      breakReminder: ["Tu es assis depuis trop longtemps. Marche une minute."],
      breakRun: [(seconds: number) => `Encore ${seconds} s. Éloigne-toi de l'écran.`],
      focusWarning: [(rule: string) => `C'est le moment de se concentrer. Ferme ${rule}.`],
      agentDone: ["Ton Agent semble avoir terminé. Va vérifier."]
    },
    actions: {
      breakDone: "Je me suis levé",
      breakRunDone: "Je suis revenu",
      breakSnooze: "Rappeler dans 10 min",
      breakMute: "Pas aujourd'hui",
      hydrationDone: "J'ai bu de l'eau",
      hydrationSnooze: "Rappeler plus tard",
      focusBack: "Retour au travail",
      focusEnd: "Terminer la concentration"
    },
    menu: {
      showDog: "Afficher le compagnon",
      hideDog: "Masquer le compagnon",
      settings: "Réglages",
      resetToday: "Réinitialiser aujourd'hui",
      quit: "Quitter"
    },
    settings: {
      title: "Réglages",
      language: "Langue",
      appearance: "Apparence",
      petAppearance: "Compagnon",
      petSize: "Taille",
      petMotion: "Mouvement",
      dog: "Compagnon",
      importPet: "Importer un compagnon",
      importPetHint:
        "Prend en charge un dossier ou zip avec pet.json et spritesheet.webp/png. L'import enregistre dans les données PawPause et lit aussi ~/.codex/pets.",
      importPetSuccess: "Compagnon importé",
      reminders: "Rappels",
      focus: "Concentration",
      statsHeading: "Statistiques",
      breaks: "Pauses",
      waters: "Eau",
      focusMin: "Concentration",
      warnings: "Distractions",
      minuteUnit: "min",
      secondUnit: "s",
      countUnit: ""
    },
    system: { unsupportedDistraction: "La détection des distractions prend actuellement en charge macOS uniquement." }
  }),
  ar: makeLocale({
    bubble: {
      breakReminder: ["جلست طويلا. امش دقيقة واحدة."],
      breakRun: [(seconds: number) => `بقيت ${seconds} ثانية. ابتعد عن الشاشة.`],
      focusWarning: [(rule: string) => `حان وقت التركيز. أغلق ${rule}.`],
      agentDone: ["يبدو أن الوكيل انتهى. تحقق من النتيجة."]
    },
    actions: {
      breakDone: "وقفت",
      breakRunDone: "عدت",
      breakSnooze: "ذكرني بعد 10 دقائق",
      breakMute: "ليس اليوم",
      hydrationDone: "شربت الماء",
      hydrationSnooze: "ذكرني لاحقا",
      focusBack: "العودة للعمل",
      focusEnd: "إنهاء التركيز"
    },
    menu: {
      showDog: "إظهار الرفيق",
      hideDog: "إخفاء الرفيق",
      settings: "الإعدادات",
      resetToday: "إعادة ضبط اليوم",
      quit: "خروج"
    },
    settings: {
      title: "الإعدادات",
      language: "اللغة",
      appearance: "المظهر",
      petAppearance: "الشخصية",
      petSize: "الحجم",
      petMotion: "الحركة",
      dog: "الرفيق",
      importPet: "استيراد حزمة شخصية",
      importPetHint:
        "يدعم مجلدا أو ملف zip يحتوي على pet.json و spritesheet.webp/png. يحفظ الاستيراد داخل بيانات PawPause ويقرأ أيضا ~/.codex/pets.",
      importPetSuccess: "تم استيراد الشخصية",
      reminders: "التذكيرات",
      focus: "التركيز",
      statsHeading: "الإحصاءات",
      breaks: "الاستراحات",
      waters: "الماء",
      focusMin: "التركيز",
      warnings: "التشتت",
      minuteUnit: "د",
      secondUnit: "ث",
      countUnit: ""
    },
    system: { unsupportedDistraction: "كشف التشتت يدعم macOS فقط حاليا." }
  }),
  de: makeLocale({
    bubble: {
      breakReminder: ["Du sitzt schon zu lange. Geh eine Minute."],
      breakRun: [(seconds: number) => `Noch ${seconds} s. Weg vom Bildschirm.`],
      focusWarning: [(rule: string) => `Fokuszeit. Bitte ${rule} schließen.`],
      agentDone: ["Dein Agent scheint fertig zu sein. Schau nach."]
    },
    actions: {
      breakDone: "Ich bin aufgestanden",
      breakRunDone: "Ich bin zurück",
      breakSnooze: "In 10 Min erinnern",
      breakMute: "Heute nicht",
      hydrationDone: "Ich habe Wasser getrunken",
      hydrationSnooze: "Später erinnern",
      focusBack: "Zurück zur Arbeit",
      focusEnd: "Fokus beenden"
    },
    menu: {
      showDog: "Begleiter anzeigen",
      hideDog: "Begleiter ausblenden",
      settings: "Einstellungen",
      resetToday: "Heute zurücksetzen",
      quit: "Beenden"
    },
    settings: {
      title: "Einstellungen",
      language: "Sprache",
      appearance: "Darstellung",
      petAppearance: "Figur",
      petSize: "Größe",
      petMotion: "Bewegung",
      dog: "Begleiter",
      importPet: "Figurenpaket importieren",
      importPetHint:
        "Unterstützt Ordner oder zip mit pet.json und spritesheet.webp/png. Der Import speichert in PawPause-Daten und liest weiterhin ~/.codex/pets.",
      importPetSuccess: "Figur importiert",
      reminders: "Erinnerungen",
      focus: "Fokus",
      statsHeading: "Statistik",
      breaks: "Pausen",
      waters: "Wasser",
      focusMin: "Fokus",
      warnings: "Ablenkungen",
      minuteUnit: "Min",
      secondUnit: "s",
      countUnit: ""
    },
    system: { unsupportedDistraction: "Ablenkungserkennung unterstützt derzeit nur macOS." }
  }),
  ru: makeLocale({
    bubble: {
      breakReminder: ["Ты слишком долго сидишь. Пройдись минуту."],
      breakRun: [(seconds: number) => `Осталось ${seconds} с. Отойди от экрана.`],
      focusWarning: [(rule: string) => `Время фокуса. Закрой ${rule}.`],
      agentDone: ["Похоже, Agent закончил работу. Проверь результат."]
    },
    actions: {
      breakDone: "Я встал",
      breakRunDone: "Я вернулся",
      breakSnooze: "Напомнить через 10 мин",
      breakMute: "Не сегодня",
      hydrationDone: "Я выпил воды",
      hydrationSnooze: "Напомнить позже",
      focusBack: "Вернуться к работе",
      focusEnd: "Завершить фокус"
    },
    menu: {
      showDog: "Показать компаньона",
      hideDog: "Скрыть компаньона",
      settings: "Настройки",
      resetToday: "Сбросить день",
      quit: "Выйти"
    },
    settings: {
      title: "Настройки",
      language: "Язык",
      appearance: "Внешний вид",
      petAppearance: "Персонаж",
      petSize: "Размер",
      petMotion: "Движение",
      dog: "Компаньон",
      importPet: "Импортировать персонажа",
      importPetHint:
        "Поддерживает папку или zip с pet.json и spritesheet.webp/png. Импорт сохраняет данные PawPause и также читает ~/.codex/pets.",
      importPetSuccess: "Персонаж импортирован",
      reminders: "Напоминания",
      focus: "Фокус",
      statsHeading: "Статистика",
      breaks: "Перерывы",
      waters: "Вода",
      focusMin: "Фокус",
      warnings: "Отвлечения",
      minuteUnit: "мин",
      secondUnit: "с",
      countUnit: ""
    },
    system: { unsupportedDistraction: "Определение отвлечений сейчас поддерживает только macOS." }
  })
} as const;

export type I18nBundle = (typeof I18N)[Language];

export function i18n(language: Language): I18nBundle {
  return I18N[language];
}
