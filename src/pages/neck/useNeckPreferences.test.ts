import { describe, expect, it } from "vitest";
import { DEFAULT_NECK_PREFERENCES, parseNeckPreferences } from "./useNeckPreferences";

describe("parseNeckPreferences", () => {
  it("round-trips a valid payload", () => {
    const preferences = { checkedPitchClasses: [0, 9], checkedStringIndexes: [0, 5] };

    expect(parseNeckPreferences(JSON.stringify(preferences))).toEqual(preferences);
  });

  it("rejects invalid payloads", () => {
    expect(parseNeckPreferences("not json")).toBeNull();
    expect(parseNeckPreferences("42")).toBeNull();
    expect(parseNeckPreferences("null")).toBeNull();
  });

  it("falls back to no selection for missing or non-array fields", () => {
    expect(parseNeckPreferences("{}")).toEqual(DEFAULT_NECK_PREFERENCES);
    expect(parseNeckPreferences(JSON.stringify({ checkedPitchClasses: "Do", checkedStringIndexes: 2 })))
      .toEqual(DEFAULT_NECK_PREFERENCES);
  });

  it("drops unknown, altered and duplicated values", () => {
    const parsed = parseNeckPreferences(JSON.stringify({
      checkedPitchClasses: [0, 1, 0, 12, "Ré", 4],
      checkedStringIndexes: [-1, 2, 2, 6, 1.5, 3],
    }));

    expect(parsed).toEqual({ checkedPitchClasses: [0, 4], checkedStringIndexes: [2, 3] });
  });
});
