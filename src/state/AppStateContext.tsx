import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from "react";
import type { QuestionGroup, GroupResult, GroupResultItem } from "../data/types";
import { CATEGORY_SUBJECTS, VOCABULARY_CATEGORY_KEYS } from "../data/questions";

export type Screen =
  | "home"
  | "practice"
  | "quiz"
  | "result"
  | "owl"
  | "shop"
  | "bag"
  | "play"
  | "tingxie"
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
  // Which lessons to restrict the Vocabulary category to on the Practice
  // screen -- empty means "all lessons" (the default/no filter). Only
  // meaningful while Vocabulary's 4 categories are all selected; cleared
  // automatically whenever they're not (see vocabRetained() below).
  selectedLessons: Set<number>;
  // Which toy (ShopItem.id) is being played on the "play" screen -- set by
  // START_PLAY, read by components/Play/PlayGame.tsx. Left stale after
  // leaving "play" (harmless, only ever read while screen === "play").
  playingItemId: string | null;
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
  selectedCategories: new Set(),
  selectedLessons: new Set(),
  playingItemId: null
};

export type AppAction =
  | { type: "GO_TO_SCREEN"; screen: Screen }
  | { type: "START_QUIZ"; mode: "lesson" | "type"; modeLabel: string; groups: QuestionGroup[] }
  | { type: "SELECT_SUBJECT"; subject: string }
  | { type: "TOGGLE_CATEGORY"; key: string }
  | { type: "TOGGLE_CATEGORY_GROUP"; keys: string[] }
  | { type: "SET_CATEGORIES"; keys: string[] }
  | { type: "TOGGLE_LESSON"; lessonNum: number }
  | { type: "SELECT_ALL_LESSONS" }
  | { type: "SUBMIT_GROUP"; record: GroupResult }
  | { type: "UPDATE_ITEM_RESULT"; groupIndex: number; qNo: string; patch: Partial<GroupResultItem> }
  | { type: "NEXT_GROUP" }
  | { type: "RESET_TO_HOME" }
  | { type: "START_PLAY"; itemId: string };

// Whether every one of Vocabulary's 4 underlying categories is still in a
// candidate selectedCategories set -- used to decide whether selectedLessons
// should survive a categories change, since a lesson filter is meaningless
// (and would sit there stale) once Vocabulary itself isn't selected.
function vocabRetained(categories: Set<string>): boolean {
  return VOCABULARY_CATEGORY_KEYS.every((k) => categories.has(k));
}

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
    case "SELECT_SUBJECT": {
      // Drop any currently-selected category that doesn't exist for the
      // newly-picked subject (e.g. switching to Higher Chinese while
      // Vocabulary is selected) -- Practice greys those buttons out and
      // makes them unclickable, so a stale selection could otherwise sit
      // there invisibly still counting toward the session.
      const next =
        action.subject === "All"
          ? state.selectedCategories
          : new Set([...state.selectedCategories].filter((k) => CATEGORY_SUBJECTS[k]?.has(action.subject)));
      return {
        ...state,
        selectedSubject: action.subject,
        selectedCategories: next,
        selectedLessons: vocabRetained(next) ? state.selectedLessons : new Set()
      };
    }
    case "TOGGLE_CATEGORY": {
      const next = new Set(state.selectedCategories);
      if (next.has(action.key)) next.delete(action.key);
      else next.add(action.key);
      return { ...state, selectedCategories: next, selectedLessons: vocabRetained(next) ? state.selectedLessons : new Set() };
    }
    case "TOGGLE_CATEGORY_GROUP": {
      const next = new Set(state.selectedCategories);
      const allSelected = action.keys.every((k) => next.has(k));
      for (const k of action.keys) {
        if (allSelected) next.delete(k);
        else next.add(k);
      }
      return { ...state, selectedCategories: next, selectedLessons: vocabRetained(next) ? state.selectedLessons : new Set() };
    }
    case "SET_CATEGORIES": {
      const next = new Set(action.keys);
      return { ...state, selectedCategories: next, selectedLessons: vocabRetained(next) ? state.selectedLessons : new Set() };
    }
    case "TOGGLE_LESSON": {
      const next = new Set(state.selectedLessons);
      if (next.has(action.lessonNum)) next.delete(action.lessonNum);
      else next.add(action.lessonNum);
      return { ...state, selectedLessons: next };
    }
    case "SELECT_ALL_LESSONS":
      return { ...state, selectedLessons: new Set() };
    case "SUBMIT_GROUP":
      return { ...state, results: [...state.results, action.record], submitted: true };
    // Self-check questions (Long-Answer/Writing-Constrained) are only known
    // correct/incorrect after the student clicks a self-check button, which
    // happens after SUBMIT_GROUP already pushed the record -- this patches
    // that one item in place.
    case "UPDATE_ITEM_RESULT": {
      const results = state.results.map((r, idx) => {
        if (idx !== action.groupIndex) return r;
        return {
          ...r,
          items: r.items.map((it) => (it.qNo === action.qNo ? { ...it, ...action.patch } : it))
        };
      });
      return { ...state, results };
    }
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
    // but deliberately keeps selectedSubject/selectedCategories/selectedLessons,
    // same as before.
    case "RESET_TO_HOME":
      return {
        ...initialState,
        selectedSubject: state.selectedSubject,
        selectedCategories: state.selectedCategories,
        selectedLessons: state.selectedLessons
      };
    case "START_PLAY":
      return { ...state, screen: "play", playingItemId: action.itemId };
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
