import { useRef, useState } from "react";
import { noteFromFrequency } from "../../lib/music/notation";
import { STRINGS } from "../../lib/music/guitar";
import { PITCH_DETECTION_PARAMS } from "../../lib/pitch/pitchDetection";
import type { Frame } from "../../lib/pitch/pitchEngine";
import { useEngineFrame } from "../../hooks/useEngineFrame";
import { isInTune } from "./tuning";

const tuneHoldMs = 750;
const dropoutGraceMs = 250;

function detectInTuneString(frame: Frame): number {
  if (frame.isRefPlaying || frame.frequencyInHertz <= 0 || frame.clarity < PITCH_DETECTION_PARAMS.minClarity) {
    return -1;
  }

  const { midi, cents } = noteFromFrequency(frame.frequencyInHertz);
  if (!isInTune(cents)) {
    return -1;
  }

  return STRINGS.findIndex((string) => string.midi === midi);
}

export function useTunedStrings(): ReadonlySet<number> {
  const [tunedStringIndices, setTunedStringIndices] = useState<ReadonlySet<number>>(() => new Set());
  const heldStringIndex = useRef(-1);
  const inTuneSince = useRef(0);
  const lastInTuneAt = useRef(0);

  useEngineFrame((frame) => {
    const now = performance.now();
    const inTuneStringIndex = detectInTuneString(frame);

    if (inTuneStringIndex < 0) {
      if (heldStringIndex.current >= 0 && now - lastInTuneAt.current > dropoutGraceMs) {
        heldStringIndex.current = -1;
      }

      return;
    }

    if (inTuneStringIndex !== heldStringIndex.current) {
      heldStringIndex.current = inTuneStringIndex;
      inTuneSince.current = now;
    }

    lastInTuneAt.current = now;

    if (now - inTuneSince.current >= tuneHoldMs) {
      setTunedStringIndices(
        (previous) => (previous.has(inTuneStringIndex) ? previous : new Set(previous).add(inTuneStringIndex)),
      );
    }
  });

  return tunedStringIndices;
}
