import type { ReactNode } from "react";
import { usePitch } from "../hooks/usePitch";
import { MicPrompt } from "./MicPrompt";

interface Props {
  feature: string;
  title?: string;
  children: ReactNode;
}

export function MicGate({ feature, title, children }: Props) {
  const { isStarted } = usePitch();

  return (
    <div
      className={`
        grid
        w-full
        grid-cols-1
      `}
    >
      <div
        className={`
          col-start-1
          row-start-1

          ${isStarted ? "" : "px-2"}
        `}
      >
        {children}
      </div>
      {!isStarted && <MicPrompt title={title} feature={feature} />}
    </div>
  );
}
