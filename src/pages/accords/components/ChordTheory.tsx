import { spellingName, type Notation } from "../../../lib/music/notation";
import {
  CHORD_QUALITIES,
  chordFamily,
  chordFormula,
  type ChordQuality,
  type ChordTone,
} from "../../../lib/music/chords";
import { cn } from "../../../lib/cn";
import { Panel } from "../../../components/Panel";
import { SectionTitle } from "../../../components/SectionTitle";
import { Flex } from "../../../components/layout/Flex";

interface Props {
  quality: ChordQuality;
  tones: ChordTone[];
  notation: Notation;
  onQualityChange: (quality: ChordQuality) => void;
}

export function ChordTheory({ quality, tones, notation, onQualityChange }: Props) {
  const family = chordFamily(quality);
  const steps = family.steps;

  return (
    <Panel
      className={`
        flex
        w-full
        flex-col
        gap-4
        px-5
        py-4
      `}
    >
      <SectionTitle>La logique de construction</SectionTitle>

      <p
        className={`
          text-sm
          leading-relaxed
          text-pearl-dim
        `}
      >
        Un accord empile des tierces sur sa fondamentale (f), qui lui donne son nom.
        La formule compte les demi-tons entre les notes : un demi-ton = une case.
      </p>

      <Flex direction="col" gap={2}>
        {CHORD_QUALITIES.map((candidate) => {
          const candidateFamily = chordFamily(candidate);
          const isActive = candidate === quality;

          return (
            <button
              key={candidate}
              type="button"
              aria-pressed={isActive}
              className={cn(
                `
                  cursor-pointer
                  rounded-xl
                  border
                  px-3.5
                  py-2.5
                  text-left
                  transition
                `,
                isActive
                  ? `
                    border-brass/60
                    bg-ebony-3
                  `
                  : `
                    border-line
                    bg-transparent

                    hover:border-pearl/28
                  `,
              )}
              onClick={() => {
                onQualityChange(candidate);
              }}
            >
              <Flex align="baseline" justify="between" gap={2}>
                <span
                  className={cn(
                    "font-semibold",
                    isActive ? "text-pearl" : "text-pearl-dim",
                  )}
                >
                  {candidateFamily.label}
                </span>
                <span
                  className={cn(
                    `
                      font-mono
                      text-sm
                    `,
                    isActive ? "text-brass" : "text-pearl-faint",
                  )}
                >
                  {chordFormula(candidate)}
                </span>
              </Flex>
              <span
                className={`
                  text-xs
                  text-pearl-faint
                `}
              >
                Fondamentale ·
                {" "}
                {candidateFamily.thirdLabel}
                {" "}
                ·
                {" "}
                {candidateFamily.fifthLabel}
              </span>
            </button>
          );
        })}
      </Flex>

      <Flex
        align="start"
        justify="center"
        gap={3}
        isWrapping
        className={`
          rounded-xl
          bg-ebony-3/60
          px-3
          py-3
        `}
      >
        {tones.map((tone, index) => (
          <Flex key={tone.roleLabel} align="start" gap={3}>
            {index > 0 && (
              <Flex direction="col" align="center" className="pt-1">
                <span
                  className={`
                    font-mono
                    text-sm
                    text-brass
                  `}
                >
                  +
                  {steps[index - 1]}
                </span>
                <span
                  className={`
                    text-[10px]
                    text-pearl-faint
                  `}
                >
                  demi-tons
                </span>
              </Flex>
            )}
            <Flex direction="col" align="center">
              <span
                className={cn(
                  `
                    font-mono
                    text-xl
                  `,
                  index === 0 ? "text-clay" : "text-pearl",
                )}
              >
                {spellingName(tone.spelling, notation)}
              </span>
              <span
                className={`
                  text-[10px]
                  text-pearl-faint
                `}
              >
                {tone.roleLabel.toLowerCase()}
              </span>
            </Flex>
          </Flex>
        ))}
      </Flex>

      <p
        className={`
          text-sm
          leading-relaxed
          text-pearl-dim
        `}
      >
        {family.character}
        {" "}
        La tierce fait la couleur ; la quinte stabilise (juste), resserre (diminuée) ou étire (augmentée).
      </p>
    </Panel>
  );
}
