import { useEffect, useRef, useState } from "react";
import { DownloadIcon } from "lucide-react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { Panel } from "../Panel";

const manualInstallSteps = [
  "Toucher « Partager » dans la barre du navigateur.",
  "Choisir « Sur l'écran d'accueil ».",
];

export function InstallButton() {
  const { isInstallable, isManualInstall, promptInstall } = useInstallPrompt();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGuideOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && containerRef.current?.contains(event.target) === true) {
        return;
      }
      setIsGuideOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isGuideOpen]);

  if (!isInstallable) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Installer l'application"
        aria-expanded={isManualInstall ? isGuideOpen : undefined}
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
          if (isManualInstall) {
            setIsGuideOpen((isOpen) => !isOpen);
          } else {
            promptInstall();
          }
        }}
      >
        <DownloadIcon width="18" height="18" />
        <span className="max-md:hidden">Installer</span>
      </button>
      {isGuideOpen && (
        <Panel
          className={`
            absolute
            top-full
            right-0
            z-40
            mt-2
            w-66
            px-4
            py-3.5

            max-md:top-auto
            max-md:bottom-full
            max-md:mt-0
            max-md:mb-2
          `}
        >
          <ol
            className={`
              m-0
              flex
              list-none
              flex-col
              gap-2
              p-0
              text-left
              text-sm
              leading-normal
              text-pearl-dim
            `}
          >
            {manualInstallSteps.map((step, index) => (
              <li
                key={step}
                className={`
                  flex
                  gap-2.5
                `}
              >
                <span
                  className={`
                    flex
                    size-5
                    flex-none
                    items-center
                    justify-center
                    rounded-full
                    bg-brass/20
                    text-xs
                    font-semibold
                    text-brass
                  `}
                >
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </div>
  );
}
