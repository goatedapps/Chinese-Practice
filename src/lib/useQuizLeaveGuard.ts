import { useState } from "react";
import { useAppState } from "../state/AppStateContext";

// Wraps a navigation callback so that, while the student is mid-quiz (the
// one screen with real unsaved state -- Result has already saved history by
// the time it mounts), it first asks for confirmation instead of leaving
// instantly. Shared by TopNav's nav items and AccountBar's Login trigger,
// the two top-bar controls that can navigate away from an in-progress quiz
// now that the top bar stays visible there (see App.tsx's showTopNav).
export function useQuizLeaveGuard() {
  const state = useAppState();
  const [pending, setPending] = useState<(() => void) | null>(null);

  function guard(action: () => void) {
    if (state.screen === "quiz") setPending(() => action);
    else action();
  }

  function confirm() {
    pending?.();
    setPending(null);
  }

  function cancel() {
    setPending(null);
  }

  return { guard, confirmOpen: pending !== null, confirm, cancel };
}
