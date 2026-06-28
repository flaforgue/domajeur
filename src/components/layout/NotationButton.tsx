import { GlobeIcon, MusicIcon } from "lucide-react";
import { useNotation } from "../../hooks/useNotation";

export function NotationButton() {
  const [notation, setNotation] = useNotation();
  const isInternational = notation === "international";

  return (
    <button
      type="button"
      aria-label="Changer la notation des notes"
      aria-pressed={isInternational}
      className={`
        flex
        cursor-pointer
        items-center
        gap-1.5
        rounded-lg
        border
        border-line
        px-3
        py-2
        text-sm
        font-semibold
        text-pearl-dim
        transition

        hover:text-pearl
      `}
      onClick={() => {
        setNotation(isInternational ? "french" : "international");
      }}
    >
      {isInternational ? <GlobeIcon width="18" height="18" /> : <MusicIcon width="18" height="18" />}
      {isInternational ? "C D E" : "Do Ré Mi"}
    </button>
  );
}
