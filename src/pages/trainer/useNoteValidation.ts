import { useEffect, useState } from "react";
import type { NoteCandidate } from "../../lib/music/guitar";
import { useEngineFrame } from "../../hooks/useEngineFrame";
import { useLatest } from "../../hooks/useLatest";
import { createValidationSession } from "./noteValidator";

interface Options {
  target: NoteCandidate | null;
  isActive: boolean;
  onValidated: () => void;
}

export function useNoteValidation({ target, isActive, onValidated }: Options): void {
  const [session] = useState(createValidationSession);
  const isActiveRef = useLatest(isActive);
  const onValidatedRef = useLatest(onValidated);

  useEffect(() => {
    session.setTarget(target);
  }, [session, target]);

  useEngineFrame((frame) => {
    if (!isActiveRef.current) {
      return;
    }

    if (session.processFrame(frame, performance.now())) {
      onValidatedRef.current();
    }
  });
}
