import { fretText, stringName, type NoteCandidate, type StringPosition } from "../../../lib/music/guitar";
import { useNotation } from "../../../hooks/useNotation";
import { Flex } from "../../../components/layout/Flex";
import { Fretboard } from "./Fretboard";

interface Props {
  note: NoteCandidate;
  altPositions: StringPosition[];
  maxFret: number;
}

export function Solution({ note, altPositions, maxFret }: Props) {
  const [notation] = useNotation();

  return (
    <Flex
      direction="col"
      align="center"
      gap={2.5}
      className="w-full"
    >
      <div
        className={`
          text-base
          font-semibold
        `}
      >
        Corde
        {" "}
        {stringName(note.stringIndex, notation)}
        ,
        {" "}
        {fretText(note.fretIndex)}
      </div>
      {altPositions.length > 0 && (
        <div
          className={`
            text-center
            text-sm
            text-pearl-faint
          `}
        >
          Aussi jouable :
          {" "}
          {altPositions.map((p) => `${stringName(p.stringIndex, notation)} ${fretText(p.fretIndex)}`).join(" · ")}
        </div>
      )}
      <Fretboard
        pos={{ stringIndex: note.stringIndex, fretIndex: note.fretIndex }}
        altPositions={altPositions}
        maxFret={maxFret}
      />
    </Flex>
  );
}
