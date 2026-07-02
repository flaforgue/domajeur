import { describe, expect, it } from "vitest";
import { isInTune } from "./tuning";

describe("isInTune", () => {
  it.each([
    [0, true],
    [5, true],
    [-5, true],
    [6, false],
    [-6, false],
  ])("reports %i cents as %s", (cents, shouldBeInTune) => {
    const isNoteInTune = isInTune(cents);

    expect(isNoteInTune).toBe(shouldBeInTune);
  });
});
