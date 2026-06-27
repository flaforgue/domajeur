import { describe, it, expect } from "vitest";
import type { NoteCandidate } from "../../lib/music/guitar";
import { INITIAL_TRAINER_STATE, trainerReducer, type TrainerState } from "./trainerReducer";

function note(midi: number, isValidated = false): NoteCandidate {
  return { stringIndex: 0, fretIndex: 0, midi, isValidated };
}

function stateWith(overrides: Partial<TrainerState>): TrainerState {
  return { ...INITIAL_TRAINER_STATE, ...overrides };
}

describe("trainerReducer", () => {
  it("selectMode loads a series and focuses the first note", () => {
    const series = [note(40), note(45)];
    const next = trainerReducer(INITIAL_TRAINER_STATE, { type: "selectMode", mode: "free", series });

    expect(next.notes).toBe(series);
    expect(next.currentIndex).toBe(0);
    expect(next.uiState).toBe("listening");
    expect(next.noteToPlayNonce).toBe(INITIAL_TRAINER_STATE.noteToPlayNonce + 1);
  });

  it("validateCurrent marks the note and, with auto-advance, schedules the next note", () => {
    const start = stateWith({ notes: [note(40)], currentIndex: 0, shouldAutoAdvance: true });
    const next = trainerReducer(start, { type: "validateCurrent" });

    expect(next.notes[0].isValidated).toBe(true);
    expect(next.uiState).toBe("flash");
    expect(next.advanceDelayMs).toBe(500);
    expect(next.validationNonce).toBe(start.validationNonce + 1);
  });

  it("validateCurrent without auto-advance reveals the solution instead", () => {
    const start = stateWith({ notes: [note(40)], currentIndex: 0, shouldAutoAdvance: false });
    const next = trainerReducer(start, { type: "validateCurrent" });

    expect(next.uiState).toBe("success");
    expect(next.isSolutionShown).toBe(true);
    expect(next.advanceDelayMs).toBeNull();
  });

  it("validateCurrent is a no-op on an already validated note", () => {
    const start = stateWith({ notes: [note(40, true)], currentIndex: 0 });
    expect(trainerReducer(start, { type: "validateCurrent" })).toBe(start);
  });

  it("advance moves to the next unvalidated note", () => {
    const start = stateWith({ notes: [note(40, true), note(45)], currentIndex: 0 });
    const next = trainerReducer(start, { type: "advance", candidate: note(50) });

    expect(next.currentIndex).toBe(1);
    expect(next.notes).toHaveLength(2);
  });

  it("advance appends a fresh note in free mode when all are validated", () => {
    const start = stateWith({ mode: "free", notes: [note(40, true)], currentIndex: 0 });
    const candidate = note(50);
    const next = trainerReducer(start, { type: "advance", candidate });

    expect(next.notes).toHaveLength(2);
    expect(next.notes[1]).toBe(candidate);
    expect(next.currentIndex).toBe(1);
  });

  it("toggleSolution flips the solution visibility", () => {
    expect(trainerReducer(stateWith({ isSolutionShown: false }), { type: "toggleSolution" }).isSolutionShown).toBe(true);
  });

  it("setFretMax updates config and regenerates the last unvalidated note", () => {
    const start = stateWith({ mode: "free", notes: [note(40)], currentIndex: 0, fretMax: 5 });
    const candidate = note(52);
    const next = trainerReducer(start, { type: "setFretMax", value: 9, candidate });

    expect(next.fretMax).toBe(9);
    expect(next.notes[0]).toBe(candidate);
  });
});
