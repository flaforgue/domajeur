import { namedNoteFromMidi } from "../../../lib/music/notation";
import { useNotation } from "../../../hooks/useNotation";

export function NoteName({ midi }: { midi: number }) {
  const [notation] = useNotation();
  const named = namedNoteFromMidi(midi, notation);

  return (
    <>
      {named.baseName}
      {named.isSharp && (
        <small
          className={`
            align-[0.55em]
            text-[0.42em]
            text-brass
          `}
        >
          ♯
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
