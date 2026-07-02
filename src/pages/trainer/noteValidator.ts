import { detectedNoteFromFrame } from "../../lib/pitch/detectedNote";
import type { Frame } from "../../lib/pitch/pitchEngine";

const minStableFrames = 8;
const minClarityToValidate = 0.85;

export interface NoteValidator {
  processFrame: (frame: Frame) => boolean;
}

export function createNoteValidator(targetMidi: number): NoteValidator {
  let stableMidi: number | null = null;
  let stableCount = 0;
  let hasValidated = false;

  return {
    processFrame(frame: Frame): boolean {
      if (frame.isRefPlaying || hasValidated) {
        return false;
      }

      const detected = detectedNoteFromFrame(frame);
      if (detected === null) {
        stableMidi = null;
        stableCount = 0;

        return false;
      }

      if (detected.midi === stableMidi) {
        stableCount++;
      } else {
        stableMidi = detected.midi;
        stableCount = 1;
      }

      if (
        detected.midi === targetMidi
        && frame.clarity >= minClarityToValidate
        && stableCount >= minStableFrames
      ) {
        hasValidated = true;

        return true;
      }

      return false;
    },
  };
}
