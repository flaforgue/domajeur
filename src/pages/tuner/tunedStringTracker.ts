import { STRINGS } from "../../lib/music/guitar";
import { detectedNoteFromFrame } from "../../lib/pitch/detectedNote";
import type { Frame } from "../../lib/pitch/pitchEngine";
import { isInTune } from "./tuning";

const tuneHoldMs = 750;
const dropoutGraceMs = 250;

export interface TunedStringTracker {
  processFrame: (frame: Frame, now: number) => number | null;
}

function detectInTuneString(frame: Frame): number {
  const detected = detectedNoteFromFrame(frame);
  if (detected === null || !isInTune(detected.cents)) {
    return -1;
  }

  return STRINGS.findIndex((string) => string.midi === detected.midi);
}

export function createTunedStringTracker(): TunedStringTracker {
  let heldStringIndex = -1;
  let inTuneSince = 0;
  let lastInTuneAt = 0;

  return {
    processFrame(frame: Frame, now: number): number | null {
      const inTuneStringIndex = detectInTuneString(frame);

      if (inTuneStringIndex < 0) {
        if (heldStringIndex >= 0 && now - lastInTuneAt > dropoutGraceMs) {
          heldStringIndex = -1;
        }

        return null;
      }

      if (inTuneStringIndex !== heldStringIndex) {
        heldStringIndex = inTuneStringIndex;
        inTuneSince = now;
      }

      lastInTuneAt = now;

      return now - inTuneSince >= tuneHoldMs ? inTuneStringIndex : null;
    },
  };
}
