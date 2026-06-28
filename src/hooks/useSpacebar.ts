import { useEffect, useRef } from "react";

function isInteractive(element: HTMLElement): boolean {
  const tag = element.tagName;

  return tag === "INPUT"
    || tag === "TEXTAREA"
    || tag === "SELECT"
    || tag === "BUTTON"
    || element.isContentEditable;
}

export function useSpacebar(onPress: () => void): void {
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) {
        return;
      }
      if (event.target instanceof HTMLElement && isInteractive(event.target)) {
        return;
      }

      event.preventDefault();
      onPressRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
