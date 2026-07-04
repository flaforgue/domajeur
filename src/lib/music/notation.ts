export type Notation = "french" | "international";
const names: Record<Notation, string[]> = {
  french: ["Do", "Do♯", "Ré", "Ré♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"],
  international: ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"],
};

const semitonesPerOctave = 12;
const a4FrequencyHz = 440;
const a4Midi = 69;

export interface NoteSpelling {
  natural: number; // pitch class of the letter (0, 2, 4, 5, 7, 9 or 11)
  alteration: number; // semitones added by the accidental, from -2 (𝄫) to 2 (𝄪)
}

const accidentalGlyphs = ["𝄫", "♭", "", "♯", "𝄪"];
const naturalPitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);

function defaultSpelling(pitchClass: number): NoteSpelling {
  return naturalPitchClasses.has(pitchClass)
    ? { natural: pitchClass, alteration: 0 }
    : { natural: pitchClass - 1, alteration: 1 };
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
  const { natural, alteration } = spelling ?? defaultSpelling(pitchClass);
  // The octave follows the letter, so Si♯3 and Do4 share MIDI 60.
  const octave = Math.floor((midi - alteration) / semitonesPerOctave) - 1;
  const baseName = pitchClassName(natural, notation);
  const accidental = accidentalGlyphs[alteration + 2];
  const pitchName = baseName + accidental;

  return { pitchClass, octave, baseName, accidental, pitchName, name: `${pitchName}${octave}` };
}
