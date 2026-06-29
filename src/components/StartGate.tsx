import { usePitch } from "../hooks/usePitch";
import { Button } from "./buttons/Button";
import { Panel } from "./containers/Panel";

export function StartGate() {
  const { start, error } = usePitch();

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
      </Panel>
    </div>
  );
}
