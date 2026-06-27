import { pitchClassName } from "../../../lib/music/notation";
import {
  scaleNotesFromConfig,
  type ScaleConfig,
  type ScaleQuality,
  type ScaleSize,
  type ScaleVariant,
} from "../../../lib/music/scales";
import type { NoteCandidate } from "../../../lib/music/guitar";
import { useNotation } from "../../../hooks/useNotation";
import { Flex } from "../../../components/layout/Flex";
import { Select } from "../../../components/inputs/Select";

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

const qualityOptions: { value: ScaleQuality; label: string }[] = [
  { value: "major", label: "Majeur" },
  { value: "minor", label: "Mineur" },
];

const scaleTypes: { value: string; label: string; size: ScaleSize; variant: ScaleVariant }[] = [
  { value: "pentatonic", label: "Pentatonique", size: "pentatonic", variant: "standard" },
  { value: "pentatonic-blues", label: "Pentatonique (blues)", size: "pentatonic", variant: "blues" },
  { value: "heptatonic", label: "Heptatonique", size: "heptatonic", variant: "standard" },
  { value: "heptatonic-blues", label: "Heptatonique (blues)", size: "heptatonic", variant: "blues" },
];

export interface ScaleSelectorState {
  rootIndex: number;
  quality: ScaleQuality;
  size: ScaleSize;
  variant: ScaleVariant;
}

export const DEFAULT_SCALE_STATE: ScaleSelectorState = {
  rootIndex: 0,
  quality: "major",
  size: "heptatonic",
  variant: "standard",
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
  return scaleNotesFromConfig(toConfig(state));
}

interface Props {
  state: ScaleSelectorState;
  onChange: (state: ScaleSelectorState) => void;
}

export function ScaleSelector({ state, onChange }: Props) {
  const [notation] = useNotation();

  const selectedScaleType = scaleTypes.find(
    (scaleType) => scaleType.size === state.size && scaleType.variant === state.variant,
  );

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
            onChange({ ...state, rootIndex: Number(value) });
          }}
        />
        <Select
          className="flex-1"
          label="Mode"
          value={state.quality}
          options={qualityOptions}
          onChange={(value) => {
            onChange({ ...state, quality: value as ScaleQuality });
          }}
        />
      </Flex>

      <Select
        label="Type de gamme"
        value={selectedScaleType?.value ?? scaleTypes[0].value}
        options={scaleTypes.map((scaleType) => ({ value: scaleType.value, label: scaleType.label }))}
        onChange={(value) => {
          const scaleType = scaleTypes.find((candidate) => candidate.value === value) ?? scaleTypes[0];
          onChange({ ...state, size: scaleType.size, variant: scaleType.variant });
        }}
      />
    </>
  );
}
