import { describe, it, expect } from "vitest";
import {
  frequencyFromMidi,
  namedNoteFromMidi,
  noteFromFrequency,
  pitchClassFromMidi,
  pitchClassName,
  spellingName,
} from "./notation";

describe("notation.ts", () => {
  describe("frequencyFromMidi", () => {
    it("anchors A4 (MIDI 69) at 440 Hz", () => {
      expect(frequencyFromMidi(69)).toBeCloseTo(440, 5);
    });

    it("doubles frequency one octave up", () => {
      expect(frequencyFromMidi(81)).toBeCloseTo(880, 5);
    });

    it("returns ~261.63 Hz for middle C (MIDI 60)", () => {
      expect(frequencyFromMidi(60)).toBeCloseTo(261.6256, 3);
    });
  });

  describe("noteFromFrequency", () => {
    it("maps 440 Hz to MIDI 69 dead in tune", () => {
      expect(noteFromFrequency(440)).toEqual({ midi: 69, cents: 0 });
    });

    it("reports a positive cents offset when sharp", () => {
      const { midi, cents } = noteFromFrequency(442);
      expect(midi).toBe(69);
      expect(cents).toBeGreaterThan(0);
    });

    it("reports a negative cents offset when flat", () => {
      const { midi, cents } = noteFromFrequency(438);
      expect(midi).toBe(69);
      expect(cents).toBeLessThan(0);
    });

    it("round-trips every MIDI note in the playable range", () => {
      for (let midi = 40; midi <= 88; midi++) {
        const result = noteFromFrequency(frequencyFromMidi(midi));
        expect(result.midi).toBe(midi);
        expect(result.cents).toBe(0);
      }
    });
  });

  describe("namedNoteFromMidi", () => {
    it("names A4 in both notations", () => {
      expect(namedNoteFromMidi(69, "international").name).toBe("A4");
      expect(namedNoteFromMidi(69, "french").name).toBe("La4");
    });

    it("names middle C and exposes pitch class + octave", () => {
      expect(namedNoteFromMidi(60, "french")).toEqual({
        pitchClass: 0,
        octave: 4,
        baseName: "Do",
        accidental: "",
        pitchName: "Do",
        name: "Do4",
      });
    });

    it("defaults to the sharp spelling", () => {
      const named = namedNoteFromMidi(61, "international");
      expect(named.name).toBe("C♯4");
      expect(named.pitchName).toBe("C♯");
      expect(named.baseName).toBe("C");
      expect(named.accidental).toBe("♯");
    });

    it("honors an explicit spelling", () => {
      expect(namedNoteFromMidi(63, "french", { naturalPitchClass: 4, alteration: -1 }).name).toBe("Mi♭4");
      expect(namedNoteFromMidi(63, "international", { naturalPitchClass: 4, alteration: -1 }).name).toBe("E♭4");
    });

    it("supports double accidentals", () => {
      expect(namedNoteFromMidi(55, "french", { naturalPitchClass: 5, alteration: 2 }).name).toBe("Fa𝄪3");
      expect(namedNoteFromMidi(57, "french", { naturalPitchClass: 11, alteration: -2 }).name).toBe("Si𝄫3");
    });

    it("keeps the octave of the letter, not of the sounding pitch", () => {
      expect(namedNoteFromMidi(60, "french", { naturalPitchClass: 11, alteration: 1 }).name).toBe("Si♯3");
      expect(namedNoteFromMidi(59, "french", { naturalPitchClass: 0, alteration: -1 }).name).toBe("Do♭4");
    });
  });

  describe("pitchClassFromMidi", () => {
    it("collapses octaves to 0..11", () => {
      expect(pitchClassFromMidi(60)).toBe(0);
      expect(pitchClassFromMidi(72)).toBe(0);
      expect(pitchClassFromMidi(69)).toBe(9);
    });

    it("stays non-negative for low MIDI values", () => {
      expect(pitchClassFromMidi(0)).toBe(0);
      expect(pitchClassFromMidi(1)).toBe(1);
    });
  });

  describe("spellingName", () => {
    it("formats a spelling in the given notation", () => {
      expect(spellingName({ naturalPitchClass: 7, alteration: -1 }, "french")).toBe("Sol♭");
      expect(spellingName({ naturalPitchClass: 7, alteration: -1 }, "international")).toBe("G♭");
      expect(spellingName({ naturalPitchClass: 0, alteration: 0 }, "french")).toBe("Do");
      expect(spellingName({ naturalPitchClass: 5, alteration: 2 }, "french")).toBe("Fa𝄪");
    });
  });

  describe("pitchClassName", () => {
    it("names the pitch class in the given notation", () => {
      expect(pitchClassName(0, "french")).toBe("Do");
      expect(pitchClassName(0, "international")).toBe("C");
    });
  });
});
