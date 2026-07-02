import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const chipButton = cva(
  `
    cursor-pointer
    rounded-lg
    border
    bg-ebony-2
    text-center
    font-body
    text-sm
    font-semibold
    transition-colors

    disabled:cursor-not-allowed
    disabled:opacity-40
  `,
  {
    variants: {
      tone: {
        default: `
          border-line
          text-pearl-dim

          enabled:hover:border-brass
          enabled:hover:text-brass
        `,
        active: `
          border-brass/50
          text-brass
        `,
        success: `
          border-green/40
          text-green

          enabled:hover:border-green
        `,
      },
    },
    defaultVariants: { tone: "default" },
  },
);

type ChipButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & VariantProps<typeof chipButton>;

export function ChipButton({ tone, className, ...props }: ChipButtonProps) {
  return <button type="button" className={cn(chipButton({ tone }), className)} {...props} />;
}
