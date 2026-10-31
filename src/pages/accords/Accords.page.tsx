import { PlayIcon } from "lucide-react";
import { useMuted } from "../../hooks/useMuted";
import { useNotation } from "../../hooks/useNotation";
import { pitchClassFromMidi, spellingName } from "../../lib/music/notation";
import {
  chordAltSymbol,
  chordName,
  chordSymbol,
  chordTones,
  type ChordQuality,
} from "../../lib/music/chords";
import { chordPositionMidis, chordPositions } from "../../lib/music/chordPositions";
import { SCALE_ROOTS } from "../../lib/music/scaleSelection";
import { Button } from "../../components/buttons/Button";
import { Panel } from "../../components/Panel";
import { PageContainer } from "../../components/layout/PageContainer";
import { Flex } from "../../components/layout/Flex";
import { FingerLegendHint } from "../../components/FingerLegendHint";
import { ChordFretboard } from "./components/ChordFretboard";
import { ChordSelector } from "./components/ChordSelector";
import { ChordTheory } from "./components/ChordTheory";
import { useChordPreferences, type ChordPreferences } from "./useChordPreferences";
import { useChordStrum } from "./useChordStrum";

export function Accords() {
  const [notation] = useNotation();
  const [isMuted] = useMuted();
  const [preferences, setPreferences] = useChordPreferences();
  const { strum, stop } = useChordStrum();

  function changePreferences(next: ChordPreferences): void {
    const isSameChord = next.rootIndex === preferences.rootIndex
      && next.quality === preferences.quality
      && next.positionIndex === preferences.positionIndex;

    if (!isSameChord) {
      stop();
    }

    setPreferences(next);
  }

  const root = SCALE_ROOTS[preferences.rootIndex];
  const tones = chordTones(root.spelling, preferences.quality);
  const positions = chordPositions(root.pitchClass, preferences.quality);
  const position = positions[Math.min(preferences.positionIndex, positions.length - 1)];
  const midis = chordPositionMidis(position);
  const maxFret = Math.max(...position.frets.filter((fret): fret is number => fret !== null));

  const noteLabels = midis.map((midi) => {
    if (midi === null) {
      return null;
    }

    const tone = tones.find((candidate) => candidate.pitchClass === pitchClassFromMidi(midi));

    return tone === undefined
      ? null
      : { name: spellingName(tone.spelling, notation), role: tone.roleLabel.toLowerCase() };
  });

  const altSymbol = chordAltSymbol(root.spelling, preferences.quality);

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
      <aside
        className={`
          sticky
          top-15
          flex
          w-80
          flex-none
          flex-col
          gap-3.5

          max-md:static
          max-md:order-last
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
          <ChordSelector
            preferences={preferences}
            positions={positions}
            onChange={changePreferences}
          />
        </Panel>

        <Button
          variant="ghost"
          disabled={isMuted}
          onClick={() => {
            strum(midis);
          }}
          className={`
            flex
            items-center
            justify-center
            gap-2
          `}
        >
          <PlayIcon width="16" height="16" />
          Écouter l&apos;accord
        </Button>
      </aside>

      <main
        className={`
          flex
          max-w-xl
          flex-1
          flex-col
          gap-5

          max-md:w-full
          max-md:max-w-full
        `}
      >
        <Panel
          variant="display"
          className={`
            relative
            flex
            w-full
            flex-col
            items-center
            gap-3
            px-6
            py-5
          `}
        >
          <FingerLegendHint
            className={`
              absolute
              top-4
              right-4
            `}
          />
          <Flex
            align="baseline"
            justify="center"
            gap={3}
            isWrapping
          >
            <h1
              className={`
                font-display
                text-4xl
                font-semibold
                text-pearl
              `}
            >
              {chordName(root.spelling, preferences.quality, notation)}
            </h1>
            <span
              className={`
                font-mono
                text-lg
                text-pearl-faint
              `}
            >
              {chordSymbol(root.spelling, preferences.quality)}
              {altSymbol !== null && ` · ${altSymbol}`}
            </span>
          </Flex>

          <ChordFretboard
            frets={position.frets}
            fingers={position.fingers}
            barres={position.barres}
            noteLabels={noteLabels}
            rootPitchClass={root.pitchClass}
            maxFret={maxFret}
          />

        </Panel>

        <ChordTheory
          quality={preferences.quality}
          tones={tones}
          notation={notation}
          onQualityChange={(quality: ChordQuality) => {
            changePreferences({ ...preferences, quality, positionIndex: 0 });
          }}
        />
      </main>
    </PageContainer>
  );
}
