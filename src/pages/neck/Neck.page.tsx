import { useState } from "react";
import { useNotation } from "../../hooks/useNotation";
import { STRINGS, stringName } from "../../lib/music/guitar";
import { NATURAL_PITCH_CLASSES, pitchClassName } from "../../lib/music/notation";
import { Checkbox } from "../../components/inputs/Checkbox";
import { Panel } from "../../components/Panel";
import { SectionTitle } from "../../components/SectionTitle";
import { PageContainer } from "../../components/layout/PageContainer";
import { NeckDiagram } from "./components/NeckDiagram";

function toggled(values: number[], value: number, isChecked: boolean): number[] {
  return isChecked ? [...values, value] : values.filter((checked) => checked !== value);
}

export function Neck() {
  const [notation] = useNotation();
  const [checkedPitchClasses, setCheckedPitchClasses] = useState<number[]>([]);
  const [checkedStringIndexes, setCheckedStringIndexes] = useState<number[]>([]);

  return (
    <PageContainer
      className={`
        flex
        max-w-3xl
        items-start
        justify-center
        gap-8

        max-md:gap-4
        max-md:px-4
      `}
    >
      <NeckDiagram
        checkedPitchClasses={checkedPitchClasses}
        checkedStringIndexes={checkedStringIndexes}
        notation={notation}
        className={`
          h-auto
          min-w-0
          flex-1

          md:h-[min(calc(100vh-9rem),52rem)]
          md:w-auto
          md:flex-none
        `}
      />

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
            mt-9
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
                setCheckedPitchClasses((previous) => toggled(previous, pitchClass, isChecked));
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
                setCheckedStringIndexes((previous) => toggled(previous, stringIndex, isChecked));
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
