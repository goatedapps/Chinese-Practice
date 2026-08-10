import { useAppState, useAppDispatch } from "../../state/AppStateContext";
import { LEVELS, setCurrentLevel } from "../../data/levels";

// A small persistent level switcher, rendered alongside TopNav/AccountBar
// (see App.tsx) -- same "small bar below TopNav" placement as AccountBar.
// Switching levels re-points every content loader (data/questions.ts,
// data/tingxie.ts, data/stories.ts) at a different public/content/<level>/
// directory -- see data/levels.ts. setCurrentLevel() (the loaders' own
// module-level "which level" state) is called here, in lockstep with
// dispatching SET_LEVEL (AppState's copy of the same choice, which also
// resets the question-bank bootstrap/session/picker state back to a clean
// slate for the new level) -- the two must never be called independently of
// each other or the loaders and the reducer end up disagreeing about which
// level is active.
export function LevelBar() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  if (LEVELS.length < 2) return null;

  return (
    <div className="level-bar">
      <span className="level-bar-label">年级 Level:</span>
      {LEVELS.map((lvl) => (
        <button
          key={lvl.id}
          className={"chip" + (state.level === lvl.id ? " chip-active" : "")}
          disabled={state.level === lvl.id}
          onClick={() => {
            setCurrentLevel(lvl.id);
            dispatch({ type: "SET_LEVEL", level: lvl.id });
          }}
        >
          {lvl.label}
        </button>
      ))}
    </div>
  );
}
