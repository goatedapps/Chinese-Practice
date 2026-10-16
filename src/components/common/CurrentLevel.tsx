import { useAppState } from "../../state/AppStateContext";
import { LEVELS } from "../../data/levels";

export function CurrentLevel() {
  const { level } = useAppState();
  const label = LEVELS.find((entry) => entry.id === level)?.label ?? level.toUpperCase();
  return <span className="current-level" aria-label={`年级 Level ${label}`}>{label}</span>;
}
