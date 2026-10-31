import { describe, expect, it } from "vitest";
import { MAX_PLAYABLE_FRET } from "./guitar";
import { pitchClassFromMidi, spellingFromPitchName } from "./notation";
import { CHORD_QUALITIES, chordTones, type ChordQuality } from "./chords";
import { chordPositionMidis, chordPositions, type ChordPosition } from "./chordPositions";

describe("chordPositions", () => {
  it("offers at least one position for every root and family", () => {
    CHORD_QUALITIES.forEach((quality) => {
      rootNames.forEach((rootName) => {
        expect(chordPositions(rootPitchClass(rootName), quality).length).toBeGreaterThan(0);
      });
    });
  });

  it("plays exactly the three chord tones in every position", () => {
    everyPosition((position, quality, rootName) => {
      const expected = new Set(chordTones(spellingFromPitchName(rootName), quality).map((tone) => tone.pitchClass));
      expect(soundedPitchClasses(position)).toEqual(expected);
    });
  });

  it("puts the root on the lowest sounded string of every position", () => {
    everyPosition((position, _quality, rootName) => {
      const bassMidi = chordPositionMidis(position).find((midi) => midi !== null);
      expect(pitchClassFromMidi(bassMidi ?? -1)).toBe(rootPitchClass(rootName));
    });
  });

  it("stays within the playable fret range", () => {
    everyPosition((position) => {
      position.frets.forEach((fret) => {
        if (fret !== null) {
          expect(fret).toBeGreaterThanOrEqual(0);
          expect(fret).toBeLessThanOrEqual(MAX_PLAYABLE_FRET);
        }
      });
    });
  });

  it("assigns a finger to every fretted string and only there", () => {
    everyPosition((position) => {
      position.frets.forEach((fret, stringIndex) => {
        const finger = position.fingers[stringIndex];
        if (fret === null) {
          expect(finger).toBeNull();
        } else if (fret === 0) {
          expect(finger).toBe(0);
        } else {
          expect(finger).toBeGreaterThanOrEqual(1);
          expect(finger).toBeLessThanOrEqual(4);
        }
      });
    });
  });

  it("only reuses a finger across strings at the same fret, reported as a barre", () => {
    everyPosition((position) => {
      const fretsByFinger = new Map<number, Set<number>>();
      position.fingers.forEach((finger, stringIndex) => {
        if (finger !== null && finger > 0) {
          const frets = fretsByFinger.get(finger) ?? new Set<number>();
          frets.add(position.frets[stringIndex] ?? -1);
          fretsByFinger.set(finger, frets);
        }
      });
      fretsByFinger.forEach((frets) => {
        expect(frets.size).toBe(1);
      });
      position.barres.forEach((barre) => {
        expect(barre.toString).toBeGreaterThan(barre.fromString);
        expect(position.frets[barre.fromString]).toBe(barre.fret);
        expect(position.frets[barre.toString]).toBe(barre.fret);
      });
    });
  });

  describe("principal positions", () => {
    it("prefers the official open chords when they exist", () => {
      expect(chordPositions(rootPitchClass("Do"), "major")[0].frets).toEqual([null, 3, 2, 0, 1, 0]);
      expect(chordPositions(rootPitchClass("Sol"), "major")[0].frets).toEqual([3, 2, 0, 0, 0, 3]);
      expect(chordPositions(rootPitchClass("La"), "minor")[0].frets).toEqual([null, 0, 2, 2, 1, 0]);
      expect(chordPositions(rootPitchClass("Ré"), "diminished")[0].frets).toEqual([null, null, 0, 1, 3, 1]);
      expect(chordPositions(rootPitchClass("Do"), "augmented")[0].frets).toEqual([null, 3, 2, 1, 1, 0]);
      expect(chordPositions(rootPitchClass("Si♭"), "augmented")[0].frets).toEqual([null, 1, 0, 3, 3, 2]);
      expect(chordPositions(rootPitchClass("Si"), "augmented")[0].frets).toEqual([null, 2, 1, 0, 0, 3]);
    });

    it("falls back to the lowest barre shape otherwise", () => {
      const fMajor = chordPositions(rootPitchClass("Fa"), "major")[0];
      expect(fMajor.frets).toEqual([1, 3, 3, 2, 1, 1]);
      expect(fMajor.barres).toContainEqual({ fret: 1, fromString: 0, toString: 5 });
      expect(fMajor.formStringIndex).toBe(0);

      const bMajor = chordPositions(rootPitchClass("Si"), "major")[0];
      expect(bMajor.frets).toEqual([null, 2, 4, 4, 4, 2]);
      expect(bMajor.formStringIndex).toBe(1);

      const bDiminished = chordPositions(rootPitchClass("Si"), "diminished")[0];
      expect(bDiminished.frets).toEqual([null, 2, 3, 4, 3, null]);
    });
  });

  it("sorts the positions from the nut to the high frets", () => {
    CHORD_QUALITIES.forEach((quality) => {
      rootNames.forEach((rootName) => {
        const baseFrets = chordPositions(rootPitchClass(rootName), quality).map((position) => position.baseFret);
        expect([...baseFrets].sort((a, b) => a - b)).toEqual(baseFrets);
      });
    });
  });

  describe("chordPositionMidis", () => {
    it("maps frets to midis string by string", () => {
      const [openC] = chordPositions(rootPitchClass("Do"), "major");
      expect(chordPositionMidis(openC)).toEqual([null, 48, 52, 55, 60, 64]);
    });
  });
});

const rootNames = [
  "Do", "Do♯", "Ré♭", "Ré", "Ré♯", "Mi♭", "Mi", "Fa", "Fa♯",
  "Sol♭", "Sol", "Sol♯", "La♭", "La", "La♯", "Si♭", "Si", "Do♭",
];

function rootPitchClass(rootName: string): number {
  const spelling = spellingFromPitchName(rootName);

  return pitchClassFromMidi(spelling.naturalPitchClass + spelling.alteration);
}

function soundedPitchClasses(position: ChordPosition): Set<number> {
  const midis = chordPositionMidis(position).filter((midi): midi is number => midi !== null);

  return new Set(midis.map(pitchClassFromMidi));
}

function everyPosition(check: (position: ChordPosition, quality: ChordQuality, rootName: string) => void): void {
  CHORD_QUALITIES.forEach((quality) => {
    rootNames.forEach((rootName) => {
      chordPositions(rootPitchClass(rootName), quality).forEach((position) => {
        check(position, quality, rootName);
      });
    });
  });
}
