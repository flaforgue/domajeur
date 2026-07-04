import { clamp } from "../math";
import { pitchClassFromMidi, type NoteSpelling } from "./notation";
import type { NoteCandidate } from "./guitar";
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

const rootSpellings: NoteSpelling[] = [
  { natural: 0, alteration: 0 }, // Do
  { natural: 0, alteration: 1 }, // Do♯
  { natural: 2, alteration: -1 }, // Ré♭
  { natural: 2, alteration: 0 }, // Ré
  { natural: 2, alteration: 1 }, // Ré♯
  { natural: 4, alteration: -1 }, // Mi♭
  { natural: 4, alteration: 0 }, // Mi
  { natural: 5, alteration: 0 }, // Fa
  { natural: 5, alteration: 1 }, // Fa♯
  { natural: 7, alteration: -1 }, // Sol♭
  { natural: 7, alteration: 0 }, // Sol
  { natural: 7, alteration: 1 }, // Sol♯
  { natural: 9, alteration: -1 }, // La♭
  { natural: 9, alteration: 0 }, // La
  { natural: 9, alteration: 1 }, // La♯
  { natural: 11, alteration: -1 }, // Si♭
  { natural: 11, alteration: 0 }, // Si
  { natural: 0, alteration: -1 }, // Do♭
];

export const SCALE_ROOTS: { pitchClass: number; spelling: NoteSpelling }[] = rootSpellings.map(
  (spelling) => ({ pitchClass: pitchClassFromMidi(spelling.natural + spelling.alteration), spelling }),
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
    rootNatural: SCALE_ROOTS[state.rootIndex].spelling.natural,
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
