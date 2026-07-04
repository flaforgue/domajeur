import { namedNoteFromMidi, type Notation, type NoteSpelling } from "../../../lib/music/notation";
import { detectedNoteFromFrame } from "../../../lib/pitch/detectedNote";
import type { Frame } from "../../../lib/pitch/pitchEngine";
import { useEngineSelector } from "../../../hooks/useEngineSelector";
import { useNotation } from "../../../hooks/useNotation";
import { cn } from "../../../lib/cn";
import { clamp } from "../../../lib/math";
import { Meter } from "../../../components/Meter";
import { Flex } from "../../../components/layout/Flex";

const maxInputRootmeanSquare = 0.1;

interface Readout {
  kind: "idle" | "reference" | "note";
  label: string;
  cents: number;
  frequency: number;
  isMatch: boolean;
  level: number;
  clarity: number;
}

function computeReadout(
  frame: Frame,
  notation: Notation,
  targetMidi: number | null,
  targetSpelling: NoteSpelling | undefined,
): Readout {
  const level = Math.round(clamp(frame.rootMeanSquare / maxInputRootmeanSquare, 0, 1) * 100) / 100;
  const silent: Readout = {
    kind: "idle",
    label: "",
    cents: 0,
    frequency: 0,
    isMatch: false,
    level,
    clarity: 0,
  };

  if (frame.isRefPlaying) {
    return { ...silent, kind: "reference" };
  }

  const detected = detectedNoteFromFrame(frame);
  if (detected === null) {
    return silent;
  }

  const isMatch = targetMidi !== null && detected.midi === targetMidi;

  return {
    kind: "note",
    label: namedNoteFromMidi(detected.midi, notation, isMatch ? targetSpelling : undefined).name,
    cents: detected.cents,
    frequency: Number(frame.frequencyInHertz.toFixed(1)),
    isMatch,
    level,
    clarity: Math.round(frame.clarity * 100) / 100,
  };
}

interface Props {
  targetMidi: number | null;
  targetSpelling?: NoteSpelling;
}

export function LiveReadout({ targetMidi, targetSpelling }: Props) {
  const [notation] = useNotation();
  const readout = useEngineSelector((frame) => computeReadout(frame, notation, targetMidi, targetSpelling));

  return (
    <Flex
      direction="col"
      gap={3.5}
      className="w-full"
    >
      <Flex
        isWrapping
        align="baseline"
        justify="center"
        gap={2.5}
        className={`
          text-sm
          text-pearl-dim
        `}
      >
        {readout.kind === "idle" && <span className="text-pearl-faint">Joue une note…</span>}
        {readout.kind === "reference" && <span className="text-brass">♪ Référence…</span>}
        {readout.kind === "note" && (
          <>
            <span>J&apos;entends</span>
            <span
              className={cn(`
                font-display
                text-2xl
                font-semibold
              `, readout.isMatch ? "text-green" : "text-pearl")}
            >
              {readout.label}
            </span>
            <span
              className={`
                font-mono
                text-xs
                text-pearl-faint
              `}
            >
              {readout.cents >= 0 ? "+" : ""}
              {readout.cents}
              {" c · "}
              {readout.frequency.toFixed(1)}
              {" Hz"}
            </span>
          </>
        )}
      </Flex>
      <Flex direction="col" gap={2}>
        <Meter label="Niveau d'entrée" value={readout.level} fillClassName="bg-clay" />
        <Meter label="Clarté" value={readout.clarity} fillClassName="bg-brass" />
      </Flex>
    </Flex>
  );
}
