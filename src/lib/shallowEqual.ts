export function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  const recordA = a as Record<string, unknown>;
  const recordB = b as Record<string, unknown>;
  const keys = Object.keys(recordA);
  if (keys.length !== Object.keys(recordB).length) {
    return false;
  }

  return keys.every((key) => recordA[key] === recordB[key]);
}
