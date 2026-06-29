import { pitchClassFromMidi } from "../../../lib/music/notation";
import type { NoteCandidate } from "../../../lib/music/guitar";
import { Flex } from "../../../components/layout/Flex";
import { Fretboard } from "./Fretboard";

interface Props {
  notes: NoteCandidate[];
  currentNote: NoteCandidate;
}

export function ScaleDiagram({ notes, currentNote }: Props) {
  const rootPitchClass = notes.length > 0 ? pitchClassFromMidi(notes[0].midi) : -1;
  const markers = notes.map((note) => ({
    stringIndex: note.stringIndex,
    fretIndex: note.fretIndex,
    isRoot: pitchClassFromMidi(note.midi) === rootPitchClass,
  }));
  const maxFret = markers.length > 0
    ? Math.max(5, ...markers.map((marker) => marker.fretIndex))
    : 5;

  return (
    <Flex direction="col" align="center" className="w-full">
      <Fretboard pos={currentNote} scaleNotes={markers} maxFret={maxFret} />
    </Flex>
  );
}
