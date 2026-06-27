import type { Ref } from "react";
import type { NoteCandidate } from "../../../lib/music/guitar";
import { cn } from "../../../lib/cn";
import { Panel } from "../../../components/containers/Panel";
import { Button } from "../../../components/buttons/Button";
import { Tooltip } from "../../../components/overlays/Tooltip";
import { NoteName } from "./NoteName";
import { AudioLinesIcon, CheckCheckIcon } from "lucide-react";

const noteClass = "font-display text-7xl leading-none font-semibold text-pearl sm:text-8xl md:text-9xl";

interface Props {
  note: NoteCandidate | null;
  noteNameRef: Ref<HTMLDivElement>;
  isCheckVisible: boolean;
  isReplayDisabled: boolean;
  isMuted: boolean;
  onReplay: () => void;
}

export function NoteCard({ note, noteNameRef, isCheckVisible, isReplayDisabled, isMuted, onReplay }: Props) {
  const replayButton = (
    <Button
      variant="icon"
      aria-label="Réécouter la note"
      disabled={isReplayDisabled}
      className={cn(isMuted && "disabled:pointer-events-none")}
      onClick={onReplay}
    >
      <AudioLinesIcon width="20" height="20" />
    </Button>
  );

  return (
    <Panel
      variant="display"
      className={`
        relative
        flex
        w-full
        flex-col
        items-center
        gap-3.5
        px-6
        pt-10
        pb-6
      `}
    >
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
      {isMuted
        ? (
          <Tooltip label="Activez le son dans le menu principal" className="cursor-not-allowed">
            {replayButton}
          </Tooltip>
        )
        : replayButton}
    </Panel>
  );
}
