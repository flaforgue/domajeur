import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const panel = cva(`
  border
  border-line
  shadow-xl
  shadow-black/30
  backdrop-blur-2xl
`, {
  variants: {
    variant: {
      plain: `
        rounded-2xl
        bg-ebony
      `,
      surface: `
        rounded-2xl
        bg-ebony-2/55
      `,
      display: `
        rounded-3xl
        bg-ebony-2/45
      `,
    },
  },
  defaultVariants: { variant: "surface" },
});

type PanelProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof panel>;

export function Panel({ variant, className, ...props }: PanelProps) {
  return <div className={cn(panel({ variant }), className)} {...props} />;
}
