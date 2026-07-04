import { describe, expect, it } from "vitest";
import { MAX_BEATS, MAX_BPM, MIN_BEATS, MIN_BPM, parseMetronomeSettings } from "./useMetronomeSettings";

describe("parseMetronomeSettings", () => {
  it("round-trips a valid payload", () => {
    expect(parseMetronomeSettings(JSON.stringify({ bpm: 120, beatsPerMeasure: 3 })))
      .toEqual({ bpm: 120, beatsPerMeasure: 3 });
  });

  it("returns null on malformed or non-object payloads", () => {
    expect(parseMetronomeSettings("not json")).toBeNull();
    expect(parseMetronomeSettings("42")).toBeNull();
    expect(parseMetronomeSettings("null")).toBeNull();
  });

  it("falls back to defaults for missing or non-numeric fields", () => {
    expect(parseMetronomeSettings("{}")).toEqual({ bpm: 100, beatsPerMeasure: 4 });
    expect(parseMetronomeSettings(JSON.stringify({ bpm: "fast", beatsPerMeasure: null })))
      .toEqual({ bpm: 100, beatsPerMeasure: 4 });
  });

  it.each([
    ["zero", 0, MIN_BPM],
    ["negative", -5, MIN_BPM],
    ["huge", 9999, MAX_BPM],
    ["fractional", 99.6, 100],
  ])("clamps a %s bpm that would break the scheduler", (_label, bpm, expected) => {
    expect(parseMetronomeSettings(JSON.stringify({ bpm }))?.bpm).toBe(expected);
  });

  it("resets a non-finite bpm to the default", () => {
    expect(parseMetronomeSettings("{\"bpm\": null}")?.bpm).toBe(100);
    expect(parseMetronomeSettings("{\"bpm\": \"NaN\"}")?.bpm).toBe(100);
  });

  it("clamps beats per measure into the displayable range", () => {
    expect(parseMetronomeSettings(JSON.stringify({ beatsPerMeasure: 0 }))?.beatsPerMeasure).toBe(MIN_BEATS);
    expect(parseMetronomeSettings(JSON.stringify({ beatsPerMeasure: 99 }))?.beatsPerMeasure).toBe(MAX_BEATS);
  });
});
