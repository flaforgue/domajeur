import { describe, expect, it } from "vitest";
import {
  clampChordPreferences,
  DEFAULT_CHORD_PREFERENCES,
  parseChordPreferences,
} from "./useChordPreferences";

describe("useChordPreferences", () => {
  describe("parseChordPreferences", () => {
    it("rejects invalid payloads", () => {
      expect(parseChordPreferences("not json")).toBeNull();
      expect(parseChordPreferences("42")).toBeNull();
      expect(parseChordPreferences("null")).toBeNull();
    });

    it("falls back field by field on invalid values", () => {
      const parsed = parseChordPreferences(JSON.stringify({
        rootIndex: "Do",
        quality: "seventh",
        positionIndex: 1.5,
      }));
      expect(parsed).toEqual(DEFAULT_CHORD_PREFERENCES);
    });

    it("keeps valid values and ignores unknown fields", () => {
      const parsed = parseChordPreferences(JSON.stringify({
        rootIndex: 3,
        quality: "diminished",
        positionIndex: 1,
        dotLabels: "notes",
      }));
      expect(parsed).toEqual({ rootIndex: 3, quality: "diminished", positionIndex: 1 });
    });
  });

  describe("clampChordPreferences", () => {
    it("clamps the root index to the available roots", () => {
      expect(clampChordPreferences({ ...DEFAULT_CHORD_PREFERENCES, rootIndex: 99 }).rootIndex).toBe(17);
      expect(clampChordPreferences({ ...DEFAULT_CHORD_PREFERENCES, rootIndex: -1 }).rootIndex).toBe(0);
    });

    it("clamps the position index to the positions of the selected chord", () => {
      const clamped = clampChordPreferences({ ...DEFAULT_CHORD_PREFERENCES, positionIndex: 99 });
      expect(clamped.positionIndex).toBeGreaterThan(0);
      expect(clampChordPreferences({ ...DEFAULT_CHORD_PREFERENCES, positionIndex: -2 }).positionIndex).toBe(0);
    });
  });
});
