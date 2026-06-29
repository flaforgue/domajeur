import { useState } from "react";
import { MinusIcon, PauseIcon, PlayIcon, PlusIcon } from "lucide-react";
import { useMuted } from "../../hooks/useMuted";
import { useMetronome } from "../../hooks/useMetronome";
import { useSpacebar } from "../../hooks/useSpacebar";
import { useWakeLock } from "../../hooks/useWakeLock";
import { cn } from "../../lib/cn";
import { Button } from "../../components/buttons/Button";
import { Panel } from "../../components/containers/Panel";
import { PageContainer } from "../../components/layout/PageContainer";
import { Flex } from "../../components/layout/Flex";
import { SectionTitle } from "../../components/titles/SectionTitle";
import { EnableSoundPrompt } from "../../components/EnableSoundPrompt";

const minBpm = 40;
const maxBpm = 240;
const minBeats = 1;
const maxBeats = 12;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function Metronome() {
  const [isMuted] = useMuted();
  const [bpm, setBpm] = useState(100);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const { isRunning, currentBeat, start, stop } = useMetronome({
    bpm,
    beatsPerMeasure,
    isSoundEnabled: !isMuted,
  });

  useWakeLock(isRunning);

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
            aria-label="Ralentir"
            disabled={bpm <= minBpm}
            onClick={() => {
              setBpm((current) => clamp(current - 1, minBpm, maxBpm));
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
            min={minBpm}
            max={maxBpm}
            value={bpm}
            onChange={(event) => {
              setBpm(Number(event.target.value));
            }}
          />
          <Button
            variant="icon"
            aria-label="Accélérer"
            disabled={bpm >= maxBpm}
            onClick={() => {
              setBpm((current) => clamp(current + 1, minBpm, maxBpm));
            }}
          >
            <PlusIcon width="20" height="20" />
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
            disabled={beatsPerMeasure <= minBeats}
            onClick={() => {
              setBeatsPerMeasure((current) => clamp(current - 1, minBeats, maxBeats));
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
            disabled={beatsPerMeasure >= maxBeats}
            onClick={() => {
              setBeatsPerMeasure((current) => clamp(current + 1, minBeats, maxBeats));
            }}
          >
            <PlusIcon width="20" height="20" />
          </Button>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
