import { type Notation, pitchClassFromMidi, pitchClassName } from "./notation";

export const STRINGS: { midi: number; suffix: string }[] = [
  { midi: 40, suffix: " grave" }, // E2
  { midi: 45, suffix: "" }, // A2
  { midi: 50, suffix: "" }, // D3
  { midi: 55, suffix: "" }, // G3
  { midi: 59, suffix: "" }, // B3
  { midi: 64, suffix: " aigu" }, // E4
];

export const LOWEST_PLAYABLE_MIDI = STRINGS[0].midi;

const naturalPitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);
const maxFretForCanonicalPosition = 12;

export interface StringPosition { stringIndex: number; fretIndex: number }
export interface ScaleMarker extends StringPosition { isRoot: boolean }
interface Note { stringIndex: number; fretIndex: number; midi: number }
export type NoteCandidate = Note & { isValidated: boolean };

export function stringName(stringIndex: number, notation: Notation): string {
  const pitchClass = pitchClassFromMidi(STRINGS[stringIndex].midi);

  return pitchClassName(pitchClass, notation) + STRINGS[stringIndex].suffix;
}

export function fretText(fretIndex: number): string {
  if (fretIndex === 0) {
    return "à vide";
  }

  if (fretIndex === 1) {
    return "1ère frette";
  }

  return `${fretIndex}ème frette`;
}

export function stringPositionsForMidi(midi: number, maxFret: number): StringPosition[] {
  const stringPositions: StringPosition[] = [];
  STRINGS.forEach((string, stringIndex) => {
    const fretIndex = midi - string.midi;
    if (fretIndex >= 0 && fretIndex <= maxFret) {
      stringPositions.push({ stringIndex, fretIndex });
    }
  });

  return stringPositions;
}

export function canonicalStringPositionFromMidi(midi: number): StringPosition {
  let bestMatch: StringPosition | null = null;
  for (let stringIndex = 0; stringIndex < STRINGS.length; stringIndex++) {
    const fretIndex = midi - STRINGS[stringIndex].midi;
    if (
      fretIndex >= 0
      && fretIndex <= maxFretForCanonicalPosition
      && (bestMatch === null || fretIndex < bestMatch.fretIndex)
    ) {
      bestMatch = { stringIndex, fretIndex };
    }
  }

  return bestMatch ?? { stringIndex: 0, fretIndex: Math.max(0, midi - LOWEST_PLAYABLE_MIDI) };
}

export function randomNote(
  maxFret: number,
  isNaturalsOnly: boolean,
  avoidMidi: number | null,
): NoteCandidate {
  const notesPool: Note[] = [];
  STRINGS.forEach((string, stringIndex) => {
    for (let fretIndex = 0; fretIndex <= maxFret; fretIndex++) {
      const midi = string.midi + fretIndex;
      if (isNaturalsOnly && !naturalPitchClasses.has(pitchClassFromMidi(midi))) {
        continue;
      }

      notesPool.push({ stringIndex, fretIndex, midi });
    }
  });

  let pickedNote = notesPool[0];
  do {
    pickedNote = notesPool[Math.floor(Math.random() * notesPool.length)];
  } while (notesPool.length > 1 && pickedNote.midi === avoidMidi);

  return { ...pickedNote, isValidated: false };
}
