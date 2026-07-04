import { useEffect, useRef } from "react";
import { useLatest } from "../../hooks/useLatest";
import type { NoteCandidate } from "../../lib/music/guitar";

const stepMs = 750;

interface ScalePlayback {
  play: (notes: NoteCandidate[]) => void;
  stop: () => void;
}

export function useScalePlayback(onStep: (note: NoteCandidate, index: number) => void): ScalePlayback {
  const timersRef = useRef<number[]>([]);
  const onStepRef = useLatest(onStep);

  function stop(): void {
    timersRef.current.forEach((id) => {
      clearTimeout(id);
    });
    timersRef.current = [];
  }

  function play(notes: NoteCandidate[]): void {
    stop();
    notes.forEach((note, index) => {
      const id = window.setTimeout(() => {
        onStepRef.current(note, index);
      }, index * stepMs);
      timersRef.current.push(id);
    });
  }

  useEffect(() => stop, []);

  return { play, stop };
}
