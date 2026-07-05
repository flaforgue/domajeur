import { NATURAL_PITCH_CLASSES, spellingFromPitchName, spellingName } from "./notation";
import type { NoteCandidate } from "./guitar";
import { SCALE_NOTES, type ScaleNoteData, type ScaleQuality } from "./scaleData";

export type { ScaleQuality } from "./scaleData";
export type ScaleSize = "heptatonic" | "pentatonic";
export type ScaleVariant = "standard" | "blues";

interface ScaleMode {
  label: string;
  relative?: { offset: number; quality: ScaleQuality };
}

const modes: Record<ScaleQuality, ScaleMode> = {
  major: {
    label: "Majeur",
    relative: { offset: 9, quality: "minor" },
  },
  minor: {
    label: "Mineur naturel",
    relative: { offset: 3, quality: "major" },
  },
  harmonicMinor: {
    label: "Mineur harmonique",
  },
  harmonicMajor: {
    label: "Majeur harmonique",
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

function scaleNotesFor(config: ScaleConfig): ScaleNoteData[] {
  const natural = config.rootNatural
    ?? (NATURAL_PITCH_CLASSES.includes(config.root) ? config.root : config.root - 1);
  const alteration = ((config.root - natural + 18) % 12) - 6;
  const rootName = spellingName({ naturalPitchClass: natural, alteration }, "french");

  const rootScales: Partial<Record<string, ScaleNoteData[]>> = SCALE_NOTES[config.quality];
  const notes = rootScales[rootName];
  if (notes === undefined) {
    throw new Error(`No scale data for ${rootName} ${config.quality}`);
  }

  return notes;
}

export function scaleNotesFromConfig(config: ScaleConfig, octaves = 1): NoteCandidate[] {
  const notes = scaleNotesFor(config);
  // The blue note is a pentatonic device, so it only applies to the pentatonic scale.
  const isPentatonic = config.size === "pentatonic" && scaleSupportsPentatonic(config.quality);
  const hasBlueNotes = config.variant === "blues" && isPentatonic;
  // Scales are practiced up to the closing tonic (do, ré, … si, do).
  const closingTonicMidi = notes[0].midi + 12 * octaves;

  return notes
    .filter((note) => note.midi <= closingTonicMidi)
    .filter((note) => (note.isBlue === true ? hasBlueNotes : !isPentatonic || note.isPentatonic === true))
    .map((note) => ({
      stringIndex: note.stringIndex,
      fretIndex: note.fretIndex,
      midi: note.midi,
      spelling: spellingFromPitchName(note.name),
      isValidated: false,
    }));
}

export function maxPlayableOctaves(config: ScaleConfig): number {
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
