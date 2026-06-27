export const IN_TUNE_TOLERANCE_CENTS = 5;

export function isInTune(cents: number): boolean {
  return Math.abs(cents) <= IN_TUNE_TOLERANCE_CENTS;
}
