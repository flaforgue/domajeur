import { useEffect, useRef } from "react";
import { useLatest } from "../../hooks/useLatest";
import { useMuted } from "../../hooks/useMuted";
import { usePitch } from "../../hooks/usePitch";
import { frequencyFromMidi } from "../../lib/music/notation";

const strumStepMs = 90;
const noteDurationSeconds = 2;
const basePeakGain = 0.6;

interface ChordStrum {
  strum: (midis: (number | null)[]) => void;
  stop: () => void;
}

export function useChordStrum(): ChordStrum {
  const { engine } = usePitch();
  const [isMuted] = useMuted();
  const isMutedRef = useLatest(isMuted);
  const timersRef = useRef<number[]>([]);

  function stop(): void {
    timersRef.current.forEach((id) => {
      clearTimeout(id);
    });
    timersRef.current = [];
  }

  useEffect(() => stop, []);

  function strum(midis: (number | null)[]): void {
    stop();
    const soundedMidis = midis.filter((midi): midi is number => midi !== null);
    const peakGain = basePeakGain / Math.sqrt(soundedMidis.length);
    soundedMidis.forEach((midi, index) => {
      const id = window.setTimeout(() => {
        if (!isMutedRef.current) {
          engine.playReference(frequencyFromMidi(midi), noteDurationSeconds, peakGain);
        }
      }, index * strumStepMs);
      timersRef.current.push(id);
    });
  }

  return { strum, stop };
}
