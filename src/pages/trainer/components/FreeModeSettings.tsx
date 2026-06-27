import { ToggleSwitch } from "../../../components/inputs/ToggleSwitch";

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
        <span>Frettes max</span>
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
