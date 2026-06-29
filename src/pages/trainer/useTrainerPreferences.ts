import { createPersistedStore } from "../../hooks/createPersistedStore";
import { DEFAULT_SCALE_STATE, type ScaleSelectorState } from "./components/ScaleSelector";
import { INITIAL_TRAINER_STATE, type TrainerMode } from "./trainerReducer";

export interface TrainerPreferences {
  mode: TrainerMode;
  isNaturalsOnly: boolean;
  fretMax: number;
  shouldAutoAdvance: boolean;
  scale: ScaleSelectorState;
}

const defaultPreferences: TrainerPreferences = {
  mode: INITIAL_TRAINER_STATE.mode,
  isNaturalsOnly: INITIAL_TRAINER_STATE.isNaturalsOnly,
  fretMax: INITIAL_TRAINER_STATE.fretMax,
  shouldAutoAdvance: INITIAL_TRAINER_STATE.shouldAutoAdvance,
  scale: DEFAULT_SCALE_STATE,
};

function parseScale(value: unknown): ScaleSelectorState {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_SCALE_STATE;
  }

  const scale = value as Partial<ScaleSelectorState>;

  return {
    rootIndex: scale.rootIndex ?? DEFAULT_SCALE_STATE.rootIndex,
    quality: scale.quality === "minor" ? "minor" : "major",
    size: scale.size === "pentatonic" ? "pentatonic" : "heptatonic",
    variant: scale.variant === "blues" ? "blues" : "standard",
  };
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
