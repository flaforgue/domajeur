import { createPersistedStore } from "../../hooks/createPersistedStore";
import { isScaleQuality } from "../../lib/music/scales";
import {
  clampScaleState,
  DEFAULT_SCALE_STATE,
  SCALE_ROOTS,
  type ScaleSelectorState,
} from "../../lib/music/scaleSelection";
import { INITIAL_TRAINER_STATE } from "./trainerReducer";

interface ScalesPreferences {
  shouldAutoAdvance: boolean;
  scale: ScaleSelectorState;
}

export interface TrainerPreferences {
  scales: ScalesPreferences;
}

const defaultPreferences: TrainerPreferences = {
  scales: {
    shouldAutoAdvance: INITIAL_TRAINER_STATE.shouldAutoAdvance,
    scale: DEFAULT_SCALE_STATE,
  },
};

function parseScaleState(value: unknown): ScaleSelectorState {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_SCALE_STATE;
  }

  const scale = value as Partial<ScaleSelectorState>;
  const rawRootIndex = scale.rootIndex;
  const isValidRootIndex = typeof rawRootIndex === "number"
    && Number.isInteger(rawRootIndex)
    && rawRootIndex >= 0
    && rawRootIndex < SCALE_ROOTS.length;

  return clampScaleState({
    rootIndex: isValidRootIndex ? rawRootIndex : DEFAULT_SCALE_STATE.rootIndex,
    quality: isScaleQuality(scale.quality) ? scale.quality : DEFAULT_SCALE_STATE.quality,
    size: scale.size === "pentatonic" ? "pentatonic" : "heptatonic",
    variant: scale.variant === "blues" ? "blues" : "standard",
    octaves: typeof scale.octaves === "number" ? scale.octaves : DEFAULT_SCALE_STATE.octaves,
    isClosedPosition: scale.isClosedPosition === true,
    isRoundTrip: scale.isRoundTrip === true,
  });
}

function parseScales(value: unknown): ScalesPreferences {
  const scales = (typeof value === "object" && value !== null ? value : {}) as Partial<ScalesPreferences>;

  return {
    shouldAutoAdvance: scales.shouldAutoAdvance ?? defaultPreferences.scales.shouldAutoAdvance,
    scale: parseScaleState(scales.scale),
  };
}

export function parseTrainerPreferences(raw: string): TrainerPreferences | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const value = data as { scales?: unknown };

  return { scales: parseScales(value.scales ?? value) };
}

const useTrainerPreferencesStore = createPersistedStore<TrainerPreferences>(
  "domajeur:trainer",
  defaultPreferences,
  parseTrainerPreferences,
  (preferences) => JSON.stringify(preferences),
);

export function useTrainerPreferences(): ReturnType<typeof useTrainerPreferencesStore> {
  return useTrainerPreferencesStore();
}
