import type { InstalledPet } from "./types";

export const BUNDLED_PETS: InstalledPet[] = [];

export function allPets(importedPets: InstalledPet[]): InstalledPet[] {
  return importedPets;
}
