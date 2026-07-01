import { ArrowLeftRightIcon } from "lucide-react";
import { pitchClassName } from "../../../lib/music/notation";
import {
  maxPlayableOctaves,
  relativeScale,
  scaleModeLabel,
  scaleNotesFromConfig,
  SCALE_QUALITIES,
  scaleSupportsBlues,
  scaleSupportsPentatonic,
  type ScaleConfig,
  type ScaleQuality,
  type ScaleSize,
  type ScaleVariant,
} from "../../../lib/music/scales";
import type { NoteCandidate } from "../../../lib/music/guitar";
import { useNotation } from "../../../hooks/useNotation";
import { Flex } from "../../../components/layout/Flex";
import { Select } from "../../../components/inputs/Select";
import { HelpTooltip } from "../../../components/HelpTooltip";

const roots: { pitchClass: number; natural: number; accidental: string }[] = [
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

const qualityOptions: { value: ScaleQuality; label: string }[] = SCALE_QUALITIES.map((quality) => ({
  value: quality,
  label: scaleModeLabel(quality),
}));

const scaleTypes: { value: string; label: string; size: ScaleSize; variant: ScaleVariant }[] = [
  { value: "pentatonic", label: "Pentatonique", size: "pentatonic", variant: "standard" },
  { value: "pentatonic-blues", label: "Pentatonique (blues)", size: "pentatonic", variant: "blues" },
  { value: "heptatonic", label: "Heptatonique", size: "heptatonic", variant: "standard" },
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

function toConfig(state: ScaleSelectorState): ScaleConfig {
  return {
    root: roots[state.rootIndex].pitchClass,
    quality: state.quality,
    size: state.size,
    variant: state.variant,
  };
}

export function scaleSeriesFromState(state: ScaleSelectorState): NoteCandidate[] {
  return scaleNotesFromConfig(toConfig(state), state.octaves);
}

export function clampScaleState(state: ScaleSelectorState): ScaleSelectorState {
  const size: ScaleSize = state.size === "pentatonic" && scaleSupportsPentatonic(state.quality)
    ? "pentatonic"
    : "heptatonic";
  const variant: ScaleVariant = state.variant === "blues" && size === "pentatonic" && scaleSupportsBlues(state.quality)
    ? "blues"
    : "standard";
  const clamped = { ...state, size, variant };

  return { ...clamped, octaves: Math.min(Math.max(1, clamped.octaves), maxPlayableOctaves(toConfig(clamped))) };
}

function toRelative(state: ScaleSelectorState): ScaleSelectorState {
  const current = roots[state.rootIndex];
  const relative = relativeScale(current.pitchClass, state.quality);
  if (relative === null) {
    return state;
  }

  const accidentalPreference = current.accidental === "♯"
    ? ["♯", "", "♭"]
    : current.accidental === "♭"
      ? ["♭", "", "♯"]
      : ["", "♯", "♭"];
  const candidates = roots
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

interface Props {
  state: ScaleSelectorState;
  onChange: (state: ScaleSelectorState) => void;
}

export function ScaleSelector({ state, onChange }: Props) {
  const [notation] = useNotation();

  const availableScaleTypes = scaleTypes.filter(
    (scaleType) =>
      (scaleType.size !== "pentatonic" || scaleSupportsPentatonic(state.quality))
      && (scaleType.variant !== "blues" || scaleSupportsBlues(state.quality)),
  );
  const selectedScaleType = availableScaleTypes.find(
    (scaleType) => scaleType.size === state.size && scaleType.variant === state.variant,
  );
  const hasRelative = relativeScale(roots[state.rootIndex].pitchClass, state.quality) !== null;
  const maxOctaves = maxPlayableOctaves(toConfig(state));

  return (
    <>
      <Flex gap={2}>
        <Select
          className="flex-1"
          label="Note de départ"
          value={String(state.rootIndex)}
          options={roots.map((root, index) => ({
            value: String(index),
            label: pitchClassName(root.natural, notation) + root.accidental,
          }))}
          onChange={(value) => {
            onChange(clampScaleState({ ...state, rootIndex: Number(value) }));
          }}
        />
        <Select
          className="flex-1"
          label="Mode"
          value={state.quality}
          options={qualityOptions}
          onChange={(value) => {
            onChange(clampScaleState({ ...state, quality: value as ScaleQuality }));
          }}
        />
        {hasRelative && (
          <button
            type="button"
            aria-label="Passer à la gamme relative"
            data-tooltip-id="relative-help"
            data-tooltip-content="Passer à la gamme relative (mêmes notes, autre tonique)"
            className={`
              grid
              cursor-pointer
              place-items-center
              rounded-lg
              border
              border-line
              bg-ebony-2
              px-2.5
              text-pearl-dim
              transition

              hover:border-pearl/28
              hover:text-pearl
            `}
            onClick={() => {
              onChange(clampScaleState(toRelative(state)));
            }}
          >
            <ArrowLeftRightIcon width="16" height="16" />
          </button>
        )}
      </Flex>

      {availableScaleTypes.length > 1 && (
        <Select
          label="Type de gamme"
          value={selectedScaleType?.value ?? availableScaleTypes[0].value}
          options={availableScaleTypes.map((scaleType) => ({ value: scaleType.value, label: scaleType.label }))}
          onChange={(value) => {
            const scaleType = availableScaleTypes.find(
              (candidate) => candidate.value === value,
            ) ?? availableScaleTypes[0];
            onChange(clampScaleState({ ...state, size: scaleType.size, variant: scaleType.variant }));
          }}
        />
      )}

      <Select
        label="Nombre d'octaves"
        value={String(state.octaves)}
        options={Array.from({ length: maxOctaves }, (_, index) => ({
          value: String(index + 1),
          label: `${index + 1} octave${index + 1 > 1 ? "s" : ""}`,
        }))}
        onChange={(value) => {
          onChange({ ...state, octaves: Number(value) });
        }}
      />

      <HelpTooltip id="relative-help" />
    </>
  );
}
