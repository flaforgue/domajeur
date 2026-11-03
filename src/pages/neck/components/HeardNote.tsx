import { CheckIcon } from "lucide-react";
import { useNotation } from "../../../hooks/useNotation";
import { cn } from "../../../lib/cn";
import { namedNoteFromMidi } from "../../../lib/music/notation";
import { InputLevelMeter } from "../../../components/InputLevelMeter";
import { Panel } from "../../../components/Panel";
import { Flex } from "../../../components/layout/Flex";
import type { RecognizedNote } from "../useRecognizedNote";

interface Props {
  recognized: RecognizedNote | null;
}

export function HeardNote({ recognized }: Props) {
  const [notation] = useNotation();

  return (
    <Panel
      className={`
        flex
        flex-col
        gap-2.5
        rounded-xl
        px-4
        py-3
      `}
    >
      <Flex
        align="center"
        justify="center"
        gap={2.5}
        className={`
          min-h-8
          text-sm
          text-pearl-dim
        `}
      >
        {recognized === null
          ? <span className="text-pearl-faint">Joue une note…</span>
          : (
            <>
              <span>J&apos;entends</span>
              <span
                className={cn(`
                  font-display
                  text-2xl
                  font-semibold
                `, recognized.isMatch ? "text-green" : "text-pearl")}
              >
                {namedNoteFromMidi(recognized.midi, notation).name}
              </span>
              <CheckIcon
                className={cn(`
                  size-5
                  text-green
                `, !recognized.isMatch && "invisible")}
                aria-label="Note mise en évidence sur le manche"
              />
            </>
          )}
      </Flex>
      <InputLevelMeter isStacked />
    </Panel>
  );
}
