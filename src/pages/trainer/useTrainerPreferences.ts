import { createPersistedStore } from "../../hooks/createPersistedStore";
import { isScaleQuality } from "../../lib/music/scales";
import {
  clampScaleState,
  DEFAULT_SCALE_STATE,
  SCALE_ROOTS,
  type ScaleSelectorState,
} from "../../lib/music/scaleSelection";
import { INITIAL_TRAINER_STATE, type TrainerMode } from "./trainerReducer";

export interface TrainerPreferences {
  mode: TrainerMode;
  isNaturalsOnly: boolean;
  fretMax: number;
  shouldAutoAdvance: boolean;
  shouldPlayOnAdvance: boolean;
  scale: ScaleSelectorState;
}

const defaultPreferences: TrainerPreferences = {
  mode: INITIAL_TRAINER_STATE.mode,
  isNaturalsOnly: INITIAL_TRAINER_STATE.isNaturalsOnly,
  fretMax: INITIAL_TRAINER_STATE.fretMax,
  shouldAutoAdvance: INITIAL_TRAINER_STATE.shouldAutoAdvance,
  shouldPlayOnAdvance: INITIAL_TRAINER_STATE.shouldPlayOnAdvance,
  scale: DEFAULT_SCALE_STATE,
};

function parseScale(value: unknown): ScaleSelectorState {
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
    isRoundTrip: scale.isRoundTrip === true,
  });
}

function parse(raw: string): TrainerPreferences | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const value = data as Partial<TrainerPreferences>;

  return {
    mode: value.mode === "scale" ? "scale" : "free",
    isNaturalsOnly: value.isNaturalsOnly ?? defaultPreferences.isNaturalsOnly,
    fretMax: value.fretMax ?? defaultPreferences.fretMax,
    shouldAutoAdvance: value.shouldAutoAdvance ?? defaultPreferences.shouldAutoAdvance,
    shouldPlayOnAdvance: value.shouldPlayOnAdvance ?? defaultPreferences.shouldPlayOnAdvance,
    scale: parseScale(value.scale),
  };
}

const useTrainerPreferencesStore = createPersistedStore<TrainerPreferences>(
  "domajeur:trainer",
  defaultPreferences,
  parse,
  (preferences) => JSON.stringify(preferences),
);

export function useTrainerPreferences(): ReturnType<typeof useTrainerPreferencesStore> {
  return useTrainerPreferencesStore();
}
