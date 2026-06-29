import { useEffect, useReducer, useRef, useState } from "react";
import { PlayIcon } from "lucide-react";
import { usePitch } from "../../hooks/usePitch";
import { useMuted } from "../../hooks/useMuted";
import { useSpacebar } from "../../hooks/useSpacebar";
import { frequencyFromMidi } from "../../lib/music/notation";
import { randomNote, stringPositionsForMidi, type NoteCandidate } from "../../lib/music/guitar";
import { Confetti, type ConfettiHandle } from "../../components/effects/Confetti";
import { Button } from "../../components/buttons/Button";
import { Panel } from "../../components/containers/Panel";
import { PageContainer } from "../../components/layout/PageContainer";
import { Flex } from "../../components/layout/Flex";
import { SegmentedControl } from "../../components/inputs/SegmentedControl";
import { ToggleSwitch } from "../../components/inputs/ToggleSwitch";
import { LiveReadout } from "./components/LiveReadout";
import { FreeModeSettings } from "./components/FreeModeSettings";
import {
  ScaleSelector,
  DEFAULT_SCALE_STATE,
  scaleSeriesFromState,
  type ScaleSelectorState,
} from "./components/ScaleSelector";
import { NoteHistory } from "./components/NoteHistory";
import { NoteCard } from "./components/NoteCard";
import { ScaleDiagram } from "./components/ScaleDiagram";
import { useNoteValidation } from "./useNoteValidation";
import {
  DEFAULT_FRET_MAX,
  INITIAL_TRAINER_STATE,
  trainerReducer,
} from "./trainerReducer";

export function Trainer() {
  const { engine, isStarted } = usePitch();
  const [isMuted] = useMuted();
  const [state, dispatch] = useReducer(trainerReducer, INITIAL_TRAINER_STATE);
  const [scaleState, setScaleState] = useState<ScaleSelectorState>(DEFAULT_SCALE_STATE);
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

  useSpacebar(() => {
    if (currentNote !== null && !isMuted) {
      engine.playReference(frequencyFromMidi(currentNote.midi));
    }
  });

  const scaleTimersRef = useRef<number[]>([]);
  function stopScalePlayback() {
    scaleTimersRef.current.forEach((id) => {
      clearTimeout(id);
    });
    scaleTimersRef.current = [];
  }

  function playScale() {
    if (isMuted) {
      return;
    }

    stopScalePlayback();
    const stepMs = 400;
    const noteDurationMs = 1000;
    state.notes.forEach((note, index) => {
      const id = window.setTimeout(() => {
        engine.playReference(frequencyFromMidi(note.midi), noteDurationMs / 1000);
      }, index * stepMs);
      scaleTimersRef.current.push(id);
    });
  }
  useEffect(() => stopScalePlayback, []);

  function selectFreeMode() {
    stopScalePlayback();
    dispatch({
      type: "selectMode",
      mode: "free",
      series: [randomNote(state.fretMax, state.isNaturalsOnly, null)],
    });
  }

  function selectScaleMode() {
    stopScalePlayback();
    dispatch({ type: "selectMode", mode: "scale", series: scaleSeriesFromState(scaleState) });
  }

  function changeScale(next: ScaleSelectorState) {
    stopScalePlayback();
    setScaleState(next);
    dispatch({ type: "selectMode", mode: "scale", series: scaleSeriesFromState(next) });
  }

  function advanceToNextNote() {
    dispatch({ type: "advance", candidate: randomNote(state.fretMax, state.isNaturalsOnly, lastMidi) });
  }

  function selectNextNote() {
    dispatch({ type: "selectNext", candidate: randomNote(state.fretMax, state.isNaturalsOnly, lastMidi) });
  }

  const noteToPlayRef = useRef<NoteCandidate | null>(null);
  noteToPlayRef.current = !isMuted && currentNote !== null && !currentNote.isValidated ? currentNote : null;
  function playFocusedNote() {
    const note = noteToPlayRef.current;
    if (note !== null) {
      engine.playReference(frequencyFromMidi(note.midi));
    }
  }
  useEffect(playFocusedNote, [state.noteToPlayNonce, engine]);

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

  const advanceRef = useRef(advanceToNextNote);
  advanceRef.current = advanceToNextNote;
  function scheduleAdvance() {
    if (state.advanceDelayMs === null) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      advanceRef.current();
    }, state.advanceDelayMs);

    return () => {
      clearTimeout(timer);
    };
  }
  useEffect(scheduleAdvance, [state.advanceDelayMs]);

  function selectDefaultMode() {
    if (isStarted) {
      dispatch({
        type: "selectMode",
        mode: "free",
        series: [randomNote(INITIAL_TRAINER_STATE.fretMax, INITIAL_TRAINER_STATE.isNaturalsOnly, null)],
      });
    }
  }
  useEffect(selectDefaultMode, [isStarted]);

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
          top-19
          flex
          max-h-[calc(100vh-92px)]
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
            if (value === "free") {
              selectFreeMode();
            } else {
              selectScaleMode();
            }
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
              engine.playReference(frequencyFromMidi(currentNote.midi));
            }
          }}
        />

        <LiveReadout targetMidi={currentNote?.midi ?? null} />

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
