import { execFile } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import electron from "electron";
import Store from "electron-store";
import {
  createEmptyStats,
  DEFAULT_SETTINGS,
  todayKey
} from "../shared/constants";
import { allPets } from "../shared/bundledPets";
import { i18n, pick, resolveLanguage } from "../shared/i18n";
import { PETDEX_SPRITE_SIZE } from "../shared/spriteStates";
import type {
  AppSnapshot,
  BlockingMode,
  DistractionStatus,
  DemoTrigger,
  PetFacing,
  PetLayout,
  PetRoamDirection,
  PetState,
  Settings,
  StatsHistory,
  SpeechBubble,
  TodayStats
} from "../shared/types";
import {
  APP_NAME,
  BREAK_RUN_DURATION_MS,
  BREAK_RUN_TICK_MS,
  DISTRACTION_CHECK_INTERVAL_MS,
  DISTRACTION_WARNING_COOLDOWN_MS,
  IS_DEV,
  PET_WINDOW,
  PRELOAD_PATH,
  RENDERER_HTML_PATH,
  SETTINGS_WINDOW,
  SCREEN_BLOCK_WINDOW,
  STORE_NAME
} from "./config";
import { classifyDistraction, isPermissionError, readActiveWindow } from "./distraction";
import {
  chooseAndImportPet,
  discoverInstalledPets,
  legacyUserPetsRoot,
  userPetsRoot
} from "./petPackages";
import { createTrayImage } from "./trayIcon";

const { app, BrowserWindow, ipcMain, Menu, nativeTheme, net, protocol, screen, shell, Tray } = electron;

type PetPosition = {
  x: number;
  y: number;
};

type StoreSchema = {
  settings: Settings;
  stats: TodayStats;
  statsHistory: StatsHistory;
  petPosition?: PetPosition;
  focusSession?: FocusSession;
};

type FocusSession = {
  startedAt: number;
  endsAt: number;
};

const MIN_PET_SCALE = 0.3;
const MAX_PET_SCALE = 1.5;
const PET_VISUAL_BASE_SCALE = 0.88;
const PET_WINDOW_PADDING = 52;
const BUBBLE_WINDOW_WIDTH = 300;
const BUBBLE_RENDER_WIDTH = 276;
const BUBBLE_WINDOW_EXTRA_HEIGHT = 190;
const AMBIENT_ROAM_TICK_MS = 16;
const AMBIENT_POSE_MIN_DELAY_MS = 12_000;
const AMBIENT_POSE_MAX_DELAY_MS = 55_000;
const AGENT_ACTIVITY_CHECK_INTERVAL_MS = 5000;
const AGENT_EVENT_MAX_AGE_MS = 2 * 60 * 1000;
const PET_LIBRARY_CHECK_INTERVAL_MS = 3000;

type AgentSource = "Codex" | "Claude Code";
type AgentEventKind = "complete" | "failed" | "needs-review" | "working";
type AgentProgressKind =
  | "working"
  | "thinking"
  | "tool"
  | "script"
  | "choice"
  | "permission"
  | "review"
  | "complete"
  | "failed";
type AgentMonitorEvent = {
  id: string;
  source: AgentSource;
  sessionKey: string;
  kind: AgentEventKind;
  message: string;
  progressKind?: AgentProgressKind;
  state: PetState;
  timestampMs: number;
  showProgress?: boolean;
};

app.setName(APP_NAME);

const store = new Store<StoreSchema>({
  name: STORE_NAME,
  defaults: {
    settings: DEFAULT_SETTINGS,
    stats: createEmptyStats(),
    statsHistory: {}
  }
});

let petWindow: Electron.BrowserWindow | null = null;
let settingsWindow: Electron.BrowserWindow | null = null;
let tray: Electron.Tray | null = null;
let petState: PetState = "idle";
let petFacing: PetFacing = "right";
let blockingMode: BlockingMode = null;
let focusActive = false;
let focusStartedAt: number | null = null;
let breakRunTimer: NodeJS.Timeout | null = null;
let breakRunCountdownTimer: NodeJS.Timeout | null = null;
let breakRunMovementTimer: NodeJS.Timeout | null = null;
let screenBlockTimer: NodeJS.Timeout | null = null;
let screenBlockCountdownTimer: NodeJS.Timeout | null = null;
let focusWarningTimer: NodeJS.Timeout | null = null;
let breakTimer: NodeJS.Timeout | null = null;
let hydrationTimer: NodeJS.Timeout | null = null;
let focusTimer: NodeJS.Timeout | null = null;
let distractionTimer: NodeJS.Timeout | null = null;
let distractionStartupTimer: NodeJS.Timeout | null = null;
let breakDueAt: number | null = null;
let breakSnoozeDueAt: number | null = null;
let hydrationDueAt: number | null = null;
let focusEndsAt: number | null = null;
let screenBlockEndsAt: number | null = null;
let bubbleTimer: NodeJS.Timeout | null = null;
let dragTimer: NodeJS.Timeout | null = null;
let dragSafetyTimer: NodeJS.Timeout | null = null;
let ambientRoamTimer: NodeJS.Timeout | null = null;
let ambientRoamMoveTimer: NodeJS.Timeout | null = null;
let ambientRoamStopTimer: NodeJS.Timeout | null = null;
let ambientPoseTimer: NodeJS.Timeout | null = null;
let ambientPoseStopTimer: NodeJS.Timeout | null = null;
let agentActivityTimer: NodeJS.Timeout | null = null;
let agentPoseTimer: NodeJS.Timeout | null = null;
let petLibraryTimer: NodeJS.Timeout | null = null;
let breakRunVelocity: PetPosition = { x: 0, y: 0 };
let breakRunFormatter: ((seconds: number) => string) | null = null;
let nextBreakRunTurnAt = 0;
let breakMutedToday = false;
let dragOffset: PetPosition = { x: 0, y: 0 };
let currentBubble: SpeechBubble | null = null;
let petLayout: PetLayout = {
  petOffsetX: 0,
  bubbleAnchorX: 0,
  bubbleLeftX: 0,
  bubbleArrowX: 0
};
let ambientRoamDirection: "left" | "right" = "right";
let ambientRoamSpeed = 2.4;
let agentLastWorkingAt: number | null = null;
let agentLastNotificationAt = 0;
let agentLastProgressBubbleAt = 0;
let agentMonitorPrimed = false;
const agentSeenEventIds = new Set<string>();
const agentActiveSessions = new Map<string, number>();
const claudeSessionStatuses = new Map<string, string>();
let ambientPoseActiveState: PetState | null = null;
let agentPoseActiveState: PetState | null = null;
let lastPetLibrarySignature = "";

function normalizePetScale(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_SETTINGS.petScale;
  return Math.min(MAX_PET_SCALE, Math.max(MIN_PET_SCALE, value));
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function normalizeRoamDirection(value: unknown): PetRoamDirection {
  return value === "left" || value === "right" || value === "both"
    ? value
    : DEFAULT_SETTINGS.petRoamDirection;
}

function mergeInstalledPets(storedPets: unknown): ReturnType<typeof discoverInstalledPets> {
  const pets = new Map<string, ReturnType<typeof discoverInstalledPets>[number]>();
  if (Array.isArray(storedPets)) {
    for (const pet of storedPets) {
      if (pet && typeof pet === "object" && typeof pet.slug === "string") {
        pets.set(pet.slug, pet as ReturnType<typeof discoverInstalledPets>[number]);
      }
    }
  }
  for (const pet of discoverInstalledPets()) {
    pets.set(pet.slug, pet);
  }
  return [...pets.values()];
}

function visiblePetSize(scale: number): Pick<Electron.Rectangle, "width" | "height"> {
  const renderScale = PET_VISUAL_BASE_SCALE * scale;
  return {
    width: Math.round(PETDEX_SPRITE_SIZE.frameWidth * renderScale),
    height: Math.round(PETDEX_SPRITE_SIZE.frameHeight * renderScale)
  };
}

function petWindowSize(scale = getSettings().petScale): Pick<Electron.Rectangle, "width" | "height"> {
  const petSize = visiblePetSize(scale);
  if (currentBubble) {
    return {
      width: Math.max(BUBBLE_WINDOW_WIDTH, petSize.width + PET_WINDOW_PADDING * 2),
      height: petSize.height + BUBBLE_WINDOW_EXTRA_HEIGHT
    };
  }
  return {
    width: Math.max(44, petSize.width + PET_WINDOW_PADDING),
    height: Math.max(48, petSize.height + PET_WINDOW_PADDING)
  };
}
let preScreenBlockBounds: Electron.Rectangle | null = null;
let distractionStatus: DistractionStatus = {
  state: "idle",
  activeApp: "",
  activeWindowTitle: "",
  matchedRule: null,
  lastCheckedAt: null,
  lastWarningAt: null,
  error: null
};

function getSettings(): Settings {
  const stored = store.get("settings");
  const installedPets = mergeInstalledPets(stored.installedPets);
  const candidatePetId =
    typeof stored.selectedPetId === "string" && stored.selectedPetId
      ? stored.selectedPetId
      : DEFAULT_SETTINGS.selectedPetId;
  const selectedPetId = allPets(installedPets).some((pet) => pet.slug === candidatePetId)
    ? candidatePetId
    : DEFAULT_SETTINGS.selectedPetId;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    language: resolveLanguage(stored.language),
    petAppearanceId: selectedPetId,
    petScale: normalizePetScale(stored.petScale),
    petRoamEnabled:
      typeof stored.petRoamEnabled === "boolean"
        ? stored.petRoamEnabled
        : DEFAULT_SETTINGS.petRoamEnabled,
    petRoamDirection: normalizeRoamDirection(stored.petRoamDirection),
    petRoamFrequencySeconds: normalizeNumber(
      stored.petRoamFrequencySeconds,
      DEFAULT_SETTINGS.petRoamFrequencySeconds,
      5,
      180
    ),
    petRoamDurationSeconds: normalizeNumber(
      stored.petRoamDurationSeconds,
      DEFAULT_SETTINGS.petRoamDurationSeconds,
      1,
      30
    ),
    petIdleMotionSeconds: normalizeNumber(
      stored.petIdleMotionSeconds,
      DEFAULT_SETTINGS.petIdleMotionSeconds,
      1,
      12
    ),
    screenBlockDurationSeconds: normalizeNumber(
      stored.screenBlockDurationSeconds,
      DEFAULT_SETTINGS.screenBlockDurationSeconds,
      15,
      600
    ),
    screenBlockCoverageRatio: normalizeNumber(
      stored.screenBlockCoverageRatio,
      DEFAULT_SETTINGS.screenBlockCoverageRatio,
      0.35,
      1
    ),
    agentActivityEnabled:
      typeof stored.agentActivityEnabled === "boolean"
        ? stored.agentActivityEnabled
        : DEFAULT_SETTINGS.agentActivityEnabled,
    agentCompletionSoundEnabled:
      typeof stored.agentCompletionSoundEnabled === "boolean"
        ? stored.agentCompletionSoundEnabled
        : DEFAULT_SETTINGS.agentCompletionSoundEnabled,
    selectedPetId,
    installedPets
  };
}

function text(): ReturnType<typeof i18n> {
  return i18n(getSettings().language);
}

function setSettings(next: Settings): void {
  const normalized = {
    ...next,
    language: resolveLanguage(next.language),
    petAppearanceId: next.selectedPetId,
    petScale: normalizePetScale(next.petScale),
    petRoamEnabled: Boolean(next.petRoamEnabled),
    petRoamDirection: normalizeRoamDirection(next.petRoamDirection),
    petRoamFrequencySeconds: normalizeNumber(next.petRoamFrequencySeconds, 18, 5, 180),
    petRoamDurationSeconds: normalizeNumber(next.petRoamDurationSeconds, 5, 1, 30),
    petIdleMotionSeconds: normalizeNumber(next.petIdleMotionSeconds, 3.2, 1, 12),
    screenBlockDurationSeconds: normalizeNumber(next.screenBlockDurationSeconds, 120, 15, 600),
    screenBlockCoverageRatio: normalizeNumber(next.screenBlockCoverageRatio, 0.4, 0.35, 1),
    agentActivityEnabled: Boolean(next.agentActivityEnabled),
    agentCompletionSoundEnabled: Boolean(next.agentCompletionSoundEnabled),
    installedPets: mergeInstalledPets(next.installedPets)
  };
  store.set("settings", normalized);
  resizePetWindowForScale(normalized.petScale);
  sendToAll("settings:updated", normalized);
  settingsWindow?.setTitle(`${APP_NAME} ${text().menu.settings}`);
  scheduleReminderTimers();
  scheduleDistractionDetection();
  scheduleAgentActivityMonitor();
  stopAmbientRoam(false);
  scheduleAmbientRoam(500);
  scheduleAmbientPose();
  updateTrayMenu();
}

function getStatsHistory(): StatsHistory {
  return store.get("statsHistory", {});
}

function isSameStats(left: TodayStats | undefined, right: TodayStats): boolean {
  return Boolean(
    left &&
      left.date === right.date &&
      left.breaksTaken === right.breaksTaken &&
      left.watersLogged === right.watersLogged &&
      left.focusMinutes === right.focusMinutes &&
      left.focusWarnings === right.focusWarnings
  );
}

function saveStatsToHistory(stats: TodayStats): void {
  if (!stats.date) return;
  const history = getStatsHistory();
  if (isSameStats(history[stats.date], stats)) return;
  store.set("statsHistory", {
    ...history,
    [stats.date]: stats
  });
}

function getStats(): TodayStats {
  const today = todayKey();
  const stats = store.get("stats", createEmptyStats());
  if (stats.date !== today) {
    saveStatsToHistory(stats);
    const current = getStatsHistory()[today] ?? createEmptyStats(today);
    store.set("stats", current);
    saveStatsToHistory(current);
    return current;
  }
  saveStatsToHistory(stats);
  return stats;
}

function getFocusSession(): FocusSession | null {
  const session = store.get("focusSession");
  if (
    !session ||
    typeof session.startedAt !== "number" ||
    typeof session.endsAt !== "number" ||
    !Number.isFinite(session.startedAt) ||
    !Number.isFinite(session.endsAt) ||
    session.endsAt <= session.startedAt
  ) {
    return null;
  }
  return session;
}

function saveFocusSession(startedAt: number, endsAt: number): void {
  store.set("focusSession", { startedAt, endsAt });
}

function clearFocusSession(): void {
  store.delete("focusSession");
}

function restoreFocusSession(): void {
  const session = getFocusSession();
  if (!session) {
    clearFocusSession();
    return;
  }

  const now = Date.now();
  if (session.endsAt <= now) {
    const elapsedMinutes = Math.max(1, Math.round((session.endsAt - session.startedAt) / 60000));
    clearFocusSession();
    updateStats((stats) => ({
      ...stats,
      focusMinutes: stats.focusMinutes + elapsedMinutes
    }));
    setPetState("focusDone");
    return;
  }

  focusActive = true;
  focusStartedAt = session.startedAt;
  focusEndsAt = session.endsAt;
  blockingMode = null;
  setPetState("focusGuard");
  if (focusTimer) clearTimeout(focusTimer);
  focusTimer = setTimeout(() => stopFocusMode(true), session.endsAt - now);
}

function updateStats(mutator: (stats: TodayStats) => TodayStats): void {
  const next = mutator(getStats());
  store.set("stats", next);
  saveStatsToHistory(next);
  sendToAll("stats:updated", next);
  publishSnapshot();
}

function resetTodayStats(): void {
  breakMutedToday = false;
  const reset = createEmptyStats();
  store.set("stats", reset);
  saveStatsToHistory(reset);
  sendToAll("stats:updated", reset);
  publishSnapshot();
}

function snapshot(): AppSnapshot {
  return {
    settings: getSettings(),
    stats: getStats(),
    statsHistory: getStatsHistory(),
    timers: {
      breakDueAt,
      breakSnoozeDueAt,
      hydrationDueAt,
      focusEndsAt
    },
    distraction: distractionStatus,
    petState,
    petFacing,
    blockingMode,
    dogVisible: Boolean(petWindow?.isVisible()),
    focusActive,
    screenBlockActive: blockingMode === "breakRun" || blockingMode === "focusWarning",
    screenBlockEndsAt
  };
}

function sendToPet<T>(channel: string, payload?: T): void {
  if (!petWindow || petWindow.isDestroyed()) return;
  petWindow.webContents.send(channel, payload);
}

function sendToAll<T>(channel: string, payload?: T): void {
  sendToPet(channel, payload);
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send(channel, payload);
  }
}

function clampNumber(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function layoutForPetAnchor(bounds: Electron.Rectangle, petAnchorScreenX?: number): PetLayout {
  const anchorX =
    petAnchorScreenX === undefined
      ? Math.round(bounds.width / 2)
      : petAnchorScreenX - bounds.x;
  const bubbleWidth = Math.min(BUBBLE_RENDER_WIDTH, Math.max(0, bounds.width - 12));
  const bubbleLeftX = currentBubble
    ? clampNumber(anchorX, 6 + bubbleWidth / 2, bounds.width - 6 - bubbleWidth / 2)
    : anchorX;
  const bubbleArrowX = currentBubble
    ? clampNumber(anchorX - (bubbleLeftX - bubbleWidth / 2), 18, Math.max(18, bubbleWidth - 18))
    : Math.round(bubbleWidth / 2);

  return {
    petOffsetX: Math.round(anchorX - bounds.width / 2),
    bubbleAnchorX: Math.round(anchorX),
    bubbleLeftX: Math.round(bubbleLeftX),
    bubbleArrowX: Math.round(bubbleArrowX)
  };
}

function sendPetLayout(): void {
  sendToPet("pet:layout", petLayout);
}

function publishSnapshot(): void {
  sendToAll("app:snapshot", snapshot());
}

function setPetState(next: PetState): void {
  petState = next;
  sendToAll("pet:set-state", next);
}

function setPetFacing(next: PetFacing): void {
  if (petFacing === next) return;
  petFacing = next;
  publishSnapshot();
}

function showBubble(bubble: SpeechBubble): void {
  if (bubbleTimer) clearTimeout(bubbleTimer);
  currentBubble = bubble;
  resizePetWindowForScale(getSettings().petScale);
  sendPetLayout();
  sendToPet("pet:show-bubble", bubble);
  if (bubble.autoDismissMs) {
    bubbleTimer = setTimeout(() => hideBubble(), bubble.autoDismissMs);
  }
}

function hideBubble(): void {
  if (bubbleTimer) {
    clearTimeout(bubbleTimer);
    bubbleTimer = null;
  }
  currentBubble = null;
  sendToPet("pet:hide-bubble");
  resizePetWindowForScale(getSettings().petScale);
  sendPetLayout();
}

function rendererUrl(route: "pet" | "settings"): string {
  const devServer = process.env.ELECTRON_RENDERER_URL;
  if (devServer) return `${devServer}#${route}`;
  return RENDERER_HTML_PATH;
}

function runtimeAssetPath(filename: string): string {
  return app.isPackaged
    ? join(process.resourcesPath, filename)
    : resolve(process.cwd(), "build", filename);
}

function loadRenderer(win: Electron.BrowserWindow, route: "pet" | "settings"): void {
  const devServer = process.env.ELECTRON_RENDERER_URL;
  if (devServer) {
    void win.loadURL(rendererUrl(route));
    return;
  }
  void win.loadFile(rendererUrl(route), { hash: route });
}

function clampBoundsToWorkArea(bounds: Electron.Rectangle): Electron.Rectangle {
  const center = {
    x: bounds.x + Math.round(bounds.width / 2),
    y: bounds.y + Math.round(bounds.height / 2)
  };
  const workArea = screen.getDisplayNearestPoint(center).workArea;
  return {
    ...bounds,
    x: Math.min(Math.max(bounds.x, workArea.x), workArea.x + workArea.width - bounds.width),
    y: Math.min(Math.max(bounds.y, workArea.y), workArea.y + workArea.height - bounds.height)
  };
}

function initialPetBounds(): Electron.Rectangle {
  const workArea = screen.getPrimaryDisplay().workArea;
  const stored = store.get("petPosition");
  const size = petWindowSize();
  const fallback = {
    ...size,
    x: Math.round(workArea.x + workArea.width / 2 - size.width / 2),
    y: workArea.y + workArea.height - size.height
  };

  if (!stored) return fallback;
  return clampBoundsToWorkArea({
    ...fallback,
    x: stored.x,
    y: stored.y
  });
}

function persistPetPosition(): void {
  if (!petWindow || petWindow.isDestroyed()) return;
  const bounds = petWindow.getBounds();
  if (!currentBubble) {
    store.set("petPosition", { x: bounds.x, y: bounds.y });
    return;
  }

  const scale = getSettings().petScale;
  const petSize = visiblePetSize(scale);
  const compactSize = {
    width: Math.max(44, petSize.width + PET_WINDOW_PADDING),
    height: Math.max(48, petSize.height + PET_WINDOW_PADDING)
  };
  const petAnchorX = bounds.x + bounds.width / 2 + petLayout.petOffsetX;
  const compactBounds = clampBoundsToWorkArea({
    ...compactSize,
    x: Math.round(petAnchorX - compactSize.width / 2),
    y: bounds.y + bounds.height - compactSize.height
  });
  store.set("petPosition", { x: compactBounds.x, y: compactBounds.y });
}

function resizePetWindowForScale(scale: number): void {
  if (!petWindow || petWindow.isDestroyed()) return;
  if (blockingMode === "breakRun" || blockingMode === "focusWarning") {
    petLayout = layoutForPetAnchor(petWindow.getBounds());
    sendPetLayout();
    return;
  }
  const current = petWindow.getBounds();
  const nextSize = petWindowSize(scale);
  const petAnchorX = current.x + current.width / 2 + petLayout.petOffsetX;
  const nextBounds = clampBoundsToWorkArea({
    ...nextSize,
    x: Math.round(petAnchorX - nextSize.width / 2),
    y: current.y + current.height - nextSize.height
  });
  petLayout = layoutForPetAnchor(nextBounds, petAnchorX);
  if (
    current.width !== nextBounds.width ||
    current.height !== nextBounds.height ||
    current.x !== nextBounds.x ||
    current.y !== nextBounds.y
  ) {
    petWindow.setBounds(nextBounds);
  }
  sendPetLayout();
  persistPetPosition();
}

function showPetWindowInactive(): void {
  if (!petWindow || petWindow.isDestroyed()) return;
  if (!petWindow.isVisible()) petWindow.showInactive();
  if (process.platform === "darwin") {
    petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }
  petWindow.setAlwaysOnTop(true, process.platform === "darwin" ? "floating" : "normal");
  updateTrayMenu();
  sendPetLayout();
  publishSnapshot();
}

function createPetWindow(): void {
  const icon = runtimeAssetPath("tray-icon.png");
  const bounds = initialPetBounds();
  petLayout = layoutForPetAnchor(bounds);
  petWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    show: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    icon,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: !IS_DEV
    }
  });

  petWindow.setAlwaysOnTop(true, process.platform === "darwin" ? "floating" : "normal");
  if (process.platform === "darwin") {
    petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }
  loadRenderer(petWindow, "pet");
  petWindow.once("ready-to-show", showPetWindowInactive);
  petWindow.webContents.once("did-finish-load", showPetWindowInactive);
  petWindow.on("show", () => {
    updateTrayMenu();
    publishSnapshot();
  });
  petWindow.on("hide", () => {
    stopPetDrag();
    updateTrayMenu();
    publishSnapshot();
  });
  petWindow.on("closed", () => {
    stopPetDrag();
    petWindow = null;
    updateTrayMenu();
    publishSnapshot();
  });
}

function ensurePetWindowVisible(): void {
  if (!petWindow || petWindow.isDestroyed()) createPetWindow();
  showPetWindowInactive();
}

function createSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: SETTINGS_WINDOW.width,
    height: SETTINGS_WINDOW.height,
    title: `${APP_NAME} ${text().menu.settings}`,
    resizable: true,
    minWidth: SETTINGS_WINDOW.width,
    maxWidth: SETTINGS_WINDOW.width,
    minHeight: 400,
    show: false,
    icon: runtimeAssetPath("tray-icon.png"),
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#14110f" : "#ffffff",
    ...(process.platform === "darwin"
      ? { titleBarStyle: "hiddenInset" as const, trafficLightPosition: { x: 14, y: 14 } }
      : {}),
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: !IS_DEV
    }
  });

  loadRenderer(settingsWindow, "settings");
  settingsWindow.once("ready-to-show", () => {
    settingsWindow?.show();
    publishSnapshot();
  });
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

function createTray(): void {
  tray = new Tray(createTrayImage(runtimeAssetPath(process.platform === "darwin" ? "trayTemplate.png" : "tray-icon.png")));
  tray.setToolTip(APP_NAME);
  tray.on("click", () => {
    tray?.popUpContextMenu();
  });
  if (process.platform !== "darwin") {
    nativeTheme.on("updated", () => tray?.setImage(createTrayImage(runtimeAssetPath("tray-icon.png"))));
  }
  nativeTheme.on("updated", () => {
    settingsWindow?.setBackgroundColor(nativeTheme.shouldUseDarkColors ? "#14110f" : "#ffffff");
  });
  updateTrayMenu();
}

function actionMenuItems(): Electron.MenuItemConstructorOptions[] {
  const dogVisible = Boolean(petWindow?.isVisible());
  const labels = text().menu;
  return [
    {
      label: dogVisible ? labels.hideDog : labels.showDog,
      click: () => {
        if (!petWindow) createPetWindow();
        if (!petWindow) return;
        if (petWindow.isVisible()) petWindow.hide();
        else petWindow.showInactive();
        updateTrayMenu();
        sendToAll("app:snapshot", snapshot());
      }
    },
    {
      label: focusActive ? labels.stopFocusMode : labels.startFocusMode,
      click: () => {
        if (focusActive) stopFocusMode(true);
        else startFocusMode();
      }
    },
    ...(app.isPackaged
      ? []
      : [
          { type: "separator" as const },
          { label: labels.demoBreakReminder, click: () => triggerDemo("break") },
          { label: labels.demoHydrationReminder, click: () => triggerDemo("hydration") },
          { label: labels.demoFocusWarning, click: () => triggerDemo("focusWarning") },
          { label: labels.demoHappyReaction, click: () => triggerDemo("happy") }
        ]),
    { type: "separator" },
    { label: labels.settings, click: createSettingsWindow }
  ];
}

function updateApplicationMenu(): void {
  const labels = text().menu;
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: APP_NAME,
      submenu: [
        ...actionMenuItems(),
        { type: "separator" },
        { role: "quit", label: labels.quit }
      ]
    },
    { role: "editMenu" },
    { role: "windowMenu" }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function updateTrayMenu(): void {
  updateApplicationMenu();
  if (!tray) return;
  const labels = text().menu;
  const template: Electron.MenuItemConstructorOptions[] = [
    { label: APP_NAME, enabled: false },
    { type: "separator" },
    ...actionMenuItems(),
    { type: "separator" },
    {
      label: labels.quit,
      click: () => {
        app.quit();
      }
    }
  ];
  tray.setContextMenu(Menu.buildFromTemplate(template));
}

function showPetContextMenu(): void {
  const labels = text().menu;
  const template: Electron.MenuItemConstructorOptions[] = [
    { label: labels.settings, click: createSettingsWindow },
    {
      label: focusActive ? labels.stopFocusMode : labels.startFocusMode,
      click: () => {
        if (focusActive) stopFocusMode(false);
        else startFocusMode();
      }
    },
    ...(app.isPackaged
      ? []
      : [
          { type: "separator" as const },
          { label: labels.demoBreakReminder, click: () => triggerDemo("break") },
          { label: labels.demoHydrationReminder, click: () => triggerDemo("hydration") },
          { label: labels.demoFocusWarning, click: () => triggerDemo("focusWarning") },
          { label: labels.demoHappyReaction, click: () => triggerDemo("happy") }
        ]),
    { type: "separator" },
    {
      label: labels.hideDog,
      click: () => {
        petWindow?.hide();
        updateTrayMenu();
        sendToAll("app:snapshot", snapshot());
      }
    }
  ];

  Menu.buildFromTemplate(template).popup({ window: petWindow ?? undefined });
}

function movePetWithCursor(): void {
  if (!petWindow || petWindow.isDestroyed()) return;
  const cursor = screen.getCursorScreenPoint();
  const size = petWindowSize();
  const bounds = clampBoundsToWorkArea({
    ...size,
    x: cursor.x - dragOffset.x,
    y: cursor.y - dragOffset.y
  });
  petWindow.setBounds(bounds);
}

function startPetDrag(offset: { offsetX: number; offsetY: number }): void {
  if (blockingMode === "breakRun" || !petWindow || petWindow.isDestroyed()) return;
  stopAmbientRoam(false);
  stopAmbientPose(true);
  dragOffset = {
    x: Math.min(Math.max(Math.round(offset.offsetX), 0), petWindow.getBounds().width),
    y: Math.min(Math.max(Math.round(offset.offsetY), 0), petWindow.getBounds().height)
  };
  if (dragTimer) clearInterval(dragTimer);
  if (dragSafetyTimer) clearTimeout(dragSafetyTimer);
  movePetWithCursor();
  dragTimer = setInterval(movePetWithCursor, 16);
  dragSafetyTimer = setTimeout(stopPetDrag, 15_000);
}

function stopPetDrag(): void {
  const wasDragging = Boolean(dragTimer || dragSafetyTimer);
  if (dragTimer) {
    clearInterval(dragTimer);
    dragTimer = null;
  }
  if (dragSafetyTimer) {
    clearTimeout(dragSafetyTimer);
    dragSafetyTimer = null;
  }
  if (wasDragging) {
    persistPetPosition();
    sendToAll("app:snapshot", snapshot());
    scheduleAmbientPose();
  }
}

function canAmbientRoam(): boolean {
  const settings = getSettings();
  return Boolean(
    petWindow?.isVisible() &&
      settings.petRoamEnabled &&
      !blockingMode &&
      !focusActive &&
      !currentBubble &&
      !dragTimer &&
      !dragSafetyTimer &&
      (petState === "idle" || petState === "sitting" || petState === "sleeping")
  );
}

function canAmbientPose(): boolean {
  return Boolean(
    petWindow?.isVisible() &&
      !blockingMode &&
      !focusActive &&
      !currentBubble &&
      !dragTimer &&
      !dragSafetyTimer &&
      !ambientRoamMoveTimer &&
      !agentPoseTimer &&
      petState === "idle"
  );
}

function stopAmbientPose(restoreState: boolean): void {
  if (ambientPoseTimer) {
    clearTimeout(ambientPoseTimer);
    ambientPoseTimer = null;
  }
  if (ambientPoseStopTimer) {
    clearTimeout(ambientPoseStopTimer);
    ambientPoseStopTimer = null;
  }
  if (restoreState && ambientPoseActiveState && petState === ambientPoseActiveState) {
    setPetState("idle");
  }
  ambientPoseActiveState = null;
}

function scheduleAmbientPose(delayMs?: number): void {
  stopAmbientPose(false);
  const settings = getSettings();
  const baseDelay = clampNumber(
    settings.petIdleMotionSeconds * 5000,
    AMBIENT_POSE_MIN_DELAY_MS,
    AMBIENT_POSE_MAX_DELAY_MS
  );
  const jitter = Math.round(baseDelay * (Math.random() * 0.35 - 0.12));
  ambientPoseTimer = setTimeout(
    startAmbientPose,
    delayMs ?? Math.max(AMBIENT_POSE_MIN_DELAY_MS, baseDelay + jitter)
  );
}

function startAmbientPose(): void {
  if (!canAmbientPose()) {
    scheduleAmbientPose();
    return;
  }

  const next = pick<PetState>(["waiting", "reviewing", "waving", "thinking"]);
  ambientPoseActiveState = next;
  setPetState(next);
  ambientPoseStopTimer = setTimeout(() => {
    if (ambientPoseActiveState && petState === ambientPoseActiveState) setPetState("idle");
    ambientPoseActiveState = null;
    scheduleAmbientPose();
  }, 1600 + Math.round(Math.random() * 1200));
}

function scheduleAmbientRoam(delayMs?: number): void {
  if (ambientRoamTimer) clearTimeout(ambientRoamTimer);
  const settings = getSettings();
  if (!settings.petRoamEnabled) return;
  const baseDelay = settings.petRoamFrequencySeconds * 1000;
  const jitter = Math.round(baseDelay * (Math.random() * 0.3 - 0.15));
  ambientRoamTimer = setTimeout(startAmbientRoam, delayMs ?? Math.max(1000, baseDelay + jitter));
}

function startAmbientRoam(): void {
  if (!canAmbientRoam() || !petWindow || petWindow.isDestroyed()) {
    scheduleAmbientRoam();
    return;
  }

  stopAmbientPose(false);
  const settings = getSettings();
  ambientRoamDirection =
    settings.petRoamDirection === "both"
      ? Math.random() > 0.5
        ? "right"
        : "left"
      : settings.petRoamDirection;
  ambientRoamSpeed = 1.8 + Math.random() * 1.6;
  setPetState(ambientRoamDirection === "right" ? "runningRight" : "runningLeft");
  setPetFacing(ambientRoamDirection);

  if (ambientRoamMoveTimer) clearInterval(ambientRoamMoveTimer);
  if (ambientRoamStopTimer) clearTimeout(ambientRoamStopTimer);
  ambientRoamMoveTimer = setInterval(movePetForAmbientRoam, AMBIENT_ROAM_TICK_MS);
  ambientRoamStopTimer = setTimeout(
    () => stopAmbientRoam(true),
    settings.petRoamDurationSeconds * 1000
  );
}

function movePetForAmbientRoam(): void {
  if (!petWindow || petWindow.isDestroyed() || !petWindow.isVisible()) return;
  if (blockingMode || dragTimer || dragSafetyTimer) {
    stopAmbientRoam(true);
    return;
  }

  const bounds = petWindow.getBounds();
  const workArea = screen.getDisplayNearestPoint({
    x: bounds.x + Math.round(bounds.width / 2),
    y: bounds.y + Math.round(bounds.height / 2)
  }).workArea;
  const delta = ambientRoamDirection === "right" ? ambientRoamSpeed : -ambientRoamSpeed;
  const minX = workArea.x + 4;
  const maxX = workArea.x + workArea.width - bounds.width - 4;
  let nextX = bounds.x + delta;

  if (nextX >= maxX) {
    nextX = maxX;
    ambientRoamDirection = "left";
    setPetState("runningLeft");
    setPetFacing("left");
  }
  if (nextX <= minX) {
    nextX = minX;
    ambientRoamDirection = "right";
    setPetState("runningRight");
    setPetFacing("right");
  }

  petWindow.setBounds({
    ...bounds,
    x: Math.round(nextX)
  });
}

function stopAmbientRoam(scheduleNext: boolean): void {
  if (ambientRoamTimer) {
    clearTimeout(ambientRoamTimer);
    ambientRoamTimer = null;
  }
  if (ambientRoamMoveTimer) {
    clearInterval(ambientRoamMoveTimer);
    ambientRoamMoveTimer = null;
  }
  if (ambientRoamStopTimer) {
    clearTimeout(ambientRoamStopTimer);
    ambientRoamStopTimer = null;
  }
  if (petState === "runningLeft" || petState === "runningRight") {
    setPetState(focusActive ? "focusGuard" : "idle");
    persistPetPosition();
  }
  if (scheduleNext) scheduleAmbientRoam();
  if (scheduleNext) scheduleAmbientPose();
}

function startClickRunReaction(direction: "left" | "right"): void {
  if (!petWindow || petWindow.isDestroyed() || blockingMode || focusActive) return;
  stopAmbientRoam(false);
  stopAmbientPose(true);
  clearAgentPose(true);
  ambientRoamDirection = direction;
  ambientRoamSpeed = 4.2 + Math.random() * 2.4;
  setPetState(direction === "right" ? "runningRight" : "runningLeft");
  setPetFacing(direction);
  if (ambientRoamMoveTimer) clearInterval(ambientRoamMoveTimer);
  if (ambientRoamStopTimer) clearTimeout(ambientRoamStopTimer);
  ambientRoamMoveTimer = setInterval(movePetForAmbientRoam, AMBIENT_ROAM_TICK_MS);
  ambientRoamStopTimer = setTimeout(() => stopAmbientRoam(true), 1100 + Math.round(Math.random() * 700));
}

function clearBreakRunTimers(): void {
  if (breakRunTimer) {
    clearTimeout(breakRunTimer);
    breakRunTimer = null;
  }
  if (breakRunCountdownTimer) {
    clearInterval(breakRunCountdownTimer);
    breakRunCountdownTimer = null;
  }
  if (breakRunMovementTimer) {
    clearInterval(breakRunMovementTimer);
    breakRunMovementTimer = null;
  }
  if (screenBlockTimer) {
    clearTimeout(screenBlockTimer);
    screenBlockTimer = null;
  }
  if (screenBlockCountdownTimer) {
    clearInterval(screenBlockCountdownTimer);
    screenBlockCountdownTimer = null;
  }
  if (focusWarningTimer) {
    clearTimeout(focusWarningTimer);
    focusWarningTimer = null;
  }
}

function showBreakRunCountdown(endsAt: number): void {
  const labels = text();
  const remainingSeconds = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  const formatter = breakRunFormatter ?? pick(labels.bubble.breakRun);
  showBubble({
    id: "break-run",
    message: formatter(remainingSeconds),
    actions: [
      { id: "break-run:done", label: labels.actions.breakRunDone, kind: "primary" },
      { id: "break-run:snooze", label: labels.actions.breakSnooze }
    ]
  });
}

function chooseBreakRunVelocity(): PetPosition {
  const speed = 3.5 + Math.random() * 2.9;
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed
  };
}

function movePetForBreakRun(): void {
  if (!petWindow || petWindow.isDestroyed() || !petWindow.isVisible()) return;

  const bounds = petWindow.getBounds();
  const workArea = screen.getDisplayNearestPoint({
    x: bounds.x + Math.round(bounds.width / 2),
    y: bounds.y + Math.round(bounds.height / 2)
  }).workArea;
  const now = Date.now();
  const minX = workArea.x + 8;
  const maxX = workArea.x + workArea.width - bounds.width - 8;
  const minY = workArea.y + 8;
  const maxY = workArea.y + workArea.height - bounds.height - 8;

  if (now >= nextBreakRunTurnAt && Math.random() < 0.45) {
    breakRunVelocity = chooseBreakRunVelocity();
  }

  let nextX = bounds.x + breakRunVelocity.x;
  let nextY = bounds.y + breakRunVelocity.y;

  if (nextX <= minX) {
    nextX = minX;
    breakRunVelocity.x = Math.abs(breakRunVelocity.x);
  }
  if (nextX >= maxX) {
    nextX = maxX;
    breakRunVelocity.x = -Math.abs(breakRunVelocity.x);
  }
  if (nextY <= minY) {
    nextY = minY;
    breakRunVelocity.y = Math.abs(breakRunVelocity.y);
  }
  if (nextY >= maxY) {
    nextY = maxY;
    breakRunVelocity.y = -Math.abs(breakRunVelocity.y);
  }

  if (now >= nextBreakRunTurnAt) {
    nextBreakRunTurnAt = now + 350 + Math.round(Math.random() * 850);
  }

  setPetFacing(breakRunVelocity.x >= 0 ? "right" : "left");
  petWindow.setBounds({
    ...bounds,
    x: Math.round(nextX),
    y: Math.round(nextY)
  });
}

function finishBreakRun(): void {
  clearBreakRunTimers();
  breakRunFormatter = null;
  blockingMode = null;
  screenBlockEndsAt = null;
  restorePetWindowAfterScreenBlock();
  updateStats((stats) => ({ ...stats, breaksTaken: stats.breaksTaken + 1 }));
  hideBubble();
  showBubble({ id: "break-run-complete", message: pick(text().bubble.breakRunComplete), autoDismissMs: 2200 });
  setPetState("breakDone");
  setTimeout(() => {
    if (!blockingMode && !focusActive) {
      hideBubble();
      setPetState("idle");
      scheduleReminderTimers();
      scheduleAmbientPose();
    }
  }, 2300);
  publishSnapshot();
}

function startBreakRun(): void {
  ensurePetWindowVisible();
  clearBreakRunTimers();
  stopPetDrag();
  stopAmbientRoam(false);
  stopAmbientPose(true);
  blockingMode = "breakRun";
  breakDueAt = null;
  breakSnoozeDueAt = null;
  breakRunFormatter = pick(text().bubble.breakRun);
  expandPetWindowForScreenBlock();
  setPetState("breakRunning");
  setPetFacing("right");
  breakRunVelocity = chooseBreakRunVelocity();
  nextBreakRunTurnAt = Date.now() + 600;
  const settings = getSettings();
  const durationMs = Math.max(15, settings.screenBlockDurationSeconds) * 1000;
  const endsAt = Date.now() + durationMs;
  screenBlockEndsAt = endsAt;
  showBreakRunCountdown(endsAt);
  screenBlockCountdownTimer = setInterval(() => showBreakRunCountdown(endsAt), 1000);
  breakRunMovementTimer = setInterval(movePetForBreakRun, BREAK_RUN_TICK_MS);
  screenBlockTimer = setTimeout(finishBreakRun, durationMs);
  publishSnapshot();
}

function expandPetWindowForScreenBlock(coverageRatio?: number): void {
  if (!petWindow || petWindow.isDestroyed()) return;
  const settings = getSettings();
  const current = petWindow.getBounds();
  preScreenBlockBounds = current;
  const display = screen.getDisplayNearestPoint({
    x: current.x + Math.round(current.width / 2),
    y: current.y + Math.round(current.height / 2)
  });
  const workArea = display.workArea;
  const ratio = Math.min(1, Math.max(0.35, coverageRatio ?? settings.screenBlockCoverageRatio));
  const targetWidth = Math.max(SCREEN_BLOCK_WINDOW.minWidth, Math.round(workArea.width * ratio));
  const targetHeight = Math.max(SCREEN_BLOCK_WINDOW.minHeight, Math.round(workArea.height * ratio));
  petWindow.setBounds({
    width: Math.min(workArea.width, targetWidth),
    height: Math.min(workArea.height, targetHeight),
    x: workArea.x + Math.round((workArea.width - targetWidth) / 2),
    y: workArea.y + Math.round((workArea.height - targetHeight) / 2)
  });
  petLayout = layoutForPetAnchor(petWindow.getBounds());
  sendPetLayout();
  petWindow.setAlwaysOnTop(true, process.platform === "darwin" ? "screen-saver" : "pop-up-menu");
}

function restorePetWindowAfterScreenBlock(): void {
  if (!petWindow || petWindow.isDestroyed()) return;
  if (preScreenBlockBounds) {
    petWindow.setBounds(clampBoundsToWorkArea(preScreenBlockBounds));
    preScreenBlockBounds = null;
  } else {
    petWindow.setBounds(initialPetBounds());
  }
  petLayout = layoutForPetAnchor(petWindow.getBounds());
  sendPetLayout();
  petWindow.setAlwaysOnTop(true, process.platform === "darwin" ? "floating" : "normal");
}

function scheduleReminderTimers(): void {
  if (breakTimer) clearTimeout(breakTimer);
  if (hydrationTimer) clearTimeout(hydrationTimer);
  breakDueAt = null;
  breakSnoozeDueAt = null;
  hydrationDueAt = null;

  const settings = getSettings();
  if (settings.breakReminderEnabled && !breakMutedToday) {
    breakDueAt = Date.now() + settings.breakIntervalMinutes * 60 * 1000;
    breakTimer = setTimeout(
      () => triggerBreakReminder(false),
      settings.breakIntervalMinutes * 60 * 1000
    );
  }
  if (settings.hydrationReminderEnabled) {
    hydrationDueAt = Date.now() + settings.hydrationIntervalMinutes * 60 * 1000;
    hydrationTimer = setTimeout(
      () => triggerHydrationReminder(false),
      settings.hydrationIntervalMinutes * 60 * 1000
    );
  }
  publishSnapshot();
}

function setDistractionStatus(partial: Partial<DistractionStatus>): void {
  distractionStatus = { ...distractionStatus, ...partial };
  publishSnapshot();
}

async function checkDistractionNow(): Promise<void> {
  const settings = getSettings();
  if (!settings.distractionDetectionEnabled) return;

  try {
    const active = await readActiveWindow();
    const matchedRule = classifyDistraction(active, settings);
    const now = Date.now();

    setDistractionStatus({
      state: "watching",
      activeApp: active.appName,
      activeWindowTitle: active.windowTitle,
      matchedRule,
      lastCheckedAt: now,
      error: null
    });

    if (!focusActive || blockingMode === "focusWarning") return;
    if (!matchedRule) return;
    if (
      distractionStatus.lastWarningAt &&
      now - distractionStatus.lastWarningAt < DISTRACTION_WARNING_COOLDOWN_MS
    ) {
      return;
    }

    setDistractionStatus({ lastWarningAt: now });
    triggerFocusWarning(matchedRule.replace(/^(app|keyword):/, ""));
  } catch (error) {
    setDistractionStatus({
      state: isPermissionError(error) ? "permission-needed" : "error",
      error: error instanceof Error ? error.message : String(error),
      lastCheckedAt: Date.now()
    });
  }
}

function scheduleDistractionDetection(): void {
  if (distractionTimer) {
    clearInterval(distractionTimer);
    distractionTimer = null;
  }
  if (distractionStartupTimer) {
    clearTimeout(distractionStartupTimer);
    distractionStartupTimer = null;
  }

  const settings = getSettings();
  if (!settings.distractionDetectionEnabled) {
    setDistractionStatus({
      state: "idle",
      matchedRule: null,
      error: null
    });
    return;
  }

  setDistractionStatus({
    state: process.platform === "darwin" ? "watching" : "unsupported",
    error: process.platform === "darwin" ? null : text().system.unsupportedDistraction
  });

  if (process.platform !== "darwin") return;

  const firstCheckDelay = focusActive ? Math.max(0, settings.distractionGraceSeconds * 1000) : 0;
  distractionStartupTimer = setTimeout(() => {
    void checkDistractionNow();
    distractionTimer = setInterval(() => void checkDistractionNow(), DISTRACTION_CHECK_INTERVAL_MS);
  }, firstCheckDelay);
}

function isAgentLikeWindow(appName: string, title: string): boolean {
  const target = `${appName} ${title}`;
  return /codex|claude|cursor|terminal|iterm|warp|vscode|visual studio code/i.test(target);
}

function titleLooksBusy(title: string): boolean {
  return /running|working|thinking|generating|executing|building|applying|processing|in progress|正在|运行|执行|生成|思考|处理中|…/.test(
    title.toLowerCase()
  );
}

function titleLooksDone(title: string): boolean {
  return /complete|completed|finished|done|success|ready|waiting for input|needs review|changes applied|任务完成|完成|已完成|等待输入|成功/.test(
    title.toLowerCase()
  );
}

function execFileText(file: string, args: string[]): Promise<string> {
  return new Promise((resolveText) => {
    execFile(file, args, { timeout: 1500 }, (_error, stdout) => {
      resolveText(stdout);
    });
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function eventTimeMs(value: unknown): number {
  const parsed = Date.parse(stringValue(value));
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function hashText(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function rememberAgentEvent(id: string): void {
  agentSeenEventIds.add(id);
  if (agentSeenEventIds.size <= 500) return;
  const first = agentSeenEventIds.values().next().value;
  if (typeof first === "string") agentSeenEventIds.delete(first);
}

function markAgentSessionWorking(event: Pick<AgentMonitorEvent, "sessionKey">): void {
  agentActiveSessions.set(event.sessionKey, Date.now());
  for (const [sessionKey, lastSeenAt] of agentActiveSessions) {
    if (Date.now() - lastSeenAt > AGENT_EVENT_MAX_AGE_MS) {
      agentActiveSessions.delete(sessionKey);
    }
  }
}

function hasRecentAgentWork(event: Pick<AgentMonitorEvent, "sessionKey">): boolean {
  const lastSeenAt = agentActiveSessions.get(event.sessionKey);
  return Boolean(lastSeenAt && Date.now() - lastSeenAt <= AGENT_EVENT_MAX_AGE_MS);
}

function listRecentFiles(root: string, extension: string, maxFiles: number, maxDepth = 5): string[] {
  if (!existsSync(root)) return [];
  const files: Array<{ path: string; mtimeMs: number }> = [];

  function walk(directory: string, depth: number): void {
    if (depth < 0) return;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(path, depth - 1);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(extension)) continue;
      try {
        files.push({ path, mtimeMs: statSync(path).mtimeMs });
      } catch {
        // Ignore files that disappear while sessions rotate.
      }
    }
  }

  walk(root, maxDepth);
  return files
    .sort((left, right) => right.mtimeMs - left.mtimeMs)
    .slice(0, maxFiles)
    .map((file) => file.path);
}

function readTextTail(path: string, maxBytes = 96_000): string {
  const stat = statSync(path);
  const start = Math.max(0, stat.size - maxBytes);
  const length = stat.size - start;
  const buffer = Buffer.alloc(length);
  const fd = openSync(path, "r");
  try {
    readSync(fd, buffer, 0, length, start);
  } finally {
    closeSync(fd);
  }
  return buffer.toString("utf8");
}

function parseJsonLinesTail(path: string): Array<Record<string, unknown>> {
  try {
    const text = readTextTail(path);
    const lines = text.split("\n");
    if (!text.startsWith("{")) lines.shift();
    return lines
      .map((line) => {
        try {
          return asRecord(JSON.parse(line));
        } catch {
          return null;
        }
      })
      .filter((line): line is Record<string, unknown> => Boolean(line));
  } catch {
    return [];
  }
}

function extractTextFromContent(content: unknown, typeName: string): string {
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      const record = asRecord(part);
      if (!record || record.type !== typeName) return "";
      return stringValue(record.text);
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

function compactAgentText(text: string): string {
  const plain = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const firstSentence = plain.match(/^.{8,90}?[。！？.!?](?=\s|$)/)?.[0] ?? plain;
  return firstSentence.length > 58 ? `${firstSentence.slice(0, 56)}...` : firstSentence;
}

function extractClaudeRecap(text: string): string | null {
  const recap = text.match(
    /※\s*recap\s*:\s*([\s\S]*?)(?:\(\s*disable recaps in \/config\s*\)|$)/i
  )?.[1];
  if (!recap) return null;
  const cleaned = recap.replace(/\s+/g, " ").trim();
  return cleaned || null;
}

function claudePromptProgressText(prompt: string): string {
  const recap = extractClaudeRecap(prompt);
  if (recap) return compactAgentText(recap);
  return "Claude Code 正在处理任务";
}

function classifyAgentProgressKind(text: string, fallback: AgentProgressKind = "working"): AgentProgressKind {
  if (/(权限|授权|批准|允许|permission|approval|authorize|grant access|allow access|sandbox)/i.test(text)) {
    return "permission";
  }
  if (/(选择|选项|决定|确认方案|二选一|choose|pick|select|option|decision|which one)/i.test(text)) {
    return "choice";
  }
  if (/(脚本|命令|终端|执行.*(pnpm|npm|yarn|node|python|pytest|tsc|shell)|script|command|terminal|exec_command|write_stdin|running command|shell)/i.test(text)) {
    return "script";
  }
  if (/(工具|调用|tool|function_call)/i.test(text)) return "tool";
  if (/(思考|推理|reasoning|thinking)/i.test(text)) return "thinking";
  if (/(需要|review|attention|done|完成|停下)/i.test(text)) return "review";
  return fallback;
}

function classifyAgentText(text: string): Omit<AgentMonitorEvent, "id" | "source" | "sessionKey" | "timestampMs"> | null {
  const compact = compactAgentText(text);
  if (!compact) return null;

  const progressKind = classifyAgentProgressKind(text);

  if (progressKind === "permission") {
    return {
      kind: "needs-review",
      message: compact,
      progressKind,
      state: "reviewing"
    };
  }

  if (progressKind === "choice") {
    return {
      kind: "needs-review",
      message: compact,
      progressKind,
      state: "reviewing"
    };
  }

  if (/(报错|失败|没有通过|无法继续|blocked|failed|error)/i.test(text)) {
    return {
      kind: "failed",
      message: compact,
      progressKind: "failed",
      state: "failed"
    };
  }

  if (/(等待你|需要你|请你|需要确认|可以看|去看一眼|waiting for input|needs review|review it)/i.test(text)) {
    return {
      kind: "needs-review",
      message: compact,
      progressKind: "review",
      state: "reviewing"
    };
  }

  if (
    /^(已|都|好，?已|装好|修好|完成|All done|Done|Fixed|Ready)/i.test(compact) ||
    /(已修完|已处理|已完成|修好了|完成了|安装完成|改好了|实现了|重启应用|done\.?|fixed\.?|ready\.?)/i.test(text)
  ) {
    return {
      kind: "complete",
      message: compact,
      progressKind: "complete",
      state: "waving"
    };
  }

  if (/(我会|我先|现在|接下来|正在|先看|先确认|thinking|working|running|executing|processing|applying)/i.test(text)) {
    return {
      kind: "working",
      message: compact,
      progressKind,
      state: "thinking"
    };
  }

  return null;
}

function agentProgressMessage(event: Pick<AgentMonitorEvent, "source" | "message" | "progressKind">): string {
  const labels = text().bubble;
  const progressKind = event.progressKind ?? classifyAgentProgressKind(event.message);
  if (progressKind === "permission") return pick(labels.agentNeedsPermission)(event.source);
  if (progressKind === "choice") return pick(labels.agentNeedsChoice)(event.source);
  if (progressKind === "script") return pick(labels.agentRunningScript)(event.source);
  if (progressKind === "tool") return pick(labels.agentUsingTool)(event.source);
  if (progressKind === "thinking") return pick(labels.agentThinking)(event.source);
  if (progressKind === "review") return pick(labels.agentNeedsReview)(event.source);
  return pick(labels.agentWorking)(event.source);
}

function agentEventMessage(event: AgentMonitorEvent): string {
  const labels = text().bubble;
  if (event.kind === "failed") return pick(labels.agentFailed)(event.source);
  if (event.progressKind === "permission") return pick(labels.agentNeedsPermission)(event.source);
  if (event.progressKind === "choice") return pick(labels.agentNeedsChoice)(event.source);
  if (event.kind === "needs-review") return pick(labels.agentNeedsReview)(event.source);
  return pick(labels.agentComplete)(event.source);
}

function playAgentCompletionSound(event: AgentMonitorEvent): void {
  if (!getSettings().agentCompletionSoundEnabled) return;
  if (event.kind !== "complete" && event.kind !== "failed") return;
  if (process.platform === "darwin") {
    const sound = event.kind === "failed" ? "Basso.aiff" : "Glass.aiff";
    execFile(
      "/usr/bin/afplay",
      [join("/System/Library/Sounds", sound)],
      { timeout: 2500 },
      (error) => {
        if (!error) return;
        execFile("/usr/bin/osascript", ["-e", "beep 1"], { timeout: 1500 }, () => {
          shell.beep();
        });
      }
    );
    return;
  }
  shell.beep();
}

function makeAgentEvent(
  source: AgentSource,
  path: string,
  timestampMs: number,
  text: string,
  classified: Omit<AgentMonitorEvent, "id" | "source" | "sessionKey" | "timestampMs">
): AgentMonitorEvent {
  return {
    ...classified,
    id: `${source}:${path}:${timestampMs}:${classified.kind}:${hashText(text)}`,
    source,
    sessionKey: `${source}:${path}`,
    timestampMs
  };
}

function collectCodexSessionEvents(): AgentMonitorEvent[] {
  const sessionsRoot = join(app.getPath("home"), ".codex", "sessions");
  const files = listRecentFiles(sessionsRoot, ".jsonl", 4);
  const events: AgentMonitorEvent[] = [];

  for (const file of files) {
    for (const line of parseJsonLinesTail(file)) {
      if (line.type !== "response_item") continue;
      const payload = asRecord(line.payload);
      if (!payload) continue;
      const timestampMs = eventTimeMs(line.timestamp);
      const payloadType = stringValue(payload.type);

      if (payloadType === "message") {
        const text = extractTextFromContent(payload.content, "output_text");
        const classified = classifyAgentText(text);
        if (classified) events.push(makeAgentEvent("Codex", file, timestampMs, text, classified));
        continue;
      }

      if (payloadType === "function_call" || payloadType === "reasoning") {
        const callName = stringValue(payload.name);
        const progressKind = payloadType === "reasoning"
          ? "thinking"
          : classifyAgentProgressKind(callName || "正在执行工具", "tool");
        events.push({
          id: `Codex:${file}:${timestampMs}:${payloadType}`,
          source: "Codex",
          sessionKey: `Codex:${file}`,
          kind: "working",
          message: payloadType === "function_call" ? callName || "正在执行工具" : "正在思考",
          progressKind,
          state: "thinking",
          timestampMs
        });
      }
    }
  }

  return events;
}

function collectClaudeSessionEvents(): AgentMonitorEvent[] {
  const projectRoot = join(app.getPath("home"), ".claude", "projects");
  const files = listRecentFiles(projectRoot, ".jsonl", 5, 3);
  const events: AgentMonitorEvent[] = [];

  for (const file of files) {
    for (const line of parseJsonLinesTail(file)) {
      const timestampMs = eventTimeMs(line.timestamp);
      if (line.type === "last-prompt") {
        const prompt = stringValue(line.lastPrompt);
        const message = claudePromptProgressText(prompt);
        events.push({
          id: `Claude Code:${file}:${timestampMs}:prompt:${hashText(prompt)}`,
          source: "Claude Code",
          sessionKey: `Claude Code:${file}`,
          kind: "working",
          message,
          progressKind: classifyAgentProgressKind(message),
          state: "thinking",
          timestampMs,
          showProgress: false
        });
        continue;
      }

      if (line.type !== "assistant") continue;
      const message = asRecord(line.message);
      if (!message) continue;
      const stopReason = stringValue(message.stop_reason);
      const text = extractTextFromContent(message.content, "text");

      if (stopReason === "end_turn") {
        const classified = classifyAgentText(text);
        if (classified) {
          const uuid = stringValue(line.uuid) || hashText(text);
          events.push({
            ...makeAgentEvent("Claude Code", file, timestampMs, text, classified),
            id: `Claude Code:${file}:${uuid}:${classified.kind}`
          });
        }
        continue;
      }

      if (stopReason === "tool_use") {
        events.push({
          id: `Claude Code:${file}:${timestampMs}:tool_use:${hashText(text)}`,
          source: "Claude Code",
          sessionKey: `Claude Code:${file}`,
          kind: "working",
          message: compactAgentText(text || "正在执行工具"),
          progressKind: classifyAgentProgressKind(text || "正在执行工具", "tool"),
          state: "thinking",
          timestampMs
        });
      }
    }
  }

  return events;
}

function collectClaudeStatusEvents(): AgentMonitorEvent[] {
  const sessionsRoot = join(app.getPath("home"), ".claude", "sessions");
  const files = listRecentFiles(sessionsRoot, ".json", 8, 1);
  const events: AgentMonitorEvent[] = [];

  for (const file of files) {
    try {
      const data = asRecord(JSON.parse(readFileSync(file, "utf8")));
      if (!data) continue;
      const sessionId = stringValue(data.sessionId) || file;
      const status = stringValue(data.status);
      const previous = claudeSessionStatuses.get(sessionId);
      claudeSessionStatuses.set(sessionId, status);
      if (!previous || previous === status) continue;

      const timestampMs =
        typeof data.updatedAt === "number" && Number.isFinite(data.updatedAt)
          ? data.updatedAt
          : Date.now();
      if (status === "idle" && /busy|running|working|processing/i.test(previous)) {
        events.push({
          id: `Claude Code:${sessionId}:${timestampMs}:idle`,
          source: "Claude Code",
          sessionKey: `Claude Code:${sessionId}`,
          kind: "complete",
          message: "任务已停下，可以看结果",
          progressKind: "complete",
          state: "waving",
          timestampMs
        });
      }
      if (/busy|running|working|processing/i.test(status)) {
        events.push({
          id: `Claude Code:${sessionId}:${timestampMs}:busy`,
          source: "Claude Code",
          sessionKey: `Claude Code:${sessionId}`,
          kind: "working",
          message: "Claude Code 正在处理任务",
          progressKind: "working",
          state: "thinking",
          timestampMs,
          showProgress: false
        });
      }
      if (/error|failed/i.test(status)) {
        events.push({
          id: `Claude Code:${sessionId}:${timestampMs}:failed`,
          source: "Claude Code",
          sessionKey: `Claude Code:${sessionId}`,
          kind: "failed",
          message: "任务状态变成失败",
          progressKind: "failed",
          state: "failed",
          timestampMs
        });
      }
    } catch {
      // Ignore incomplete status files while Claude Code is writing them.
    }
  }

  return events;
}

function clearAgentPose(restoreState: boolean): void {
  if (agentPoseTimer) {
    clearTimeout(agentPoseTimer);
    agentPoseTimer = null;
  }
  if (restoreState && agentPoseActiveState && petState === agentPoseActiveState) {
    setPetState(focusActive ? "focusGuard" : "idle");
  }
  agentPoseActiveState = null;
}

function showAgentWorkingPose(event: Pick<AgentMonitorEvent, "source" | "message" | "progressKind" | "timestampMs">): void {
  if (blockingMode || focusActive) return;
  ensurePetWindowVisible();
  if (!petWindow?.isVisible()) return;
  stopAmbientRoam(false);
  stopAmbientPose(true);
  clearAgentPose(false);
  agentPoseActiveState = "thinking";
  setPetState("thinking");
  const now = Date.now();
  if (!currentBubble?.actions?.length && now - agentLastProgressBubbleAt > 8000) {
    agentLastProgressBubbleAt = now;
    showBubble({
      id: `agent-progress-${event.timestampMs}`,
      message: agentProgressMessage(event),
      autoDismissMs: 3200
    });
  }
  agentPoseTimer = setTimeout(() => {
    clearAgentPose(true);
    if (!focusActive && !blockingMode) {
      scheduleAmbientRoam();
      scheduleAmbientPose();
    }
  }, 5200);
}

function notifyAgentEvent(event: AgentMonitorEvent): boolean {
  if (blockingMode || currentBubble?.actions?.length) return false;
  const now = Date.now();
  if (now - agentLastNotificationAt < 7000) return false;
  agentLastNotificationAt = now;
  ensurePetWindowVisible();
  stopAmbientRoam(false);
  stopAmbientPose(true);
  clearAgentPose(false);

  const bubbleId = `agent-${event.kind}-${event.timestampMs}`;
  playAgentCompletionSound(event);
  setPetState(event.state);
  const displayMs = event.kind === "failed" ? 5200 : 3800;
  showBubble({
    id: bubbleId,
    message: agentEventMessage(event),
    autoDismissMs: displayMs
  });
  setTimeout(
    () => {
      if (currentBubble?.id === bubbleId) hideBubble();
      if (petState === event.state) setPetState(focusActive ? "focusGuard" : "idle");
      if (!focusActive && !blockingMode) {
        scheduleAmbientRoam(5000);
        scheduleAmbientPose();
      }
    },
    displayMs + 200
  );
  return true;
}

async function checkAgentActivityNow(): Promise<void> {
  if (!getSettings().agentActivityEnabled) return;
  try {
    const now = Date.now();
    const newestAllowedAt = now - AGENT_EVENT_MAX_AGE_MS;
    const events = [
      ...collectCodexSessionEvents(),
      ...collectClaudeSessionEvents(),
      ...collectClaudeStatusEvents()
    ]
      .filter((event) => event.timestampMs >= newestAllowedAt && event.timestampMs <= now + 30_000)
      .sort((left, right) => left.timestampMs - right.timestampMs);

    if (!agentMonitorPrimed) {
      const latestWorking = events.filter((event) => event.kind === "working").at(-1);
      for (const event of events) rememberAgentEvent(event.id);
      agentMonitorPrimed = true;
      if (latestWorking && now - latestWorking.timestampMs < 30_000) {
        markAgentSessionWorking(latestWorking);
        agentLastWorkingAt = Date.now();
        if (latestWorking.showProgress !== false) showAgentWorkingPose(latestWorking);
      }
      return;
    }

    for (const event of events) {
      if (agentSeenEventIds.has(event.id)) continue;
      if (event.kind === "working") {
        rememberAgentEvent(event.id);
        markAgentSessionWorking(event);
        agentLastWorkingAt = Date.now();
        if (event.showProgress !== false) showAgentWorkingPose(event);
        continue;
      }
      if (!hasRecentAgentWork(event)) {
        rememberAgentEvent(event.id);
        continue;
      }
      if (notifyAgentEvent(event)) rememberAgentEvent(event.id);
    }

    const active = await readActiveWindow().catch(() => null);
    if (!active || !isAgentLikeWindow(active.appName, active.windowTitle)) return;
    if (titleLooksBusy(active.windowTitle)) {
      agentLastWorkingAt = Date.now();
      showAgentWorkingPose({
        source: "Codex",
        message: "Agent is working",
        timestampMs: Date.now()
      });
    }
    if (titleLooksDone(active.windowTitle) && agentLastWorkingAt && now - agentLastWorkingAt < 20_000) {
      showAgentWorkingPose({
        source: "Codex",
        message: "Agent may need review",
        timestampMs: Date.now()
      });
    }
  } catch {
    // Local agent state is best-effort; missing logs or permissions should stay quiet.
  }
}

function scheduleAgentActivityMonitor(): void {
  if (agentActivityTimer) {
    clearInterval(agentActivityTimer);
    agentActivityTimer = null;
  }
  if (!getSettings().agentActivityEnabled || process.platform !== "darwin") return;
  agentActivityTimer = setInterval(
    () => void checkAgentActivityNow(),
    AGENT_ACTIVITY_CHECK_INTERVAL_MS
  );
  void checkAgentActivityNow();
}

function petLibrarySignature(): string {
  return getSettings()
    .installedPets.map((pet) => `${pet.slug}:${pet.importedAt}`)
    .sort()
    .join("|");
}

function schedulePetLibraryMonitor(): void {
  if (petLibraryTimer) clearInterval(petLibraryTimer);
  lastPetLibrarySignature = petLibrarySignature();
  petLibraryTimer = setInterval(() => {
    const next = petLibrarySignature();
    if (next === lastPetLibrarySignature) return;
    lastPetLibrarySignature = next;
    sendToAll("settings:updated", getSettings());
    publishSnapshot();
  }, PET_LIBRARY_CHECK_INTERVAL_MS);
}

function resumeLongTermState(): void {
  blockingMode = null;
  hideBubble();
  if (focusActive) {
    setPetState("focusGuard");
    sendToAll("app:snapshot", snapshot());
    return;
  }
  setPetState("idle");
  sendToAll("app:snapshot", snapshot());
  scheduleAmbientRoam();
  scheduleAmbientPose();
}

function happyFeedback(message: string | null = pick(text().bubble.woof), after?: () => void): void {
  if (blockingMode) return;
  stopAmbientRoam(false);
  stopAmbientPose(true);
  const returnState = focusActive ? "focusGuard" : "idle";
  setPetState("happy");
  if (message) {
    showBubble({ id: "happy", message, autoDismissMs: 1800 });
  }
  setTimeout(() => {
    hideBubble();
    setPetState(returnState);
    if (returnState === "idle") {
      scheduleAmbientRoam();
      scheduleAmbientPose();
    }
    after?.();
  }, 1900);
}

function simplePetReaction(state: PetState, durationMs: number, message: string | null = null): void {
  if (blockingMode) return;
  stopAmbientRoam(false);
  stopAmbientPose(true);
  clearAgentPose(true);
  const returnState = focusActive ? "focusGuard" : "idle";
  setPetState(state);
  if (message) showBubble({ id: `click-${state}-${Date.now()}`, message, autoDismissMs: durationMs - 100 });
  setTimeout(() => {
    if (message) hideBubble();
    if (petState === state) setPetState(returnState);
    if (returnState === "idle") {
      scheduleAmbientRoam(1200);
      scheduleAmbientPose();
    }
  }, durationMs);
}

function randomPetClickReaction(): void {
  const reaction = pick([
    "happy",
    "sad",
    "waving",
    "jumping",
    "thinking",
    "run-left",
    "run-right"
  ] as const);
  if (reaction === "run-left" || reaction === "run-right") {
    startClickRunReaction(reaction === "run-left" ? "left" : "right");
    return;
  }
  if (reaction === "happy") {
    happyFeedback(Math.random() > 0.5 ? pick(text().bubble.woof) : null);
    return;
  }
  simplePetReaction(reaction, reaction === "sad" ? 1500 : 1300);
}

function triggerBreakReminder(fromDemo: boolean): void {
  if (blockingMode === "focusWarning" || blockingMode === "breakRun") return;
  if (!fromDemo && (focusActive || breakMutedToday)) {
    scheduleReminderTimers();
    return;
  }
  if (!fromDemo && getSettings().screenBlockReminderEnabled) {
    startBreakRun();
    return;
  }
  ensurePetWindowVisible();
  stopAmbientRoam(false);
  stopAmbientPose(true);
  blockingMode = "break";
  breakDueAt = null;
  breakSnoozeDueAt = null;
  publishSnapshot();
  setPetState("breakPrompt");
  const labels = text();
  showBubble({
    id: "break",
    message: pick(labels.bubble.breakReminder),
    actions: [
      { id: "break:done", label: labels.actions.breakDone, kind: "primary" },
      { id: "break:snooze", label: labels.actions.breakSnooze },
      { id: "break:mute", label: labels.actions.breakMute, kind: "danger" }
    ]
  });
}

function triggerHydrationReminder(fromDemo: boolean): void {
  if (blockingMode || (!fromDemo && focusActive)) {
    scheduleReminderTimers();
    return;
  }
  ensurePetWindowVisible();
  stopAmbientRoam(false);
  stopAmbientPose(true);
  blockingMode = "hydration";
  hydrationDueAt = null;
  publishSnapshot();
  setPetState("hydrationPrompt");
  const labels = text();
  showBubble({
    id: "hydration",
    message: pick(labels.bubble.hydrationReminder),
    actions: [
      { id: "hydration:done", label: labels.actions.hydrationDone, kind: "primary" },
      { id: "hydration:snooze", label: labels.actions.hydrationSnooze }
    ]
  });
}

function finishFocusWarning(): void {
  if (focusWarningTimer) {
    clearTimeout(focusWarningTimer);
    focusWarningTimer = null;
  }
  if (blockingMode !== "focusWarning") return;
  blockingMode = null;
  restorePetWindowAfterScreenBlock();
  hideBubble();
  setPetState(focusActive ? "focusGuard" : "idle");
  publishSnapshot();
}

function triggerFocusWarning(rule?: string): void {
  if (blockingMode === "breakRun") return;
  ensurePetWindowVisible();
  stopAmbientRoam(false);
  stopAmbientPose(true);
  if (!focusActive) startFocusMode();
  blockingMode = "focusWarning";
  expandPetWindowForScreenBlock(1);
  updateStats((stats) => ({ ...stats, focusWarnings: stats.focusWarnings + 1 }));
  setPetState("focusAlert");
  sendToAll("app:snapshot", snapshot());
  const labels = text();
  showBubble({
    id: "focus-warning",
    message: pick(labels.bubble.focusWarning)(rule ?? "?"),
    actions: [
      { id: "focus:back", label: labels.actions.focusBack, kind: "primary" },
      { id: "focus:end", label: labels.actions.focusEnd }
    ],
    autoDismissMs: 5000
  });
  if (focusWarningTimer) clearTimeout(focusWarningTimer);
  focusWarningTimer = setTimeout(finishFocusWarning, 5000);
}

function startFocusMode(): void {
  if (focusActive || blockingMode) return;
  ensurePetWindowVisible();
  stopAmbientRoam(false);
  stopAmbientPose(true);
  const settings = getSettings();
  focusActive = true;
  focusStartedAt = Date.now();
  blockingMode = null;
  setPetState("focusGuard");
  focusEndsAt = Date.now() + settings.focusDurationMinutes * 60 * 1000;
  saveFocusSession(focusStartedAt, focusEndsAt);
  sendToAll("app:snapshot", snapshot());
  showBubble({
    id: "focus-start",
    message: pick(text().bubble.focusStart)(settings.focusDurationMinutes),
    autoDismissMs: 4500
  });
  if (focusTimer) clearTimeout(focusTimer);
  focusTimer = setTimeout(
    () => stopFocusMode(true),
    settings.focusDurationMinutes * 60 * 1000
  );
  scheduleDistractionDetection();
  updateTrayMenu();
}

function stopFocusMode(completed: boolean): void {
  if (!focusActive) return;
  const startedAt = focusStartedAt ?? Date.now();
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
  if (blockingMode === "focusWarning") {
    if (focusWarningTimer) {
      clearTimeout(focusWarningTimer);
      focusWarningTimer = null;
    }
    restorePetWindowAfterScreenBlock();
    hideBubble();
  }
  focusActive = false;
  focusStartedAt = null;
  blockingMode = null;
  clearFocusSession();
  if (focusTimer) {
    clearTimeout(focusTimer);
    focusTimer = null;
  }
  focusEndsAt = null;
  scheduleDistractionDetection();
  updateStats((stats) => ({
    ...stats,
    focusMinutes: stats.focusMinutes + elapsedMinutes
  }));
  sendToAll("app:snapshot", snapshot());
  setPetState("focusDone");
  showBubble({
    id: "focus-complete",
    message: completed ? pick(text().bubble.focusComplete) : pick(text().bubble.focusCancelled),
    autoDismissMs: 2800
  });
  setTimeout(() => {
    if (!focusActive && !blockingMode) {
      hideBubble();
      setPetState("idle");
      scheduleAmbientRoam();
      scheduleAmbientPose();
    }
  }, 2900);
  updateTrayMenu();
}

function triggerDemo(trigger: DemoTrigger): void {
  ensurePetWindowVisible();
  if (trigger === "break") triggerBreakReminder(true);
  if (trigger === "hydration") triggerHydrationReminder(true);
  if (trigger === "focusWarning") triggerFocusWarning("Twitter");
  if (trigger === "happy") happyFeedback(pick(text().bubble.woof));
}

function handleBubbleAction(actionId: string): void {
  if (actionId === "break-run:done") {
    finishBreakRun();
    return;
  }
  if (actionId === "break-run:snooze") {
    clearBreakRunTimers();
    breakRunFormatter = null;
    blockingMode = null;
    screenBlockEndsAt = null;
    restorePetWindowAfterScreenBlock();
    resumeLongTermState();
    if (breakTimer) clearTimeout(breakTimer);
    breakDueAt = Date.now() + 10 * 60 * 1000;
    breakSnoozeDueAt = breakDueAt;
    breakTimer = setTimeout(() => triggerBreakReminder(false), 10 * 60 * 1000);
    publishSnapshot();
    return;
  }
  if (actionId === "break:done") {
    if (getSettings().screenBlockReminderEnabled) {
      startBreakRun();
    } else {
      updateStats((stats) => ({ ...stats, breaksTaken: stats.breaksTaken + 1 }));
      resumeLongTermState();
      scheduleReminderTimers();
    }
    return;
  }
  if (actionId === "break:snooze") {
    resumeLongTermState();
    if (breakTimer) clearTimeout(breakTimer);
    breakDueAt = Date.now() + 10 * 60 * 1000;
    breakSnoozeDueAt = breakDueAt;
    breakTimer = setTimeout(() => triggerBreakReminder(false), 10 * 60 * 1000);
    publishSnapshot();
    return;
  }
  if (actionId === "break:mute") {
    breakMutedToday = true;
    breakDueAt = null;
    breakSnoozeDueAt = null;
    blockingMode = null;
    sendToAll("app:snapshot", snapshot());
    setPetState("sad");
    showBubble({ id: "break-muted", message: pick(text().bubble.breakIgnore), autoDismissMs: 2600 });
    setTimeout(resumeLongTermState, 2700);
    return;
  }
  if (actionId === "hydration:done") {
    updateStats((stats) => ({ ...stats, watersLogged: stats.watersLogged + 1 }));
    blockingMode = null;
    sendToAll("app:snapshot", snapshot());
    setPetState("drinking");
    hideBubble();
    setTimeout(() => {
      if (blockingMode) return;
      setPetState("hydrationDone");
      showBubble({ id: "hydration-complete", message: pick(text().bubble.hydrationDone), autoDismissMs: 1800 });
      setTimeout(() => {
        hideBubble();
        setPetState(focusActive ? "focusGuard" : "idle");
        scheduleReminderTimers();
      }, 1900);
    }, 2400);
    return;
  }
  if (actionId === "hydration:snooze") {
    resumeLongTermState();
    if (hydrationTimer) clearTimeout(hydrationTimer);
    hydrationDueAt = Date.now() + 15 * 60 * 1000;
    hydrationTimer = setTimeout(() => triggerHydrationReminder(false), 15 * 60 * 1000);
    publishSnapshot();
    return;
  }
  if (actionId === "focus:back") {
    if (blockingMode === "focusWarning") {
      finishFocusWarning();
      showBubble({ id: "focus-back", message: pick(text().bubble.focusBack), autoDismissMs: 1800 });
      return;
    }
    blockingMode = null;
    sendToAll("app:snapshot", snapshot());
    setPetState("focusGuard");
    showBubble({ id: "focus-back", message: pick(text().bubble.focusBack), autoDismissMs: 1800 });
    setTimeout(() => {
      if (focusActive && !blockingMode) hideBubble();
    }, 1900);
    return;
  }
  if (actionId === "focus:end") {
    if (blockingMode === "focusWarning") {
      finishFocusWarning();
    }
    stopFocusMode(false);
  }
}

function registerIpc(): void {
  ipcMain.handle("app:get-snapshot", () => snapshot());
  ipcMain.handle("pet:import-package", async () => {
    const result = await chooseAndImportPet();
    if (!result.ok) return result;
    const settings = getSettings();
    const installedPets = [
      ...settings.installedPets.filter((pet) => pet.slug !== result.pet.slug),
      result.pet
    ];
    setSettings({
      ...settings,
      installedPets,
      selectedPetId: result.pet.slug
    });
    sendToAll("pet:imported", result.pet);
    return result;
  });
  ipcMain.handle("pet:list-installed", () => getSettings().installedPets);
  ipcMain.on("pet:select", (_event, petId: string) => {
    setSettings({ ...getSettings(), selectedPetId: petId });
  });
  ipcMain.on("break:start-screen-block", startBreakRun);
  ipcMain.on("break:end-screen-block", finishBreakRun);
  ipcMain.on("pet:clicked", () => {
    if (blockingMode) return;
    randomPetClickReaction();
  });
  ipcMain.on("pet:context-menu", showPetContextMenu);
  ipcMain.on("pet:drag-start", (_event, offset: { offsetX: number; offsetY: number }) =>
    startPetDrag(offset)
  );
  ipcMain.on("pet:drag-stop", stopPetDrag);
  ipcMain.on("bubble:action", (_event, actionId: string) => handleBubbleAction(actionId));
  ipcMain.on("settings:update", (_event, partial: Partial<Settings>) => {
    setSettings({ ...getSettings(), ...partial });
  });
  ipcMain.on("demo:trigger", (_event, trigger: DemoTrigger) => triggerDemo(trigger));
  ipcMain.on("focus:start", startFocusMode);
  ipcMain.on("focus:stop", () => stopFocusMode(false));
  ipcMain.on("stats:reset-today", resetTodayStats);
}

protocol.registerSchemesAsPrivileged([
  { scheme: "pawpal-asset", privileges: { bypassCSP: true, supportFetchAPI: true } },
  { scheme: "pawpause-asset", privileges: { bypassCSP: true, supportFetchAPI: true } }
]);

app.whenReady().then(() => {
  const handleAssetRequest = (request: Request) => {
    let requestedPath = "";
    try {
      const url = new URL(request.url);
      requestedPath = decodeURIComponent(url.pathname.replace(/^\//, ""));
    } catch {
      return new Response("Invalid asset URL", { status: 404 });
    }

    const base = app.isPackaged ? process.resourcesPath : process.cwd();
    const bundledPetRoot = resolve(base, "petdex_pets");
    const petRoot = userPetsRoot();
    const legacyPetRoot = legacyUserPetsRoot();
    const assetPath = isAbsolute(requestedPath)
      ? resolve(requestedPath)
      : resolve(base, requestedPath);
    const isInsideBundledPetRoot =
      assetPath === bundledPetRoot || assetPath.startsWith(`${bundledPetRoot}${sep}`);
    const isInsidePetRoot = assetPath === petRoot || assetPath.startsWith(`${petRoot}${sep}`);
    const isInsideLegacyPetRoot =
      assetPath === legacyPetRoot || assetPath.startsWith(`${legacyPetRoot}${sep}`);

    if (!isInsideBundledPetRoot && !isInsidePetRoot && !isInsideLegacyPetRoot) {
      return new Response("Asset not found", { status: 404 });
    }

    return net.fetch(pathToFileURL(assetPath).href);
  };

  protocol.handle("pawpal-asset", handleAssetRequest);
  protocol.handle("pawpause-asset", handleAssetRequest);

  getStats();
  restoreFocusSession();
  registerIpc();
  createPetWindow();
  createTray();
  scheduleReminderTimers();
  scheduleDistractionDetection();
  scheduleAgentActivityMonitor();
  schedulePetLibraryMonitor();
  scheduleAmbientRoam();
  scheduleAmbientPose();
  if (IS_DEV) {
    createSettingsWindow();
  }

  app.on("activate", () => {
    if (!petWindow) createPetWindow();
  });
});

app.on("before-quit", () => {
  for (const timer of [
    breakRunTimer,
    breakRunCountdownTimer,
    breakRunMovementTimer,
    screenBlockTimer,
    screenBlockCountdownTimer,
    focusWarningTimer,
    breakTimer,
    hydrationTimer,
    focusTimer,
    distractionTimer,
    distractionStartupTimer,
    agentActivityTimer,
    petLibraryTimer,
    bubbleTimer,
    dragTimer,
    dragSafetyTimer,
    ambientRoamTimer,
    ambientRoamMoveTimer,
    ambientRoamStopTimer,
    ambientPoseTimer,
    ambientPoseStopTimer,
    agentPoseTimer
  ]) {
    if (timer) clearTimeout(timer);
  }
});

app.on("window-all-closed", () => {
  // Keep the menu-bar utility alive after the settings window is closed.
});
