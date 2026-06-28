import { Volume2Icon, VolumeXIcon } from "lucide-react";
import { useMuted } from "../../hooks/useMuted";
import { cn } from "../../lib/cn";

export function MuteButton() {
  const [isMuted, setMuted] = useMuted();

  return (
    <button
      type="button"
      aria-label={isMuted ? "Activer le son" : "Couper le son"}
      aria-pressed={isMuted}
      className={cn(
        `
          flex
          cursor-pointer
          items-center
          gap-1.5
          rounded-lg
          border
          px-3
          py-2
          text-sm
          font-semibold
          transition
        `,
        isMuted
          ? `
            border-clay/40
            bg-clay/10
            text-clay
          `
          : `
            border-line
            text-pearl-dim

            hover:text-pearl
          `,
      )}
      onClick={() => {
        setMuted(!isMuted);
      }}
    >
      {isMuted ? <VolumeXIcon width="18" height="18" /> : <Volume2Icon width="18" height="18" />}
      {isMuted && <span className="max-md:hidden">Son coupé</span>}
    </button>
  );
}
