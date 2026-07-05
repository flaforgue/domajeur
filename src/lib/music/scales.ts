import { NATURAL_PITCH_CLASSES, spellingFromPitchName, spellingName } from "./notation";
import { STRINGS, type NoteCandidate } from "./guitar";
import {
  CLOSED_POSITIONS,
  SCALE_NOTES,
  type ClosedPositionPattern,
  type ScaleNoteData,
  type ScaleQuality,
} from "./scaleData";

export type { ScaleQuality } from "./scaleData";
export type ScaleSize = "heptatonic" | "pentatonic";
export type ScaleVariant = "standard" | "blues";

interface ScaleMode {
  label: string;
  relative?: { offset: number; quality: ScaleQuality };
}

const modes: Record<ScaleQuality, ScaleMode> = {
  major: {
    label: "Majeur naturel",
    relative: { offset: 9, quality: "minor" },
  },
  harmonicMajor: {
    label: "Majeur harmonique",
  },
  minor: {
    label: "Mineur naturel",
    relative: { offset: 3, quality: "major" },
  },
  harmonicMinor: {
    label: "Mineur harmonique",
  },
};

export const SCALE_QUALITIES = Object.keys(modes) as ScaleQuality[];

export function isScaleQuality(value: unknown): value is ScaleQuality {
  return SCALE_QUALITIES.includes(value as ScaleQuality);
}

export interface ScaleConfig {
  root: number;
  rootNatural?: number; // pitch class of the root's letter (2 for Ré♭); defaults to the sharp spelling
  quality: ScaleQuality;
  size: ScaleSize;
  variant: ScaleVariant;
}

export function scaleModeLabel(quality: ScaleQuality): string {
  return modes[quality].label;
}

export function scaleSupportsPentatonic(quality: ScaleQuality): boolean {
  return SCALE_NOTES[quality].Do.some((note) => note.isPentatonic === true);
}

export function scaleSupportsBlues(quality: ScaleQuality): boolean {
  return SCALE_NOTES[quality].Do.some((note) => note.isBlue === true);
}

function rootNameFor(config: ScaleConfig): string {
  const natural = config.rootNatural
    ?? (NATURAL_PITCH_CLASSES.includes(config.root) ? config.root : config.root - 1);
  const alteration = ((config.root - natural + 18) % 12) - 6;

  return spellingName({ naturalPitchClass: natural, alteration }, "french");
}

function scaleNotesFor(config: ScaleConfig): ScaleNoteData[] {
  const rootName = rootNameFor(config);
  const rootScales: Partial<Record<string, ScaleNoteData[]>> = SCALE_NOTES[config.quality];
  const notes = rootScales[rootName];
  if (notes === undefined) {
    throw new Error(`No scale data for ${rootName} ${config.quality}`);
  }

  return notes;
}

function closedPatternsFor(config: ScaleConfig): ClosedPositionPattern[][] {
  const rootName = rootNameFor(config);
  const rootPatterns: Partial<Record<string, ClosedPositionPattern[][]>> = CLOSED_POSITIONS[config.quality];
  const patterns = rootPatterns[rootName];
  if (patterns === undefined) {
    throw new Error(`No closed positions for ${rootName} ${config.quality}`);
  }

  return patterns;
}

interface PlayableNote {
  note: ScaleNoteData;
  stringIndex: number;
  fretIndex: number;
}

function openSeries(notes: ScaleNoteData[], octaves: number): PlayableNote[] {
  const closingTonicMidi = notes[0].midi + 12 * octaves;

  return notes
    .filter((note) => note.midi <= closingTonicMidi)
    .map((note) => ({ note, stringIndex: note.stringIndex, fretIndex: note.fretIndex }));
}

function closedSeries(config: ScaleConfig, notes: ScaleNoteData[], octaves: number): PlayableNote[] {
  const patterns = closedPatternsFor(config);
  const pattern = patterns[Math.min(octaves, patterns.length) - 1];
  const notesByMidi = new Map(notes.map((note) => [note.midi, note]));

  return pattern.flatMap(({ stringIndex, frets }) =>
    frets.map((fretIndex) => {
      const note = notesByMidi.get(STRINGS[stringIndex].midi + fretIndex);
      if (note === undefined) {
        throw new Error(`Closed position (${stringIndex}, ${fretIndex}) matches no note of the scale`);
      }

      return { note, stringIndex, fretIndex };
    }),
  );
}

export function scaleNotesFromConfig(
  config: ScaleConfig,
  octaves = 1,
  isClosedPosition = false,
): NoteCandidate[] {
  const notes = scaleNotesFor(config);
  // The blue note is a pentatonic device, so it only applies to the pentatonic scale.
  const isPentatonic = config.size === "pentatonic" && scaleSupportsPentatonic(config.quality);
  const hasBlueNotes = config.variant === "blues" && isPentatonic;
  const series = isClosedPosition ? closedSeries(config, notes, octaves) : openSeries(notes, octaves);

  return series
    .filter(({ note }) => (note.isBlue === true ? hasBlueNotes : !isPentatonic || note.isPentatonic === true))
    .map(({ note, stringIndex, fretIndex }) => ({
      stringIndex,
      fretIndex,
      midi: note.midi,
      spelling: spellingFromPitchName(note.name),
      isValidated: false,
    }));
}

export function maxPlayableOctaves(config: ScaleConfig, isClosedPosition = false): number {
  if (isClosedPosition) {
    return closedPatternsFor(config).length;
  }

  const notes = scaleNotesFor(config);

  return (notes[notes.length - 1].midi - notes[0].midi) / 12;
}

export function relativeScale(
  root: number,
  quality: ScaleQuality,
): { root: number; quality: ScaleQuality } | null {
  const relative = modes[quality].relative;
  if (relative === undefined) {
    return null;
  }

  return { root: (root + relative.offset) % 12, quality: relative.quality };
}
