import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from "react";
import type { QuestionGroup, GroupResult } from "../data/types";

export type Screen =
  | "home"
  | "lessonPicker"
  | "typePicker"
  | "quiz"
  | "result"
  | "owl"
  | "shop"
  | "auth";

export interface AppState {
  screen: Screen;
  mode: "lesson" | "type" | null;
  modeLabel: string;
  groups: QuestionGroup[];
  groupIndex: number;
  results: GroupResult[];
  submitted: boolean;
  selectedSubject: string;
  selectedCategories: Set<string>;
}

const initialState: AppState = {
  screen: "home",
  mode: null,
  modeLabel: "",
  groups: [],
  groupIndex: 0,
  results: [],
  submitted: false,
  selectedSubject: "All",
  selectedCategories: new Set()
};

export type AppAction =
  | { type: "GO_TO_SCREEN"; screen: Screen }
  | { type: "START_QUIZ"; mode: "lesson" | "type"; modeLabel: string; groups: QuestionGroup[] }
  | { type: "SELECT_SUBJECT"; subject: string }
  | { type: "TOGGLE_CATEGORY"; key: string }
  | { type: "SUBMIT_GROUP"; record: GroupResult }
  | { type: "NEXT_GROUP" }
  | { type: "RESET_TO_HOME" };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "GO_TO_SCREEN":
      return { ...state, screen: action.screen };
    case "START_QUIZ":
      return {
        ...state,
        mode: action.mode,
        modeLabel: action.modeLabel,
        groups: action.groups,
        groupIndex: 0,
        results: [],
        submitted: false,
        screen: "quiz"
      };
    case "SELECT_SUBJECT":
      return { ...state, selectedSubject: action.subject };
    case "TOGGLE_CATEGORY": {
      const next = new Set(state.selectedCategories);
      if (next.has(action.key)) next.delete(action.key);
      else next.add(action.key);
      return { ...state, selectedCategories: next };
    }
    case "SUBMIT_GROUP":
      return { ...state, results: [...state.results, action.record], submitted: true };
    case "NEXT_GROUP": {
      const groupIndex = state.groupIndex + 1;
      return {
        ...state,
        groupIndex,
        submitted: false,
        screen: groupIndex >= state.groups.length ? "result" : "quiz"
      };
    }
    // Mirrors the old app's resetToHome(): clears the in-session quiz state
    // but deliberately keeps selectedSubject/selectedCategories, same as before.
    case "RESET_TO_HOME":
      return {
        ...initialState,
        selectedSubject: state.selectedSubject,
        selectedCategories: state.selectedCategories
      };
    default:
      return state;
  }
}

const AppStateCtx = createContext<AppState | null>(null);
const AppDispatchCtx = createContext<Dispatch<AppAction> | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppStateCtx.Provider value={state}>
      <AppDispatchCtx.Provider value={dispatch}>{children}</AppDispatchCtx.Provider>
    </AppStateCtx.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const ctx = useContext(AppDispatchCtx);
  if (!ctx) throw new Error("useAppDispatch must be used within AppStateProvider");
  return ctx;
}
