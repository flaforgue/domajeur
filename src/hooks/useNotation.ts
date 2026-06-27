import type { Notation } from "../lib/music/notation";
import { createPersistedStore } from "./createPersistedStore";

function parseNotation(raw: string): Notation | null {
  return raw === "french" || raw === "international" ? raw : null;
}

const useNotationStore = createPersistedStore<Notation>(
  "domajeur:notation",
  "french",
  parseNotation,
  (notation) => notation,
);

export function useNotation(): ReturnType<typeof useNotationStore> {
  return useNotationStore();
}
