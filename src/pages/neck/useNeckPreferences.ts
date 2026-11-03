import { createPersistedStore } from "../../hooks/createPersistedStore";
import { STRINGS } from "../../lib/music/guitar";
import { NATURAL_PITCH_CLASSES } from "../../lib/music/notation";

export interface NeckPreferences {
  checkedPitchClasses: number[];
  checkedStringIndexes: number[];
}

export const DEFAULT_NECK_PREFERENCES: NeckPreferences = {
  checkedPitchClasses: [],
  checkedStringIndexes: [],
};

function parseIndexes(value: unknown, isValid: (index: number) => boolean): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((index): index is number => typeof index === "number" && isValid(index)))];
}

export function parseNeckPreferences(raw: string): NeckPreferences | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const value = data as Partial<Record<keyof NeckPreferences, unknown>>;

  return {
    checkedPitchClasses: parseIndexes(
      value.checkedPitchClasses,
      (pitchClass) => NATURAL_PITCH_CLASSES.includes(pitchClass),
    ),
    checkedStringIndexes: parseIndexes(
      value.checkedStringIndexes,
      (stringIndex) => Number.isInteger(stringIndex) && stringIndex >= 0 && stringIndex < STRINGS.length,
    ),
  };
}

const useNeckPreferencesStore = createPersistedStore<NeckPreferences>(
  "domajeur:neck",
  DEFAULT_NECK_PREFERENCES,
  parseNeckPreferences,
  (preferences) => JSON.stringify(preferences),
);

export function useNeckPreferences(): ReturnType<typeof useNeckPreferencesStore> {
  return useNeckPreferencesStore();
}
