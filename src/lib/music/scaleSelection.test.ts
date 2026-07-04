import { describe, expect, it } from "vitest";
import {
  clampScaleState,
  DEFAULT_SCALE_STATE,
  relativeScaleState,
  SCALE_ROOTS,
  scaleSeriesFromState,
  type ScaleSelectorState,
} from "./scaleSelection";

const doIndex = 0;
const doSharpIndex = 1;
const reFlatIndex = 2;
const laIndex = 12;
const laSharpIndex = 13;
const siFlatIndex = 14;

function makeState(overrides: Partial<ScaleSelectorState> = {}): ScaleSelectorState {
  return { ...DEFAULT_SCALE_STATE, ...overrides };
}

describe("clampScaleState", () => {
  it("keeps a valid pentatonic selection", () => {
    const clamped = clampScaleState(makeState({ quality: "minor", size: "pentatonic", variant: "blues" }));

    expect(clamped).toMatchObject({ size: "pentatonic", variant: "blues" });
  });

  it("falls back to a standard heptatonic when the quality has no pentatonic", () => {
    const clamped = clampScaleState(makeState({ quality: "phrygianDominant", size: "pentatonic", variant: "blues" }));

    expect(clamped).toMatchObject({ size: "heptatonic", variant: "standard" });
  });

  it("drops the blues variant when the size is heptatonic", () => {
    const clamped = clampScaleState(makeState({ size: "heptatonic", variant: "blues" }));

    expect(clamped.variant).toBe("standard");
  });

  it.each([
    [0, 1],
    [99, 2],
  ])("clamps %i octaves into the playable range for a Do major heptatonic", (octaves, expected) => {
    const clamped = clampScaleState(makeState({ rootIndex: doIndex, octaves }));

    expect(clamped.octaves).toBe(expected);
  });
});

describe("relativeScaleState", () => {
  it("switches a major scale to its relative minor", () => {
    const relative = relativeScaleState(makeState({ rootIndex: doIndex, quality: "major" }));

    expect(relative).toMatchObject({ rootIndex: laIndex, quality: "minor" });
  });

  it("switches a minor scale back to its relative major", () => {
    const relative = relativeScaleState(makeState({ rootIndex: laIndex, quality: "minor" }));

    expect(relative).toMatchObject({ rootIndex: doIndex, quality: "major" });
  });

  it.each([
    ["sharp", doSharpIndex, laSharpIndex],
    ["flat", reFlatIndex, siFlatIndex],
  ])("keeps the %s spelling of the root", (_spelling, rootIndex, expectedRootIndex) => {
    const relative = relativeScaleState(makeState({ rootIndex, quality: "major" }));

    expect(relative.rootIndex).toBe(expectedRootIndex);
  });

  it("returns the state unchanged when the quality has no relative", () => {
    const state = makeState({ quality: "phrygianDominant" });

    const relative = relativeScaleState(state);

    expect(relative).toBe(state);
  });
});

describe("scaleSeriesFromState", () => {
  it.each([
    ["heptatonic", "standard", 8],
    ["pentatonic", "standard", 6],
    ["pentatonic", "blues", 7],
  ] as const)("produces the notes of a one-octave %s %s scale, closing tonic included", (size, variant, expectedCount) => {
    const series = scaleSeriesFromState(makeState({ size, variant }));

    expect(series).toHaveLength(expectedCount);
    expect(series[series.length - 1].midi).toBe(series[0].midi + 12);
  });

  it("stacks the second octave one octave above the first", () => {
    const series = scaleSeriesFromState(makeState({ octaves: 2 }));

    expect(series).toHaveLength(15);
    expect(series[7].midi).toBe(series[0].midi + 12);
    expect(series[14].midi).toBe(series[0].midi + 24);
  });

  it("mirrors the ascent back down to the root when round trip is enabled", () => {
    const series = scaleSeriesFromState(makeState({ isRoundTrip: true }));

    expect(series.map((note) => note.midi)).toEqual([
      48, 50, 52, 53, 55, 57, 59, 60,
      59, 57, 55, 53, 52, 50, 48,
    ]);
  });

  it("keeps ascending and descending entries independent for validation", () => {
    const series = scaleSeriesFromState(makeState({ isRoundTrip: true }));

    expect(series[0]).not.toBe(series[series.length - 1]);
    expect(series[0]).toEqual(series[series.length - 1]);
  });

  it("spells the series according to the chosen root spelling", () => {
    const sharpSeries = scaleSeriesFromState(makeState({ rootIndex: doSharpIndex }));
    const flatSeries = scaleSeriesFromState(makeState({ rootIndex: reFlatIndex }));

    expect(sharpSeries[0].spelling).toEqual({ natural: 0, alteration: 1 });
    expect(flatSeries[0].spelling).toEqual({ natural: 2, alteration: -1 });
  });

  it("starts every note unvalidated", () => {
    const series = scaleSeriesFromState(makeState());

    expect(series.every((note) => !note.isValidated)).toBe(true);
  });
});

describe("SCALE_ROOTS", () => {
  it("covers every pitch class", () => {
    const pitchClasses = new Set(SCALE_ROOTS.map((root) => root.pitchClass));

    expect(pitchClasses.size).toBe(12);
  });
});
