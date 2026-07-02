import { noteFromFrequency } from "../music/notation";
import { PITCH_DETECTION_PARAMS } from "./pitchDetection";
import type { Frame } from "./pitchEngine";

export interface DetectedNote {
  midi: number;
  cents: number;
}

export function detectedNoteFromFrame(frame: Frame): DetectedNote | null {
  if (
    frame.isRefPlaying
    || frame.frequencyInHertz <= 0
    || frame.clarity < PITCH_DETECTION_PARAMS.minClarity
  ) {
    return null;
  }

  return noteFromFrequency(frame.frequencyInHertz);
}
