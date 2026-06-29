import { useEffect } from "react";

export function useWakeLock(isEnabled: boolean): void {
  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    const wakeLockApi: WakeLock | undefined = (navigator as { wakeLock?: WakeLock }).wakeLock;
    if (wakeLockApi === undefined) {
      return undefined;
    }

    const screenWakeLock: WakeLock = wakeLockApi;
    let sentinel: WakeLockSentinel | null = null;
    let isReleased = false;

    function acquire(): void {
      if (sentinel !== null || document.visibilityState !== "visible") {
        return;
      }

      screenWakeLock
        .request("screen")
        .then((lock) => {
          if (isReleased) {
            lock.release().catch(() => undefined);

            return;
          }

          sentinel = lock;
          lock.addEventListener("release", () => {
            sentinel = null;
          });
        })
        .catch(() => undefined);
    }

    function handleVisibilityChange(): void {
      acquire();
    }

    acquire();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isReleased = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (sentinel !== null) {
        sentinel.release().catch(() => undefined);
        sentinel = null;
      }
    };
  }, [isEnabled]);
}
