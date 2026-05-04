import { allPets } from "../../shared/bundledPets";
import { PETDEX_SPRITE_SIZE, PETDEX_STATES, mapPetStateToPetdexState } from "../../shared/spriteStates";
import type { InstalledPet, PetState, SpriteAnimationState } from "../../shared/types";

export type SpritePetAsset = {
  kind: "sprite";
  src: string;
  animation: SpriteAnimationState;
  frameWidth: number;
  frameHeight: number;
  sheetWidth: number;
  sheetHeight: number;
};

export function getSelectedPetAsset(
  selectedPetId: string,
  installedPets: InstalledPet[],
  state: PetState
): SpritePetAsset {
  const installed = allPets(installedPets).find((pet) => pet.slug === selectedPetId) ?? allPets(installedPets)[0];
  if (!installed) {
    throw new Error("No Petdex sprite pets are available.");
  }

  const src = new URL(window.pawpause.assetUrl(installed.spritesheetPath));
  const petdexState = mapPetStateToPetdexState(state);

  return {
    kind: "sprite",
    src: src.href,
    animation: PETDEX_STATES[petdexState],
    frameWidth: PETDEX_SPRITE_SIZE.frameWidth,
    frameHeight: PETDEX_SPRITE_SIZE.frameHeight,
    sheetWidth: PETDEX_SPRITE_SIZE.sheetWidth,
    sheetHeight: PETDEX_SPRITE_SIZE.sheetHeight
  };
}
