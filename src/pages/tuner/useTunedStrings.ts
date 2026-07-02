import { useState } from "react";
import { useEngineFrame } from "../../hooks/useEngineFrame";
import { createTunedStringTracker } from "./tunedStringTracker";

export function useTunedStrings(): ReadonlySet<number> {
  const [tunedStringIndices, setTunedStringIndices] = useState<ReadonlySet<number>>(() => new Set());
  const [tracker] = useState(createTunedStringTracker);

  useEngineFrame((frame) => {
    const tunedStringIndex = tracker.processFrame(frame, performance.now());
    if (tunedStringIndex !== null) {
      setTunedStringIndices(
        (previous) => (previous.has(tunedStringIndex) ? previous : new Set(previous).add(tunedStringIndex)),
      );
    }
  });

  return tunedStringIndices;
}
