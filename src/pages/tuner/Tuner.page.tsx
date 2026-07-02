import { usePitch } from "../../hooks/usePitch";
import { useNotation } from "../../hooks/useNotation";
import { useMuted } from "../../hooks/useMuted";
import { useWakeLock } from "../../hooks/useWakeLock";
import { frequencyFromMidi } from "../../lib/music/notation";
import { STRINGS, stringName } from "../../lib/music/guitar";
import { PageContainer } from "../../components/layout/PageContainer";
import { Flex } from "../../components/layout/Flex";
import { SectionTitle } from "../../components/titles/SectionTitle";
import { MicPrompt } from "../../components/MicPrompt";
import { ReferenceButton } from "./components/ReferenceButton";
import { TunerDisplay } from "./components/TunerDisplay";
import { useTunedStrings } from "./useTunedStrings";

export function Tuner() {
  const { engine, isStarted } = usePitch();
  const [notation] = useNotation();
  const [isMuted] = useMuted();
  const tunedStringIndices = useTunedStrings();

  useWakeLock(isStarted);

  return (
    <PageContainer
      className={`
        flex
        max-w-xl
        flex-col
        gap-6
      `}
    >
      <div
        className={`
          grid
          w-full
          grid-cols-1
        `}
      >
        <div
          className={`
            col-start-1
            row-start-1
          `}
        >
          <TunerDisplay />
        </div>
        {!isStarted && (
          <MicPrompt feature="L'accordeur a besoin du micro pour écouter ta guitare et afficher la note détectée. Les tons de référence ci-dessous restent disponibles sans le micro." />
        )}
      </div>

      <Flex direction="col" align="center" gap={2.5}>
        <SectionTitle>Cordes à vide</SectionTitle>
        <Flex isWrapping justify="center" gap={2}>
          {STRINGS.map((s, i) => (
            <ReferenceButton
              key={i}
              isTuned={tunedStringIndices.has(i)}
              disabled={isMuted}
              onClick={() => {
                engine.playReference(frequencyFromMidi(s.midi), 1.4);
              }}
            >
              {stringName(i, notation)}
            </ReferenceButton>
          ))}
        </Flex>
      </Flex>
    </PageContainer>
  );
}
