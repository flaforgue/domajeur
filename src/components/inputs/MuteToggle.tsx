import { useMuted } from "../../hooks/useMuted";
import { ToggleSwitch } from "./ToggleSwitch";

export function MuteToggle() {
  const [isMuted, setMuted] = useMuted();

  return (
    <ToggleSwitch
      isChecked={!isMuted}
      onChange={(isChecked) => {
        setMuted(!isChecked);
      }}
    >
      Son
    </ToggleSwitch>
  );
}
