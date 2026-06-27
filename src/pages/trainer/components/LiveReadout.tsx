import { noteFromFrequency, namedNoteFromMidi, type Notation } from "../../../lib/music/notation";
import { PITCH_DETECTION_PARAMS } from "../../../lib/pitch/pitchDetection";
import type { Frame } from "../../../lib/pitch/pitchEngine";
import { useEngineSelector } from "../../../hooks/useEngineSelector";
import { useNotation } from "../../../hooks/useNotation";
import { cn } from "../../../lib/cn";
import { Meter } from "../../../components/Meter";
import { Flex } from "../../../components/layout/Flex";

const maxInputRootmeanSquare = 0.1;

type Heard
  = | { kind: "idle" }
    | { kind: "reference" }
    | { kind: "note"; label: string; cents: number; frequency: number; isMatch: boolean };

interface Readout { heard: Heard; level: number; clarity: number }

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function computeReadout(frame: Frame, notation: Notation, targetMidi: number | null): Readout {
  const level = clamp01(frame.rootMeanSquare / maxInputRootmeanSquare);

  if (frame.isRefPlaying) {
    return { heard: { kind: "reference" }, level, clarity: 0 };
  }

  if (frame.frequencyInHertz > 0 && frame.clarity >= PITCH_DETECTION_PARAMS.minClarity) {
    const { midi, cents } = noteFromFrequency(frame.frequencyInHertz);

    return {
      heard: {
        kind: "note",
        label: namedNoteFromMidi(midi, notation).name,
        cents,
        frequency: frame.frequencyInHertz,
        isMatch: targetMidi !== null && midi === targetMidi,
      },
      level,
      clarity: frame.clarity,
    };
  }

  return { heard: { kind: "idle" }, level, clarity: 0 };
}

function signature(readout: Readout): string {
  const { heard } = readout;
  const heardSignature = heard.kind === "note"
    ? `note:${heard.label}:${heard.cents}:${heard.frequency.toFixed(1)}:${String(heard.isMatch)}`
    : heard.kind;

  return `${heardSignature}|${Math.round(readout.level * 100)}|${Math.round(readout.clarity * 100)}`;
}

function readoutsAreEqual(a: Readout, b: Readout): boolean {
  return signature(a) === signature(b);
}

interface Props {
  targetMidi: number | null;
}

export function LiveReadout({ targetMidi }: Props) {
  const [notation] = useNotation();
  const readout = useEngineSelector(
    (frame) => computeReadout(frame, notation, targetMidi),
    readoutsAreEqual,
  );

  const { heard } = readout;

  return (
    <Flex direction="col" gap={3.5} className="w-full">
      <Flex
        isWrapping
        align="baseline"
        justify="center"
        gap={2.5}
        className={`
          min-h-8
          text-sm
          text-pearl-dim
        `}
      >
        {heard.kind === "idle" && <span className="text-pearl-faint">Joue une note…</span>}
        {heard.kind === "reference" && <span className="text-brass">♪ Référence…</span>}
        {heard.kind === "note" && (
          <>
            <span>J&apos;entends</span>
            <span
              className={cn(`
                font-display
                text-2xl
                font-semibold
              `, heard.isMatch ? "text-green" : "text-pearl")}
            >
              {heard.label}
            </span>
            <span
              className={`
                font-mono
                text-xs
                text-pearl-faint
              `}
            >
              {heard.cents >= 0 ? "+" : ""}
              {heard.cents}
              {" c · "}
              {heard.frequency.toFixed(1)}
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
