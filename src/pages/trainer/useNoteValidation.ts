import { useEffect, useRef } from "react";
import type { NoteCandidate } from "../../lib/music/guitar";
import { useEngineFrame } from "../../hooks/useEngineFrame";
import { useLatest } from "../../hooks/useLatest";
import { createNoteValidator, type NoteValidator } from "./noteValidator";

interface Options {
  target: NoteCandidate | null;
  isActive: boolean;
  onValidated: () => void;
}

export function useNoteValidation({ target, isActive, onValidated }: Options): void {
  const validatorRef = useRef<NoteValidator | null>(null);
  const isActiveRef = useLatest(isActive);
  const onValidatedRef = useLatest(onValidated);

  useEffect(() => {
    validatorRef.current = target === null ? null : createNoteValidator(target.midi);
  }, [target]);

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
