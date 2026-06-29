import { createPersistedStore } from "../../hooks/createPersistedStore";

export interface MetronomeSettings {
  bpm: number;
  beatsPerMeasure: number;
}

const defaultSettings: MetronomeSettings = {
  bpm: 100,
  beatsPerMeasure: 4,
};

function parse(raw: string): MetronomeSettings | null {
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
    bpm: typeof value.bpm === "number" ? value.bpm : defaultSettings.bpm,
    beatsPerMeasure: typeof value.beatsPerMeasure === "number"
      ? value.beatsPerMeasure
      : defaultSettings.beatsPerMeasure,
  };
}

const useMetronomeSettingsStore = createPersistedStore<MetronomeSettings>(
  "domajeur:metronome",
  defaultSettings,
  parse,
  (settings) => JSON.stringify(settings),
);

export function useMetronomeSettings(): ReturnType<typeof useMetronomeSettingsStore> {
  return useMetronomeSettingsStore();
}
