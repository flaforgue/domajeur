import { useCallback, useSyncExternalStore } from "react";
import { createPitchEngine, type PitchEngine } from "../lib/pitch/pitchEngine";

interface PitchApi {
  engine: PitchEngine;
  isStarted: boolean;
  error: string | null;
  start: () => Promise<void>;
}

let instance: PitchEngine | null = null;
function getEngine(): PitchEngine {
  instance ??= createPitchEngine();

  return instance;
}

export function usePitch(): PitchApi {
  const engine = getEngine();
  const status = useSyncExternalStore(engine.subscribeStatus, engine.getStatus);
  const start = useCallback(() => engine.start(), [engine]);

  return { engine, isStarted: status.isStarted, error: status.error, start };
}
