import { useEffect, useReducer, useState, type Dispatch } from "react";
import type { ScaleSelectorState } from "../../lib/music/scaleSelection";
import { useTrainerPreferences } from "./useTrainerPreferences";
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

export function useTrainerState(): TrainerStateApi {
  const [storedPreferences, setStoredPreferences] = useTrainerPreferences();
  const [state, dispatch] = useReducer(
    trainerReducer,
    storedPreferences,
    (preferences) => ({ ...INITIAL_TRAINER_STATE, shouldAutoAdvance: preferences.scales.shouldAutoAdvance }),
  );
  const [scaleState, setScaleState] = useState<ScaleSelectorState>(storedPreferences.scales.scale);

  useEffect(() => {
    setStoredPreferences({ scales: { shouldAutoAdvance: state.shouldAutoAdvance, scale: scaleState } });
  }, [state.shouldAutoAdvance, scaleState, setStoredPreferences]);

  return { state, dispatch, scaleState, setScaleState };
}
