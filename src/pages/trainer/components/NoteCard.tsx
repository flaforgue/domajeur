import type { Ref } from "react";
import type { NoteCandidate, StringPosition } from "../../../lib/music/guitar";
import { cn } from "../../../lib/cn";
import { Panel } from "../../../components/containers/Panel";
import { Button } from "../../../components/buttons/Button";
import { Flex } from "../../../components/layout/Flex";
import { NoteName } from "./NoteName";
import { Solution } from "./Solution";
import { AudioLinesIcon, CheckCheckIcon } from "lucide-react";

const noteClass = "font-display text-7xl leading-none font-semibold text-pearl sm:text-8xl md:text-9xl";

interface Props {
  note: NoteCandidate | null;
  noteNameRef: Ref<HTMLDivElement>;
  isCheckVisible: boolean;
  isReplayDisabled: boolean;
  isSolutionShown: boolean;
  altPositions: StringPosition[];
  maxFret: number;
  onReplay: () => void;
}

export function NoteCard({
  note,
  noteNameRef,
  isCheckVisible,
  isReplayDisabled,
  isSolutionShown,
  altPositions,
  maxFret,
  onReplay,
}: Props) {
  const isSolutionVisible = isSolutionShown && note !== null;

  return (
    <Panel
      variant="display"
      className={`
        relative
        flex
        w-full
        flex-col
        items-center
        px-6
        pt-10
        pb-6
      `}
    >
      <div
        key={isSolutionVisible ? "solution" : "note"}
        className={`
          w-full
          animate-fade-in
        `}
      >
        {isSolutionVisible
          ? <Solution note={note} altPositions={altPositions} maxFret={maxFret} />
          : (
            <Flex direction="col" align="center" gap={3.5}>
              <div ref={noteNameRef} className={cn(noteClass, isCheckVisible && "opacity-20")}>
                {note !== null
                  ? <NoteName midi={note.midi} />
                  : <span className="text-pearl-faint">—</span>}
              </div>
              {isCheckVisible && (
                <CheckCheckIcon
                  className={`
                    absolute
                    top-1/2
                    left-1/2
                    h-24
                    w-24
                    -translate-x-1/2
                    translate-y-[-60%]
                    text-green
                  `}
                  aria-label="Validé"
                />
              )}
              <Button
                variant="icon"
                aria-label="Réécouter la note"
                disabled={isReplayDisabled}
                onClick={onReplay}
              >
                <AudioLinesIcon width="20" height="20" />
              </Button>
            </Flex>
          )}
      </div>
    </Panel>
  );
}
