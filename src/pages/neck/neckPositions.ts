import { STRINGS } from "../../lib/music/guitar";
import { NATURAL_PITCH_CLASSES, pitchClassFromMidi } from "../../lib/music/notation";

export const NECK_FRET_COUNT = 12;

interface NeckPosition {
  stringIndex: number;
  fretIndex: number;
  midi: number;
}

export const NATURAL_NECK_POSITIONS: NeckPosition[] = STRINGS
  .flatMap((string, stringIndex) => Array.from(
    { length: NECK_FRET_COUNT + 1 },
    (_, fretIndex) => ({ stringIndex, fretIndex, midi: string.midi + fretIndex }),
  ))
  .filter(({ midi }) => NATURAL_PITCH_CLASSES.includes(pitchClassFromMidi(midi)));

export function isPositionHighlighted(
  { stringIndex, midi }: NeckPosition,
  checkedPitchClasses: number[],
  checkedStringIndexes: number[],
): boolean {
  return checkedPitchClasses.includes(pitchClassFromMidi(midi)) || checkedStringIndexes.includes(stringIndex);
}
