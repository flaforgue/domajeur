import { cn } from "../../../lib/cn";
import { clamp } from "../../../lib/math";
import { Flex } from "../../../components/layout/Flex";

const tickPositions = ["20%", "35%", "65%", "80%"];
const centerPercent = 50;
const maxCentsOffset = 50;

interface Props {
  cents: number | null;
  isInTune: boolean;
  toleranceInCents: number;
}

export function Gauge({ cents, isInTune, toleranceInCents }: Props) {
  const needleLeft = cents === null
    ? centerPercent
    : centerPercent + clamp(cents, -maxCentsOffset, maxCentsOffset);

  const inTuneZoneLeft = centerPercent - toleranceInCents;
  const inTuneZoneWidth = 2 * toleranceInCents;

  return (
    <div
      className={`
        w-full
        max-w-sm
      `}
    >
      <div
        className={`
          relative
          h-11
          rounded-lg
          border
          border-line
          bg-ebony-3
        `}
      >
        <span
          className={cn(
            `
              absolute
              top-0
              bottom-0
              rounded-sm
              transition-colors
            `,
            isInTune ? "bg-green/30" : "bg-green/15",
          )}
          style={{ left: `${inTuneZoneLeft}%`, width: `${inTuneZoneWidth}%` }}
        />
        {tickPositions.map((left) => (
          <span
            key={left}
            className={`
              absolute
              top-3.5
              bottom-3.5
              w-px
              bg-line
            `}
            style={{ left }}
          />
        ))}
        <span
          className={`
            absolute
            top-1.5
            bottom-1.5
            left-1/2
            w-0.5
            -translate-x-1/2
            bg-green
          `}
        />
        <div
          className={cn(
            `
              absolute
              top-0.5
              bottom-0.5
              w-1
              -translate-x-1/2
              rounded-sm
              transition-all
              duration-70
              ease-linear
            `,
            isInTune ? "bg-green" : "bg-brass",
          )}
          style={{ left: `${needleLeft}%` }}
        />
      </div>
      <Flex
        justify="between"
        className={`
          mt-1.5
          text-xs
          text-pearl-faint
        `}
      >
        <span>♭ bas</span>
        <span>juste</span>
        <span>haut ♯</span>
      </Flex>
    </div>
  );
}
