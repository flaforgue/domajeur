import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const panel = cva(`
  border
  border-line
`, {
  variants: {
    variant: {
      surface: `
        rounded-2xl
        bg-ebony-2
      `,
      display: `
        rounded-3xl
        bg-linear-to-b
        from-ebony-2
        to-rosewood
      `,
    },
  },
  defaultVariants: { variant: "surface" },
});

type PanelProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof panel>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Panel = forwardRef<HTMLDivElement, PanelProps>(({ variant, className, ...props }, ref) => {
  return <div ref={ref} className={cn(panel({ variant }), className)} {...props} />;
});

Panel.displayName = "Panel";
