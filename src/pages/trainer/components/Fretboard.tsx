import type { ScaleMarker, StringPosition } from "../../../lib/music/guitar";

interface Props {
  pos: StringPosition;
  altPositions?: StringPosition[];
  scaleNotes?: ScaleMarker[];
  maxFret: number;
}

const stringCount = 6;

export function Fretboard({ pos, altPositions = [], scaleNotes = [], maxFret }: Props) {
  const frets = Math.max(5, maxFret);
  const paddingLeft = 34;
  const paddingRight = 18;
  const paddingVertical = 18;
  const rowGap = 22;
  const fretGap = 40;
  const width = paddingLeft + frets * fretGap + paddingRight;
  const height = paddingVertical * 2 + (stringCount - 1) * rowGap + 6;

  const stringY = (i: number) => paddingVertical + (stringCount - 1 - i) * rowGap;
  const fretX = (f: number) => paddingLeft + f * fretGap;
  const markerX = (p: StringPosition) => (p.fretIndex === 0 ? paddingLeft - 16 : fretX(p.fretIndex) - fretGap / 2);
  const markerY = (p: StringPosition) => stringY(p.stringIndex);

  return (
    <svg
      className={`
        mt-1
        w-full
        max-w-md
      `}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Position sur le manche"
    >
      {Array.from({ length: frets + 1 }, (_, f) => (
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
          x2={fretX(frets)}
          y2={stringY(i)}
          className="stroke-pearl-faint"
          strokeWidth={0.7 + (stringCount - 1 - i) * 0.22}
        />
      ))}
      {[3, 5, 7, 9, 12, 15, 17].filter((f) => f <= frets).map((f) => (
        <circle
          key={`m${f}`}
          cx={fretX(f) - fretGap / 2}
          cy={(stringY(0) + stringY(stringCount - 1)) / 2}
          r={3}
          className="fill-line"
        />
      ))}
      {Array.from({ length: frets }, (_, idx) => idx + 1).map((f) => (
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
      {scaleNotes.map((scaleNote) => (
        <circle
          key={`scale-${scaleNote.stringIndex}-${scaleNote.fretIndex}`}
          cx={markerX(scaleNote)}
          cy={markerY(scaleNote)}
          r={scaleNote.isRoot ? 7 : 5.5}
          strokeWidth={1.5}
          className={scaleNote.isRoot
            ? `
              fill-clay
              stroke-clay
            `
            : `
              fill-pearl-faint/25
              stroke-pearl-faint/50
            `}
        />
      ))}
      {altPositions.map((altPosition) => (
        <circle
          key={`alt-${altPosition.stringIndex}-${altPosition.fretIndex}`}
          cx={markerX(altPosition)}
          cy={markerY(altPosition)}
          r={7}
          strokeWidth={1.5}
          className={`
            fill-brass/20
            stroke-brass/55
          `}
        />
      ))}
      <circle
        cx={markerX(pos)}
        cy={markerY(pos)}
        r={9}
        className="fill-brass"
      />
      <circle
        cx={markerX(pos)}
        cy={markerY(pos)}
        r={9}
        className={`
          origin-center
          animate-fret-pulse
          fill-none
          stroke-brass
          stroke-2
          transform-fill
        `}
      />
    </svg>
  );
}
