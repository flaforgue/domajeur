import { useEffect, useRef } from "react";
import { usePitch } from "./usePitch";
import type { Frame } from "../lib/pitch/pitchEngine";

export function useEngineFrame(onFrame: (frame: Frame) => void): void {
  const { engine } = usePitch();
  const handlerRef = useRef(onFrame);
  handlerRef.current = onFrame;

  useEffect(() => engine.subscribe((frame) => {
    handlerRef.current(frame);
  }), [engine]);
}
