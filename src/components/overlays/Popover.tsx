import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ToggleButton } from "../buttons/ToggleButton";

interface Props {
  label: string;
  icon: ReactNode;
  align?: "left" | "right";
  children: ReactNode;
}

export function Popover({ label, icon, align = "left", children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current !== null
        && event.target instanceof Node
        && !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <ToggleButton
        isActive={isOpen}
        aria-label={label}
        variant="ghost"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((wasOpen) => !wasOpen);
        }}
      >
        {icon}
      </ToggleButton>
      {isOpen && (
        <div
          className={cn(
            `
              absolute
              top-full
              z-50
              mt-2
              w-64
            `,
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
