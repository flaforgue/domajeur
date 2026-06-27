import { Fragment } from "react";
import { usePitch } from "../../hooks/usePitch";
import { useNotation } from "../../hooks/useNotation";
import { useMuted } from "../../hooks/useMuted";
import { frequencyFromMidi } from "../../lib/music/notation";
import { STRINGS, stringName } from "../../lib/music/guitar";
import { PageContainer } from "../../components/layout/PageContainer";
import { Flex } from "../../components/layout/Flex";
import { SectionTitle } from "../../components/titles/SectionTitle";
import { Tooltip } from "../../components/overlays/Tooltip";
import { ReferenceButton } from "./components/ReferenceButton";
import { TunerDisplay } from "./components/TunerDisplay";
import { useTunedStrings } from "./useTunedStrings";

export function Tuner() {
  const { engine } = usePitch();
  const [notation] = useNotation();
  const [isMuted] = useMuted();
  const tunedStringIndices = useTunedStrings();

  return (
    <PageContainer
      className={`
        flex
        max-w-xl
        flex-col
        gap-6
      `}
    >
      <TunerDisplay />

      <Flex direction="col" align="center" gap={2.5}>
        <SectionTitle>Cordes à vide</SectionTitle>
        <Flex isWrapping justify="center" gap={2}>
          {STRINGS.map((s, i) => {
            const button = (
              <ReferenceButton
                isTuned={tunedStringIndices.has(i)}
                disabled={isMuted}
                onClick={() => {
                  engine.playReference(frequencyFromMidi(s.midi), 1.4);
                }}
              >
                {stringName(i, notation)}
              </ReferenceButton>
            );

            return isMuted
              ? (
                <Tooltip key={i} label="Activez le son dans le menu principal" className="cursor-not-allowed">
                  {button}
                </Tooltip>
              )
              : <Fragment key={i}>{button}</Fragment>;
          })}
        </Flex>
      </Flex>
    </PageContainer>
  );
}
