import { clamp } from "../math";
import { pitchClassFromMidi, spellingFromPitchName, type NoteSpelling } from "./notation";
import type { NoteCandidate } from "./guitar";
import { SCALE_ROOT_NAMES } from "./scaleData";
import {
  maxPlayableOctaves,
  relativeScale,
  scaleNotesFromConfig,
  scaleSupportsBlues,
  scaleSupportsPentatonic,
  type ScaleConfig,
  type ScaleQuality,
  type ScaleSize,
  type ScaleVariant,
} from "./scales";

export const SCALE_ROOTS: { pitchClass: number; spelling: NoteSpelling }[] = SCALE_ROOT_NAMES.map(
  (name) => {
    const spelling = spellingFromPitchName(name);

    return { pitchClass: pitchClassFromMidi(spelling.naturalPitchClass + spelling.alteration), spelling };
  },
);

export interface ScaleSelectorState {
  rootIndex: number;
  quality: ScaleQuality;
  size: ScaleSize;
  variant: ScaleVariant;
  octaves: number;
  isRoundTrip: boolean;
}

export const DEFAULT_SCALE_STATE: ScaleSelectorState = {
  rootIndex: 0,
  quality: "major",
  size: "heptatonic",
  variant: "standard",
  octaves: 1,
  isRoundTrip: false,
};

export function scaleConfigFromState(state: ScaleSelectorState): ScaleConfig {
  return {
    root: SCALE_ROOTS[state.rootIndex].pitchClass,
    rootNatural: SCALE_ROOTS[state.rootIndex].spelling.naturalPitchClass,
    quality: state.quality,
    size: state.size,
    variant: state.variant,
  };
}

export function scaleSeriesFromState(state: ScaleSelectorState): NoteCandidate[] {
  const ascending = scaleNotesFromConfig(scaleConfigFromState(state), state.octaves);
  if (!state.isRoundTrip) {
    return ascending;
  }

  const descending = ascending.slice(0, -1).reverse().map((note) => ({ ...note }));

  return [...ascending, ...descending];
}

export function clampScaleState(state: ScaleSelectorState): ScaleSelectorState {
  const size: ScaleSize = state.size === "pentatonic" && scaleSupportsPentatonic(state.quality)
    ? "pentatonic"
    : "heptatonic";
  const variant: ScaleVariant = state.variant === "blues" && size === "pentatonic" && scaleSupportsBlues(state.quality)
    ? "blues"
    : "standard";
  const clamped = { ...state, size, variant };

  return { ...clamped, octaves: clamp(clamped.octaves, 1, maxPlayableOctaves(scaleConfigFromState(clamped))) };
}

export function relativeScaleState(state: ScaleSelectorState): ScaleSelectorState {
  const current = SCALE_ROOTS[state.rootIndex];
  const relative = relativeScale(current.pitchClass, state.quality);
  if (relative === null) {
    return state;
  }

  const currentAlteration = current.spelling.alteration;
  const alterationPreference = currentAlteration === 0
    ? [0, 1, -1]
    : [currentAlteration, 0, -currentAlteration];
  const candidates = SCALE_ROOTS
    .map((root, index) => ({ ...root, index }))
    .filter((candidate) => candidate.pitchClass === relative.root);
  const match = alterationPreference
    .map((alteration) => candidates.find((candidate) => candidate.spelling.alteration === alteration))
    .find((candidate) => candidate !== undefined);

  return {
    ...state,
    rootIndex: match?.index ?? candidates[0].index,
    quality: relative.quality,
  };
}
