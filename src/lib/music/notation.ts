export type Notation = "french" | "international";
const names: Record<Notation, string[]> = {
  french: ["Do", "Do♯", "Ré", "Ré♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"],
  international: ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"],
};

const semitonesPerOctave = 12;
const a4FrequencyHz = 440;
const a4Midi = 69;

export interface NoteSpelling {
  naturalPitchClass: number;
  alteration: number;
}

const accidentalGlyphs = ["𝄫", "♭", "", "♯", "𝄪"];

export const NATURAL_PITCH_CLASSES = [0, 2, 4, 5, 7, 9, 11];

function defaultSpelling(pitchClass: number): NoteSpelling {
  return NATURAL_PITCH_CLASSES.includes(pitchClass)
    ? { naturalPitchClass: pitchClass, alteration: 0 }
    : { naturalPitchClass: pitchClass - 1, alteration: 1 };
}

export function spellingName(spelling: NoteSpelling, notation: Notation): string {
  return pitchClassName(spelling.naturalPitchClass, notation) + accidentalGlyphs[spelling.alteration + 2];
}

export function spellingFromPitchName(pitchName: string): NoteSpelling {
  const natural = NATURAL_PITCH_CLASSES.find(
    (pitchClass) => pitchName.startsWith(names.french[pitchClass]),
  );
  if (natural === undefined) {
    throw new Error(`Unknown pitch name: ${pitchName}`);
  }

  return {
    naturalPitchClass: natural,
    alteration: accidentalGlyphs.indexOf(pitchName.slice(names.french[natural].length)) - 2,
  };
}

export function pitchClassFromMidi(midi: number): number {
  return ((midi % semitonesPerOctave) + semitonesPerOctave) % semitonesPerOctave;
}

export function pitchClassName(pitchClass: number, notation: Notation): string {
  return names[notation][pitchClass];
}

export function frequencyFromMidi(midi: number): number {
  return a4FrequencyHz * Math.pow(2, (midi - a4Midi) / semitonesPerOctave);
}

export function noteFromFrequency(frequency: number): { midi: number; cents: number } {
  const midiFloat = a4Midi + semitonesPerOctave * Math.log2(frequency / a4FrequencyHz);
  const midi = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midi) * 100);

  return { midi, cents };
}

export interface NamedNote {
  pitchClass: number;
  octave: number;
  baseName: string;
  accidental: string;
  pitchName: string;
  name: string;
}

export function namedNoteFromMidi(midi: number, notation: Notation, spelling?: NoteSpelling): NamedNote {
  const pitchClass = pitchClassFromMidi(midi);
  const { naturalPitchClass: natural, alteration } = spelling ?? defaultSpelling(pitchClass);
  // The octave follows the letter, so Si♯3 and Do4 share MIDI 60.
  const octave = Math.floor((midi - alteration) / semitonesPerOctave) - 1;
  const baseName = pitchClassName(natural, notation);
  const accidental = accidentalGlyphs[alteration + 2];
  const pitchName = baseName + accidental;

  return { pitchClass, octave, baseName, accidental, pitchName, name: `${pitchName}${octave}` };
}
