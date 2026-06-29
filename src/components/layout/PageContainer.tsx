import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(`
        mx-auto
        px-6
        pt-8
        pb-8
      `, className)}
      {...props}
    />
  );
}
