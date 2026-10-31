import { describe, it, expect } from "vitest";
import {
  canonicalStringPositionFromMidi,
  fretText,
  stringName,
  stringPositionsForMidi,
} from "./guitar";

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
});
