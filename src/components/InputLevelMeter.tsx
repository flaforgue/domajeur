import { useEngineSelector } from "../hooks/useEngineSelector";
import { clamp } from "../lib/math";
import { Meter } from "./Meter";

const maxInputRootMeanSquare = 0.1;

export function InputLevelMeter({ isStacked }: { isStacked?: boolean }) {
  const level = useEngineSelector(
    (frame) => Math.round(clamp(frame.rootMeanSquare / maxInputRootMeanSquare, 0, 1) * 100) / 100,
  );

  return (
    <Meter
      label="Niveau d'entrée"
      value={level}
      fillClassName="bg-clay"
      isStacked={isStacked}
    />
  );
}
