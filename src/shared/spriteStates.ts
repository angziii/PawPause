import type { PetState, PetdexStateId, SpriteAnimationState } from "./types";

export const PETDEX_SPRITE_SIZE = {
  frameWidth: 192,
  frameHeight: 208,
  sheetWidth: 1536,
  sheetHeight: 1872
} as const;

export const PETDEX_STATES: Record<PetdexStateId, SpriteAnimationState> = {
  idle: { row: 0, frames: 6, durationMs: 1100 },
  "running-right": { row: 1, frames: 8, durationMs: 1060 },
  "running-left": { row: 2, frames: 8, durationMs: 1060 },
  waving: { row: 3, frames: 4, durationMs: 700 },
  jumping: { row: 4, frames: 5, durationMs: 840 },
  failed: { row: 5, frames: 8, durationMs: 1220 },
  waiting: { row: 6, frames: 6, durationMs: 1010 },
  running: { row: 7, frames: 6, durationMs: 820 },
  review: { row: 8, frames: 6, durationMs: 1030 }
};

export function mapPetStateToPetdexState(state: PetState): PetdexStateId {
  if (state === "idle") return "idle";
  if (state === "runningRight") return "running-right";
  if (state === "runningLeft") return "running-left";
  if (state === "waving") return "waving";
  if (state === "jumping") return "jumping";
  if (state === "failed") return "failed";
  if (state === "waiting") return "waiting";
  if (state === "reviewing") return "review";
  if (state === "thinking") return "waiting";
  if (state === "breakRunning") return "running";
  if (state === "happy") return "jumping";
  if (
    state === "breakDone" ||
    state === "hydrationDone" ||
    state === "focusDone"
  ) {
    return "waving";
  }
  if (
    state === "breakPrompt" ||
    state === "focusGuard"
  ) {
    return "review";
  }
  if (state === "focusAlert" || state === "sad") return "failed";
  if (state === "hydrationPrompt" || state === "drinking") return "waiting";
  return "waiting";
}
