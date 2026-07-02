import { Tooltip } from "react-tooltip";

export const HELP_TOOLTIP_ID = "help";

const isHoverCapable = window.matchMedia("(hover: hover)").matches;

export function HelpTooltip() {
  if (!isHoverCapable) {
    return null;
  }

  return (
    <Tooltip
      id={HELP_TOOLTIP_ID}
      portalRoot={document.body}
      style={{
        maxWidth: "16rem",
        zIndex: 70,
        background: "var(--color-pearl)",
        color: "var(--color-ebony)",
        borderRadius: "0.5rem",
        fontFamily: "var(--font-body)",
        fontSize: "0.75rem",
        fontWeight: 500,
        lineHeight: "1rem",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.55)",
      }}
    />
  );
}
