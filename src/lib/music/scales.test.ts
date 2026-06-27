import { describe, it, expect } from "vitest";
import { scaleIntervals, scaleNotesFromConfig, type ScaleConfig } from "./scales";

const config = (overrides: Partial<ScaleConfig> = {}): ScaleConfig => ({
  root: 0,
  quality: "major",
  size: "heptatonic",
  variant: "standard",
  ...overrides,
});

describe("scales.ts", () => {
  describe("scaleIntervals", () => {
    it("returns the major scale", () => {
      expect(scaleIntervals(config())).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it("returns the natural minor scale", () => {
      expect(scaleIntervals(config({ quality: "minor" }))).toEqual([0, 2, 3, 5, 7, 8, 10]);
    });

    it("drops the two semitone notes for the major pentatonic", () => {
      expect(scaleIntervals(config({ size: "pentatonic" }))).toEqual([0, 2, 4, 7, 9]);
    });

    it("drops the two semitone notes for the minor pentatonic", () => {
      expect(scaleIntervals(config({ quality: "minor", size: "pentatonic" }))).toEqual([0, 3, 5, 7, 10]);
    });

    it("adds the ♭5 blue note to the minor pentatonic", () => {
      expect(scaleIntervals(config({ quality: "minor", size: "pentatonic", variant: "blues" })))
        .toEqual([0, 3, 5, 6, 7, 10]);
    });

    it("adds the ♭3 blue note to the major pentatonic", () => {
      expect(scaleIntervals(config({ size: "pentatonic", variant: "blues" }))).toEqual([0, 2, 3, 4, 7, 9]);
    });
  });

  describe("scaleNotesFromConfig", () => {
    const cases: { name: string; overrides: Partial<ScaleConfig>; midis: number[] }[] = [
      {
        name: "major heptatonic",
        overrides: {
          quality: "major",
          size: "heptatonic",
          variant: "standard",
        },
        midis: [48, 50, 52, 53, 55, 57, 59],
      },
      {
        name: "major heptatonic blues",
        overrides: {
          quality: "major",
          size: "heptatonic",
          variant: "blues",
        },
        midis: [48, 50, 51, 52, 53, 55, 57, 59],
      },
      {
        name: "major pentatonic",
        overrides: {
          quality: "major",
          size: "pentatonic",
          variant: "standard",
        },
        midis: [48, 50, 52, 55, 57],
      },
      {
        name: "major pentatonic blues",
        overrides: {
          quality: "major",
          size: "pentatonic",
          variant: "blues",
        },
        midis: [48, 50, 51, 52, 55, 57],
      },
      {
        name: "minor heptatonic",
        overrides: {
          quality: "minor",
          size: "heptatonic",
          variant: "standard",
        },
        midis: [48, 50, 51, 53, 55, 56, 58],
      },
      {
        name: "minor heptatonic blues",
        overrides: {
          quality: "minor",
          size: "heptatonic",
          variant: "blues",
        },
        midis: [48, 50, 51, 53, 54, 55, 56, 58],
      },
      {
        name: "minor pentatonic",
        overrides: {
          quality: "minor",
          size: "pentatonic",
          variant: "standard",
        },
        midis: [48, 51, 53, 55, 58],
      },
      {
        name: "minor pentatonic blues",
        overrides: {
          quality: "minor",
          size: "pentatonic",
          variant: "blues",
        },
        midis: [48, 51, 53, 54, 55, 58],
      },
    ];

    it.each(cases)("builds C $name", ({ overrides, midis }) => {
      expect(scaleNotesFromConfig(config(overrides)).map((note) => note.midi)).toEqual(midis);
    });

    it("builds A minor pentatonic from the first playable A (MIDI 45)", () => {
      const midis = scaleNotesFromConfig(config({ root: 9, quality: "minor", size: "pentatonic" })).map((n) => n.midi);
      expect(midis).toEqual([45, 48, 50, 52, 55]);
    });

    it("returns notes that are not pre-validated and have a playable position", () => {
      for (const note of scaleNotesFromConfig(config({ root: 7 }))) {
        expect(note.isValidated).toBe(false);
        expect(note.fretIndex).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
