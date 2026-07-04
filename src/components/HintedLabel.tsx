import type { ReactNode } from "react";
import { InfoIcon } from "lucide-react";
import { HELP_TOOLTIP_ID } from "./HelpTooltip";

interface Props {
  hint: string;
  children: ReactNode;
}

export function HintedLabel({ hint, children }: Props) {
  return (
    <span
      className={`
        flex
        items-center
        gap-1
      `}
    >
      {children}
      <InfoIcon
        width="14"
        height="14"
        className={`
          cursor-help
          text-pearl-faint
        `}
        data-tooltip-id={HELP_TOOLTIP_ID}
        data-tooltip-content={hint}
      />
    </span>
  );
}
