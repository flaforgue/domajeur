import { pitchClassFromMidi } from "./notation";
import {
  canonicalStringPositionFromMidi,
  HIGHEST_CANONICAL_MIDI,
  LOWEST_PLAYABLE_MIDI,
  type NoteCandidate,
} from "./guitar";

const maxScaleOctaves = 3;

export type ScaleQuality = "major" | "minor" | "phrygianDominant";
export type ScaleSize = "heptatonic" | "pentatonic";
export type ScaleVariant = "standard" | "blues";

interface ScaleMode {
  label: string;
  intervals: number[];
  pentatonicRemovals?: number[];
  pentatonicBlueNote?: number;
  relative?: { offset: number; quality: ScaleQuality };
}

const modes: Record<ScaleQuality, ScaleMode> = {
  major: {
    label: "Majeur",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    pentatonicRemovals: [5, 11],
    pentatonicBlueNote: 3,
    relative: { offset: 9, quality: "minor" },
  },
  minor: {
    label: "Mineur",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    pentatonicRemovals: [2, 8],
    pentatonicBlueNote: 6,
    relative: { offset: 3, quality: "major" },
  },
  phrygianDominant: {
    label: "Phrygien dominant",
    intervals: [0, 1, 4, 5, 7, 8, 10],
  },
};

export const SCALE_QUALITIES = Object.keys(modes) as ScaleQuality[];

export function isScaleQuality(value: unknown): value is ScaleQuality {
  return SCALE_QUALITIES.includes(value as ScaleQuality);
}

export interface ScaleConfig {
  root: number;
  quality: ScaleQuality;
  size: ScaleSize;
  variant: ScaleVariant;
}

export function scaleModeLabel(quality: ScaleQuality): string {
  return modes[quality].label;
}

export function scaleSupportsPentatonic(quality: ScaleQuality): boolean {
  return modes[quality].pentatonicRemovals !== undefined;
}

export function scaleSupportsBlues(quality: ScaleQuality): boolean {
  return modes[quality].pentatonicBlueNote !== undefined;
}

export function scaleIntervals(config: ScaleConfig): number[] {
  const mode = modes[config.quality];
  const removals = mode.pentatonicRemovals;
  const isPentatonic = config.size === "pentatonic" && removals !== undefined;
  const baseScale = isPentatonic
    ? mode.intervals.filter((interval) => !removals.includes(interval))
    : mode.intervals;

  const intervals = new Set(baseScale);
  // The blue note is a pentatonic device, so it only applies to the pentatonic scale.
  if (config.variant === "blues" && isPentatonic && mode.pentatonicBlueNote !== undefined) {
    intervals.add(mode.pentatonicBlueNote);
  }

  return [...intervals].sort((a, b) => a - b);
}

function rootMidiFor(root: number): number {
  let rootMidi = LOWEST_PLAYABLE_MIDI;
  while (pitchClassFromMidi(rootMidi) !== root) {
    rootMidi++;
  }

  return rootMidi;
}

export function scaleNotesFromConfig(config: ScaleConfig, octaves = 1): NoteCandidate[] {
  const rootMidi = rootMidiFor(config.root);
  const intervals = scaleIntervals(config);

  return Array.from({ length: octaves }, (_, octave) => octave).flatMap((octave) =>
    intervals.map((interval) => {
      const midi = rootMidi + interval + 12 * octave;
      const position = canonicalStringPositionFromMidi(midi);

      return {
        stringIndex: position.stringIndex,
        fretIndex: position.fretIndex,
        midi,
        isValidated: false,
      };
    }),
  );
}

export function maxPlayableOctaves(config: ScaleConfig): number {
  const rootMidi = rootMidiFor(config.root);
  const intervals = scaleIntervals(config);
  const topInterval = intervals[intervals.length - 1];

  let max = 1;
  for (let octaves = 2; octaves <= maxScaleOctaves; octaves++) {
    if (rootMidi + topInterval + 12 * (octaves - 1) <= HIGHEST_CANONICAL_MIDI) {
      max = octaves;
    }
  }

  return max;
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
