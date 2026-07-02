import { InfoIcon } from "lucide-react";
import { ToggleSwitch } from "../../../components/inputs/ToggleSwitch";
import { HELP_TOOLTIP_ID } from "../../../components/HelpTooltip";

interface Props {
  isNaturalsOnly: boolean;
  onNaturalsOnlyChange: (value: boolean) => void;
  fretMax: number;
  onFretMaxChange: (value: number) => void;
}

export function FreeModeSettings({ isNaturalsOnly, onNaturalsOnlyChange, fretMax, onFretMaxChange }: Props) {
  return (
    <>
      <ToggleSwitch isChecked={isNaturalsOnly} onChange={onNaturalsOnlyChange}>
        Notes naturelles
      </ToggleSwitch>
      <label
        className={`
          flex
          cursor-pointer
          items-center
          justify-between
          gap-2.5
          text-sm
          text-pearl-dim
        `}
      >
        <span
          className={`
            flex
            items-center
            gap-1
          `}
        >
          Frettes max
          <InfoIcon
            width="14"
            height="14"
            className={`
              cursor-help
              text-pearl-faint
            `}
            data-tooltip-id={HELP_TOOLTIP_ID}
            data-tooltip-content="Frette la plus haute utilisée pour générer les notes (0 = uniquement les cordes à vide)."
          />
        </span>
        <span
          className={`
            flex
            items-center
            gap-2
          `}
        >
          <input
            type="range"
            className={`
              w-23
              accent-brass
            `}
            min={0}
            max={12}
            value={fretMax}
            onChange={(event) => {
              onFretMaxChange(Number(event.target.value));
            }}
          />
          <span
            className={`
              font-mono
              text-sm
              text-pearl
            `}
          >
            {fretMax}
          </span>
        </span>
      </label>
    </>
  );
}
