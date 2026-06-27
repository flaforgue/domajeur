import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const toggleButton = cva(
  `
    flex-none
    cursor-pointer
    rounded-lg
    border
    px-3
    py-2
    font-body
    text-xs
    font-semibold
    transition
  `,
  {
    variants: {
      variant: {
        default: "",
        ghost: "",
      },
      isActive: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "default", isActive: true, class: `
        border-transparent
        bg-brass
        text-ebony
      ` },
      { variant: "default", isActive: false, class: `
        border-line
        bg-ebony-2
        text-pearl-dim

        hover:border-pearl/28
        hover:text-pearl
      ` },
      { variant: "ghost", isActive: true, class: `
        border-brass
        bg-transparent
        text-brass
      ` },
      { variant: "ghost", isActive: false, class: `
        border-line
        bg-transparent
        text-pearl

        enabled:hover:border-pearl/30
      ` },
    ],
    defaultVariants: { variant: "default", isActive: false },
  },
);

type ToggleButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & VariantProps<typeof toggleButton>;

export function ToggleButton({ variant, isActive, className, ...props }: ToggleButtonProps) {
  return (
    <button
      type="button"
      className={cn(toggleButton({ variant, isActive }), className)}
      {...props}
    />
  );
}
