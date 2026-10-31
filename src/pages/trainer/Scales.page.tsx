import { useEffect, useRef } from "react";
import { PlayIcon } from "lucide-react";
import { usePitch } from "../../hooks/usePitch";
import { useMuted } from "../../hooks/useMuted";
import { useSpacebar } from "../../hooks/useSpacebar";
import { useWakeLock } from "../../hooks/useWakeLock";
import { frequencyFromMidi } from "../../lib/music/notation";
import { MAX_PLAYABLE_FRET, randomNote, stringPositionsForMidi } from "../../lib/music/guitar";
import { scaleSeriesFromState, type ScaleSelectorState } from "../../lib/music/scaleSelection";
import { useLatest } from "../../hooks/useLatest";
import { useTimeout } from "../../hooks/useTimeout";
import { Confetti, type ConfettiHandle } from "../../components/Confetti";
import { FingerLegendHint } from "../../components/FingerLegendHint";
import { MicGate } from "../../components/MicGate";
import { Button } from "../../components/buttons/Button";
import { HintedLabel } from "../../components/HintedLabel";
import { Panel } from "../../components/Panel";
import { PageContainer } from "../../components/layout/PageContainer";
import { Flex } from "../../components/layout/Flex";
import { ToggleSwitch } from "../../components/inputs/ToggleSwitch";
import { LiveReadout } from "./components/LiveReadout";
import { ScaleSelector } from "./components/ScaleSelector";
import { NoteHistory } from "./components/NoteHistory";
import { NoteCard } from "./components/NoteCard";
import { ScaleDiagram } from "./components/ScaleDiagram";
import { useNoteValidation } from "./useNoteValidation";
import { useScalePlayback } from "./useScalePlayback";
import { useTrainerState } from "./useTrainerState";

export function Scales() {
  const { engine, isStarted } = usePitch();
  const [isMuted] = useMuted();
  useWakeLock(isStarted);
  const { state, dispatch, scaleState, setScaleState } = useTrainerState("scale");
  const confettiRef = useRef<ConfettiHandle>(null);
  const noteNameRef = useRef<HTMLDivElement>(null);

  const currentNote = state.currentIndex >= 0 ? state.notes[state.currentIndex] : null;
  const isFirstPosition = scaleState.octaves === 1 && !scaleState.isClosedPosition;
  const isCheckVisible = state.uiState === "success" || state.uiState === "flash";
  const lastMidi = state.notes[state.notes.length - 1]?.midi ?? null;

  const altPositions = currentNote === null
    ? []
    : stringPositionsForMidi(currentNote.midi, MAX_PLAYABLE_FRET).filter(
      (p) => !(p.stringIndex === currentNote.stringIndex && p.fretIndex === currentNote.fretIndex),
    );

  function playNote(midi: number, duration?: number): void {
    if (!isMuted) {
      engine.playReference(frequencyFromMidi(midi), duration);
    }
  }

  useSpacebar(() => {
    if (currentNote !== null) {
      playNote(currentNote.midi);
    }
  });

  const scalePlayback = useScalePlayback((note, index) => {
    playNote(note.midi);
    dispatch({ type: "focusNote", index });
  });

  function playScale() {
    if (isMuted) {
      return;
    }

    scalePlayback.play(state.notes);
  }

  function applyScale(scale = scaleState): void {
    scalePlayback.stop();
    dispatch({ type: "selectMode", mode: "scale", series: scaleSeriesFromState(scale) });
  }

  function changeScale(next: ScaleSelectorState) {
    setScaleState(next);
    applyScale(next);
  }

  function advanceToNextNote() {
    dispatch({ type: "advance", candidate: randomNote(state.fretMax, state.isNaturalsOnly, lastMidi) });
  }

  function selectNextNote() {
    dispatch({ type: "selectNext", candidate: randomNote(state.fretMax, state.isNaturalsOnly, lastMidi) });
  }

  const noteToPlayRef = useLatest(!isMuted && currentNote !== null && !currentNote.isValidated ? currentNote : null);
  function playFocusedNote() {
    const note = noteToPlayRef.current;
    if (note !== null) {
      engine.playReference(frequencyFromMidi(note.midi));
    }
  }
  useEffect(playFocusedNote, [state.noteToPlayNonce, engine, noteToPlayRef]);

  function burstConfetti() {
    if (state.validationNonce > 0) {
      const rect = noteNameRef.current?.getBoundingClientRect();
      const origin = rect === undefined
        ? undefined
        : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      confettiRef.current?.burst(origin);
    }
  }
  useEffect(burstConfetti, [state.validationNonce]);

  useTimeout(state.advanceDelayMs, advanceToNextNote);

  const applyScaleRef = useLatest(applyScale);
  function initializeScale() {
    applyScaleRef.current();
  }
  useEffect(initializeScale, [applyScaleRef]);

  const isRevisitedInAutoMode = state.uiState === "success" && state.shouldAutoAdvance;
  useNoteValidation({
    target: currentNote,
    isActive: currentNote !== null && (state.uiState === "listening" || isRevisitedInAutoMode),
    onValidated: () => {
      if (currentNote?.isValidated === true) {
        advanceToNextNote();
      } else {
        dispatch({ type: "validateCurrent" });
      }
    },
  });

  return (
    <PageContainer
      className={`
        flex
        max-w-5xl
        items-start
        gap-8

        max-md:flex-col
      `}
    >
      <Confetti ref={confettiRef} />

      <aside
        className={`
          sticky
          top-15
          flex
          max-h-[calc(100vh-76px)]
          w-80
          flex-none
          flex-col
          gap-3.5

          max-md:static
          max-md:order-last
          max-md:max-h-none
          max-md:w-full
        `}
      >
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
          <ScaleSelector state={scaleState} onChange={changeScale} />
          <ToggleSwitch
            isChecked={state.shouldAutoAdvance}
            onChange={(isChecked) => {
              dispatch({ type: "setAutoAdvance", isOn: isChecked });
            }}
          >
            <HintedLabel hint="Passe automatiquement à la note suivante dès que la note jouée est validée au micro.">
              Enchaînement auto
            </HintedLabel>
          </ToggleSwitch>
        </Panel>

        <Button
          variant="ghost"
          disabled={isMuted || state.notes.length === 0}
          onClick={playScale}
          className={`
            flex
            items-center
            justify-center
            gap-2
          `}
        >
          <PlayIcon width="16" height="16" />
          Écouter la gamme
        </Button>

        <NoteHistory
          notes={state.notes}
          currentIndex={state.currentIndex}
          onSelect={(index) => {
            playNote(state.notes[index].midi);
            dispatch({ type: "focusNote", index });
          }}
        />
      </aside>

      <main
        className={`
          flex
          max-w-xl
          flex-1
          flex-col
          items-center
          gap-5

          max-md:w-full
          max-md:max-w-full
        `}
      >
        <NoteCard
          note={currentNote}
          noteNameRef={noteNameRef}
          isCheckVisible={isCheckVisible}
          isReplayDisabled={currentNote === null || isMuted}
          isSolutionShown={state.isSolutionShown}
          altPositions={altPositions}
          maxFret={MAX_PLAYABLE_FRET}
          cornerHint={isFirstPosition ? <FingerLegendHint /> : undefined}
          extra={currentNote !== null
            ? (
              <ScaleDiagram
                notes={state.notes}
                currentNote={currentNote}
                hasFingerNumbers={isFirstPosition}
              />
            )
            : undefined}
          onReplay={() => {
            if (currentNote !== null) {
              playNote(currentNote.midi);
            }
          }}
        />

        <MicGate
          title="Validation au micro"
          feature="Active le micro pour valider les notes que tu joues."
        >
          <LiveReadout targetMidi={currentNote?.midi ?? null} targetSpelling={currentNote?.spelling} />
        </MicGate>

        <Flex gap={3} className="w-full">
          <Button
            variant="next"
            isDone={isCheckVisible}
            disabled={currentNote === null || state.advanceDelayMs !== null}
            onClick={selectNextNote}
            className="flex-1"
          >
            Note suivante
          </Button>
        </Flex>
      </main>
    </PageContainer>
  );
}
