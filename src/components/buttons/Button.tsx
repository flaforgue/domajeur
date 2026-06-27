import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const button = cva(
  `
    cursor-pointer
    rounded-lg
    border
    font-body
    font-semibold
    transition

    disabled:cursor-not-allowed
    disabled:opacity-45
  `,
  {
    variants: {
      variant: {
        primary: `
          border-transparent
          bg-brass
          px-3
          py-2
          text-base
          text-ebony

          enabled:hover:bg-brass-soft
        `,
        ghost: `
          border-line
          bg-transparent
          px-3
          py-2
          text-sm
          text-pearl

          enabled:hover:border-pearl/30
        `,
        next: `
          min-w-38
          flex-1
          px-3
          py-2
          text-sm
        `,
        icon: `
          grid
          h-10
          w-10
          place-items-center
          rounded-full
          border-line
          bg-ebony-3
          text-pearl-dim

          enabled:hover:border-brass/50
          enabled:hover:text-brass

          disabled:opacity-40
        `,
      },
      isDone: { true: "", false: "" },
    },
    compoundVariants: [
      { variant: "next", isDone: false, class: `
        border-line
        bg-ebony-3
        text-pearl

        enabled:hover:border-pearl/30
      ` },
      { variant: "next", isDone: true, class: `
        border-transparent
        bg-green
        text-ebony
      ` },
    ],
    defaultVariants: { variant: "primary", isDone: false },
  },
);

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & VariantProps<typeof button>;

export function Button({ variant, isDone, className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(button({ variant, isDone }), className)}
      {...props}
    />
  );
}
