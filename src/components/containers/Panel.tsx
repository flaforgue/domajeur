import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const panel = cva(`
  border
  border-line
  shadow-xl
  shadow-black/30
  backdrop-blur-2xl
`, {
  variants: {
    variant: {
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Panel = forwardRef<HTMLDivElement, PanelProps>(({ variant, className, ...props }, ref) => {
  return <div ref={ref} className={cn(panel({ variant }), className)} {...props} />;
});

Panel.displayName = "Panel";
