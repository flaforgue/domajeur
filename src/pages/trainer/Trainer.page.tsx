import { useEffect, useRef } from "react";
import { PlayIcon } from "lucide-react";
import { usePitch } from "../../hooks/usePitch";
import { useMuted } from "../../hooks/useMuted";
import { useSpacebar } from "../../hooks/useSpacebar";
import { useWakeLock } from "../../hooks/useWakeLock";
import { frequencyFromMidi } from "../../lib/music/notation";
import { randomNote, stringPositionsForMidi } from "../../lib/music/guitar";
import { scaleSeriesFromState, type ScaleSelectorState } from "../../lib/music/scaleSelection";
import { useLatest } from "../../hooks/useLatest";
import { useTimeout } from "../../hooks/useTimeout";
import { Confetti, type ConfettiHandle } from "../../components/Confetti";
import { MicGate } from "../../components/MicGate";
import { Button } from "../../components/buttons/Button";
import { Panel } from "../../components/Panel";
import { PageContainer } from "../../components/layout/PageContainer";
import { Flex } from "../../components/layout/Flex";
import { SegmentedControl } from "../../components/inputs/SegmentedControl";
import { ToggleSwitch } from "../../components/inputs/ToggleSwitch";
import { LiveReadout } from "./components/LiveReadout";
import { FreeModeSettings } from "./components/FreeModeSettings";
import { ScaleSelector } from "./components/ScaleSelector";
import { NoteHistory } from "./components/NoteHistory";
import { NoteCard } from "./components/NoteCard";
import { ScaleDiagram } from "./components/ScaleDiagram";
import { useNoteValidation } from "./useNoteValidation";
import { useScalePlayback } from "./useScalePlayback";
import { useTrainerState } from "./useTrainerState";
import { DEFAULT_FRET_MAX, type TrainerMode } from "./trainerReducer";

export function Trainer() {
  const { engine, isStarted } = usePitch();
  const [isMuted] = useMuted();
  useWakeLock(isStarted);
  const { state, dispatch, scaleState, setScaleState } = useTrainerState();
  const confettiRef = useRef<ConfettiHandle>(null);
  const noteNameRef = useRef<HTMLDivElement>(null);

  const currentNote = state.currentIndex >= 0 ? state.notes[state.currentIndex] : null;
  const validatedCount = state.notes.filter((note) => note.isValidated).length;
  const effectiveMaxFret = state.mode === "free" ? state.fretMax : DEFAULT_FRET_MAX;
  const isCheckVisible = state.uiState === "success" || state.uiState === "flash";
  const lastMidi = state.notes[state.notes.length - 1]?.midi ?? null;

  const altPositions = currentNote === null
    ? []
    : stringPositionsForMidi(currentNote.midi, effectiveMaxFret).filter(
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

  function applyMode(mode: TrainerMode, scale = scaleState): void {
    scalePlayback.stop();
    const series = mode === "scale"
      ? scaleSeriesFromState(scale)
      : [randomNote(state.fretMax, state.isNaturalsOnly, null)];
    dispatch({ type: "selectMode", mode, series });
  }

  function changeScale(next: ScaleSelectorState) {
    setScaleState(next);
    applyMode("scale", next);
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

  function selectDefaultMode() {
    applyMode(state.mode);
  }
  const selectDefaultModeRef = useLatest(selectDefaultMode);
  function initializeDefaultMode() {
    selectDefaultModeRef.current();
  }
  useEffect(initializeDefaultMode, [selectDefaultModeRef]);

  const isRevisitedInAutoMode = state.uiState === "success" && state.shouldAutoAdvance;
  useNoteValidation({
    targetMidi: currentNote?.midi ?? null,
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
          max-md:max-h-none
          max-md:w-full
        `}
      >
        <SegmentedControl
          label="Mode d'entraînement"
          value={state.mode}
          options={[
            { value: "free", label: "Série libre" },
            { value: "scale", label: "Gamme" },
          ]}
          onChange={(value) => {
            applyMode(value === "free" ? "free" : "scale");
          }}
        />

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
          {state.mode === "free"
            ? (
              <FreeModeSettings
                isNaturalsOnly={state.isNaturalsOnly}
                onNaturalsOnlyChange={(isChecked) => {
                  dispatch({ type: "setNaturalsOnly", isOn: isChecked, candidate: randomNote(state.fretMax, isChecked, lastMidi) });
                }}
                fretMax={state.fretMax}
                onFretMaxChange={(value) => {
                  dispatch({ type: "setFretMax", value, candidate: randomNote(value, state.isNaturalsOnly, lastMidi) });
                }}
                shouldPlayOnAdvance={state.shouldPlayOnAdvance}
                onPlayOnAdvanceChange={(isChecked) => {
                  dispatch({ type: "setPlayOnAdvance", isOn: isChecked });
                }}
              />
            )
            : (
              <ScaleSelector state={scaleState} onChange={changeScale} />
            )}
        </Panel>

        {state.mode === "scale" && (
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
        )}

        <Flex
          align="center"
          justify="between"
          gap={2}
          className="my-2"
        >
          <Flex align="baseline" gap={2}>
            <span
              className={`
                font-display
                text-3xl
                leading-none
                font-semibold
                text-green
              `}
            >
              {validatedCount}
            </span>
            <span
              className={`
                text-sm
                text-pearl-faint
              `}
            >
              validées
            </span>
          </Flex>

          <ToggleSwitch
            isChecked={state.shouldAutoAdvance}
            onChange={(isChecked) => {
              dispatch({ type: "setAutoAdvance", isOn: isChecked });
            }}
          >
            Enchaînement auto
          </ToggleSwitch>
        </Flex>

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
          maxFret={effectiveMaxFret}
          extra={state.mode === "scale" && currentNote !== null
            ? <ScaleDiagram notes={state.notes} currentNote={currentNote} />
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
          {state.mode !== "scale" && (
            <Button
              variant="ghost"
              disabled={currentNote === null}
              onClick={() => {
                dispatch({ type: "toggleSolution" });
              }}
              className="flex-1"
            >
              {state.isSolutionShown ? "Masquer la solution" : "Voir la solution"}
            </Button>
          )}
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
