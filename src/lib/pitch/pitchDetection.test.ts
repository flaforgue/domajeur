import { describe, it, expect } from "vitest";
import { PITCH_DETECTION_PARAMS, detectPitch } from "./pitchDetection";

describe("detectPitch", () => {
  const sampleRate = 44100;
  const frameSize = PITCH_DETECTION_PARAMS.nbSamplesPerAnalysisFrame;
  function sineBuffer(frequency: number, amplitude = 0.5): Float32Array {
    const buffer = new Float32Array(frameSize);
    for (let i = 0; i < frameSize; i++) {
      buffer[i] = amplitude * Math.sin((2 * Math.PI * frequency * i) / sampleRate);
    }

    return buffer;
  }

  it.each([110, 220, 440, 660])("detects a clean %i Hz sine", (frequency) => {
    const detection = detectPitch(sineBuffer(frequency), sampleRate);

    expect(Math.abs(detection.frequencyInHertz - frequency)).toBeLessThan(1);
    expect(detection.clarity).toBeGreaterThan(0.95);
  });

  it("reports the RMS of the signal", () => {
    // RMS of a sine of amplitude A is A / sqrt(2).
    const detection = detectPitch(sineBuffer(220, 0.5), sampleRate);
    expect(detection.rootMeanSquare).toBeCloseTo(0.5 / Math.SQRT2, 2);
  });

  it("returns no pitch for silence", () => {
    const detection = detectPitch(new Float32Array(frameSize), sampleRate);
    expect(detection.frequencyInHertz).toBe(-1);
    expect(detection.clarity).toBe(0);
  });

  it("returns no pitch below the RMS gate", () => {
    const tooQuiet = sineBuffer(220, PITCH_DETECTION_PARAMS.minRootMeanSquare / 4);
    expect(detectPitch(tooQuiet, sampleRate).frequencyInHertz).toBe(-1);
  });
});
