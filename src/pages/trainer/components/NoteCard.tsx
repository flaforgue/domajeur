import type { ReactNode, Ref } from "react";
import type { NoteCandidate, StringPosition } from "../../../lib/music/guitar";
import { cn } from "../../../lib/cn";
import { Panel } from "../../../components/containers/Panel";
import { Button } from "../../../components/buttons/Button";
import { Flex } from "../../../components/layout/Flex";
import { NoteName } from "./NoteName";
import { Solution } from "./Solution";
import { AudioLinesIcon, CheckCheckIcon } from "lucide-react";

interface Props {
  note: NoteCandidate | null;
  noteNameRef: Ref<HTMLDivElement>;
  isCheckVisible: boolean;
  isReplayDisabled: boolean;
  isSolutionShown: boolean;
  altPositions: StringPosition[];
  maxFret: number;
  extra?: ReactNode;
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
  extra,
  onReplay,
}: Props) {
  const isSolutionVisible = isSolutionShown && note !== null;
  const isCompact = extra !== undefined;
  const noteSizeClass = isCompact ? "text-4xl" : "text-7xl";
  const checkSizeClass = isCompact ? "h-12 w-12" : "h-24 w-24";
  const paddingClass = isCompact ? "pt-6 pb-5" : "pt-10 pb-6";

  return (
    <Panel
      variant="display"
      className={cn(
        `
          relative
          flex
          w-full
          flex-col
          items-center
          px-6
        `,
        paddingClass,
      )}
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
            <Flex
              direction={isCompact ? "row" : "col"}
              align="center"
              justify="center"
              gap={isCompact ? 4 : 3.5}
            >
              <div className="relative">
                <div
                  ref={noteNameRef}
                  className={cn(`
                    font-display
                    leading-none
                    font-semibold
                    text-pearl
                  `, noteSizeClass, isCheckVisible && "opacity-20")}
                >
                  {note !== null
                    ? <NoteName midi={note.midi} />
                    : <span className="text-pearl-faint">—</span>}
                </div>
                {isCheckVisible && (
                  <CheckCheckIcon
                    className={cn(
                      `
                        absolute
                        inset-0
                        m-auto
                        text-green
                      `,
                      checkSizeClass,
                    )}
                    aria-label="Validé"
                  />
                )}
              </div>
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

      {extra !== undefined && !isSolutionVisible && (
        <div
          className={`
            mt-5
            w-full
            border-t
            border-line
          `}
        >
          {extra}
        </div>
      )}
    </Panel>
  );
}
