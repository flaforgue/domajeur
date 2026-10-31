import { useId } from "react";
import { InfoIcon } from "lucide-react";
import { cn } from "../lib/cn";
import { FingerLegend } from "./FingerLegend";
import { HelpTooltip } from "./HelpTooltip";

interface Props {
  className?: string;
}

export function FingerLegendHint({ className }: Props) {
  const tooltipId = useId();

  return (
    <>
      <InfoIcon
        width="16"
        height="16"
        aria-label="Numérotation des doigts de la main gauche"
        className={cn(`
          cursor-help
          text-pearl-faint
        `, className)}
        data-tooltip-id={tooltipId}
      />
      <HelpTooltip id={tooltipId}>
        <FingerLegend surface="light" />
      </HelpTooltip>
    </>
  );
}
