import { clamp } from "../math";
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

export const SCALE_ROOTS: { pitchClass: number; natural: number; accidental: string }[] = [
  { pitchClass: 0, natural: 0, accidental: "" },
  { pitchClass: 1, natural: 0, accidental: "♯" },
  { pitchClass: 1, natural: 2, accidental: "♭" },
  { pitchClass: 2, natural: 2, accidental: "" },
  { pitchClass: 3, natural: 2, accidental: "♯" },
  { pitchClass: 3, natural: 4, accidental: "♭" },
  { pitchClass: 4, natural: 4, accidental: "" },
  { pitchClass: 5, natural: 5, accidental: "" },
  { pitchClass: 6, natural: 5, accidental: "♯" },
  { pitchClass: 7, natural: 7, accidental: "" },
  { pitchClass: 8, natural: 7, accidental: "♯" },
  { pitchClass: 8, natural: 9, accidental: "♭" },
  { pitchClass: 9, natural: 9, accidental: "" },
  { pitchClass: 10, natural: 9, accidental: "♯" },
  { pitchClass: 10, natural: 11, accidental: "♭" },
  { pitchClass: 11, natural: 11, accidental: "" },
];

export interface ScaleSelectorState {
  rootIndex: number;
  quality: ScaleQuality;
  size: ScaleSize;
  variant: ScaleVariant;
  octaves: number;
}

export const DEFAULT_SCALE_STATE: ScaleSelectorState = {
  rootIndex: 0,
  quality: "major",
  size: "heptatonic",
  variant: "standard",
  octaves: 1,
};

export function scaleConfigFromState(state: ScaleSelectorState): ScaleConfig {
  return {
    root: SCALE_ROOTS[state.rootIndex].pitchClass,
    rootNatural: SCALE_ROOTS[state.rootIndex].natural,
    quality: state.quality,
    size: state.size,
    variant: state.variant,
  };
}

export function scaleSeriesFromState(state: ScaleSelectorState): NoteCandidate[] {
  return scaleNotesFromConfig(scaleConfigFromState(state), state.octaves);
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

  const accidentalPreference = current.accidental === "♯"
    ? ["♯", "", "♭"]
    : current.accidental === "♭"
      ? ["♭", "", "♯"]
      : ["", "♯", "♭"];
  const candidates = SCALE_ROOTS
    .map((root, index) => ({ accidental: root.accidental, pitchClass: root.pitchClass, index }))
    .filter((candidate) => candidate.pitchClass === relative.root);
  const match = accidentalPreference
    .map((accidental) => candidates.find((candidate) => candidate.accidental === accidental))
    .find((candidate) => candidate !== undefined);

  return {
    ...state,
    rootIndex: match?.index ?? candidates[0].index,
    quality: relative.quality,
  };
}
