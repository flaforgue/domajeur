import { useEffect, useReducer, useState, type Dispatch } from "react";
import type { ScaleSelectorState } from "../../lib/music/scaleSelection";
import { useTrainerPreferences, type TrainerPreferences } from "./useTrainerPreferences";
import {
  INITIAL_TRAINER_STATE,
  trainerReducer,
  type TrainerAction,
  type TrainerMode,
  type TrainerState,
} from "./trainerReducer";

interface TrainerStateApi {
  state: TrainerState;
  dispatch: Dispatch<TrainerAction>;
  scaleState: ScaleSelectorState;
  setScaleState: (next: ScaleSelectorState) => void;
}

function initTrainerState(mode: TrainerMode, preferences: TrainerPreferences): TrainerState {
  if (mode === "free") {
    return {
      ...INITIAL_TRAINER_STATE,
      mode,
      isNaturalsOnly: preferences.neck.isNaturalsOnly,
      fretMax: preferences.neck.fretMax,
      shouldAutoAdvance: preferences.neck.shouldAutoAdvance,
      shouldPlayOnAdvance: preferences.neck.shouldPlayOnAdvance,
    };
  }

  return {
    ...INITIAL_TRAINER_STATE,
    mode,
    shouldAutoAdvance: preferences.scales.shouldAutoAdvance,
  };
}

export function useTrainerState(mode: TrainerMode): TrainerStateApi {
  const [storedPreferences, setStoredPreferences] = useTrainerPreferences();
  const [state, dispatch] = useReducer(
    trainerReducer,
    storedPreferences,
    (preferences) => initTrainerState(mode, preferences),
  );
  const [scaleState, setScaleState] = useState<ScaleSelectorState>(storedPreferences.scales.scale);

  useEffect(() => {
    setStoredPreferences(mode === "free"
      ? {
        ...storedPreferences,
        neck: {
          isNaturalsOnly: state.isNaturalsOnly,
          fretMax: state.fretMax,
          shouldAutoAdvance: state.shouldAutoAdvance,
          shouldPlayOnAdvance: state.shouldPlayOnAdvance,
        },
      }
      : {
        ...storedPreferences,
        scales: { shouldAutoAdvance: state.shouldAutoAdvance, scale: scaleState },
      });
  }, [
    mode,
    state.isNaturalsOnly,
    state.fretMax,
    state.shouldAutoAdvance,
    state.shouldPlayOnAdvance,
    scaleState,
    storedPreferences,
    setStoredPreferences,
  ]);

  return { state, dispatch, scaleState, setScaleState };
}
