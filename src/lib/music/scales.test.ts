import { describe, it, expect } from "vitest";
import { namedNoteFromMidi, spellingFromPitchName } from "./notation";
import { STRINGS } from "./guitar";
import { SCALE_NOTES, SCALE_ROOT_NAMES } from "./scaleData";
import {
  isScaleQuality,
  maxPlayableOctaves,
  relativeScale,
  scaleNotesFromConfig,
  SCALE_QUALITIES,
  type ScaleConfig,
} from "./scales";

const config = (overrides: Partial<ScaleConfig> = {}): ScaleConfig => ({
  root: 0,
  quality: "major",
  size: "heptatonic",
  variant: "standard",
  ...overrides,
});

describe("scales.ts", () => {
  describe("SCALE_NOTES", () => {
    const scales = SCALE_QUALITIES.flatMap((quality) =>
      SCALE_ROOT_NAMES.map((rootName) => ({
        title: `${rootName} ${quality}`,
        notes: SCALE_NOTES[quality][rootName],
      })),
    );

    it("keeps name, octave and midi consistent for every note", () => {
      for (const { notes } of scales) {
        for (const note of notes) {
          const spelling = spellingFromPitchName(note.name);
          expect(12 * (note.octave + 1) + spelling.naturalPitchClass + spelling.alteration).toBe(note.midi);
        }
      }
    });

    it("keeps every position playable and matching its midi", () => {
      for (const { notes } of scales) {
        for (const note of notes) {
          expect(note.fretIndex).toBeGreaterThanOrEqual(0);
          expect(note.fretIndex).toBeLessThanOrEqual(12);
          expect(STRINGS[note.stringIndex].midi + note.fretIndex).toBe(note.midi);
        }
      }
    });

    it("lists every scale in ascending order, from the tonic to a closing tonic", () => {
      for (const { title, notes } of scales) {
        for (let i = 1; i < notes.length; i++) {
          expect(notes[i].midi, title).toBeGreaterThan(notes[i - 1].midi);
        }
        expect(notes[notes.length - 1].name, title).toBe(notes[0].name);
        expect((notes[notes.length - 1].midi - notes[0].midi) % 12, title).toBe(0);
      }
    });

    it("uses each of the seven letters exactly once for every root and quality", () => {
      for (const { title, notes } of scales) {
        const octave = notes.filter((note) => note.isBlue !== true && note.midi < notes[0].midi + 12);
        const letters = new Set(octave.map((note) => spellingFromPitchName(note.name).naturalPitchClass));
        expect(letters.size, title).toBe(7);
      }
    });

    it("spells the blue note as the flattened degree above", () => {
      for (const { title, notes } of scales) {
        for (const note of notes.filter((candidate) => candidate.isBlue === true)) {
          const degreeAbove = notes.find((candidate) => candidate.midi === note.midi + 1);
          const blueSpelling = spellingFromPitchName(note.name);
          const aboveSpelling = spellingFromPitchName(degreeAbove?.name ?? "");
          expect(blueSpelling.naturalPitchClass, title).toBe(aboveSpelling.naturalPitchClass);
          expect(blueSpelling.alteration, title).toBe(aboveSpelling.alteration - 1);
        }
      }
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
        midis: [48, 50, 52, 53, 55, 57, 59, 60],
      },
      {
        name: "major pentatonic",
        overrides: {
          quality: "major",
          size: "pentatonic",
          variant: "standard",
        },
        midis: [48, 50, 52, 55, 57, 60],
      },
      {
        name: "major pentatonic blues",
        overrides: {
          quality: "major",
          size: "pentatonic",
          variant: "blues",
        },
        midis: [48, 50, 51, 52, 55, 57, 60],
      },
      {
        name: "minor heptatonic",
        overrides: {
          quality: "minor",
          size: "heptatonic",
          variant: "standard",
        },
        midis: [48, 50, 51, 53, 55, 56, 58, 60],
      },
      {
        name: "minor pentatonic",
        overrides: {
          quality: "minor",
          size: "pentatonic",
          variant: "standard",
        },
        midis: [48, 51, 53, 55, 58, 60],
      },
      {
        name: "minor pentatonic blues",
        overrides: {
          quality: "minor",
          size: "pentatonic",
          variant: "blues",
        },
        midis: [48, 51, 53, 54, 55, 58, 60],
      },
      {
        name: "harmonic minor heptatonic",
        overrides: {
          quality: "harmonicMinor",
          size: "heptatonic",
          variant: "standard",
        },
        midis: [48, 50, 51, 53, 55, 56, 59, 60],
      },
      {
        name: "harmonic major heptatonic",
        overrides: {
          quality: "harmonicMajor",
          size: "heptatonic",
          variant: "standard",
        },
        midis: [48, 50, 52, 53, 55, 56, 59, 60],
      },
    ];

    it.each(cases)("builds C $name", ({ overrides, midis }) => {
      expect(scaleNotesFromConfig(config(overrides)).map((note) => note.midi)).toEqual(midis);
    });

    it("ignores blues on the heptatonic scale since the blue note is a pentatonic device", () => {
      expect(scaleNotesFromConfig(config({ variant: "blues" })).map((note) => note.midi))
        .toEqual([48, 50, 52, 53, 55, 57, 59, 60]);
      expect(scaleNotesFromConfig(config({ quality: "minor", variant: "blues" })).map((note) => note.midi))
        .toEqual([48, 50, 51, 53, 55, 56, 58, 60]);
    });

    it("ignores pentatonic and blues for harmonic minor since it supports neither", () => {
      const notes = scaleNotesFromConfig(config({ quality: "harmonicMinor", size: "pentatonic", variant: "blues" }));
      expect(notes.map((note) => note.midi)).toEqual([48, 50, 51, 53, 55, 56, 59, 60]);
    });

    it("ignores pentatonic and blues for harmonic major since it supports neither", () => {
      const notes = scaleNotesFromConfig(config({ quality: "harmonicMajor", size: "pentatonic", variant: "blues" }));
      expect(notes.map((note) => note.midi)).toEqual([48, 50, 52, 53, 55, 56, 59, 60]);
    });

    it("builds A minor pentatonic from the first playable A (MIDI 45)", () => {
      const midis = scaleNotesFromConfig(config({ root: 9, quality: "minor", size: "pentatonic" })).map((n) => n.midi);
      expect(midis).toEqual([45, 48, 50, 52, 55, 57]);
    });

    it("returns notes that are not pre-validated and have a playable position", () => {
      for (const note of scaleNotesFromConfig(config({ root: 7 }))) {
        expect(note.isValidated).toBe(false);
        expect(note.fretIndex).toBeGreaterThanOrEqual(0);
      }
    });

    it("defaults to a single octave", () => {
      expect(scaleNotesFromConfig(config()).map((note) => note.midi)).toEqual([48, 50, 52, 53, 55, 57, 59, 60]);
    });

    it("repeats the intervals shifted by an octave and closes on the tonic", () => {
      expect(scaleNotesFromConfig(config({ root: 4 }), 2).map((note) => note.midi)).toEqual([
        40, 42, 44, 45, 47, 49, 51,
        52, 54, 56, 57, 59, 61, 63,
        64,
      ]);
    });
  });

  describe("spellings", () => {
    const pitchNames = (overrides: Partial<ScaleConfig>): string[] =>
      scaleNotesFromConfig(config(overrides)).map(
        (note) => namedNoteFromMidi(note.midi, "french", note.spelling).pitchName,
      );

    it("spells C harmonic minor with flats, never reusing a letter", () => {
      expect(pitchNames({ quality: "harmonicMinor" }))
        .toEqual(["Do", "Ré", "Mi♭", "Fa", "Sol", "La♭", "Si", "Do"]);
    });

    it("spells C harmonic major with its flattened 6th", () => {
      expect(pitchNames({ quality: "harmonicMajor" }))
        .toEqual(["Do", "Ré", "Mi", "Fa", "Sol", "La♭", "Si", "Do"]);
    });

    it("spells the natural minor scale with flats", () => {
      expect(pitchNames({ quality: "minor" }))
        .toEqual(["Do", "Ré", "Mi♭", "Fa", "Sol", "La♭", "Si♭", "Do"]);
    });

    it("follows the root's own spelling for enharmonic roots", () => {
      expect(pitchNames({ root: 1, rootNatural: 2 }))
        .toEqual(["Ré♭", "Mi♭", "Fa", "Sol♭", "La♭", "Si♭", "Do", "Ré♭"]);
      expect(pitchNames({ root: 1, rootNatural: 0 }))
        .toEqual(["Do♯", "Ré♯", "Mi♯", "Fa♯", "Sol♯", "La♯", "Si♯", "Do♯"]);
    });

    it("uses a double sharp where the key demands it", () => {
      expect(pitchNames({ root: 8, rootNatural: 7, quality: "harmonicMinor" }))
        .toEqual(["Sol♯", "La♯", "Si", "Do♯", "Ré♯", "Mi", "Fa𝄪", "Sol♯"]);
    });

    it("spells the blue note as the flattened degree above", () => {
      expect(pitchNames({ root: 9, quality: "minor", size: "pentatonic", variant: "blues" }))
        .toEqual(["La", "Do", "Ré", "Mi♭", "Mi", "Sol", "La"]);
      expect(pitchNames({ size: "pentatonic", variant: "blues" }))
        .toEqual(["Do", "Ré", "Mi♭", "Mi", "Sol", "La", "Do"]);
    });
  });

  describe("maxPlayableOctaves", () => {
    it("allows three octaves for the lowest roots", () => {
      expect(maxPlayableOctaves(config({ root: 4 }))).toBe(3); // E, root MIDI 40
    });

    it("caps roots that would overflow the 12th fret", () => {
      expect(maxPlayableOctaves(config({ root: 0 }))).toBe(2); // C, root MIDI 48
      expect(maxPlayableOctaves(config({ root: 9 }))).toBe(2); // A, root MIDI 45
    });

    it("stays within the highest canonical position for every root", () => {
      for (let root = 0; root < 12; root++) {
        const octaves = maxPlayableOctaves(config({ root }));
        for (const note of scaleNotesFromConfig(config({ root }), octaves)) {
          expect(note.midi).toBeLessThanOrEqual(76);
        }
      }
    });
  });

  describe("isScaleQuality", () => {
    it("accepts every known quality", () => {
      expect(isScaleQuality("major")).toBe(true);
      expect(isScaleQuality("minor")).toBe(true);
      expect(isScaleQuality("harmonicMinor")).toBe(true);
      expect(isScaleQuality("harmonicMajor")).toBe(true);
    });

    it("rejects unknown or non-string values", () => {
      expect(isScaleQuality("phrygianDominant")).toBe(false);
      expect(isScaleQuality("lydian")).toBe(false);
      expect(isScaleQuality(undefined)).toBe(false);
      expect(isScaleQuality(null)).toBe(false);
      expect(isScaleQuality(0)).toBe(false);
    });
  });

  describe("relativeScale", () => {
    it("maps a major tonic to its relative minor a minor third below", () => {
      expect(relativeScale(0, "major")).toEqual({ root: 9, quality: "minor" }); // Do majeur → La mineur
      expect(relativeScale(7, "major")).toEqual({ root: 4, quality: "minor" }); // Sol majeur → Mi mineur
      expect(relativeScale(9, "major")).toEqual({ root: 6, quality: "minor" }); // La majeur → Fa♯ mineur
    });

    it("maps a minor tonic to its relative major a minor third above", () => {
      expect(relativeScale(9, "minor")).toEqual({ root: 0, quality: "major" }); // La mineur → Do majeur
      expect(relativeScale(4, "minor")).toEqual({ root: 7, quality: "major" }); // Mi mineur → Sol majeur
    });

    it("has no relative for harmonic minor or harmonic major", () => {
      expect(relativeScale(0, "harmonicMinor")).toBeNull();
      expect(relativeScale(0, "harmonicMajor")).toBeNull();
    });

    it("round-trips a major key back to itself through its relative", () => {
      const relative = relativeScale(0, "major");
      expect(relative).toEqual({ root: 9, quality: "minor" });
      if (relative !== null) {
        expect(relativeScale(relative.root, relative.quality)).toEqual({ root: 0, quality: "major" });
      }
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
        expect(relativeScale(majorRoot, "major")).toEqual({ root: minorRoot, quality: "minor" });
        expect(relativeScale(minorRoot, "minor")).toEqual({ root: majorRoot, quality: "major" });
      },
    );
  });
});
