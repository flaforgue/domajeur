import { cn } from "../lib/cn";
import { Flex } from "./layout/Flex";

interface Props {
  label: string;
  value: number; // 0..1
  fillClassName: string;
}

export function Meter({ label, value, fillClassName }: Props) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);

  return (
    <Flex align="center" gap={2.5}>
      <span
        className={`
          w-28
          shrink-0
          text-xs
          text-pearl-faint
        `}
      >
        {label}
      </span>
      <div
        className={`
          h-2
          flex-1
          overflow-hidden
          rounded-sm
          bg-ebony-3
        `}
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
          w-12
          shrink-0
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
    </Flex>
  );
}
