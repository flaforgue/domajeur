import { useEffect, useReducer, useState, type Dispatch } from "react";
import type { ScaleSelectorState } from "./components/ScaleSelector";
import { useTrainerPreferences, type TrainerPreferences } from "./useTrainerPreferences";
import {
  INITIAL_TRAINER_STATE,
  trainerReducer,
  type TrainerAction,
  type TrainerState,
} from "./trainerReducer";

interface TrainerStateApi {
  state: TrainerState;
  dispatch: Dispatch<TrainerAction>;
  scaleState: ScaleSelectorState;
  setScaleState: (next: ScaleSelectorState) => void;
}

function initTrainerState(preferences: TrainerPreferences): TrainerState {
  return {
    ...INITIAL_TRAINER_STATE,
    mode: preferences.mode,
    isNaturalsOnly: preferences.isNaturalsOnly,
    fretMax: preferences.fretMax,
    shouldAutoAdvance: preferences.shouldAutoAdvance,
  };
}

export function useTrainerState(): TrainerStateApi {
  const [storedPreferences, setStoredPreferences] = useTrainerPreferences();
  const [state, dispatch] = useReducer(trainerReducer, storedPreferences, initTrainerState);
  const [scaleState, setScaleState] = useState<ScaleSelectorState>(storedPreferences.scale);

  useEffect(() => {
    setStoredPreferences({
      mode: state.mode,
      isNaturalsOnly: state.isNaturalsOnly,
      fretMax: state.fretMax,
      shouldAutoAdvance: state.shouldAutoAdvance,
      scale: scaleState,
    });
  }, [
    state.mode,
    state.isNaturalsOnly,
    state.fretMax,
    state.shouldAutoAdvance,
    scaleState,
    setStoredPreferences,
  ]);

  return { state, dispatch, scaleState, setScaleState };
}
