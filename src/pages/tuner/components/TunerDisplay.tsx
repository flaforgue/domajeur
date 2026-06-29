import { noteFromFrequency, namedNoteFromMidi, type Notation } from "../../../lib/music/notation";
import { PITCH_DETECTION_PARAMS } from "../../../lib/pitch/pitchDetection";
import type { Frame } from "../../../lib/pitch/pitchEngine";
import { useEngineSelector } from "../../../hooks/useEngineSelector";
import { useNotation } from "../../../hooks/useNotation";
import { cn } from "../../../lib/cn";
import { Panel } from "../../../components/containers/Panel";
import { Flex } from "../../../components/layout/Flex";
import { Gauge } from "./Gauge";
import { IN_TUNE_TOLERANCE_CENTS, isInTune } from "../tuning";
import { EnableSoundPrompt } from "../../../components/EnableSoundPrompt";
import { useMuted } from "../../../hooks/useMuted";

type TunerView
  = | { kind: "idle" }
    | { kind: "active"; note: string; octave: number; cents: number; frequency: number; isInTune: boolean };

const idleView: TunerView = { kind: "idle" };

function computeView(frame: Frame, notation: Notation): TunerView {
  if (frame.frequencyInHertz <= 0 || frame.clarity < PITCH_DETECTION_PARAMS.minClarity || frame.isRefPlaying) {
    return idleView;
  }

  const { midi, cents } = noteFromFrequency(frame.frequencyInHertz);
  const named = namedNoteFromMidi(midi, notation);

  return {
    kind: "active",
    note: named.name.replace(/\d+$/, ""),
    octave: named.octave,
    cents,
    frequency: frame.frequencyInHertz,
    isInTune: isInTune(cents),
  };
}

function signature(view: TunerView): string {
  return view.kind === "active"
    ? `${view.note}|${view.octave}|${view.cents}|${view.frequency.toFixed(1)}|${String(view.isInTune)}`
    : "idle";
}

function viewsAreEqual(a: TunerView, b: TunerView): boolean {
  return signature(a) === signature(b);
}

export function TunerDisplay() {
  const [isMuted] = useMuted();
  const [notation] = useNotation();
  const view = useEngineSelector((frame) => computeView(frame, notation), viewsAreEqual);

  const isActive = view.kind === "active";
  const isNoteInTune = isActive && view.isInTune;
  const borderClasses = isNoteInTune
    ? "border-green ring-1 ring-green shadow-xl shadow-green/20"
    : isActive
      ? "border-brass/40"
      : "";

  return (
    <Panel
      variant="display"
      className={cn(
        `
          flex
          flex-col
          items-center
          gap-4
          px-7
          py-10
          transition
          duration-200
        `,
        borderClasses,
      )}
    >
      <Flex align="baseline" gap={1.5}>
        <span
          className={cn(
            `
              font-display
              text-8xl
              leading-none
              font-semibold
            `,
            isNoteInTune ? "text-green" : "text-pearl",
          )}
        >
          {isActive ? view.note : "–"}
        </span>
        <span
          className={`
            font-display
            text-3xl
            text-pearl-faint
          `}
        >
          {isActive ? view.octave : ""}
        </span>
      </Flex>
      <div
        className={`
          min-h-5
          font-mono
          text-sm
          text-pearl-dim
        `}
      >
        {isActive ? `${view.cents >= 0 ? "+" : ""}${view.cents} cents` : "joue une corde"}
      </div>

      <Gauge
        cents={isActive ? view.cents : null}
        isInTune={isNoteInTune}
        toleranceInCents={IN_TUNE_TOLERANCE_CENTS}
      />

      <div
        className={`
          min-h-4
          font-mono
          text-xs
          text-pearl-faint
        `}
      >
        {isActive ? `${view.frequency.toFixed(1)} Hz` : ""}
      </div>

      {isMuted && <EnableSoundPrompt />}
    </Panel>
  );
}
