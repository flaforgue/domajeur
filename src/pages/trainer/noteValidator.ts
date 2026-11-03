import { createNoteRecognizer } from "../../lib/pitch/noteRecognizer";
import type { Frame } from "../../lib/pitch/pitchEngine";
import type { NoteCandidate } from "../../lib/music/guitar";

export interface NoteValidator {
  processFrame: (frame: Frame, now: number) => boolean;
}

export function createNoteValidator(targetMidi: number): NoteValidator {
  const recognizer = createNoteRecognizer();
  let hasValidated = false;

  return {
    processFrame(frame: Frame, now: number): boolean {
      if (hasValidated) {
        return false;
      }

      hasValidated = recognizer.processFrame(frame, now) === targetMidi;

      return hasValidated;
    },
  };
}

export interface ValidationSession {
  setTarget: (target: NoteCandidate | null) => void;
  processFrame: (frame: Frame, now: number) => boolean;
}

export function createValidationSession(): ValidationSession {
  let target: NoteCandidate | null = null;
  let validator: NoteValidator | null = null;

  return {
    setTarget(next: NoteCandidate | null): void {
      if (next === target) {
        return;
      }

      target = next;
      validator = next === null ? null : createNoteValidator(next.midi);
    },
    processFrame(frame: Frame, now: number): boolean {
      return validator?.processFrame(frame, now) ?? false;
    },
  };
}
