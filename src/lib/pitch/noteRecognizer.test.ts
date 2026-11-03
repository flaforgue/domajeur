import { describe, expect, it } from "vitest";
import { frequencyFromMidi } from "../music/notation";
import type { Frame } from "./pitchEngine";
import { createNoteRecognizer, type NoteRecognizer } from "./noteRecognizer";

const midi = 45;
const otherMidi = 47;
const holdMs = 130;

describe("createNoteRecognizer", () => {
  it("recognizes any note once it has been held long enough", () => {
    const recognizer = createNoteRecognizer();

    expect(recognizer.processFrame(noteFrame(midi), 0)).toBeNull();
    expect(recognizer.processFrame(noteFrame(midi), holdMs - 1)).toBeNull();
    expect(recognizer.processFrame(noteFrame(midi), holdMs)).toBe(midi);
  });

  it("recognizes a sustained note only once", () => {
    const recognizer = createNoteRecognizer();
    processAll(recognizer, [[noteFrame(midi), 0], [noteFrame(midi), holdMs]]);

    expect(recognizer.processFrame(noteFrame(midi), holdMs * 10)).toBeNull();
  });

  it("recognizes the same note again after a silence", () => {
    const recognizer = createNoteRecognizer();
    processAll(recognizer, [
      [noteFrame(midi), 0],
      [noteFrame(midi), holdMs],
      [silentFrame(), 200],
      [noteFrame(midi), 300],
    ]);

    expect(recognizer.processFrame(noteFrame(midi), 300 + holdMs)).toBe(midi);
  });

  it("recognizes a new note played right after the previous one", () => {
    const recognizer = createNoteRecognizer();
    processAll(recognizer, [[noteFrame(midi), 0], [noteFrame(midi), holdMs], [noteFrame(otherMidi), 200]]);

    expect(recognizer.processFrame(noteFrame(otherMidi), 200 + holdMs)).toBe(otherMidi);
  });
});

function silentFrame(): Frame {
  return { frequencyInHertz: -1, clarity: 0, rootMeanSquare: 0.05, isRefPlaying: false };
}

function noteFrame(noteMidi: number): Frame {
  return { ...silentFrame(), frequencyInHertz: frequencyFromMidi(noteMidi), clarity: 0.9 };
}

function processAll(recognizer: NoteRecognizer, frames: [Frame, number][]): void {
  frames.forEach(([frame, now]) => {
    recognizer.processFrame(frame, now);
  });
}
