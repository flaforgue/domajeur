import { MinusIcon, PauseIcon, PlayIcon, PlusIcon } from "lucide-react";
import { useMuted } from "../../hooks/useMuted";
import { useMetronome } from "../../hooks/useMetronome";
import { useSpacebar } from "../../hooks/useSpacebar";
import { useWakeLock } from "../../hooks/useWakeLock";
import { MAX_BEATS, MAX_BPM, MIN_BEATS, MIN_BPM, useMetronomeSettings } from "./useMetronomeSettings";
import { cn } from "../../lib/cn";
import { clamp } from "../../lib/math";
import { Button } from "../../components/buttons/Button";
import { Panel } from "../../components/Panel";
import { PageContainer } from "../../components/layout/PageContainer";
import { Flex } from "../../components/layout/Flex";
import { SectionTitle } from "../../components/SectionTitle";
import { EnableSoundPrompt } from "../../components/EnableSoundPrompt";

export function Metronome() {
  const [isMuted] = useMuted();
  const [{ bpm, beatsPerMeasure }, setSettings] = useMetronomeSettings();
  const { isRunning, currentBeat, start, stop } = useMetronome({
    bpm,
    beatsPerMeasure,
    isSoundEnabled: !isMuted,
  });

  useWakeLock(isRunning);

  function changeBpm(value: number): void {
    setSettings({ bpm: clamp(value, MIN_BPM, MAX_BPM), beatsPerMeasure });
  }

  function changeBeatsPerMeasure(value: number): void {
    setSettings({ bpm, beatsPerMeasure: clamp(value, MIN_BEATS, MAX_BEATS) });
  }

  useSpacebar(() => {
    if (isMuted) {
      return;
    }

    if (isRunning) {
      stop();
    } else {
      start();
    }
  });

  const controlButton = (
    <Button
      variant="primary"
      onClick={() => {
        if (isRunning) {
          stop();
        } else {
          start();
        }
      }}
    >
      {isRunning && <PauseIcon width="20" height="20" />}
      {!isRunning && <PlayIcon width="20" height="20" />}
    </Button>
  );

  return (
    <PageContainer
      className={`
        flex
        max-w-xl
        flex-col
        gap-6
      `}
    >
      <Panel
        variant="display"
        className={`
          flex
          flex-col
          items-center
          gap-7
          px-7
          py-10
        `}
      >
        <Flex
          isWrapping
          justify="center"
          gap={2.5}
          className="min-h-4"
        >
          {Array.from({ length: beatsPerMeasure }, (_, index) => (
            <span
              key={index}
              className={cn(
                `
                  h-4
                  w-4
                  rounded-full
                  transition
                `,
                index === currentBeat && "scale-125",
                index === currentBeat
                  ? (index === 0 ? "bg-green" : "bg-brass")
                  : "bg-line",
              )}
            />
          ))}
        </Flex>

        <Flex align="baseline" gap={2}>
          <span
            className={`
              font-display
              text-8xl
              leading-none
              font-semibold
              text-pearl
            `}
          >
            {bpm}
          </span>
          <span
            className={`
              font-mono
              text-sm
              text-pearl-faint
            `}
          >
            BPM
          </span>
        </Flex>

        <Flex align="center" gap={3} className="w-full">
          <Button
            variant="icon"
            aria-label="Ralentir de 5"
            disabled={bpm <= MIN_BPM}
            onClick={() => {
              changeBpm(bpm - 5);
            }}
            className="text-sm"
          >
            −5
          </Button>
          <Button
            variant="icon"
            aria-label="Ralentir"
            disabled={bpm <= MIN_BPM}
            onClick={() => {
              changeBpm(bpm - 1);
            }}
          >
            <MinusIcon width="20" height="20" />
          </Button>
          <input
            type="range"
            className={`
              flex-1
              accent-brass
            `}
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(event) => {
              changeBpm(Number(event.target.value));
            }}
          />
          <Button
            variant="icon"
            aria-label="Accélérer"
            disabled={bpm >= MAX_BPM}
            onClick={() => {
              changeBpm(bpm + 1);
            }}
          >
            <PlusIcon width="20" height="20" />
          </Button>
          <Button
            variant="icon"
            aria-label="Accélérer de 5"
            disabled={bpm >= MAX_BPM}
            onClick={() => {
              changeBpm(bpm + 5);
            }}
            className="text-sm"
          >
            +5
          </Button>
        </Flex>

        {isMuted ? <EnableSoundPrompt /> : controlButton}
      </Panel>

      <Flex direction="col" align="center" gap={2.5}>
        <SectionTitle>Temps par mesure</SectionTitle>
        <Flex align="center" gap={3}>
          <Button
            variant="icon"
            aria-label="Moins de temps"
            disabled={beatsPerMeasure <= MIN_BEATS}
            onClick={() => {
              changeBeatsPerMeasure(beatsPerMeasure - 1);
            }}
          >
            <MinusIcon width="20" height="20" />
          </Button>
          <span
            className={`
              w-8
              text-center
              font-mono
              text-2xl
              text-pearl
            `}
          >
            {beatsPerMeasure}
          </span>
          <Button
            variant="icon"
            aria-label="Plus de temps"
            disabled={beatsPerMeasure >= MAX_BEATS}
            onClick={() => {
              changeBeatsPerMeasure(beatsPerMeasure + 1);
            }}
          >
            <PlusIcon width="20" height="20" />
          </Button>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
