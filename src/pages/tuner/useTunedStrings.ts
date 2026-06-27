import { useRef, useState } from "react";
import { noteFromFrequency } from "../../lib/music/notation";
import { STRINGS } from "../../lib/music/guitar";
import { PITCH_DETECTION_PARAMS } from "../../lib/pitch/pitchDetection";
import { useEngineFrame } from "../../hooks/useEngineFrame";
import { isInTune } from "./tuning";

const tuneHoldMs = 1000;

export function useTunedStrings(): ReadonlySet<number> {
  const [tunedStringIndices, setTunedStringIndices] = useState<ReadonlySet<number>>(() => new Set());
  const heldStringIndex = useRef(-1);
  const heldSince = useRef(0);

  useEngineFrame((frame) => {
    if (frame.isRefPlaying || frame.frequencyInHertz <= 0 || frame.clarity < PITCH_DETECTION_PARAMS.minClarity) {
      heldStringIndex.current = -1;

      return;
    }

    const { midi, cents } = noteFromFrequency(frame.frequencyInHertz);
    const stringIndex = STRINGS.findIndex((string) => string.midi === midi);
    if (stringIndex < 0 || !isInTune(cents)) {
      heldStringIndex.current = -1;

      return;
    }

    if (heldStringIndex.current !== stringIndex) {
      heldStringIndex.current = stringIndex;
      heldSince.current = performance.now();

      return;
    }

    if (performance.now() - heldSince.current >= tuneHoldMs) {
      setTunedStringIndices((previous) => (previous.has(stringIndex) ? previous : new Set(previous).add(stringIndex)));
    }
  });

  return tunedStringIndices;
}
