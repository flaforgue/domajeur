import { STRINGS } from "../../../lib/music/guitar";
import { namedNoteFromMidi, type Notation } from "../../../lib/music/notation";
import { cn } from "../../../lib/cn";
import { isPositionHighlighted, NATURAL_NECK_POSITIONS, NECK_FRET_COUNT } from "../neckPositions";

interface Props {
  checkedPitchClasses: number[];
  checkedStringIndexes: number[];
  matchedMidi: number | null;
  notation: Notation;
  className?: string;
}

const inlayFrets = [3, 5, 7, 9];
const doubleInlayFret = 12;

export function NeckDiagram({
  checkedPitchClasses,
  checkedStringIndexes,
  matchedMidi,
  notation,
  className = "",
}: Props) {
  const stringGap = 46;
  const fretGap = 50;
  const paddingLeft = 48;
  const paddingRight = 22;
  const paddingTop = 8;
  const paddingBottom = 10;
  const openRowHeight = 36;
  const markerWidth = 40;
  const markerHeight = 22;
  const nutY = paddingTop + openRowHeight;
  const width = paddingLeft + (STRINGS.length - 1) * stringGap + paddingRight;
  const height = nutY + NECK_FRET_COUNT * fretGap + paddingBottom;

  const stringX = (stringIndex: number) => paddingLeft + stringIndex * stringGap;
  const fretY = (fretIndex: number) => nutY + fretIndex * fretGap;
  // Open strings sit above the nut, fretted notes in the middle of their fret.
  const markerY = (fretIndex: number) => (fretIndex === 0 ? nutY - openRowHeight / 2 : fretY(fretIndex) - fretGap / 2);
  const inlayX = (leftStringIndex: number) => stringX(leftStringIndex) + stringGap / 2;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Notes naturelles sur le manche, de la corde à vide à la 12e frette"
    >
      {inlayFrets.map((f) => (
        <circle
          key={`inlay${f}`}
          cx={inlayX(2)}
          cy={fretY(f) - fretGap / 2}
          r={6}
          className="fill-line-soft"
        />
      ))}
      {[1, 3].map((leftStringIndex) => (
        <circle
          key={`inlay${doubleInlayFret}-${leftStringIndex}`}
          cx={inlayX(leftStringIndex)}
          cy={fretY(doubleInlayFret) - fretGap / 2}
          r={6}
          className="fill-line-soft"
        />
      ))}
      {Array.from({ length: NECK_FRET_COUNT + 1 }, (_, f) => (
        <line
          key={`f${f}`}
          x1={stringX(0)}
          y1={fretY(f)}
          x2={stringX(STRINGS.length - 1)}
          y2={fretY(f)}
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
      {STRINGS.map((_, i) => (
        <line
          key={`s${i}`}
          x1={stringX(i)}
          y1={fretY(0)}
          x2={stringX(i)}
          y2={fretY(NECK_FRET_COUNT)}
          className="stroke-pearl-faint"
          strokeWidth={0.7 + (STRINGS.length - 1 - i) * 0.22}
        />
      ))}
      {Array.from({ length: NECK_FRET_COUNT }, (_, idx) => idx + 1).map((f) => (
        <text
          key={`t${f}`}
          x={12}
          y={fretY(f) - fretGap / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn(`
            font-mono
            text-xs
          `, inlayFrets.includes(f) || f === doubleInlayFret ? "fill-pearl-dim" : "fill-pearl-faint/60")}
        >
          {f}
        </text>
      ))}
      {NATURAL_NECK_POSITIONS.map((position) => {
        const { stringIndex, fretIndex, midi } = position;
        const key = `${stringIndex}-${fretIndex}`;
        if (!isPositionHighlighted(position, checkedPitchClasses, checkedStringIndexes)) {
          return (
            <circle
              key={key}
              cx={stringX(stringIndex)}
              cy={markerY(fretIndex)}
              r={4}
              className="fill-pearl-faint/45"
            />
          );
        }

        return (
          <g key={key}>
            <rect
              x={stringX(stringIndex) - markerWidth / 2}
              y={markerY(fretIndex) - markerHeight / 2}
              width={markerWidth}
              height={markerHeight}
              rx={markerHeight / 2}
              className={midi === matchedMidi ? "fill-green" : "fill-brass"}
            />
            <text
              x={stringX(stringIndex)}
              y={markerY(fretIndex)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              className={`
                fill-ebony
                font-mono
                font-semibold
              `}
            >
              {namedNoteFromMidi(midi, notation).name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
