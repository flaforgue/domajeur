import { useEffect } from "react";
import { MicIcon, MicOffIcon } from "lucide-react";
import { usePitch } from "../hooks/usePitch";
import { Button } from "./buttons/Button";
import { Panel } from "./Panel";
import { Flex } from "./layout/Flex";

type Platform = "ios" | "android" | "other";

const resetSteps: Record<Platform, string[]> = {
  ios: [
    "Toucher « aA » (ou l'icône à gauche de l'adresse).",
    "Ouvrir « Réglages du site web », puis « Microphone ».",
    "Choisir « Autoriser » ou « Demander », puis recharger la page.",
  ],
  android: [
    "Ouvrir les paramètres du navigateur puis «  Paramètres des sites ».",
    "Sélectionner « Micro » puis « Les sites peuvent demander à utiliser votre micro ».",
    "Si nécessaire, autoriser également l'accès au micro depuis les paramètres Android de l'application Chrome.",
    "Enfin, recharger la page et accepter l'accès au micro.",
  ],
  other: [
    "Ouvrir les autorisations du site afin d'autoriser l'accès au micro.",
    "Recharger la page.",
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

interface Props {
  feature: string;
  title?: string;
}

export function MicPrompt({ feature, title = "Micro nécessaire" }: Props) {
  const { engine, start, error, isStarted, isPermissionDenied } = usePitch();

  useEffect(() => {
    engine.checkPermission();
  }, [engine]);

  if (isStarted) {
    return null;
  }

  const panel = (
    <Panel
      variant="plain"
      className={`
        flex
        max-w-md
        flex-col
        items-center
        gap-3
        border-brass/35
        px-6
        py-6
        text-center
        shadow-2xl
      `}
    >
      <Flex
        align="center"
        gap={2}
        className={`
          font-display
          text-lg
          font-semibold
          text-pearl
        `}
      >
        {isPermissionDenied
          ? <MicOffIcon width="20" height="20" className="text-clay" />
          : <MicIcon width="20" height="20" className="text-brass" />}
        {title}
      </Flex>

      <p
        className={`
          mt-0
          mb-1
          max-w-sm
          text-sm
          leading-normal
          text-pearl-dim
        `}
      >
        {feature}
      </p>

      {isPermissionDenied
        ? (
          <>
            <p
              className={`
                mt-0
                mb-1
                text-sm
                leading-normal
                text-pearl-dim
              `}
            >
              L&apos;accès au micro est bloqué par le navigateur. Réactive-le, puis recharge&nbsp;:
            </p>
            <ol
              className={`
                mb-2
                flex
                max-w-sm
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
            <Button
              onClick={() => {
                start().catch(console.error);
              }}
            >
              Activer le micro
            </Button>
            {error !== null && (
              <p
                className={`
                  mt-1
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
  );

  return (
    <div
      className={`
        z-20
        col-start-1
        row-start-1
        flex
        items-center
        justify-center
        rounded-2xl
        p-2
      `}
      style={{
        backdropFilter: "blur(4px)",
      }}
    >
      {panel}
    </div>
  );
}
