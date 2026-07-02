import { useEffect, useRef } from "react";
import { detectedNoteFromFrame } from "../../lib/pitch/detectedNote";
import { useEngineFrame } from "../../hooks/useEngineFrame";
import { useLatest } from "../../hooks/useLatest";

const minStableFrames = 8;
const minClarityToValidate = 0.85;

interface Options {
  targetMidi: number | null;
  isActive: boolean;
  onValidated: () => void;
}

export function useNoteValidation({ targetMidi, isActive, onValidated }: Options): void {
  const stable = useRef<{ midi: number | null; count: number }>({ midi: null, count: 0 });
  const hasValidated = useRef(false);

  const targetMidiRef = useLatest(targetMidi);
  const isActiveRef = useLatest(isActive);
  const onValidatedRef = useLatest(onValidated);

  useEffect(() => {
    stable.current = { midi: null, count: 0 };
    hasValidated.current = false;
  }, [targetMidi]);

  useEngineFrame((frame) => {
    if (frame.isRefPlaying || !isActiveRef.current || targetMidiRef.current === null || hasValidated.current) {
      return;
    }

    const detected = detectedNoteFromFrame(frame);
    if (detected === null) {
      stable.current = { midi: null, count: 0 };

      return;
    }

    if (detected.midi === stable.current.midi) {
      stable.current.count++;
    } else {
      stable.current = { midi: detected.midi, count: 1 };
    }

    if (
      detected.midi === targetMidiRef.current
      && frame.clarity >= minClarityToValidate
      && stable.current.count >= minStableFrames
    ) {
      hasValidated.current = true;
      onValidatedRef.current();
    }
  });
}
