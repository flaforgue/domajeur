import { useNotation } from "../../hooks/useNotation";
import { ToggleSwitch } from "./ToggleSwitch";

export function NotationToggle() {
  const [notation, setNotation] = useNotation();

  return (
    <ToggleSwitch
      isChecked={notation === "international"}
      onChange={(isChecked) => {
        setNotation(isChecked ? "international" : "french");
      }}
    >
      Notation internationale
    </ToggleSwitch>
  );
}
