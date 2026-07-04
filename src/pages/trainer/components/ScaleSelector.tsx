import { InfoIcon, MoveDiagonal2Icon } from "lucide-react";
import { spellingName } from "../../../lib/music/notation";
import {
  maxPlayableOctaves,
  relativeScale,
  scaleModeLabel,
  SCALE_QUALITIES,
  scaleSupportsBlues,
  scaleSupportsPentatonic,
  type ScaleQuality,
  type ScaleSize,
  type ScaleVariant,
} from "../../../lib/music/scales";
import {
  clampScaleState,
  relativeScaleState,
  SCALE_ROOTS,
  scaleConfigFromState,
  type ScaleSelectorState,
} from "../../../lib/music/scaleSelection";
import { useNotation } from "../../../hooks/useNotation";
import { Flex } from "../../../components/layout/Flex";
import { Select } from "../../../components/inputs/Select";
import { ToggleSwitch } from "../../../components/inputs/ToggleSwitch";
import { HELP_TOOLTIP_ID } from "../../../components/HelpTooltip";

const qualityOptions: { value: ScaleQuality; label: string }[] = SCALE_QUALITIES.map((quality) => ({
  value: quality,
  label: scaleModeLabel(quality),
}));

const scaleTypes: { value: string; label: string; size: ScaleSize; variant: ScaleVariant }[] = [
  { value: "pentatonic", label: "Pentatonique", size: "pentatonic", variant: "standard" },
  { value: "pentatonic-blues", label: "Pentatonique (blues)", size: "pentatonic", variant: "blues" },
  { value: "heptatonic", label: "Heptatonique", size: "heptatonic", variant: "standard" },
];

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
  const hasRelative = relativeScale(SCALE_ROOTS[state.rootIndex].pitchClass, state.quality) !== null;
  const maxOctaves = maxPlayableOctaves(scaleConfigFromState(state));

  return (
    <>
      <Flex gap={2}>
        <Select
          className="flex-1"
          label="Note de départ"
          value={String(state.rootIndex)}
          options={SCALE_ROOTS.map((root, index) => ({
            value: String(index),
            label: spellingName(root.spelling, notation),
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
            data-tooltip-id={HELP_TOOLTIP_ID}
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
              onChange(clampScaleState(relativeScaleState(state)));
            }}
          >
            <MoveDiagonal2Icon width="16" height="16" />
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

      <ToggleSwitch
        isChecked={state.isRoundTrip}
        onChange={(isChecked) => {
          onChange({ ...state, isRoundTrip: isChecked });
        }}
      >
        <span
          className={`
            flex
            items-center
            gap-1
          `}
        >
          Aller-retour
          <InfoIcon
            width="14"
            height="14"
            className={`
              cursor-help
              text-pearl-faint
            `}
            data-tooltip-id={HELP_TOOLTIP_ID}
            data-tooltip-content="Jouer la gamme en mode ascendant puis descendant."
          />
        </span>
      </ToggleSwitch>
    </>
  );
}
