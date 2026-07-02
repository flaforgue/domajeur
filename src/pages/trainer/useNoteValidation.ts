import { useEffect, useRef } from "react";
import { useEngineFrame } from "../../hooks/useEngineFrame";
import { useLatest } from "../../hooks/useLatest";
import { createNoteValidator, type NoteValidator } from "./noteValidator";

interface Options {
  targetMidi: number | null;
  isActive: boolean;
  onValidated: () => void;
}

export function useNoteValidation({ targetMidi, isActive, onValidated }: Options): void {
  const validatorRef = useRef<NoteValidator | null>(null);
  const isActiveRef = useLatest(isActive);
  const onValidatedRef = useLatest(onValidated);

  useEffect(() => {
    validatorRef.current = targetMidi === null ? null : createNoteValidator(targetMidi);
  }, [targetMidi]);

  useEngineFrame((frame) => {
    const validator = validatorRef.current;
    if (!isActiveRef.current || validator === null) {
      return;
    }

    if (validator.processFrame(frame)) {
      onValidatedRef.current();
    }
  });
}
