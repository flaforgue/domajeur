import { describe, it, expect } from "vitest";
import { relativeRoot, scaleIntervals, scaleNotesFromConfig, type ScaleConfig } from "./scales";

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

  describe("relativeRoot", () => {
    it("maps a major tonic to its relative minor a minor third below", () => {
      expect(relativeRoot(0, "major")).toBe(9); // Do majeur → La mineur
      expect(relativeRoot(7, "major")).toBe(4); // Sol majeur → Mi mineur
      expect(relativeRoot(9, "major")).toBe(6); // La majeur → Fa♯ mineur
    });

    it("maps a minor tonic to its relative major a minor third above", () => {
      expect(relativeRoot(9, "minor")).toBe(0); // La mineur → Do majeur
      expect(relativeRoot(4, "minor")).toBe(7); // Mi mineur → Sol majeur
    });

    it("round-trips a major key back to itself through its relative", () => {
      expect(relativeRoot(relativeRoot(0, "major"), "minor")).toBe(0);
    });

    it("shares the same pitch classes as its relative", () => {
      const major = scaleNotesFromConfig(config({ root: 0, quality: "major" })).map((n) => n.midi % 12);
      const minor = scaleNotesFromConfig(config({ root: 9, quality: "minor" })).map((n) => n.midi % 12);
      expect(new Set(minor)).toEqual(new Set(major));
    });

    it.each([
      ["Do Majeur", 0, "La Mineur", 9],
      ["Sol Majeur", 7, "Mi Mineur", 4],
      ["Ré Majeur", 2, "Si Mineur", 11],
      ["La Majeur", 9, "Fa♯ Mineur", 6],
      ["Mi Majeur", 4, "Do♯ Mineur", 1],
      ["Si Majeur", 11, "Sol♯ Mineur", 8],
      ["Fa♯ Majeur", 6, "Ré♯ Mineur", 3],
      ["Do♯ Majeur", 1, "La♯ Mineur", 10],
      ["Fa Majeur", 5, "Ré Mineur", 2],
      ["Si♭ Majeur", 10, "Sol Mineur", 7],
      ["Mi♭ Majeur", 3, "Do Mineur", 0],
      ["La♭ Majeur", 8, "Fa Mineur", 5],
      ["Ré♭ Majeur", 1, "Si♭ Mineur", 10],
      ["Sol♭ Majeur", 6, "Mi♭ Mineur", 3],
      ["Do♭ Majeur", 11, "La♭ Mineur", 8],
    ])(
      "should calculate the relative correct for %s and %s",
      (_majorName, majorRoot, _minorName, minorRoot) => {
        expect(relativeRoot(majorRoot, "major")).toBe(minorRoot);
        expect(relativeRoot(minorRoot, "minor")).toBe(majorRoot);
      },
    );
  });
});
