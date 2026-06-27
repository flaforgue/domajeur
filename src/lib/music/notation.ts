export type Notation = "french" | "international";
const names: Record<Notation, string[]> = {
  french: ["Do", "Do♯", "Ré", "Ré♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"],
  international: ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"],
};

const semitonesPerOctave = 12;
const a4FrequencyHz = 440;
const a4Midi = 69;

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

export interface NamedNote { pitchClass: number; octave: number; name: string }

export function namedNoteFromMidi(midi: number, notation: Notation): NamedNote {
  const pitchClass = pitchClassFromMidi(midi);
  const octave = Math.floor(midi / semitonesPerOctave) - 1;

  return { pitchClass, octave, name: `${pitchClassName(pitchClass, notation)}${octave}` };
}
