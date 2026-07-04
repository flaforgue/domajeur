import { createPersistedStore } from "../../hooks/createPersistedStore";
import { clamp } from "../../lib/math";

export const MIN_BPM = 40;
export const MAX_BPM = 240;
export const MIN_BEATS = 1;
export const MAX_BEATS = 12;

interface MetronomeSettings {
  bpm: number;
  beatsPerMeasure: number;
}

const defaultSettings: MetronomeSettings = {
  bpm: 100,
  beatsPerMeasure: 4,
};

function boundedNumber(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? clamp(Math.round(value), min, max)
    : fallback;
}

export function parseMetronomeSettings(raw: string): MetronomeSettings | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const value = data as Partial<MetronomeSettings>;

  return {
    bpm: boundedNumber(value.bpm, MIN_BPM, MAX_BPM, defaultSettings.bpm),
    beatsPerMeasure: boundedNumber(value.beatsPerMeasure, MIN_BEATS, MAX_BEATS, defaultSettings.beatsPerMeasure),
  };
}

const useMetronomeSettingsStore = createPersistedStore<MetronomeSettings>(
  "domajeur:metronome",
  defaultSettings,
  parseMetronomeSettings,
  (settings) => JSON.stringify(settings),
);

export function useMetronomeSettings(): ReturnType<typeof useMetronomeSettingsStore> {
  return useMetronomeSettingsStore();
}
