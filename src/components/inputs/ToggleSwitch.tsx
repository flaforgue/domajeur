import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface Props {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function ToggleSwitch({ isChecked, onChange, children, className = "" }: Props) {
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
          relative
          h-6
          w-10
          flex-none
          rounded-full
          bg-line
          transition-all
          duration-200

          peer-checked:bg-brass

          after:absolute
          after:top-1
          after:left-1
          after:h-4
          after:w-4
          after:rounded-full
          after:bg-pearl
          after:transition-all
          after:duration-200
          after:content-['']

          peer-checked:after:translate-x-4
          peer-checked:after:bg-ebony
        `}
      />
      {children}
    </label>
  );
}
