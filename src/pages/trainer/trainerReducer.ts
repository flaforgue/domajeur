import type { NoteCandidate } from "../../lib/music/guitar";

type UiState = "listening" | "success" | "flash";

export interface TrainerState {
  notes: NoteCandidate[];
  currentIndex: number;
  shouldAutoAdvance: boolean;
  uiState: UiState;
  isSolutionShown: boolean;
  advanceDelayMs: number | null;
  // Bumped whenever a note becomes the current one → effect (re)plays its reference tone.
  noteToPlayNonce: number;
  // Bumped on every validation → effect fires the confetti burst.
  validationNonce: number;
}

const delayBetweenNotesMs = 150;

export const INITIAL_TRAINER_STATE: TrainerState = {
  notes: [],
  currentIndex: -1,
  shouldAutoAdvance: true,
  uiState: "listening",
  isSolutionShown: false,
  advanceDelayMs: null,
  noteToPlayNonce: 0,
  validationNonce: 0,
};

export type TrainerAction
  = | { type: "loadSeries"; series: NoteCandidate[] }
    | { type: "focusNote"; index: number }
    | { type: "validateCurrent" }
    | { type: "advance" }
    | { type: "selectNext" }
    | { type: "setAutoAdvance"; isOn: boolean };

function focusTo(state: TrainerState, notes: NoteCandidate[], index: number, shouldPlay = false): TrainerState {
  const note = notes[index];

  return {
    ...state,
    notes,
    currentIndex: index,
    isSolutionShown: false,
    uiState: note.isValidated ? "success" : "listening",
    advanceDelayMs: null,
    noteToPlayNonce: shouldPlay ? state.noteToPlayNonce + 1 : state.noteToPlayNonce,
  };
}

function unvalidatedNotes(notes: NoteCandidate[]): NoteCandidate[] {
  return notes.map((note) => ({ ...note, isValidated: false }));
}

export function trainerReducer(state: TrainerState, action: TrainerAction): TrainerState {
  switch (action.type) {
    case "loadSeries":
      return focusTo(state, action.series, 0);

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
      const isCelebrated = notes.every((note) => note.isValidated);
      const validationNonce = isCelebrated ? state.validationNonce + 1 : state.validationNonce;

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

      if (state.notes.every((note) => note.isValidated)) {
        return focusTo(state, unvalidatedNotes(state.notes), 0);
      }

      return focusTo(state, state.notes, (state.currentIndex + 1) % state.notes.length);
    }

    case "selectNext": {
      const nextIndex = (state.currentIndex + 1) % state.notes.length;
      if (nextIndex === 0 && state.notes.every((note) => note.isValidated)) {
        return focusTo(state, unvalidatedNotes(state.notes), 0, true);
      }

      return focusTo(state, state.notes, nextIndex, true);
    }

    case "setAutoAdvance":
      return { ...state, shouldAutoAdvance: action.isOn };

    default:
      return state;
  }
}
