import { MAX_PLAYABLE_FRET, STRINGS } from "./guitar";
import { pitchClassFromMidi } from "./notation";
import type { ChordQuality } from "./chords";

export interface ChordBarre {
  fret: number;
  fromString: number;
  toString: number;
}

export interface ChordPosition {
  frets: (number | null)[];
  fingers: (number | null)[];
  barres: ChordBarre[];
  isOpen: boolean;
  baseFret: number;
  // Barre chords keep the open-chord shape they are named after (formStringIndex
  // is the string whose open note names the shape: 0 for "forme de Mi", 1 for "forme de La").
  formStringIndex?: number;
}

interface OpenShape {
  quality: ChordQuality;
  rootPitchClass: number;
  frets: (number | null)[];
  fingers: (number | null)[];
}

interface MovableShape {
  quality: ChordQuality;
  rootStringIndex: number;
  offsets: (number | null)[];
  fingers: (number | null)[];
  isNamedForm?: boolean;
}

const openShapes: OpenShape[] = [
  { quality: "major", rootPitchClass: 0, frets: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, 0, 1, 0] },
  { quality: "major", rootPitchClass: 2, frets: [null, null, 0, 2, 3, 2], fingers: [null, null, 0, 1, 3, 2] },
  { quality: "major", rootPitchClass: 4, frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  { quality: "major", rootPitchClass: 7, frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  { quality: "major", rootPitchClass: 9, frets: [null, 0, 2, 2, 2, 0], fingers: [null, 0, 1, 2, 3, 0] },
  { quality: "minor", rootPitchClass: 2, frets: [null, null, 0, 2, 3, 1], fingers: [null, null, 0, 2, 3, 1] },
  { quality: "minor", rootPitchClass: 4, frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  { quality: "minor", rootPitchClass: 9, frets: [null, 0, 2, 2, 1, 0], fingers: [null, 0, 2, 3, 1, 0] },
  { quality: "diminished", rootPitchClass: 2, frets: [null, null, 0, 1, 3, 1], fingers: [null, null, 0, 1, 3, 2] },
  { quality: "diminished", rootPitchClass: 9, frets: [null, 0, 1, 2, 1, null], fingers: [null, 0, 1, 3, 2, null] },
  { quality: "augmented", rootPitchClass: 0, frets: [null, 3, 2, 1, 1, 0], fingers: [null, 4, 3, 1, 2, 0] },
  { quality: "augmented", rootPitchClass: 2, frets: [null, null, 0, 3, 3, 2], fingers: [null, null, 0, 2, 3, 1] },
  { quality: "augmented", rootPitchClass: 4, frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
  { quality: "augmented", rootPitchClass: 7, frets: [3, 2, 1, 0, 0, 3], fingers: [3, 2, 1, 0, 0, 4] },
  { quality: "augmented", rootPitchClass: 9, frets: [null, 0, 3, 2, 2, 1], fingers: [null, 0, 4, 2, 3, 1] },
  { quality: "augmented", rootPitchClass: 10, frets: [null, 1, 0, 3, 3, 2], fingers: [null, 1, 0, 3, 4, 2] },
  { quality: "augmented", rootPitchClass: 11, frets: [null, 2, 1, 0, 0, 3], fingers: [null, 2, 1, 0, 0, 3] },
];

const movableShapes: MovableShape[] = [
  { quality: "major", rootStringIndex: 0, offsets: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1], isNamedForm: true },
  { quality: "major", rootStringIndex: 1, offsets: [null, 0, 2, 2, 2, 0], fingers: [null, 1, 3, 3, 3, 1], isNamedForm: true },
  { quality: "minor", rootStringIndex: 0, offsets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1], isNamedForm: true },
  { quality: "minor", rootStringIndex: 1, offsets: [null, 0, 2, 2, 1, 0], fingers: [null, 1, 3, 4, 2, 1], isNamedForm: true },
  { quality: "diminished", rootStringIndex: 1, offsets: [null, 0, 1, 2, 1, null], fingers: [null, 1, 2, 4, 3, null] },
  { quality: "diminished", rootStringIndex: 2, offsets: [null, null, 0, 1, 3, 1], fingers: [null, null, 1, 2, 4, 3] },
  { quality: "augmented", rootStringIndex: 1, offsets: [null, 0, 3, 2, 2, null], fingers: [null, 1, 4, 2, 3, null] },
  { quality: "augmented", rootStringIndex: 1, offsets: [null, 0, -1, -2, -2, null], fingers: [null, 4, 3, 1, 1, null] },
];

function barresFrom(frets: (number | null)[], fingers: (number | null)[]): ChordBarre[] {
  const stringsByFinger = new Map<number, number[]>();
  fingers.forEach((finger, stringIndex) => {
    if (finger !== null && finger > 0) {
      stringsByFinger.set(finger, [...(stringsByFinger.get(finger) ?? []), stringIndex]);
    }
  });

  return [...stringsByFinger.values()]
    .filter((stringIndexes) => stringIndexes.length > 1)
    .map((stringIndexes) => ({
      fret: frets[stringIndexes[0]] ?? 0,
      fromString: Math.min(...stringIndexes),
      toString: Math.max(...stringIndexes),
    }))
    .sort((a, b) => a.fret - b.fret);
}

function frettedFrets(frets: (number | null)[]): number[] {
  return frets.filter((fret): fret is number => fret !== null && fret > 0);
}

function soundedKeys(position: ChordPosition): string[] {
  return position.frets.flatMap((fret, stringIndex) => (fret === null ? [] : [`${stringIndex}:${fret}`]));
}

function isSubsetOf(candidate: ChordPosition, other: ChordPosition): boolean {
  const otherKeys = new Set(soundedKeys(other));
  const candidateKeys = soundedKeys(candidate);

  return candidateKeys.length < otherKeys.size && candidateKeys.every((key) => otherKeys.has(key));
}

export function chordPositions(rootPitchClass: number, quality: ChordQuality): ChordPosition[] {
  const open: ChordPosition[] = openShapes
    .filter((shape) => shape.quality === quality && shape.rootPitchClass === rootPitchClass)
    .map((shape) => ({
      frets: shape.frets,
      fingers: shape.fingers,
      barres: barresFrom(shape.frets, shape.fingers),
      isOpen: true,
      baseFret: Math.min(...frettedFrets(shape.frets)),
    }));

  const movable: ChordPosition[] = movableShapes
    .filter((shape) => shape.quality === quality)
    .flatMap((shape) => {
      const openPitchClass = pitchClassFromMidi(STRINGS[shape.rootStringIndex].midi);
      const normalizedFret = (((rootPitchClass - openPitchClass) % 12) + 12) % 12;
      const rootFret = normalizedFret === 0 ? 12 : normalizedFret;
      const frets = shape.offsets.map((offset) => (offset === null ? null : rootFret + offset));
      const sounded = frets.filter((fret): fret is number => fret !== null);
      if (Math.min(...sounded) < 1 || Math.max(...sounded) > MAX_PLAYABLE_FRET) {
        return [];
      }

      return [{
        frets,
        fingers: shape.fingers,
        barres: barresFrom(frets, shape.fingers),
        isOpen: false,
        baseFret: Math.min(...sounded),
        formStringIndex: shape.isNamedForm === true ? shape.rootStringIndex : undefined,
      }];
    });

  const positions = [...open, ...movable].sort((a, b) => {
    if (a.baseFret !== b.baseFret) {
      return a.baseFret - b.baseFret;
    }

    return Number(b.isOpen) - Number(a.isOpen);
  });

  return positions.filter((position) => !positions.some((other) => isSubsetOf(position, other)));
}

export function chordPositionMidis(position: ChordPosition): (number | null)[] {
  return position.frets.map((fret, stringIndex) => (fret === null ? null : STRINGS[stringIndex].midi + fret));
}
