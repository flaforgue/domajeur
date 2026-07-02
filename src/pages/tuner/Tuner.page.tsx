import { usePitch } from "../../hooks/usePitch";
import { useNotation } from "../../hooks/useNotation";
import { useMuted } from "../../hooks/useMuted";
import { useWakeLock } from "../../hooks/useWakeLock";
import { frequencyFromMidi } from "../../lib/music/notation";
import { STRINGS, stringName } from "../../lib/music/guitar";
import { PageContainer } from "../../components/layout/PageContainer";
import { Flex } from "../../components/layout/Flex";
import { SectionTitle } from "../../components/SectionTitle";
import { MicGate } from "../../components/MicGate";
import { ChipButton } from "../../components/buttons/ChipButton";
import { TunerDisplay } from "./components/TunerDisplay";
import { useTunedStrings } from "./useTunedStrings";

export function Tuner() {
  const { engine, isStarted } = usePitch();
  const [notation] = useNotation();
  const [isMuted] = useMuted();
  const tunedStringIndices = useTunedStrings();

  useWakeLock(isStarted);

  return (
    <PageContainer className="max-w-xl">
      <MicGate feature="L'accordeur a besoin du micro pour écouter ta guitare et afficher la note détectée. Les tons de référence ci-dessous restent disponibles sans le micro.">
        <Flex gap={6} direction="col">
          <TunerDisplay />

          <Flex direction="col" align="center" gap={2.5}>
            <SectionTitle>Cordes à vide</SectionTitle>
            <Flex isWrapping justify="center" gap={2}>
              {STRINGS.map((s, i) => (
                <ChipButton
                  key={i}
                  tone={tunedStringIndices.has(i) ? "success" : "default"}
                  disabled={isMuted}
                  className={`
                    min-w-16
                    px-3.5
                    py-2.5
                  `}
                  onClick={() => {
                    engine.playReference(frequencyFromMidi(s.midi), 1);
                  }}
                >
                  {stringName(i, notation)}
                </ChipButton>
              ))}
            </Flex>
          </Flex>
        </Flex>
      </MicGate>
    </PageContainer>
  );
}
