import { describe, expect, it } from "vitest";
import { frequencyFromMidi } from "../../lib/music/notation";
import type { Frame } from "../../lib/pitch/pitchEngine";
import type { NoteCandidate } from "../../lib/music/guitar";
import { createNoteValidator, createValidationSession, type NoteValidator } from "./noteValidator";

const targetMidi = 45;
const otherMidi = 47;
const holdMs = 130;

function makeFrame(overrides: Partial<Frame> = {}): Frame {
  return { frequencyInHertz: -1, clarity: 0, rootMeanSquare: 0.05, isRefPlaying: false, ...overrides };
}

function noteFrame(midi: number, clarity = 0.9): Frame {
  return makeFrame({ frequencyInHertz: frequencyFromMidi(midi), clarity });
}

function processAll(validator: NoteValidator, frames: [Frame, number][]): void {
  frames.forEach(([frame, now]) => {
    validator.processFrame(frame, now);
  });
}

describe("createNoteValidator", () => {
  it("validates once the target note has been held long enough", () => {
    const validator = createNoteValidator(targetMidi);

    expect(validator.processFrame(noteFrame(targetMidi), 0)).toBe(false);
    expect(validator.processFrame(noteFrame(targetMidi), holdMs - 1)).toBe(false);
    expect(validator.processFrame(noteFrame(targetMidi), holdMs)).toBe(true);
  });

  it("needs a frame at the end of the hold, not just elapsed time", () => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, [[noteFrame(targetMidi), 0]]);

    expect(validator.processFrame(makeFrame(), holdMs + 100)).toBe(false);
  });

  it.each([
    ["silence", makeFrame()],
    ["an unclear frame", noteFrame(targetMidi, 0.3)],
    ["another note", noteFrame(otherMidi)],
  ])("restarts the hold after %s", (_interruption, interruptingFrame) => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, [
      [noteFrame(targetMidi), 0],
      [interruptingFrame, 100],
      [noteFrame(targetMidi), 110],
    ]);

    expect(validator.processFrame(noteFrame(targetMidi), 110 + holdMs - 1)).toBe(false);
    expect(validator.processFrame(noteFrame(targetMidi), 110 + holdMs)).toBe(true);
  });

  it("keeps the hold running while the reference tone is playing", () => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, [
      [noteFrame(targetMidi), 0],
      [makeFrame({ isRefPlaying: true }), 60],
    ]);

    expect(validator.processFrame(noteFrame(targetMidi), holdMs)).toBe(true);
  });

  it.each([
    [0.85, true],
    [0.84, false],
  ])("validates only when the final frame reaches the validation clarity (%f)", (clarity, shouldValidate) => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, [[noteFrame(targetMidi, 0.7), 0]]);

    expect(validator.processFrame(noteFrame(targetMidi, clarity), holdMs)).toBe(shouldValidate);
  });

  it("never validates a note other than the target", () => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, [[noteFrame(otherMidi), 0]]);

    expect(validator.processFrame(noteFrame(otherMidi), holdMs * 10)).toBe(false);
  });

  it("validates only once", () => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, [[noteFrame(targetMidi), 0]]);

    expect(validator.processFrame(noteFrame(targetMidi), holdMs)).toBe(true);
    expect(validator.processFrame(noteFrame(targetMidi), holdMs * 2)).toBe(false);
  });
});

describe("createValidationSession", () => {
  function candidate(midi: number): NoteCandidate {
    return { stringIndex: 0, fretIndex: 0, midi, isValidated: false };
  }

  it("validates nothing before a target is set", () => {
    const session = createValidationSession();

    expect(session.processFrame(noteFrame(targetMidi), holdMs)).toBe(false);
  });

  it("validates the current target after the hold", () => {
    const session = createValidationSession();
    session.setTarget(candidate(targetMidi));

    expect(session.processFrame(noteFrame(targetMidi), 0)).toBe(false);
    expect(session.processFrame(noteFrame(targetMidi), holdMs)).toBe(true);
  });

  it("re-arms for a new series entry sharing the same pitch (round-trip seam)", () => {
    const session = createValidationSession();
    session.setTarget(candidate(targetMidi));
    session.processFrame(noteFrame(targetMidi), 0);
    expect(session.processFrame(noteFrame(targetMidi), holdMs)).toBe(true);

    session.setTarget(candidate(targetMidi));
    session.processFrame(noteFrame(targetMidi), 500);

    expect(session.processFrame(noteFrame(targetMidi), 500 + holdMs)).toBe(true);
  });

  it("does not re-arm while the same entry stays the target", () => {
    const session = createValidationSession();
    const entry = candidate(targetMidi);
    session.setTarget(entry);
    session.processFrame(noteFrame(targetMidi), 0);
    expect(session.processFrame(noteFrame(targetMidi), holdMs)).toBe(true);

    session.setTarget(entry);
    session.processFrame(noteFrame(targetMidi), 500);

    expect(session.processFrame(noteFrame(targetMidi), 500 + holdMs)).toBe(false);
  });
});
