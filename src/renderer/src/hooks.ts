import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import type { AppSnapshot, TodayStats } from "../../shared/types";

const initialStats: TodayStats = {
  date: "",
  breaksTaken: 0,
  watersLogged: 0,
  focusMinutes: 0,
  focusWarnings: 0
};

export function useSnapshot(): AppSnapshot {
  const [snapshot, setSnapshot] = useState<AppSnapshot>({
    settings: DEFAULT_SETTINGS,
    stats: initialStats,
    statsHistory: {},
    timers: {
      breakDueAt: null,
      breakSnoozeDueAt: null,
      hydrationDueAt: null,
      focusEndsAt: null
    },
    distraction: {
      state: "idle",
      activeApp: "",
      activeWindowTitle: "",
      matchedRule: null,
      lastCheckedAt: null,
      lastWarningAt: null,
      error: null
    },
    petState: "idle",
    petFacing: "right",
    petDisplayScale: DEFAULT_SETTINGS.petScale,
    blockingMode: null,
    focusActive: false,
    dogVisible: true,
    screenBlockActive: false,
    screenBlockEndsAt: null
  });

  useEffect(() => {
    let mounted = true;
    void window.pawpause.getSnapshot().then((next) => {
      if (mounted) setSnapshot(next);
    });
    const offPet = window.pawpause.onPetState((petState) =>
      setSnapshot((current) => ({ ...current, petState }))
    );
    const offSettings = window.pawpause.onSettingsUpdated((settings) =>
      setSnapshot((current) => ({
        ...current,
        settings,
        petDisplayScale:
          current.petDisplayScale === current.settings.petScale
            ? settings.petScale
            : current.petDisplayScale
      }))
    );
    const offStats = window.pawpause.onStatsUpdated((stats) =>
      setSnapshot((current) => ({
        ...current,
        stats,
        statsHistory: stats.date
          ? { ...current.statsHistory, [stats.date]: stats }
          : current.statsHistory
      }))
    );
    const offSnapshot = window.pawpause.onSnapshot(setSnapshot);
    return () => {
      mounted = false;
      offPet();
      offSettings();
      offStats();
      offSnapshot();
    };
  }, []);

  return snapshot;
}

export function useNow(refreshMs = 30_000): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), refreshMs);
    return () => window.clearInterval(timer);
  }, [refreshMs]);

  return now;
}
