import { cn } from "../lib/cn";
import { clamp } from "../lib/math";

interface Props {
  label: string;
  value: number; // 0..1
  fillClassName: string;
  isStacked?: boolean;
}

export function Meter({ label, value, fillClassName, isStacked = false }: Props) {
  const percent = Math.round(clamp(value, 0, 1) * 100);

  return (
    <div
      className={cn(
        `
          grid
          items-center
          gap-x-2.5
        `,
        isStacked
          ? `
            grid-cols-[1fr_auto]
            gap-y-1.5
          `
          : "grid-cols-[7rem_1fr_3rem]",
      )}
    >
      <span
        className={`
          text-xs
          text-pearl-faint
        `}
      >
        {label}
      </span>
      <div
        className={cn(`
          h-2
          overflow-hidden
          rounded-sm
          bg-ebony-3
        `, isStacked && `
          col-span-2
          row-start-2
        `)}
      >
        <div
          className={cn(`
            h-full
            rounded-sm
            transition-all
            duration-80
            ease-linear
          `, fillClassName)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span
        className={`
          text-right
          font-mono
          text-xs
          text-pearl-dim
        `}
      >
        {percent}
        {" "}
        %
      </span>
    </div>
  );
}
