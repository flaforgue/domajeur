import { useEffect } from "react";
import { usePitch } from "./usePitch";
import { useLatest } from "./useLatest";
import type { Frame } from "../lib/pitch/pitchEngine";

export function useEngineFrame(onFrame: (frame: Frame) => void): void {
  const { engine } = usePitch();
  const handlerRef = useLatest(onFrame);

  useEffect(() => engine.subscribe((frame) => {
    handlerRef.current(frame);
  }), [engine, handlerRef]);
}
