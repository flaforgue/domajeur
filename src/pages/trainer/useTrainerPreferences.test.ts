import { describe, expect, it } from "vitest";
import { DEFAULT_SCALE_STATE } from "../../lib/music/scaleSelection";
import { parseTrainerPreferences } from "./useTrainerPreferences";

describe("parseTrainerPreferences", () => {
  it("round-trips a fully populated payload", () => {
    expect(parseTrainerPreferences(serialized())).toEqual({
      neck: {
        isNaturalsOnly: false,
        fretMax: 7,
        shouldAutoAdvance: false,
        shouldPlayOnAdvance: false,
      },
      scales: {
        shouldAutoAdvance: true,
        scale: {
          rootIndex: 3,
          quality: "minor",
          size: "pentatonic",
          variant: "blues",
          octaves: 2,
          isClosedPosition: true,
          isRoundTrip: true,
        },
      },
    });
  });

  it("returns null on malformed or non-object payloads", () => {
    expect(parseTrainerPreferences("not json")).toBeNull();
    expect(parseTrainerPreferences("42")).toBeNull();
    expect(parseTrainerPreferences("null")).toBeNull();
  });

  it("falls back to defaults for missing fields", () => {
    expect(parseTrainerPreferences("{}")).toEqual({
      neck: {
        isNaturalsOnly: true,
        fretMax: 12,
        shouldAutoAdvance: true,
        shouldPlayOnAdvance: true,
      },
      scales: {
        shouldAutoAdvance: true,
        scale: DEFAULT_SCALE_STATE,
      },
    });
  });

  it("migrates flat payloads saved before the page split", () => {
    const legacy = JSON.stringify({
      mode: "scale",
      isNaturalsOnly: false,
      fretMax: 5,
      shouldAutoAdvance: false,
      shouldPlayOnAdvance: true,
      scale: { rootIndex: 3, quality: "minor" },
    });

    expect(parseTrainerPreferences(legacy)).toEqual({
      neck: {
        isNaturalsOnly: false,
        fretMax: 5,
        shouldAutoAdvance: false,
        shouldPlayOnAdvance: true,
      },
      scales: {
        shouldAutoAdvance: false,
        scale: { ...DEFAULT_SCALE_STATE, rootIndex: 3, quality: "minor" },
      },
    });
  });

  it("repairs an out-of-range root index", () => {
    const parsed = parseTrainerPreferences(serialized({ scale: { rootIndex: 99, quality: "minor" } }));

    expect(parsed?.scales.scale.rootIndex).toBe(DEFAULT_SCALE_STATE.rootIndex);
  });
});

function serialized(scales: Record<string, unknown> = {}): string {
  return JSON.stringify({
    neck: {
      isNaturalsOnly: false,
      fretMax: 7,
      shouldAutoAdvance: false,
      shouldPlayOnAdvance: false,
    },
    scales: {
      shouldAutoAdvance: true,
      scale: {
        rootIndex: 3,
        quality: "minor",
        size: "pentatonic",
        variant: "blues",
        octaves: 2,
        isClosedPosition: true,
        isRoundTrip: true,
      },
      ...scales,
    },
  });
}
