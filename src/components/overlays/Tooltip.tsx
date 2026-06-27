import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface Props {
  label: string;
  className?: string;
  children: ReactNode;
}

export function Tooltip({ label, className, children }: Props) {
  return (
    <span className={cn("group", "relative", "inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={`
          pointer-events-none
          absolute
          bottom-full
          left-1/2
          z-50
          mb-2
          -translate-x-1/2
          rounded-md
          border
          border-line
          bg-ebony-3
          px-2.5
          py-1.5
          text-xs
          whitespace-nowrap
          text-pearl
          opacity-0
          transition

          group-hover:opacity-100
        `}
      >
        {label}
      </span>
    </span>
  );
}
