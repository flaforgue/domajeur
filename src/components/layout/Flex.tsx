import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const flex = cva("flex", {
  variants: {
    direction: {
      row: "",
      col: "flex-col",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    isWrapping: {
      true: "flex-wrap",
      false: "",
    },
  },
  defaultVariants: {
    direction: "row",
  },
});

type Gap = 0 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8;
const gapClasses = new Map<Gap, string>([
  [0, "gap-0"],
  [1, "gap-1"],
  [1.5, "gap-1.5"],
  [2, "gap-2"],
  [2.5, "gap-2.5"],
  [3, "gap-3"],
  [3.5, "gap-3.5"],
  [4, "gap-4"],
  [5, "gap-5"],
  [6, "gap-6"],
  [7, "gap-7"],
  [8, "gap-8"],
]);

type FlexProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof flex> & { gap?: Gap };

export function Flex({ direction, align, justify, isWrapping, gap, className, ...props }: FlexProps) {
  return (
    <div
      className={cn(
        flex({ direction, align, justify, isWrapping }),
        gap !== undefined && gapClasses.get(gap),
        className,
      )}
      {...props}
    />
  );
}
