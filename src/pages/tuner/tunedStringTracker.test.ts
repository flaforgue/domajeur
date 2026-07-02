import { describe, expect, it } from "vitest";
import { STRINGS } from "../../lib/music/guitar";
import { frequencyFromMidi } from "../../lib/music/notation";
import type { Frame } from "../../lib/pitch/pitchEngine";
import { createTunedStringTracker } from "./tunedStringTracker";

const aStringIndex = 1;
const dStringIndex = 2;

function makeFrame(overrides: Partial<Frame> = {}): Frame {
  return { frequencyInHertz: -1, clarity: 0, rootMeanSquare: 0.05, isRefPlaying: false, ...overrides };
}

function stringFrame(stringIndex: number, detuneCents = 0): Frame {
  const frequency = frequencyFromMidi(STRINGS[stringIndex].midi) * Math.pow(2, detuneCents / 1200);

  return makeFrame({ frequencyInHertz: frequency, clarity: 0.9 });
}

describe("createTunedStringTracker", () => {
  it("confirms a string held in tune for 750ms", () => {
    const tracker = createTunedStringTracker();
    tracker.processFrame(stringFrame(aStringIndex), 0);

    const tunedStringIndex = tracker.processFrame(stringFrame(aStringIndex), 750);

    expect(tunedStringIndex).toBe(aStringIndex);
  });

  it("does not confirm before the hold duration", () => {
    const tracker = createTunedStringTracker();
    tracker.processFrame(stringFrame(aStringIndex), 0);

    const tunedStringIndex = tracker.processFrame(stringFrame(aStringIndex), 749);

    expect(tunedStringIndex).toBeNull();
  });

  it("keeps the hold across a dropout shorter than the grace window", () => {
    const tracker = createTunedStringTracker();
    tracker.processFrame(stringFrame(aStringIndex), 0);
    tracker.processFrame(makeFrame(), 200);

    const tunedStringIndex = tracker.processFrame(stringFrame(aStringIndex), 750);

    expect(tunedStringIndex).toBe(aStringIndex);
  });

  it("restarts the hold after a dropout longer than the grace window", () => {
    const tracker = createTunedStringTracker();
    tracker.processFrame(stringFrame(aStringIndex), 0);
    tracker.processFrame(makeFrame(), 400);

    const tunedStringIndex = tracker.processFrame(stringFrame(aStringIndex), 750);

    expect(tunedStringIndex).toBeNull();
  });

  it("restarts the hold when the detected string changes", () => {
    const tracker = createTunedStringTracker();
    tracker.processFrame(stringFrame(aStringIndex), 0);

    const tunedStringIndex = tracker.processFrame(stringFrame(dStringIndex), 750);

    expect(tunedStringIndex).toBeNull();
  });

  it.each([
    [5, aStringIndex],
    [-5, aStringIndex],
    [6, null],
    [-6, null],
  ])("treats a note detuned by %i cents as %j after the hold", (detuneCents, expected) => {
    const tracker = createTunedStringTracker();
    tracker.processFrame(stringFrame(aStringIndex, detuneCents), 0);

    const tunedStringIndex = tracker.processFrame(stringFrame(aStringIndex, detuneCents), 750);

    expect(tunedStringIndex).toBe(expected);
  });

  it("ignores in-tune notes that are not an open string", () => {
    const tracker = createTunedStringTracker();
    const nonOpenStringFrame = makeFrame({ frequencyInHertz: frequencyFromMidi(46), clarity: 0.9 });
    tracker.processFrame(nonOpenStringFrame, 0);

    const tunedStringIndex = tracker.processFrame(nonOpenStringFrame, 750);

    expect(tunedStringIndex).toBeNull();
  });
});
