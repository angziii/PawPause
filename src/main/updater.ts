import electron from "electron";
import { autoUpdater } from "electron-updater";

const { app, dialog } = electron;

type UpdaterState = "idle" | "checking" | "available" | "downloading" | "downloaded";

type UpdaterLabels = {
  checkForUpdates: string;
};

type UpdaterControllerOptions = {
  labels: () => UpdaterLabels;
  onStateChange?: () => void;
};

let state: UpdaterState = "idle";
let promptOpen = false;
let currentCheckManual = false;
let options: UpdaterControllerOptions | null = null;

function setState(next: UpdaterState): void {
  state = next;
  options?.onStateChange?.();
}

function updateTitle(): string {
  return `${app.getName()} Update`;
}

function updateDetail(version?: string): string {
  return version ? `Version ${version} is available.` : "A new version is available.";
}

function canCheckForUpdates(): boolean {
  return process.platform === "win32" && app.isPackaged && state !== "checking" && state !== "downloading";
}

async function askToDownload(version?: string): Promise<void> {
  if (promptOpen) return;
  promptOpen = true;
  try {
    const result = await dialog.showMessageBox({
      type: "info",
      title: updateTitle(),
      message: "A PawPause update is available.",
      detail: updateDetail(version),
      buttons: ["Download", "Later"],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    });
    if (result.response !== 0) {
      setState("idle");
      return;
    }
    setState("downloading");
    autoUpdater.downloadUpdate().catch((error: unknown) => {
      setState("idle");
      void showUpdateError(error);
    });
  } finally {
    promptOpen = false;
  }
}

async function askToInstall(version?: string): Promise<void> {
  if (promptOpen) return;
  promptOpen = true;
  try {
    const result = await dialog.showMessageBox({
      type: "info",
      title: updateTitle(),
      message: "PawPause is ready to update.",
      detail: version
        ? `Version ${version} has been downloaded. Restart PawPause to install it.`
        : "The update has been downloaded. Restart PawPause to install it.",
      buttons: ["Restart and Install", "Later"],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    });
    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  } finally {
    promptOpen = false;
  }
}

async function showNoUpdate(): Promise<void> {
  await dialog.showMessageBox({
    type: "info",
    title: updateTitle(),
    message: "PawPause is up to date.",
    buttons: ["OK"],
    noLink: true
  });
}

async function showUpdateError(error: unknown): Promise<void> {
  await dialog.showMessageBox({
    type: "warning",
    title: updateTitle(),
    message: "PawPause could not check for updates.",
    detail: error instanceof Error ? error.message : String(error),
    buttons: ["OK"],
    noLink: true
  });
}

export function configureUpdater(controllerOptions: UpdaterControllerOptions): void {
  options = controllerOptions;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on("checking-for-update", () => setState("checking"));
  autoUpdater.on("update-available", (info) => {
    currentCheckManual = false;
    setState("available");
    void askToDownload(info.version);
  });
  autoUpdater.on("update-not-available", () => {
    const shouldNotify = currentCheckManual;
    currentCheckManual = false;
    setState("idle");
    if (shouldNotify) void showNoUpdate();
  });
  autoUpdater.on("download-progress", () => setState("downloading"));
  autoUpdater.on("update-downloaded", (info) => {
    setState("downloaded");
    void askToInstall(info.version);
  });
  autoUpdater.on("error", (error) => {
    const shouldNotify = currentCheckManual;
    currentCheckManual = false;
    setState("idle");
    if (shouldNotify) void showUpdateError(error);
  });
}

export function updaterMenuItem(): Electron.MenuItemConstructorOptions {
  const labels = options?.labels();
  return {
    label: labels?.checkForUpdates ?? "Check for Updates",
    enabled: canCheckForUpdates(),
    click: () => {
      void checkForUpdates(true);
    }
  };
}

export async function checkForUpdates(manual = false): Promise<void> {
  if (process.platform !== "win32" || !app.isPackaged) {
    if (manual) await showNoUpdate();
    return;
  }
  if (!canCheckForUpdates()) return;
  currentCheckManual = manual;
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    const shouldNotify = currentCheckManual;
    currentCheckManual = false;
    setState("idle");
    if (shouldNotify) await showUpdateError(error);
  }
}

export function scheduleStartupUpdateCheck(): void {
  if (process.platform !== "win32" || !app.isPackaged) return;
  setTimeout(() => {
    void checkForUpdates(false);
  }, 8000);
}
