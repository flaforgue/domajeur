import { useEffect } from "react";
import { usePitch } from "../hooks/usePitch";
import { Button } from "./buttons/Button";
import { Panel } from "./containers/Panel";

type Platform = "ios" | "android" | "other";

const resetSteps: Record<Platform, string[]> = {
  ios: [
    "Touche « aA » (ou l'icône à gauche de l'adresse).",
    "Ouvre « Réglages du site web », puis « Microphone ».",
    "Choisis « Autoriser » ou « Demander », puis recharge la page.",
  ],
  android: [
    "Ouvre les paramètres du navigateur puis «  Paramètres des sites ».",
    "Sélectionne « Micro » puis « Les sites peuvent demander à utiliser votre micro ».",
    "Si nécessaire, autoriser également l'accès au micro depuis les paramètres Android de l'application Chrome.",
    "Enfin, rechargez la page et acceptez l'accès au micro.",
  ],
  other: [
    "Ouvre les autorisations du site afin d'autoriser l'accès au micro.",
    "Recharge la page.",
  ],
};

function detectPlatform(): Platform {
  const userAgent = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return "ios";
  }

  if (userAgent.includes("Android")) {
    return "android";
  }

  return "other";
}

export function StartGate() {
  const { engine, start, error, isPermissionDenied } = usePitch();

  useEffect(() => {
    engine.checkPermission();
  }, [engine]);

  return (
    <div
      className={`
        fixed
        inset-x-0
        top-20
        bottom-0
        z-50
        grid
        place-items-center
        bg-ebony/75
        p-6
        backdrop-blur-sm
      `}
    >
      <Panel
        className={`
          max-w-md
          px-8
          py-9
          text-center
          shadow-2xl
        `}
      >
        <div
          className={`
            mb-1.5
            text-4xl
            text-brass
          `}
          aria-hidden="true"
        >
          ♩
        </div>
        <h2
          className={`
            mt-0
            mb-2
            text-2xl
          `}
        >
          Autorisation nécessaire
        </h2>

        {isPermissionDenied
          ? (
            <>
              <p
                className={`
                  mt-0
                  mb-4
                  text-sm
                  leading-normal
                  text-pearl-dim
                `}
              >
                L&apos;accès au micro est bloqué. Réactive-le dans les réglages, puis recharge&nbsp;:
              </p>
              <ol
                className={`
                  mb-5
                  flex
                  list-none
                  flex-col
                  gap-2
                  text-left
                  text-sm
                  leading-normal
                  text-pearl-dim
                `}
              >
                {resetSteps[detectPlatform()].map((step, index) => (
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
              <Button
                onClick={() => {
                  window.location.reload();
                }}
              >
                Recharger la page
              </Button>
            </>
          )
          : (
            <>
              <p
                className={`
                  mt-0
                  mb-4
                  text-sm
                  leading-normal
                  text-pearl-dim
                `}
              >
                L&apos;accès au micro est requis pour que l&apos;application puisse valider les notes que tu joues.
              </p>
              <Button
                onClick={() => {
                  start().catch(() => undefined);
                }}
              >
                Activer le micro
              </Button>
              {error !== null && (
                <p
                  className={`
                    mt-4
                    mb-0
                    text-sm
                    leading-normal
                    text-clay
                  `}
                >
                  {error}
                </p>
              )}
            </>
          )}
      </Panel>
    </div>
  );
}
