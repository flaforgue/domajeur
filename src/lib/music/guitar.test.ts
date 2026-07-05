import { describe, it, expect } from "vitest";
import {
  canonicalStringPositionFromMidi,
  fretText,
  randomNote,
  stringName,
  stringPositionsForMidi,
} from "./guitar";

const naturalPitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);

describe("guitar.ts", () => {
  describe("stringName", () => {
    it("names the low and high E strings with their suffixes", () => {
      expect(stringName(0, "french")).toBe("Mi grave");
      expect(stringName(5, "international")).toBe("E aigu");
    });

    it("names a middle string without suffix", () => {
      expect(stringName(1, "international")).toBe("A");
    });
  });

  describe("fretText", () => {
    it("handles open string, first fret and others", () => {
      expect(fretText(0)).toBe("à vide");
      expect(fretText(1)).toBe("1ère frette");
      expect(fretText(5)).toBe("5ème frette");
    });
  });

  describe("stringPositionsForMidi", () => {
    it("finds every playable position within maxFret", () => {
      expect(stringPositionsForMidi(45, 5)).toEqual([
        { stringIndex: 0, fretIndex: 5 },
        { stringIndex: 1, fretIndex: 0 },
      ]);
    });

    it("excludes positions beyond maxFret", () => {
      expect(stringPositionsForMidi(45, 4)).toEqual([{ stringIndex: 1, fretIndex: 0 }]);
    });
  });

  describe("canonicalStringPositionFromMidi", () => {
    it("prefers the lowest fret", () => {
      expect(canonicalStringPositionFromMidi(45)).toEqual({ stringIndex: 1, fretIndex: 0 });
      expect(canonicalStringPositionFromMidi(40)).toEqual({ stringIndex: 0, fretIndex: 0 });
    });

    it("reaches the notes above the 12th fret on the high E string", () => {
      expect(canonicalStringPositionFromMidi(77)).toEqual({ stringIndex: 5, fretIndex: 13 });
      expect(canonicalStringPositionFromMidi(81)).toEqual({ stringIndex: 5, fretIndex: 17 });
    });
  });

  describe("randomNote", () => {
    it("stays within fret bounds and is never pre-validated", () => {
      for (let i = 0; i < 200; i++) {
        const note = randomNote(7, false, null);
        expect(note.fretIndex).toBeGreaterThanOrEqual(0);
        expect(note.fretIndex).toBeLessThanOrEqual(7);
        expect(note.isValidated).toBe(false);
      }
    });

    it("only yields natural notes when naturals-only is set", () => {
      for (let i = 0; i < 200; i++) {
        const note = randomNote(7, true, null);
        expect(naturalPitchClasses.has(note.midi % 12)).toBe(true);
      }
    });

    it("avoids the given MIDI when alternatives exist", () => {
      for (let i = 0; i < 200; i++) {
        expect(randomNote(7, false, 45).midi).not.toBe(45);
      }
    });
  });
});
