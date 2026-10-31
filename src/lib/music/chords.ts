import {
  NATURAL_PITCH_CLASSES,
  pitchClassFromMidi,
  spellingName,
  type Notation,
  type NoteSpelling,
} from "./notation";

export type ChordQuality = "major" | "minor" | "diminished" | "augmented";

interface ChordFamily {
  label: string;
  suffix: string;
  altSuffix?: string;
  steps: [number, number];
  thirdLabel: string;
  fifthLabel: string;
  character: string;
}

const families: Record<ChordQuality, ChordFamily> = {
  major: {
    label: "Majeur",
    suffix: "",
    steps: [4, 3],
    thirdLabel: "Tierce majeure",
    fifthLabel: "Quinte juste",
    character: "Son stable et lumineux.",
  },
  minor: {
    label: "Mineur",
    suffix: "m",
    steps: [3, 4],
    thirdLabel: "Tierce mineure",
    fifthLabel: "Quinte juste",
    character: "Son sombre — seule la tierce change par rapport au majeur.",
  },
  diminished: {
    label: "Diminué",
    suffix: "dim",
    altSuffix: "°",
    steps: [3, 3],
    thirdLabel: "Tierce mineure",
    fifthLabel: "Quinte diminuée",
    character: "Son tendu, instable — il appelle une résolution.",
  },
  augmented: {
    label: "Augmenté",
    suffix: "aug",
    altSuffix: "+",
    steps: [4, 4],
    thirdLabel: "Tierce majeure",
    fifthLabel: "Quinte augmentée",
    character: "Son en suspens — aucune quinte juste pour le stabiliser.",
  },
};

export const CHORD_QUALITIES = Object.keys(families) as ChordQuality[];

export function isChordQuality(value: unknown): value is ChordQuality {
  return CHORD_QUALITIES.includes(value as ChordQuality);
}

export function chordFamily(quality: ChordQuality): ChordFamily {
  return families[quality];
}

export function chordFormula(quality: ChordQuality): string {
  return ["f", ...families[quality].steps].join(" + ");
}

function intervalSpelling(root: NoteSpelling, letterSteps: number, semitones: number): NoteSpelling {
  const letterIndex = NATURAL_PITCH_CLASSES.indexOf(root.naturalPitchClass);
  const naturalPitchClass = NATURAL_PITCH_CLASSES[(letterIndex + letterSteps) % NATURAL_PITCH_CLASSES.length];
  const targetPitchClass = root.naturalPitchClass + root.alteration + semitones;
  const alteration = ((targetPitchClass - naturalPitchClass + 18) % 12) - 6;

  return { naturalPitchClass, alteration };
}

export interface ChordTone {
  pitchClass: number;
  spelling: NoteSpelling;
  roleLabel: string;
}

export function chordTones(root: NoteSpelling, quality: ChordQuality): ChordTone[] {
  const family = families[quality];
  const tones: { spelling: NoteSpelling; roleLabel: string }[] = [
    { spelling: root, roleLabel: "Fondamentale" },
    { spelling: intervalSpelling(root, 2, family.steps[0]), roleLabel: family.thirdLabel },
    { spelling: intervalSpelling(root, 4, family.steps[0] + family.steps[1]), roleLabel: family.fifthLabel },
  ];

  return tones.map(({ spelling, roleLabel }) => ({
    pitchClass: pitchClassFromMidi(spelling.naturalPitchClass + spelling.alteration),
    spelling,
    roleLabel,
  }));
}

export function chordName(root: NoteSpelling, quality: ChordQuality, notation: Notation): string {
  return `${spellingName(root, notation)} ${families[quality].label.toLowerCase()}`;
}

export function chordSymbol(root: NoteSpelling, quality: ChordQuality): string {
  return spellingName(root, "international") + families[quality].suffix;
}

export function chordAltSymbol(root: NoteSpelling, quality: ChordQuality): string | null {
  const altSuffix = families[quality].altSuffix;

  return altSuffix === undefined ? null : spellingName(root, "international") + altSuffix;
}
