import { VolumeXIcon } from "lucide-react";
import { useMuted } from "../hooks/useMuted";
import { Button } from "./buttons/Button";
import { Flex } from "./layout/Flex";

export function EnableSoundPrompt() {
  const [, setMuted] = useMuted();

  return (
    <Flex direction="col" align="center" gap={2}>
      <Flex
        align="center"
        gap={1.5}
        className={`
          text-sm
          text-pearl-dim
        `}
      >
        <VolumeXIcon width="16" height="16" />
        Le son est coupé
      </Flex>
      <Button
        variant="primary"
        onClick={() => {
          setMuted(false);
        }}
      >
        Activer le son
      </Button>
    </Flex>
  );
}
