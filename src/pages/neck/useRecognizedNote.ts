import { useEffect, useState } from "react";
import { useEngineFrame } from "../../hooks/useEngineFrame";
import { createNoteRecognizer } from "../../lib/pitch/noteRecognizer";

const matchFeedbackMs = 1000;

export interface RecognizedNote {
  midi: number;
  isMatch: boolean;
}

export function useRecognizedNote(highlightedMidis: ReadonlySet<number>): RecognizedNote | null {
  const [recognizer] = useState(createNoteRecognizer);
  const [recognized, setRecognized] = useState<RecognizedNote | null>(null);

  useEngineFrame((frame) => {
    const midi = recognizer.processFrame(frame, performance.now());
    if (midi !== null) {
      setRecognized({ midi, isMatch: highlightedMidis.has(midi) });
    }
  });

  useEffect(() => {
    if (recognized?.isMatch !== true) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRecognized({ midi: recognized.midi, isMatch: false });
    }, matchFeedbackMs);

    return () => {
      clearTimeout(timer);
    };
  }, [recognized]);

  return recognized;
}
