import { describe, it, expect } from "vitest";
import type { NoteCandidate } from "../../lib/music/guitar";
import { INITIAL_TRAINER_STATE, trainerReducer, type TrainerState } from "./trainerReducer";

describe("trainerReducer", () => {
  it("loadSeries loads a series and focuses the first note", () => {
    const series = [note(40), note(45)];
    const next = trainerReducer(INITIAL_TRAINER_STATE, { type: "loadSeries", series });

    expect(next.notes).toBe(series);
    expect(next.currentIndex).toBe(0);
    expect(next.uiState).toBe("listening");
    expect(next.noteToPlayNonce).toBe(INITIAL_TRAINER_STATE.noteToPlayNonce);
  });

  it("validateCurrent marks the note and, with auto-advance, schedules the next note", () => {
    const start = stateWith({ notes: [note(40)], currentIndex: 0, shouldAutoAdvance: true });
    const next = trainerReducer(start, { type: "validateCurrent" });

    expect(next.notes[0].isValidated).toBe(true);
    expect(next.uiState).toBe("flash");
    expect(next.advanceDelayMs).toBe(150);
    expect(next.validationNonce).toBe(start.validationNonce + 1);
  });

  it("validateCurrent without auto-advance reveals the solution instead", () => {
    const start = stateWith({ notes: [note(40)], currentIndex: 0, shouldAutoAdvance: false });
    const next = trainerReducer(start, { type: "validateCurrent" });

    expect(next.uiState).toBe("success");
    expect(next.isSolutionShown).toBe(true);
    expect(next.advanceDelayMs).toBeNull();
  });

  it("validateCurrent fires the confetti only when the series is complete", () => {
    const midSeries = stateWith({ notes: [note(40), note(45)], currentIndex: 0 });
    expect(trainerReducer(midSeries, { type: "validateCurrent" }).validationNonce)
      .toBe(midSeries.validationNonce);

    const lastNote = stateWith({ notes: [note(40, true), note(45)], currentIndex: 1 });
    expect(trainerReducer(lastNote, { type: "validateCurrent" }).validationNonce)
      .toBe(lastNote.validationNonce + 1);
  });

  it("validateCurrent is a no-op on an already validated note", () => {
    const start = stateWith({ notes: [note(40, true)], currentIndex: 0 });
    expect(trainerReducer(start, { type: "validateCurrent" })).toBe(start);
  });

  it("advance moves to the next unvalidated note", () => {
    const start = stateWith({ notes: [note(40, true), note(45)], currentIndex: 0 });
    const next = trainerReducer(start, { type: "advance" });

    expect(next.currentIndex).toBe(1);
    expect(next.notes).toHaveLength(2);
  });

  it("advance never plays the next note", () => {
    const start = stateWith({ notes: [note(40, true), note(45)], currentIndex: 0 });
    const next = trainerReducer(start, { type: "advance" });

    expect(next.noteToPlayNonce).toBe(start.noteToPlayNonce);
  });

  it("advance restarts a fully validated scale from the first note, to play again", () => {
    const start = stateWith({ notes: [note(40, true), note(45, true)], currentIndex: 1 });
    const next = trainerReducer(start, { type: "advance" });

    expect(next.currentIndex).toBe(0);
    expect(next.uiState).toBe("listening");
    expect(next.notes.every((n) => !n.isValidated)).toBe(true);
    expect(next.notes[0]).not.toBe(start.notes[0]);
  });

  it("selectNext restarts a fully validated scale when wrapping past the last note", () => {
    const start = stateWith({ notes: [note(40, true), note(45, true)], currentIndex: 1 });
    const next = trainerReducer(start, { type: "selectNext" });

    expect(next.currentIndex).toBe(0);
    expect(next.uiState).toBe("listening");
    expect(next.notes.every((n) => !n.isValidated)).toBe(true);
  });

  it("selectNext keeps validations when wrapping a partially validated scale", () => {
    const start = stateWith({ notes: [note(40), note(45, true)], currentIndex: 1 });
    const next = trainerReducer(start, { type: "selectNext" });

    expect(next.currentIndex).toBe(0);
    expect(next.notes[1].isValidated).toBe(true);
  });

  it("selectNext cycles sequentially, ignoring validation", () => {
    const start = stateWith({ notes: [note(40), note(45, true), note(50)], currentIndex: 1 });
    const next = trainerReducer(start, { type: "selectNext" });

    expect(next.notes).toHaveLength(3);
    expect(next.currentIndex).toBe(2);
  });

  it("selectNext wraps to the first note at the end of a scale", () => {
    const start = stateWith({ notes: [note(40), note(45)], currentIndex: 1 });
    const next = trainerReducer(start, { type: "selectNext" });

    expect(next.currentIndex).toBe(0);
  });
});

function note(midi: number, isValidated = false): NoteCandidate {
  return { stringIndex: 0, fretIndex: 0, midi, isValidated };
}

function stateWith(overrides: Partial<TrainerState>): TrainerState {
  return { ...INITIAL_TRAINER_STATE, ...overrides };
}
