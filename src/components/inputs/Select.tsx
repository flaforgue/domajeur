import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

export function Select({ label, value, options, onChange, className }: Props) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-label={label}
        value={value}
        className={`
          w-full
          cursor-pointer
          appearance-none
          rounded-lg
          border
          border-line
          bg-ebony-2
          py-2
          pr-9
          pl-3
          font-body
          text-sm
          text-pearl
          transition

          hover:border-pearl/28
        `}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        width="16"
        height="16"
        className={`
          pointer-events-none
          absolute
          top-1/2
          right-2.5
          -translate-y-1/2
          text-pearl-dim
        `}
      />
    </div>
  );
}
