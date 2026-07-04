import { ToggleSwitch } from "../../../components/inputs/ToggleSwitch";
import { HintedLabel } from "../../../components/HintedLabel";

interface Props {
  isNaturalsOnly: boolean;
  onNaturalsOnlyChange: (value: boolean) => void;
  fretMax: number;
  onFretMaxChange: (value: number) => void;
  shouldAutoAdvance: boolean;
  onAutoAdvanceChange: (value: boolean) => void;
  shouldPlayOnAdvance: boolean;
  onPlayOnAdvanceChange: (value: boolean) => void;
}

export function FreeModeSettings({
  isNaturalsOnly,
  onNaturalsOnlyChange,
  fretMax,
  onFretMaxChange,
  shouldAutoAdvance,
  onAutoAdvanceChange,
  shouldPlayOnAdvance,
  onPlayOnAdvanceChange,
}: Props) {
  return (
    <>
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
        <HintedLabel hint="Frette la plus haute utilisée pour générer les notes (0 = uniquement les cordes à vide).">
          Frettes max
        </HintedLabel>
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
      <ToggleSwitch isChecked={isNaturalsOnly} onChange={onNaturalsOnlyChange}>
        Notes naturelles
      </ToggleSwitch>
      <ToggleSwitch isChecked={shouldAutoAdvance} onChange={onAutoAdvanceChange}>
        Enchaînement auto
      </ToggleSwitch>
      <ToggleSwitch isChecked={shouldPlayOnAdvance} onChange={onPlayOnAdvanceChange}>
        <HintedLabel hint="Joue la note de référence quand l'enchaînement automatique passe à la note suivante.">
          Jouer la note suivante
        </HintedLabel>
      </ToggleSwitch>
    </>
  );
}
