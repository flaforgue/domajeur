import { namedNoteFromMidi } from "../../../lib/music/notation";
import type { NoteCandidate } from "../../../lib/music/guitar";
import { useNotation } from "../../../hooks/useNotation";
import { Flex } from "../../../components/layout/Flex";
import { ChipButton } from "../../../components/buttons/ChipButton";

interface Props {
  notes: NoteCandidate[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function NoteHistory({ notes, currentIndex, onSelect }: Props) {
  const [notation] = useNotation();

  return (
    <Flex
      isWrapping
      gap={2}
      className={`
        min-h-0
        w-full
        flex-1
        scrollbar-thin
        content-start
        overflow-y-auto
        p-0.5

        max-md:max-h-45
      `}
    >
      {notes.map((note, index) => (
        <ChipButton
          key={index}
          tone={index === currentIndex ? "active" : note.isValidated ? "success" : "default"}
          className={`
            w-18
            py-2
          `}
          onClick={() => {
            onSelect(index);
          }}
        >
          {namedNoteFromMidi(note.midi, notation).name}
        </ChipButton>
      ))}
    </Flex>
  );
}
