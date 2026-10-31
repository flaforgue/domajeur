import type { ReactNode } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface Props {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function Checkbox({ isChecked, onChange, children, className = "" }: Props) {
  return (
    <label
      className={cn(`
        flex
        cursor-pointer
        items-center
        gap-2.5
        text-sm
        text-pearl-dim
      `, className)}
    >
      <input
        type="checkbox"
        className={`
          peer
          sr-only
        `}
        checked={isChecked}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
      />
      <span
        className={`
          grid
          size-5
          flex-none
          place-items-center
          rounded-md
          border
          border-line
          bg-ebony-2
          text-ebony
          transition-colors

          peer-checked:border-brass
          peer-checked:bg-brass

          peer-focus-visible:outline-2
          peer-focus-visible:outline-offset-2
          peer-focus-visible:outline-brass
        `}
      >
        {isChecked && <CheckIcon width="14" height="14" strokeWidth={3} />}
      </span>
      <span className="peer-checked:text-pearl">{children}</span>
    </label>
  );
}
