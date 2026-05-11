export type Language = "zh-CN" | "en" | "ja" | "ko" | "es" | "fr" | "ar" | "de" | "ru";

export type PetAppearanceId = string;

export type PetFacing = "left" | "right";
export type PetRoamDirection = "both" | "left" | "right";

export type PetState =
  | "idle"
  | "sitting"
  | "happy"
  | "breakPrompt"
  | "breakRunning"
  | "breakDone"
  | "hydrationPrompt"
  | "drinking"
  | "hydrationDone"
  | "focusGuard"
  | "focusAlert"
  | "focusDone"
  | "sad"
  | "sleeping"
  | "runningLeft"
  | "runningRight"
  | "waving"
  | "jumping"
  | "failed"
  | "waiting"
  | "reviewing"
  | "thinking";

export type PetdexStateId =
  | "idle"
  | "running-right"
  | "running-left"
  | "waving"
  | "jumping"
  | "failed"
  | "waiting"
  | "running"
  | "review";

export type SpriteAnimationState = {
  row: number;
  frames: number;
  durationMs: number;
};

export type PetPackageManifest = {
  id: string;
  displayName: string;
  description?: string;
  author?: string;
  spritesheet: string;
  source: "builtin" | "imported";
};

export type InstalledPet = {
  slug: string;
  manifest: PetPackageManifest;
  spritesheetPath: string;
  spritesheetExt: "webp" | "png";
  importedAt: string;
};

export type BubbleAction = {
  id: string;
  label: string;
  kind?: "primary" | "secondary" | "danger";
};

export type SpeechBubble = {
  id: string;
  message: string;
  actions?: BubbleAction[];
  autoDismissMs?: number;
};

export type PetLayout = {
  petOffsetX: number;
  bubbleAnchorX: number;
  bubbleLeftX: number;
  bubbleArrowX: number;
};

export type BlockingMode = "break" | "breakRun" | "hydration" | "focusWarning" | null;

export type Settings = {
  language: Language;
  petAppearanceId: PetAppearanceId;
  petScale: number;
  petRoamEnabled: boolean;
  petRoamDirection: PetRoamDirection;
  petRoamFrequencySeconds: number;
  petRoamDurationSeconds: number;
  petIdleMotionSeconds: number;
  lyricsModeEnabled: boolean;
  selectedPetId: string;
  installedPets: InstalledPet[];
  onboardingDismissed: boolean;
  breakReminderEnabled: boolean;
  breakIntervalMinutes: number;
  screenBlockReminderEnabled: boolean;
  screenBlockDurationSeconds: number;
  screenBlockCoverageRatio: number;
  hydrationReminderEnabled: boolean;
  hydrationIntervalMinutes: number;
  focusDurationMinutes: number;
  agentActivityEnabled: boolean;
  agentCompletionSoundEnabled: boolean;
  distractionDetectionEnabled: boolean;
  distractionGraceSeconds: number;
  distractionBlockedApps: string[];
  distractionBlockedKeywords: string[];
};

export type TodayStats = {
  date: string;
  breaksTaken: number;
  watersLogged: number;
  focusMinutes: number;
  focusWarnings: number;
};

export type StatsHistory = Record<string, TodayStats>;

export type TimerStatus = {
  breakDueAt: number | null;
  breakSnoozeDueAt: number | null;
  hydrationDueAt: number | null;
  focusEndsAt: number | null;
};

export type DistractionStatus = {
  state: "idle" | "watching" | "permission-needed" | "unsupported" | "error";
  activeApp: string;
  activeWindowTitle: string;
  matchedRule: string | null;
  lastCheckedAt: number | null;
  lastWarningAt: number | null;
  error: string | null;
};

export type AppSnapshot = {
  settings: Settings;
  stats: TodayStats;
  statsHistory: StatsHistory;
  timers: TimerStatus;
  distraction: DistractionStatus;
  petState: PetState;
  petFacing: PetFacing;
  blockingMode: BlockingMode;
  focusActive: boolean;
  dogVisible: boolean;
  screenBlockActive: boolean;
  screenBlockEndsAt: number | null;
};

export type PetImportResult =
  | { ok: true; pet: InstalledPet }
  | { ok: false; error: string };

export type DemoTrigger =
  | "break"
  | "hydration"
  | "focusWarning"
  | "happy";

export type RendererEventMap = {
  "pet:set-state": PetState;
  "pet:layout": PetLayout;
  "pet:show-bubble": SpeechBubble;
  "pet:hide-bubble": void;
  "pet:imported": InstalledPet;
  "settings:updated": Settings;
  "stats:updated": TodayStats;
  "app:snapshot": AppSnapshot;
};
