import { describe, expect, it } from "vitest";
import { DEFAULT_SCALE_STATE, SCALE_ROOTS } from "../../lib/music/scaleSelection";
import { parseTrainerPreferences } from "./useTrainerPreferences";

function serialized(overrides: Record<string, unknown> = {}, scale: Record<string, unknown> = {}): string {
  return JSON.stringify({
    mode: "scale",
    isNaturalsOnly: false,
    fretMax: 7,
    shouldAutoAdvance: false,
    shouldPlayOnAdvance: false,
    scale: { rootIndex: 3, quality: "minor", size: "pentatonic", variant: "blues", octaves: 2, isRoundTrip: true, ...scale },
    ...overrides,
  });
}

describe("parseTrainerPreferences", () => {
  it("round-trips a fully populated payload", () => {
    expect(parseTrainerPreferences(serialized())).toEqual({
      mode: "scale",
      isNaturalsOnly: false,
      fretMax: 7,
      shouldAutoAdvance: false,
      shouldPlayOnAdvance: false,
      scale: { rootIndex: 3, quality: "minor", size: "pentatonic", variant: "blues", octaves: 2, isRoundTrip: true },
    });
  });

  it("returns null on malformed or non-object payloads", () => {
    expect(parseTrainerPreferences("not json")).toBeNull();
    expect(parseTrainerPreferences("42")).toBeNull();
    expect(parseTrainerPreferences("null")).toBeNull();
  });

  it("falls back to defaults for missing fields", () => {
    const parsed = parseTrainerPreferences("{}");

    expect(parsed).toMatchObject({
      mode: "free",
      isNaturalsOnly: true,
      shouldAutoAdvance: true,
      shouldPlayOnAdvance: true,
      scale: DEFAULT_SCALE_STATE,
    });
  });

  it.each([
    ["out of bounds", SCALE_ROOTS.length],
    ["negative", -1],
    ["fractional", 3.5],
    ["not a number", "9"],
  ])("resets a %s rootIndex to the default instead of crashing later", (_label, rootIndex) => {
    const parsed = parseTrainerPreferences(serialized({}, { rootIndex }));

    expect(parsed?.scale.rootIndex).toBe(DEFAULT_SCALE_STATE.rootIndex);
  });

  it("keeps every valid rootIndex", () => {
    for (let rootIndex = 0; rootIndex < SCALE_ROOTS.length; rootIndex++) {
      expect(parseTrainerPreferences(serialized({}, { rootIndex }))?.scale.rootIndex).toBe(rootIndex);
    }
  });

  it("clamps invalid scale combinations like the selector does", () => {
    const parsed = parseTrainerPreferences(serialized({}, { quality: "harmonicMinor", size: "pentatonic", octaves: 99 }));

    expect(parsed?.scale).toMatchObject({ quality: "harmonicMinor", size: "heptatonic", variant: "standard" });
    expect(parsed?.scale.octaves).toBeLessThanOrEqual(3);
  });
});
