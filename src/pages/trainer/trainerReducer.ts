import type { NoteCandidate } from "../../lib/music/guitar";

type UiState = "listening" | "success" | "flash";
type TrainerMode = "free" | "scale";

export interface TrainerState {
  mode: TrainerMode;
  notes: NoteCandidate[];
  currentIndex: number;
  shouldAutoAdvance: boolean;
  isNaturalsOnly: boolean;
  fretMax: number;
  uiState: UiState;
  isSolutionShown: boolean;
  advanceDelayMs: number | null;
  // Bumped whenever a note becomes the current one → effect (re)plays its reference tone.
  noteToPlayNonce: number;
  // Bumped on every validation → effect fires the confetti burst.
  validationNonce: number;
}

export const DEFAULT_FRET_MAX = 12;
const delayBetweenNotesMs = 500;

export const INITIAL_TRAINER_STATE: TrainerState = {
  mode: "free",
  notes: [],
  currentIndex: -1,
  shouldAutoAdvance: true,
  isNaturalsOnly: true,
  fretMax: DEFAULT_FRET_MAX,
  uiState: "listening",
  isSolutionShown: false,
  advanceDelayMs: null,
  noteToPlayNonce: 0,
  validationNonce: 0,
};

export type TrainerAction
  = | { type: "selectMode"; mode: TrainerMode; series: NoteCandidate[] }
    | { type: "focusNote"; index: number }
    | { type: "validateCurrent" }
    | { type: "advance"; candidate: NoteCandidate }
    | { type: "setAutoAdvance"; isOn: boolean }
    | { type: "setNaturalsOnly"; isOn: boolean; candidate: NoteCandidate }
    | { type: "setFretMax"; value: number; candidate: NoteCandidate }
    | { type: "toggleSolution" };

function focusTo(state: TrainerState, notes: NoteCandidate[], index: number): TrainerState {
  const note = notes[index];

  return {
    ...state,
    notes,
    currentIndex: index,
    isSolutionShown: false,
    uiState: note.isValidated ? "success" : "listening",
    advanceDelayMs: null,
    noteToPlayNonce: state.noteToPlayNonce + 1,
  };
}

function regenerate(state: TrainerState, candidate: NoteCandidate): TrainerState {
  if (state.mode !== "free") {
    return state;
  }

  const lastIndex = state.notes.length - 1;
  if (lastIndex >= 0 && !state.notes[lastIndex].isValidated) {
    const notes = [...state.notes];
    notes[lastIndex] = candidate;

    return focusTo(state, notes, lastIndex);
  }

  return focusTo(state, [...state.notes, candidate], state.notes.length);
}

export function trainerReducer(state: TrainerState, action: TrainerAction): TrainerState {
  switch (action.type) {
    case "selectMode":
      return focusTo({ ...state, mode: action.mode }, action.series, 0);

    case "focusNote":
      return focusTo(state, state.notes, action.index);

    case "validateCurrent": {
      const current = state.currentIndex >= 0 ? state.notes[state.currentIndex] : undefined;
      if (current === undefined || current.isValidated) {
        return state;
      }

      const notes = state.notes.map((note, index) => (
        index === state.currentIndex ? { ...note, isValidated: true } : note
      ));
      const validationNonce = state.validationNonce + 1;

      if (state.shouldAutoAdvance) {
        return { ...state, notes, uiState: "flash", advanceDelayMs: delayBetweenNotesMs, validationNonce };
      }

      return { ...state, notes, uiState: "success", isSolutionShown: true, validationNonce };
    }

    case "advance": {
      const nextUnvalidated = state.notes.findIndex((note, index) => !note.isValidated && index !== state.currentIndex);
      if (nextUnvalidated >= 0) {
        return focusTo(state, state.notes, nextUnvalidated);
      }

      if (state.mode === "free") {
        return focusTo(state, [...state.notes, action.candidate], state.notes.length);
      }

      return focusTo(state, state.notes, (state.currentIndex + 1) % state.notes.length);
    }

    case "setAutoAdvance":
      return { ...state, shouldAutoAdvance: action.isOn };

    case "setNaturalsOnly":
      return regenerate({ ...state, isNaturalsOnly: action.isOn }, action.candidate);

    case "setFretMax":
      return regenerate({ ...state, fretMax: action.value }, action.candidate);

    case "toggleSolution":
      return { ...state, isSolutionShown: !state.isSolutionShown };

    default:
      return state;
  }
}
