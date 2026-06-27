import { namedNoteFromMidi } from "../../../lib/music/notation";
import { useNotation } from "../../../hooks/useNotation";

export function NoteName({ midi }: { midi: number }) {
  const [notation] = useNotation();
  const nm = namedNoteFromMidi(midi, notation);
  const base = nm.name.replace(/♯/, "").replace(/-?\d+$/, "");
  const isSharp = nm.name.includes("♯");

  return (
    <>
      {base}
      {isSharp && (
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
        {nm.octave}
      </span>
    </>
  );
}
