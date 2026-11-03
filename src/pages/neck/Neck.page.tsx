import { useNotation } from "../../hooks/useNotation";
import { usePitch } from "../../hooks/usePitch";
import { useWakeLock } from "../../hooks/useWakeLock";
import { STRINGS, stringName } from "../../lib/music/guitar";
import { NATURAL_PITCH_CLASSES, pitchClassName } from "../../lib/music/notation";
import { Checkbox } from "../../components/inputs/Checkbox";
import { MicGate } from "../../components/MicGate";
import { Panel } from "../../components/Panel";
import { SectionTitle } from "../../components/SectionTitle";
import { PageContainer } from "../../components/layout/PageContainer";
import { HeardNote } from "./components/HeardNote";
import { NeckDiagram } from "./components/NeckDiagram";
import { isPositionHighlighted, NATURAL_NECK_POSITIONS } from "./neckPositions";
import { useNeckPreferences } from "./useNeckPreferences";
import { useRecognizedNote } from "./useRecognizedNote";

function toggled(values: number[], value: number, isChecked: boolean): number[] {
  return isChecked ? [...values, value] : values.filter((checked) => checked !== value);
}

export function Neck() {
  const [notation] = useNotation();
  const [preferences, setPreferences] = useNeckPreferences();
  const { checkedPitchClasses, checkedStringIndexes } = preferences;
  const { isStarted } = usePitch();
  useWakeLock(isStarted);

  const highlightedMidis = new Set(
    NATURAL_NECK_POSITIONS
      .filter((position) => isPositionHighlighted(position, checkedPitchClasses, checkedStringIndexes))
      .map(({ midi }) => midi),
  );
  const recognized = useRecognizedNote(highlightedMidis);

  return (
    <PageContainer
      className={`
        flex
        max-w-4xl
        items-start
        justify-center
        gap-8

        max-md:gap-4
        max-md:px-4
      `}
    >
      <div
        className={`
          flex
          min-w-0
          flex-1
          flex-col-reverse
          gap-2

          md:flex-none

          lg:flex-row
          lg:items-start
          lg:gap-8
        `}
      >
        <NeckDiagram
          checkedPitchClasses={checkedPitchClasses}
          checkedStringIndexes={checkedStringIndexes}
          matchedMidi={recognized?.isMatch === true ? recognized.midi : null}
          notation={notation}
          className={`
            h-auto
            w-full

            md:h-[min(calc(100vh-17rem),52rem)]
            md:w-auto

            lg:h-[min(calc(100vh-9rem),52rem)]
          `}
        />
        <div
          className={`
            contain-inline-size

            lg:order-first
            lg:w-64
            lg:flex-none
          `}
        >
          <MicGate
            title="Écoute au micro"
            feature="Active le micro pour afficher la note que tu joues. Elle passe au vert si elle est mise en évidence sur le manche."
          >
            <HeardNote recognized={recognized} />
          </MicGate>
        </div>
      </div>

      <aside
        className={`
          sticky
          top-20
          flex
          flex-none
          flex-col
          gap-4.5

          max-md:top-4
        `}
      >
        <Panel
          className={`
            flex
            flex-col
            gap-3
            rounded-xl
            px-4
            py-3.5

            max-md:px-3
          `}
        >
          <SectionTitle>Notes</SectionTitle>
          {NATURAL_PITCH_CLASSES.map((pitchClass) => (
            <Checkbox
              key={pitchClass}
              isChecked={checkedPitchClasses.includes(pitchClass)}
              onChange={(isChecked) => {
                setPreferences({
                  ...preferences,
                  checkedPitchClasses: toggled(checkedPitchClasses, pitchClass, isChecked),
                });
              }}
            >
              {pitchClassName(pitchClass, notation)}
            </Checkbox>
          ))}
        </Panel>

        <Panel
          className={`
            flex
            flex-col
            gap-3
            rounded-xl
            px-4
            py-3.5

            max-md:px-3
          `}
        >
          <SectionTitle>Cordes</SectionTitle>
          {STRINGS.map((_, stringIndex) => (
            <Checkbox
              key={stringIndex}
              isChecked={checkedStringIndexes.includes(stringIndex)}
              onChange={(isChecked) => {
                setPreferences({
                  ...preferences,
                  checkedStringIndexes: toggled(checkedStringIndexes, stringIndex, isChecked),
                });
              }}
            >
              {stringName(stringIndex, notation)}
            </Checkbox>
          ))}
        </Panel>
      </aside>
    </PageContainer>
  );
}
