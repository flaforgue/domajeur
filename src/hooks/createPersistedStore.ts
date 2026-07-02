import { useSyncExternalStore } from "react";

export function createPersistedStore<T>(
  storageKey: string,
  fallback: T,
  parse: (raw: string) => T | null,
  serialize: (value: T) => string,
): () => readonly [T, (next: T) => void] {
  let value: T | null = null;
  const listeners = new Set<() => void>();

  function read(): T {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw === null ? null : parse(raw);
      if (parsed !== null) {
        return parsed;
      }
    } catch (error) {
      console.error(`Failed to read stored "${storageKey}"`, error);
    }

    return fallback;
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function getSnapshot(): T {
    value ??= read();

    return value;
  }

  function setValue(next: T): void {
    const serialized = serialize(next);
    if (serialized === serialize(getSnapshot())) {
      return;
    }

    value = next;
    try {
      window.localStorage.setItem(storageKey, serialized);
    } catch (error) {
      console.error(`Failed to write stored "${storageKey}"`, error);
    }
    listeners.forEach((listener) => {
      listener();
    });
  }

  return function useStore(): readonly [T, (next: T) => void] {
    return [useSyncExternalStore(subscribe, getSnapshot), setValue];
  };
}
