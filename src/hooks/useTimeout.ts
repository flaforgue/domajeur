import { useEffect } from "react";
import { useLatest } from "./useLatest";

export function useTimeout(delayMs: number | null, onTimeout: () => void): void {
  const onTimeoutRef = useLatest(onTimeout);

  useEffect(() => {
    if (delayMs === null) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onTimeoutRef.current();
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [delayMs, onTimeoutRef]);
}
