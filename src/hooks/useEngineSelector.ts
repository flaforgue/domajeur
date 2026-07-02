import { useCallback, useRef, useSyncExternalStore } from "react";
import { usePitch } from "./usePitch";
import { shallowEqual } from "../lib/shallowEqual";
import type { Frame } from "../lib/pitch/pitchEngine";

export function useEngineSelector<T>(
  select: (frame: Frame) => T,
  isEqual: (a: T, b: T) => boolean = shallowEqual,
): T {
  const { engine } = usePitch();
  const cache = useRef<{ value: T } | null>(null);

  const subscribe = useCallback(
    (onStoreChange: () => void) => engine.subscribe(() => {
      onStoreChange();
    }),
    [engine],
  );

  function getSnapshot(): T {
    const next = select(engine.getFrame());
    if (cache.current !== null && isEqual(cache.current.value, next)) {
      return cache.current.value;
    }

    cache.current = { value: next };

    return next;
  }

  return useSyncExternalStore(subscribe, getSnapshot);
}
