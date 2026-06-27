import { useEffect, useRef } from "react";
import { noteFromFrequency } from "../../lib/music/notation";
import { PITCH_DETECTION_PARAMS } from "../../lib/pitch/pitchDetection";
import { useEngineFrame } from "../../hooks/useEngineFrame";

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

  const targetMidiRef = useRef(targetMidi);
  targetMidiRef.current = targetMidi;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const onValidatedRef = useRef(onValidated);
  onValidatedRef.current = onValidated;

  useEffect(() => {
    stable.current = { midi: null, count: 0 };
    hasValidated.current = false;
  }, [targetMidi]);

  useEngineFrame((frame) => {
    if (frame.isRefPlaying || !isActiveRef.current || targetMidiRef.current === null || hasValidated.current) {
      return;
    }

    if (frame.frequencyInHertz > 0 && frame.clarity >= PITCH_DETECTION_PARAMS.minClarity) {
      const { midi } = noteFromFrequency(frame.frequencyInHertz);
      if (midi === stable.current.midi) {
        stable.current.count++;
      } else {
        stable.current = { midi, count: 1 };
      }

      if (
        midi === targetMidiRef.current
        && frame.clarity >= minClarityToValidate
        && stable.current.count >= minStableFrames
      ) {
        hasValidated.current = true;
        onValidatedRef.current();
      }
    } else {
      stable.current = { midi: null, count: 0 };
    }
  });
}
