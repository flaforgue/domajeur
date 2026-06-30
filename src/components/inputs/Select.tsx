import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface Option {
  value: string;
  label: string;
}

interface Anchor {
  top: number;
  left: number;
  width: number;
}

interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

export function Select({ label, value, options, onChange, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const baseId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedLabel = selectedIndex >= 0 ? options[selectedIndex].label : "";

  function updateAnchor(): void {
    const button = buttonRef.current;
    if (button !== null) {
      const rect = button.getBoundingClientRect();
      setAnchor({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }

  function open(): void {
    updateAnchor();
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  }

  function commit(index: number): void {
    onChange(options[index].value);
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  // Reposition the (portaled) list with the trigger, and close on outside click.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (containerRef.current?.contains(target) === true || listRef.current?.contains(target) === true) {
        return;
      }
      setIsOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", updateAnchor, true);
    window.addEventListener("resize", updateAnchor);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", updateAnchor, true);
      window.removeEventListener("resize", updateAnchor);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current !== null) {
      const item = listRef.current.children[highlightedIndex];
      if (item instanceof HTMLElement) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, highlightedIndex]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    if (event.key === "Escape") {
      setIsOpen(false);

      return;
    }

    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setHighlightedIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setHighlightedIndex(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(highlightedIndex);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        aria-activedescendant={isOpen ? `${baseId}-${highlightedIndex}` : undefined}
        className={`
          flex
          w-full
          cursor-pointer
          items-center
          justify-between
          gap-2
          rounded-lg
          border
          border-line
          bg-ebony-2
          py-2
          pr-2.5
          pl-3
          text-sm
          text-pearl
          transition

          hover:border-pearl/28
        `}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            open();
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDownIcon
          width="16"
          height="16"
          className={`
            shrink-0
            text-pearl-dim
          `}
        />
      </button>
      {isOpen && anchor !== null && createPortal(
        <ul
          ref={listRef}
          role="listbox"
          aria-label={label}
          style={{ position: "fixed", top: anchor.top, left: anchor.left, minWidth: anchor.width, zIndex: 70 }}
          className={`
            max-h-64
            overflow-y-auto
            rounded-lg
            border
            border-line
            bg-ebony-2
            p-1
            shadow-xl
            shadow-black/30
          `}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <li
                key={option.value}
                id={`${baseId}-${index}`}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  `
                    flex
                    cursor-pointer
                    items-center
                    justify-between
                    gap-2
                    rounded-md
                    px-2.5
                    py-1.5
                    text-sm
                  `,
                  index === highlightedIndex && "bg-ebony-3",
                  isSelected ? "text-brass" : "text-pearl",
                )}
                onMouseMove={() => {
                  setHighlightedIndex(index);
                }}
                onClick={() => {
                  commit(index);
                }}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <CheckIcon width="14" height="14" className="shrink-0" />}
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </div>
  );
}
