import { namedNoteFromMidi, type NoteSpelling } from "../../../lib/music/notation";
import { useNotation } from "../../../hooks/useNotation";

export function NoteName({ midi, spelling }: { midi: number; spelling?: NoteSpelling }) {
  const [notation] = useNotation();
  const named = namedNoteFromMidi(midi, notation, spelling);

  return (
    <>
      {named.baseName}
      {named.accidental !== "" && (
        <small
          className={`
            align-[0.55em]
            text-[0.42em]
            text-brass
          `}
        >
          {named.accidental}
        </small>
      )}
      <span
        className={`
          ml-[0.04em]
          align-[0.2em]
          text-[0.34em]
          text-pearl-faint
        `}
      >
        {named.octave}
      </span>
    </>
  );
}
