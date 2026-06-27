import { namedNoteFromMidi } from "../../../lib/music/notation";
import type { NoteCandidate } from "../../../lib/music/guitar";
import { useNotation } from "../../../hooks/useNotation";
import { Flex } from "../../../components/layout/Flex";
import { NoteChipButton } from "./NoteChipButton";

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
        <NoteChipButton
          key={index}
          isActive={index === currentIndex}
          isValidated={note.isValidated}
          onClick={() => {
            onSelect(index);
          }}
        >
          {namedNoteFromMidi(note.midi, notation).name}
        </NoteChipButton>
      ))}
    </Flex>
  );
}
