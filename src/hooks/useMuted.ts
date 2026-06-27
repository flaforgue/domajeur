import { createPersistedStore } from "./createPersistedStore";

function parseMuted(raw: string): boolean | null {
  if (raw === "true") {
    return true;
  }

  if (raw === "false") {
    return false;
  }

  return null;
}

const useMutedStore = createPersistedStore<boolean>(
  "domajeur:muted",
  true,
  parseMuted,
  (isMuted) => String(isMuted),
);

export function useMuted(): ReturnType<typeof useMutedStore> {
  return useMutedStore();
}
