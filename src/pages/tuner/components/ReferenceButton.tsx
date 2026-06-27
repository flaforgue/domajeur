import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

const referenceButton = cn(
  "min-w-16",
  "px-3.5",
  "py-2.5",
  "font-body",
  "font-semibold",
  "text-sm",
  "text-pearl",
  "bg-ebony-3",
  "border",
  "border-line",
  "rounded-lg",
  "cursor-pointer",
  "transition",
  "enabled:hover:text-brass",
  "enabled:hover:border-brass/50",
  "disabled:pointer-events-none",
  "disabled:opacity-40",
);

interface ReferenceButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  isTuned?: boolean;
}

export function ReferenceButton({ isTuned = false, className, ...props }: ReferenceButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        referenceButton,
        isTuned && `
          border-green
          text-green

          enabled:hover:border-green
          enabled:hover:text-green
        `,
        className,
      )}
      {...props}
    />
  );
}
