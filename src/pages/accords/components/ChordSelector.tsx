import { spellingName, pitchClassFromMidi, pitchClassName, type Notation } from "../../../lib/music/notation";
import { fretText, STRINGS } from "../../../lib/music/guitar";
import { CHORD_QUALITIES, chordFamily, type ChordQuality } from "../../../lib/music/chords";
import type { ChordPosition } from "../../../lib/music/chordPositions";
import { SCALE_ROOTS } from "../../../lib/music/scaleSelection";
import { useNotation } from "../../../hooks/useNotation";
import { Flex } from "../../../components/layout/Flex";
import { Select } from "../../../components/inputs/Select";
import type { ChordPreferences } from "../useChordPreferences";

const qualityOptions: { value: ChordQuality; label: string }[] = CHORD_QUALITIES.map((quality) => ({
  value: quality,
  label: chordFamily(quality).label,
}));

function positionLabel(position: ChordPosition, quality: ChordQuality, notation: Notation): string {
  if (position.isOpen) {
    return "Position ouverte";
  }

  if (position.formStringIndex !== undefined) {
    const openNoteName = pitchClassName(pitchClassFromMidi(STRINGS[position.formStringIndex].midi), notation);
    // Barre shapes are named after the open chord they derive from: Mi vs Mim, La vs Lam.
    const formName = quality === "minor" ? `${openNoteName}m` : openNoteName;

    return `Barré ${fretText(position.baseFret)} (forme de ${formName})`;
  }

  return `Vers la ${fretText(position.baseFret)}`;
}

interface Props {
  preferences: ChordPreferences;
  positions: ChordPosition[];
  onChange: (preferences: ChordPreferences) => void;
}

export function ChordSelector({ preferences, positions, onChange }: Props) {
  const [notation] = useNotation();

  return (
    <>
      <Flex gap={2}>
        <Select
          className="flex-1"
          label="Fondamentale"
          value={String(preferences.rootIndex)}
          options={SCALE_ROOTS.map((root, index) => ({
            value: String(index),
            label: spellingName(root.spelling, notation),
          }))}
          onChange={(value) => {
            onChange({ ...preferences, rootIndex: Number(value), positionIndex: 0 });
          }}
        />
        <Select
          className="flex-1"
          label="Type d'accord"
          value={preferences.quality}
          options={qualityOptions}
          onChange={(value) => {
            onChange({ ...preferences, quality: value as ChordQuality, positionIndex: 0 });
          }}
        />
      </Flex>

      {positions.length > 1 && (
        <Select
          label="Position"
          value={String(Math.min(preferences.positionIndex, positions.length - 1))}
          options={positions.map((position, index) => ({
            value: String(index),
            label: positionLabel(position, preferences.quality, notation),
          }))}
          onChange={(value) => {
            onChange({ ...preferences, positionIndex: Number(value) });
          }}
        />
      )}
    </>
  );
}
