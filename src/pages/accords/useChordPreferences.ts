import { createPersistedStore } from "../../hooks/createPersistedStore";
import { clamp } from "../../lib/math";
import { isChordQuality, type ChordQuality } from "../../lib/music/chords";
import { chordPositions } from "../../lib/music/chordPositions";
import { SCALE_ROOTS } from "../../lib/music/scaleSelection";

export interface ChordPreferences {
  rootIndex: number;
  quality: ChordQuality;
  positionIndex: number;
}

export const DEFAULT_CHORD_PREFERENCES: ChordPreferences = {
  rootIndex: 0,
  quality: "major",
  positionIndex: 0,
};

export function clampChordPreferences(preferences: ChordPreferences): ChordPreferences {
  const rootIndex = clamp(preferences.rootIndex, 0, SCALE_ROOTS.length - 1);
  const positionsCount = chordPositions(SCALE_ROOTS[rootIndex].pitchClass, preferences.quality).length;

  return {
    ...preferences,
    rootIndex,
    positionIndex: clamp(preferences.positionIndex, 0, positionsCount - 1),
  };
}

export function parseChordPreferences(raw: string): ChordPreferences | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const value = data as Partial<ChordPreferences>;

  return clampChordPreferences({
    rootIndex: typeof value.rootIndex === "number" && Number.isInteger(value.rootIndex)
      ? value.rootIndex
      : DEFAULT_CHORD_PREFERENCES.rootIndex,
    quality: isChordQuality(value.quality) ? value.quality : DEFAULT_CHORD_PREFERENCES.quality,
    positionIndex: typeof value.positionIndex === "number" && Number.isInteger(value.positionIndex)
      ? value.positionIndex
      : DEFAULT_CHORD_PREFERENCES.positionIndex,
  });
}

const useChordPreferencesStore = createPersistedStore<ChordPreferences>(
  "domajeur:chords",
  DEFAULT_CHORD_PREFERENCES,
  parseChordPreferences,
  (preferences) => JSON.stringify(preferences),
);

export function useChordPreferences(): ReturnType<typeof useChordPreferencesStore> {
  return useChordPreferencesStore();
}
