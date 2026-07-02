import { describe, expect, it } from "vitest";
import type { Frame } from "./pitchEngine";
import { detectedNoteFromFrame } from "./detectedNote";

function makeFrame(overrides: Partial<Frame> = {}): Frame {
  return {
    frequencyInHertz: 440,
    clarity: 0.9,
    rootMeanSquare: 0.05,
    isRefPlaying: false,
    ...overrides,
  };
}

describe("detectedNoteFromFrame", () => {
  it("returns the midi note and cents offset of a clear frame", () => {
    const detected = detectedNoteFromFrame(makeFrame({ frequencyInHertz: 440 }));

    expect(detected).toEqual({ midi: 69, cents: 0 });
  });

  it.each([
    ["the reference tone is playing", { isRefPlaying: true }],
    ["nothing is detected", { frequencyInHertz: -1 }],
    ["the detection is below the clarity threshold", { clarity: 0.54 }],
  ])("returns null when %s", (_reason, overrides) => {
    const detected = detectedNoteFromFrame(makeFrame(overrides));

    expect(detected).toBeNull();
  });

  it("accepts a frame exactly at the clarity threshold", () => {
    const detected = detectedNoteFromFrame(makeFrame({ clarity: 0.55 }));

    expect(detected).not.toBeNull();
  });
});
