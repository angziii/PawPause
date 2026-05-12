import electron from "electron";
import type {
  AppSnapshot,
  DemoTrigger,
  InstalledPet,
  PetImportResult,
  PetLayout,
  PetState,
  Settings,
  SpeechBubble,
  TodayStats
} from "../shared/types";

type Unsubscribe = () => void;

const { contextBridge, ipcRenderer } = electron;

function onChannel<T>(channel: string, callback: (payload: T) => void): Unsubscribe {
  const listener = (_event: Electron.IpcRendererEvent, payload: T) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const api = {
  getSnapshot: (): Promise<AppSnapshot> => ipcRenderer.invoke("app:get-snapshot"),
  importPetPackage: (): Promise<PetImportResult> => ipcRenderer.invoke("pet:import-package"),
  listInstalledPets: (): Promise<InstalledPet[]> => ipcRenderer.invoke("pet:list-installed"),
  selectPet: (petId: string): void => ipcRenderer.send("pet:select", petId),
  petClicked: (): void => ipcRenderer.send("pet:clicked"),
  petContextMenu: (): void => ipcRenderer.send("pet:context-menu"),
  petDragStart: (offset: { offsetX: number; offsetY: number }): void =>
    ipcRenderer.send("pet:drag-start", offset),
  petDragStop: (): void => ipcRenderer.send("pet:drag-stop"),
  bubbleAction: (actionId: string): void => ipcRenderer.send("bubble:action", actionId),
  openExternal: (url: string): void => ipcRenderer.send("app:open-external", url),
  updateSettings: (settings: Partial<Settings>): void =>
    ipcRenderer.send("settings:update", settings),
  triggerDemo: (trigger: DemoTrigger): void => ipcRenderer.send("demo:trigger", trigger),
  isPackaged: !process.defaultApp,
  assetUrl: (relativePath: string): string => {
    return `pawpal-asset://asset/${encodeURIComponent(relativePath)}`;
  },
  startFocus: (): void => ipcRenderer.send("focus:start"),
  stopFocus: (): void => ipcRenderer.send("focus:stop"),
  startScreenBlock: (): void => ipcRenderer.send("break:start-screen-block"),
  endScreenBlock: (): void => ipcRenderer.send("break:end-screen-block"),
  resetToday: (): void => ipcRenderer.send("stats:reset-today"),
  onPetState: (callback: (state: PetState) => void): Unsubscribe =>
    onChannel("pet:set-state", callback),
  onPetLayout: (callback: (layout: PetLayout) => void): Unsubscribe =>
    onChannel("pet:layout", callback),
  onShowBubble: (callback: (bubble: SpeechBubble) => void): Unsubscribe =>
    onChannel("pet:show-bubble", callback),
  onHideBubble: (callback: () => void): Unsubscribe => onChannel("pet:hide-bubble", callback),
  onPetImported: (callback: (pet: InstalledPet) => void): Unsubscribe =>
    onChannel("pet:imported", callback),
  onSettingsUpdated: (callback: (settings: Settings) => void): Unsubscribe =>
    onChannel("settings:updated", callback),
  onStatsUpdated: (callback: (stats: TodayStats) => void): Unsubscribe =>
    onChannel("stats:updated", callback),
  onSnapshot: (callback: (snapshot: AppSnapshot) => void): Unsubscribe =>
    onChannel("app:snapshot", callback)
};

contextBridge.exposeInMainWorld("pawpause", api);
contextBridge.exposeInMainWorld("pawpal", api);

export type PawPauseApi = typeof api;
