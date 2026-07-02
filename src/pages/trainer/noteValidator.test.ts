import { describe, expect, it } from "vitest";
import { frequencyFromMidi } from "../../lib/music/notation";
import type { Frame } from "../../lib/pitch/pitchEngine";
import { createNoteValidator, type NoteValidator } from "./noteValidator";

const targetMidi = 45;
const otherMidi = 47;

function makeFrame(overrides: Partial<Frame> = {}): Frame {
  return { frequencyInHertz: -1, clarity: 0, rootMeanSquare: 0.05, isRefPlaying: false, ...overrides };
}

function noteFrame(midi: number, clarity = 0.9): Frame {
  return makeFrame({ frequencyInHertz: frequencyFromMidi(midi), clarity });
}

function targetFrames(count: number, clarity = 0.9): Frame[] {
  return Array.from({ length: count }, () => noteFrame(targetMidi, clarity));
}

function processAll(validator: NoteValidator, frames: Frame[]): void {
  frames.forEach((frame) => {
    validator.processFrame(frame);
  });
}

describe("createNoteValidator", () => {
  it("validates once the target note has been stable for 8 frames", () => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, targetFrames(7));

    const isValidated = validator.processFrame(noteFrame(targetMidi));

    expect(isValidated).toBe(true);
  });

  it("does not validate before the target note has been stable for 8 frames", () => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, targetFrames(6));

    const isValidated = validator.processFrame(noteFrame(targetMidi));

    expect(isValidated).toBe(false);
  });

  it.each([
    ["silence", makeFrame()],
    ["an unclear frame", noteFrame(targetMidi, 0.3)],
    ["another note", noteFrame(otherMidi)],
  ])("restarts the stability count after %s", (_interruption, interruptingFrame) => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, [...targetFrames(7), interruptingFrame, ...targetFrames(6)]);

    const isValidated = validator.processFrame(noteFrame(targetMidi));

    expect(isValidated).toBe(false);
  });

  it("keeps the stability count while the reference tone is playing", () => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, [...targetFrames(7), makeFrame({ isRefPlaying: true })]);

    const isValidated = validator.processFrame(noteFrame(targetMidi));

    expect(isValidated).toBe(true);
  });

  it.each([
    [0.85, true],
    [0.84, false],
  ])("validates only when the final frame reaches the validation clarity (%f)", (clarity, shouldValidate) => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, targetFrames(7, 0.7));

    const isValidated = validator.processFrame(noteFrame(targetMidi, clarity));

    expect(isValidated).toBe(shouldValidate);
  });

  it("never validates a note other than the target", () => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, Array.from({ length: 20 }, () => noteFrame(otherMidi)));

    const isValidated = validator.processFrame(noteFrame(otherMidi));

    expect(isValidated).toBe(false);
  });

  it("validates only once", () => {
    const validator = createNoteValidator(targetMidi);
    processAll(validator, targetFrames(8));

    const isValidated = validator.processFrame(noteFrame(targetMidi));

    expect(isValidated).toBe(false);
  });
});
