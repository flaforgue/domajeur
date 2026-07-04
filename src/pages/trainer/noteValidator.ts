import { detectedNoteFromFrame } from "../../lib/pitch/detectedNote";
import type { Frame } from "../../lib/pitch/pitchEngine";

const stableHoldMs = 130;
const minClarityToValidate = 0.85;

export interface NoteValidator {
  processFrame: (frame: Frame, now: number) => boolean;
}

export function createNoteValidator(targetMidi: number): NoteValidator {
  let stableMidi: number | null = null;
  let stableSince = 0;
  let hasValidated = false;

  return {
    processFrame(frame: Frame, now: number): boolean {
      if (frame.isRefPlaying || hasValidated) {
        return false;
      }

      const detected = detectedNoteFromFrame(frame);
      if (detected === null) {
        stableMidi = null;

        return false;
      }

      if (detected.midi !== stableMidi) {
        stableMidi = detected.midi;
        stableSince = now;
      }

      if (
        detected.midi === targetMidi
        && frame.clarity >= minClarityToValidate
        && now - stableSince >= stableHoldMs
      ) {
        hasValidated = true;

        return true;
      }

      return false;
    },
  };
}
