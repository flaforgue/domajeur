import { pitchClassFromMidi } from "./notation";
import { canonicalStringPositionFromMidi, LOWEST_PLAYABLE_MIDI, type NoteCandidate } from "./guitar";

export type ScaleQuality = "major" | "minor";
export type ScaleSize = "heptatonic" | "pentatonic";
export type ScaleVariant = "standard" | "blues";

export interface ScaleConfig {
  root: number;
  quality: ScaleQuality;
  size: ScaleSize;
  variant: ScaleVariant;
}

const fullScaleByQuality: Record<ScaleQuality, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

const pentatonicRemovalsByQuality: Record<ScaleQuality, number[]> = {
  major: [5, 11],
  minor: [2, 8],
};

const blueNoteByQuality: Record<ScaleQuality, number> = {
  major: 3,
  minor: 6,
};

export function scaleIntervals(config: ScaleConfig): number[] {
  const fullScale = fullScaleByQuality[config.quality];
  const removals = pentatonicRemovalsByQuality[config.quality];
  const baseScale = config.size === "pentatonic"
    ? fullScale.filter((interval) => !removals.includes(interval))
    : fullScale;

  const intervals = new Set(baseScale);
  if (config.variant === "blues") {
    intervals.add(blueNoteByQuality[config.quality]);
  }

  return [...intervals].sort((a, b) => a - b);
}

export function scaleNotesFromConfig(config: ScaleConfig): NoteCandidate[] {
  let rootMidi = LOWEST_PLAYABLE_MIDI;
  while (pitchClassFromMidi(rootMidi) !== config.root) {
    rootMidi++;
  }

  return scaleIntervals(config).map((interval) => {
    const midi = rootMidi + interval;
    const position = canonicalStringPositionFromMidi(midi);

    return {
      stringIndex: position.stringIndex,
      fretIndex: position.fretIndex,
      midi,
      isValidated: false,
    };
  });
}
