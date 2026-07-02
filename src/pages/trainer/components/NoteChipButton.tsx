import type { ButtonHTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

const noteChipButton = cva(
  `
    w-18
    cursor-pointer
    rounded-lg
    border
    bg-ebony-2
    py-2
    text-center
    font-body
    text-sm
    font-semibold
    transition-colors
  `,
  {
    variants: {
      tone: {
        default: `
          border-line
          text-pearl-dim

          hover:border-brass
          hover:text-brass
        `,
        validated: `
          border-green/40
          text-green

          hover:border-green
        `,
        active: `
          border-brass/50
          text-brass
        `,
      },
    },
    defaultVariants: { tone: "default" },
  },
);

interface NoteChipButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  isActive?: boolean;
  isValidated?: boolean;
}

export function NoteChipButton({
  isActive = false,
  isValidated = false,
  className,
  ...props
}: NoteChipButtonProps) {
  const tone = isActive ? "active" : isValidated ? "validated" : "default";

  return <button type="button" className={cn(noteChipButton({ tone }), className)} {...props} />;
}
