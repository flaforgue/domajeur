import { SettingsIcon } from "lucide-react";
import { Panel } from "../containers/Panel";
import { Popover } from "../overlays/Popover";
import { MuteToggle } from "../inputs/MuteToggle";
import { NotationToggle } from "../inputs/NotationToggle";

export function SettingsMenu() {
  return (
    <Popover label="Réglages" icon={<SettingsIcon width="18" height="18" />} align="right">
      <Panel
        className={`
          flex
          flex-col
          gap-3.5
          rounded-xl
          px-4
          py-3.5
        `}
      >
        <MuteToggle />
        <NotationToggle />
      </Panel>
    </Popover>
  );
}
