import { STRINGS } from "../../../lib/music/guitar";
import { pitchClassFromMidi } from "../../../lib/music/notation";
import type { ChordBarre } from "../../../lib/music/chordPositions";

interface ChordNoteLabel {
  name: string;
  role: string;
}

interface Props {
  frets: (number | null)[];
  fingers: (number | null)[];
  barres: ChordBarre[];
  noteLabels: (ChordNoteLabel | null)[];
  rootPitchClass: number;
  maxFret: number;
}

const stringCount = 6;

export function ChordFretboard({ frets, fingers, barres, noteLabels, rootPitchClass, maxFret }: Props) {
  const fretCount = Math.max(5, maxFret);
  const paddingLeft = 34;
  const paddingRight = 78;
  const paddingVertical = 18;
  const rowGap = 22;
  const fretGap = 40;
  const width = paddingLeft + fretCount * fretGap + paddingRight;
  const height = paddingVertical * 2 + (stringCount - 1) * rowGap + 6;

  const stringY = (i: number) => paddingVertical + (stringCount - 1 - i) * rowGap;
  const fretX = (f: number) => paddingLeft + f * fretGap;
  const markerX = (f: number) => (f === 0 ? paddingLeft - 16 : fretX(f) - fretGap / 2);

  const isRootString = (stringIndex: number, fret: number) =>
    pitchClassFromMidi(STRINGS[stringIndex].midi + fret) === rootPitchClass;

  return (
    <svg
      className={`
        mt-1
        w-full
        max-w-md
      `}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Position de l'accord sur le manche"
    >
      {Array.from({ length: fretCount + 1 }, (_, f) => (
        <line
          key={`f${f}`}
          x1={fretX(f)}
          y1={stringY(stringCount - 1)}
          x2={fretX(f)}
          y2={stringY(0)}
          className={f === 0
            ? `
              stroke-pearl-dim
              stroke-3
            `
            : `
              stroke-line
              stroke-1
            `}
        />
      ))}
      {Array.from({ length: stringCount }, (_, i) => (
        <line
          key={`s${i}`}
          x1={fretX(0)}
          y1={stringY(i)}
          x2={fretX(fretCount)}
          y2={stringY(i)}
          className="stroke-pearl-faint"
          strokeWidth={0.7 + (stringCount - 1 - i) * 0.22}
        />
      ))}
      {[3, 5, 7, 9, 12, 15, 17].filter((f) => f <= fretCount).map((f) => (
        <circle
          key={`m${f}`}
          cx={fretX(f) - fretGap / 2}
          cy={(stringY(0) + stringY(stringCount - 1)) / 2}
          r={3}
          className="fill-line"
        />
      ))}
      {Array.from({ length: fretCount }, (_, idx) => idx + 1).map((f) => (
        <text
          key={`t${f}`}
          x={fretX(f) - fretGap / 2}
          y={height - 4}
          className={`
            fill-pearl-faint
            font-mono
            text-xs
          `}
          textAnchor="middle"
        >
          {f}
        </text>
      ))}
      {barres.map((barre) => (
        <line
          key={`b${barre.fret}-${barre.fromString}`}
          x1={markerX(barre.fret)}
          y1={stringY(barre.fromString) + 7}
          x2={markerX(barre.fret)}
          y2={stringY(barre.toString) - 7}
          strokeWidth={14}
          strokeLinecap="round"
          className="stroke-pearl-faint/25"
        />
      ))}
      {frets.map((fret, stringIndex) => {
        if (fret === null) {
          const crossX = paddingLeft - 16;
          const crossY = stringY(stringIndex);
          const crossArm = 6.5;

          return (
            <g
              key={`x${stringIndex}`}
              strokeWidth={2.5}
              strokeLinecap="round"
              className="stroke-pearl-faint"
            >
              <line
                x1={crossX - crossArm}
                y1={crossY - crossArm}
                x2={crossX + crossArm}
                y2={crossY + crossArm}
              />
              <line
                x1={crossX - crossArm}
                y1={crossY + crossArm}
                x2={crossX + crossArm}
                y2={crossY - crossArm}
              />
            </g>
          );
        }

        const isRoot = isRootString(stringIndex, fret);

        if (fret === 0) {
          return (
            <circle
              key={`o${stringIndex}`}
              cx={markerX(0)}
              cy={stringY(stringIndex)}
              r={8}
              strokeWidth={1.5}
              className={isRoot
                ? `
                  fill-none
                  stroke-clay
                `
                : `
                  fill-none
                  stroke-pearl-faint
                `}
            />
          );
        }

        const finger = fingers[stringIndex];

        return (
          <g key={`d${stringIndex}`}>
            <circle
              cx={markerX(fret)}
              cy={stringY(stringIndex)}
              r={9}
              className={isRoot ? "fill-clay" : "fill-pearl-dim"}
            />
            <text
              x={markerX(fret)}
              y={stringY(stringIndex)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              className={`
                fill-ebony
                font-mono
                font-semibold
              `}
            >
              {finger === null || finger === 0 ? "" : String(finger)}
            </text>
          </g>
        );
      })}
      {frets.map((fret, stringIndex) => {
        const label = noteLabels[stringIndex];
        if (fret === null || label === null) {
          return null;
        }

        const labelX = fretX(fretCount) + 10;

        return (
          <g key={`n${stringIndex}`}>
            <text
              x={labelX}
              y={stringY(stringIndex) - 5}
              textAnchor="start"
              dominantBaseline="central"
              fontSize={9}
              className={isRootString(stringIndex, fret)
                ? `
                  fill-clay
                  font-mono
                `
                : `
                  fill-pearl-dim
                  font-mono
                `}
            >
              {label.name}
            </text>
            <text
              x={labelX}
              y={stringY(stringIndex) + 5.5}
              textAnchor="start"
              dominantBaseline="central"
              fontSize={6.5}
              className="fill-pearl-faint"
            >
              {label.role}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
