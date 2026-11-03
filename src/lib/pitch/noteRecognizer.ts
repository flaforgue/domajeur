import { detectedNoteFromFrame } from "./detectedNote";
import type { Frame } from "./pitchEngine";

const stableHoldMs = 130;
const minClarityToRecognize = 0.85;

export interface NoteRecognizer {
  processFrame: (frame: Frame, now: number) => number | null;
}

export function createNoteRecognizer(): NoteRecognizer {
  let stableMidi: number | null = null;
  let stableSince = 0;
  let hasRecognized = false;

  return {
    processFrame(frame: Frame, now: number): number | null {
      if (frame.isRefPlaying) {
        return null;
      }

      const detected = detectedNoteFromFrame(frame);
      if (detected === null) {
        stableMidi = null;

        return null;
      }

      if (detected.midi !== stableMidi) {
        stableMidi = detected.midi;
        stableSince = now;
        hasRecognized = false;
      }

      if (hasRecognized || frame.clarity < minClarityToRecognize || now - stableSince < stableHoldMs) {
        return null;
      }

      hasRecognized = true;

      return detected.midi;
    },
  };
}
