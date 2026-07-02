import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

const sectionTitle = `
  text-xs
  font-semibold
  tracking-widest
  text-pearl-faint
  uppercase
`;

export function SectionTitle({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn(sectionTitle, className)} {...props} />;
}
