import { describe, expect, it } from "vitest";
import { spellingFromPitchName, spellingName } from "./notation";
import {
  CHORD_QUALITIES,
  chordAltSymbol,
  chordFormula,
  chordName,
  chordSymbol,
  chordTones,
  isChordQuality,
} from "./chords";

describe("chords", () => {
  describe("chordTones", () => {
    it("spells the major triad with a major third and a perfect fifth", () => {
      expect(toneNames("Do", "major")).toEqual(["Do", "Mi", "Sol"]);
      expect(toneNames("Sol♭", "major")).toEqual(["Sol♭", "Si♭", "Ré♭"]);
    });

    it("spells the minor triad with a minor third", () => {
      expect(toneNames("La", "minor")).toEqual(["La", "Do", "Mi"]);
      expect(toneNames("Mi♭", "minor")).toEqual(["Mi♭", "Sol♭", "Si♭"]);
    });

    it("spells the diminished triad with a diminished fifth", () => {
      expect(toneNames("Si", "diminished")).toEqual(["Si", "Ré", "Fa"]);
      expect(toneNames("Do♭", "diminished")).toEqual(["Do♭", "Mi𝄫", "Sol𝄫"]);
    });

    it("spells the augmented triad with an augmented fifth", () => {
      expect(toneNames("Fa", "augmented")).toEqual(["Fa", "La", "Do♯"]);
      expect(toneNames("Ré♯", "augmented")).toEqual(["Ré♯", "Fa𝄪", "La𝄪"]);
    });

    it("keeps each tone's pitch class consistent with the family formula", () => {
      CHORD_QUALITIES.forEach((quality) => {
        const tones = chordTones(spellingFromPitchName("La♭"), quality);
        const semitones = chordFormula(quality).split(" + ").slice(1).map(Number);
        expect(tones[1].pitchClass).toBe((tones[0].pitchClass + semitones[0]) % 12);
        expect(tones[2].pitchClass).toBe((tones[0].pitchClass + semitones[0] + semitones[1]) % 12);
      });
    });

    it("labels the intervals in French", () => {
      const roles = chordTones(spellingFromPitchName("Do"), "diminished").map((tone) => tone.roleLabel);
      expect(roles).toEqual(["Fondamentale", "Tierce mineure", "Quinte diminuée"]);
    });
  });

  describe("chordName", () => {
    it("combines the root name and the family label", () => {
      expect(chordName(spellingFromPitchName("Do"), "major", "french")).toBe("Do majeur");
      expect(chordName(spellingFromPitchName("Do♯"), "minor", "international")).toBe("C♯ mineur");
    });
  });

  describe("chordSymbol", () => {
    it("always uses letter names, as on chord charts", () => {
      expect(chordSymbol(spellingFromPitchName("Do"), "major")).toBe("C");
      expect(chordSymbol(spellingFromPitchName("La"), "minor")).toBe("Am");
      expect(chordSymbol(spellingFromPitchName("Si♭"), "diminished")).toBe("B♭dim");
      expect(chordSymbol(spellingFromPitchName("Fa♯"), "augmented")).toBe("F♯aug");
    });

    it("exposes the alternative notation only for diminished and augmented", () => {
      expect(chordAltSymbol(spellingFromPitchName("Do"), "major")).toBeNull();
      expect(chordAltSymbol(spellingFromPitchName("Do"), "minor")).toBeNull();
      expect(chordAltSymbol(spellingFromPitchName("Do"), "diminished")).toBe("C°");
      expect(chordAltSymbol(spellingFromPitchName("Do"), "augmented")).toBe("C+");
    });
  });

  describe("isChordQuality", () => {
    it("accepts the four families and rejects anything else", () => {
      expect(isChordQuality("major")).toBe(true);
      expect(isChordQuality("augmented")).toBe(true);
      expect(isChordQuality("seventh")).toBe(false);
      expect(isChordQuality(undefined)).toBe(false);
    });
  });
});

function toneNames(rootName: string, quality: Parameters<typeof chordTones>[1]): string[] {
  return chordTones(spellingFromPitchName(rootName), quality).map((tone) => spellingName(tone.spelling, "french"));
}
