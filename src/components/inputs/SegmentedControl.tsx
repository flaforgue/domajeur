import { cn } from "../../lib/cn";
import { Flex } from "../layout/Flex";

interface Segment {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string;
  options: Segment[];
  onChange: (value: string) => void;
}

export function SegmentedControl({ label, value, options, onChange }: Props) {
  return (
    <Flex
      gap={1}
      role="group"
      aria-label={label}
      className={`
        rounded-xl
        border
        border-line
        bg-ebony-2
        p-1
      `}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            className={cn(
              `
                flex-1
                cursor-pointer
                rounded-lg
                px-3
                py-1.5
                font-body
                text-xs
                font-semibold
                transition
              `,
              isActive
                ? `
                  bg-brass
                  text-ebony
                `
                : `
                  text-pearl-dim

                  enabled:hover:text-pearl
                `,
            )}
            onClick={() => {
              onChange(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </Flex>
  );
}
