# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Vite + React + TypeScript web app for practicing Chinese-language exam questions (Primary school Chinese / Higher Chinese, Singapore-style "语文应用": cloze, error correction, reading comprehension, dialogue completion, hanyu pinyin, etc.), with a Tamagotchi-style gamification layer (earn BP for correct answers, hatch and grow a pet owl, feed/play with it via a shop + bag). Sound effects are synthesized with the Web Audio API (no external audio assets, except the one animated owl variant's video, whose sound is muxed into its own file) and dictation read-aloud uses the browser's `SpeechSynthesis` API — the app still needs no backend and works fully offline once built/served.

This was originally a single-file static HTML/CSS/vanilla-JS app (`app.js` + `data/*.js` + `styles.css` at the repo root, on this branch's earlier commits); it has since been rewritten onto Vite + React + TypeScript. **The root-level `app.js`, `styles.css`, and any root `data/` directory are gone** — don't recreate files there. Everything now lives under `src/`, and `index.html` loads `/src/main.tsx`.

## Running / testing

Standard Vite/npm project — no test suite (verify changes by running the dev server and clicking through the flow manually):

- `npm install` — install dependencies (React 19, `@supabase/supabase-js` is present as a dependency for a not-yet-built sync layer, see below).
- `npm run dev` — start the Vite dev server.
- `npm run build` — `tsc -b && vite build`; always run this (or at least `npx tsc -b`) after non-trivial changes, since there's no test suite to catch regressions otherwise.
- `npm run lint` — `oxlint`.
- `npm run preview` — serve the production build locally.
- `scripts/slice_owl_sprites.py` — one-off Python helper used to slice a hand-drawn owl sprite sheet into the individual PNGs under `public/owl/`; only relevant if re-generating owl art from a new sheet.

## Architecture

### Data layer (`src/data/`)
- `types.ts` — shared TypeScript interfaces for everything below: `Question` (`MCQQuestion | FillInQuestion | SelfCheckQuestion`), `QuestionGroup`, `Passage`, `GroupResult`/`GroupResultItem`, `HistoryEntry`, `PetState`, `ShopItem`, `PetStage`, `MoodBucket`.
- `questions.ts` — the question "database". This is the file to edit when adding/editing practice content:
  - `LESSON_COUNT` — number of lessons shown in the "practice by lesson" picker.
  - `CATEGORIES` — map of category key → `{ label, lessonMode }`. `lessonMode: true` categories are single-sentence items eligible for "practice by lesson"; `lessonMode: false` are passage-based items only offered under "practice by type".
  - `SUBJECTS` — e.g. `["Chinese", "Higher Chinese"]`, used as a filter in the type picker.
  - `QUESTION_GROUPS` — array of all groups. A **group** is either a standalone question (`passage: null`) or a passage plus every question that shares it — always presented and graded together, never split apart. Each has `groupId`, `subject`, `paper`, `section`, `category`, `lessonEligible` + `lessonIds`, `passage`, an optional shared `optionBank` (e.g. dialogue completion — rendered once, questions reference option keys instead of repeating them), and `questions[]` (`qNo`, `marks`, `format`, `text` — supports `__word__` markers rendered as underlined spans via `RichText`/`richText.tsx` — plus format-specific fields: MCQ has `options`/`correctKey`, Fill-in has `accepted`/`displayAnswer`, Long-Answer/Writing-Constrained just has `displayAnswer` and is self-graded by the student).
  - To add a new paper/lesson: append new group objects following an existing group's shape. Bump `LESSON_COUNT` for a new lesson number; add keys to `CATEGORIES` for a new question type. No other file needs to change for new data of the existing shape.
- `pet.ts` — pet/BP tunable config (not per-user state): `PET_STAGES` (6 growth stages: egg/baby/toddler/young/teenager/adult, with `minGrowth` thresholds), `MOOD_DECAY_PER_HOUR`, `BP_AWARD` (per question format), `SHOP_ITEMS` (id/cost/growth/mood), `PET_DEFAULT_STATE`, and the owl-art helpers described below.

### App state layer (`src/state/AppStateContext.tsx`)
`useReducer` + two React Contexts (`AppStateCtx`/`AppDispatchCtx`, read via `useAppState()`/`useAppDispatch()`). `AppState` holds `screen` (`"home" | "lessonPicker" | "typePicker" | "quiz" | "result" | "owl" | "shop" | "bag" | "auth"`), the current quiz session (`mode`, `modeLabel`, `groups`, `groupIndex`, `results`, `submitted`), and picker selections (`selectedSubject`, `selectedCategories`). `App.tsx`'s `ScreenRouter` switches on `state.screen` to render the matching component from `src/components/`. `"auth"` is a routed-to placeholder for a not-yet-built login screen.

Quiz session actions: `START_QUIZ`, `SUBMIT_GROUP`, `UPDATE_ITEM_RESULT` (patches one self-check item's result in place after the student clicks a self-check button — see below), `NEXT_GROUP`, `RESET_TO_HOME` (mirrors the old app's `resetToHome()`: clears session state but keeps `selectedSubject`/`selectedCategories`).

### Screens (`src/components/`)
Each top-level screen is its own component/folder: `Home`, `LessonPicker`, `TypePicker`, `Quiz`, `Result`, `Owl`, `Shop`, `Bag`. Shared UI lives in `components/common/`: `Modal.tsx` (`ConfirmModal` — a custom in-page confirm dialog, used instead of `window.confirm` so styling/behavior stays consistent, e.g. leaving a quiz mid-session or clearing history) and `OwlArt.tsx` (see Owl art below).

- **Quiz** (`Quiz.tsx`): groups for the session are shuffled once (`lib/shuffle.ts`) and stepped through one at a time via `state.groupIndex`. Submitting a group calls `gradeGroup` (`lib/grading.ts`), which grades MCQ/Fill-in immediately and returns self-check items (Long-Answer/Writing-Constrained) as `correct: null` until the student clicks a "✓ 我答对了 / ✗ 还需加强" button, which dispatches `UPDATE_ITEM_RESULT`. Each question has a "🔊 听写 Dictation" button (`lib/speech.ts`'s `speakText()`, `SpeechSynthesisUtterance` in `zh-CN`) that reads the question aloud. **Auto-advance:** if every item in a submitted group graded `correct === true` outright, the quiz auto-dispatches `NEXT_GROUP` after a 0.8s pause (with a visible "moving on..." hint on the Next button); anything wrong/skipped, or still awaiting a self-check click, requires the manual click. A pending auto-advance is cancelled if the student clicks Next early or navigates to a new group.
- **Result** (`Result.tsx`): computes the session score, saves it to history (`state/history.ts`) once on mount, and plays `Sound.applause()` on a 100% score or `Sound.encourage()` otherwise.
- **Home** (`Home.tsx`): mode picker + last-8 history rows, each with a per-row delete (with `ConfirmModal`) and a "Clear All" action (`state/history.ts`'s `deleteHistoryEntry`/`clearAllHistory`).
- **Owl** (`Owl.tsx`): shows growth stage, mood, growth-bar progress to the next stage, and BP. The screen's `<h1>` *is* the owl's name (inline-editable via a pencil button, `renameOwl()`) — there's no separate static title. Links to Shop and Bag (with a live bag-item count).
- **Shop** (`Shop.tsx`): spend BP on `SHOP_ITEMS`; buying calls `buyItem()` (adds to the pet's bag, does **not** apply the effect immediately) and animates the purchased item's emoji flying from its card into a bag-count badge (`lib/throwAnimation.ts`'s `flyItemTo`).
- **Bag** (`Bag.tsx`): lists bagged items; clicking "🎁 送给它 Give" flies the item's emoji from its card onto the owl art (`flyItemTo` again) and only calls `giveItem()` (which applies growth/mood and decrements inventory) once the animation lands.

### Pet / BP layer (`src/data/pet.ts` + `src/state/PetContext.tsx`)
`PetProvider` holds `PetState` in `useState`, persisted to `localStorage` under `PET_KEY` (`hanyuPracticePet_v1`) on every change; `usePet()` exposes `{ pet, awardBP, buyItem, giveItem, renameOwl }`.

- **Mood is derived, never stored as a live value**: `pet.moodAtCheckpoint` + `pet.lastFedAt` is a fixed pair, and `computeCurrentMood()` decays from that pair fresh on every call (not a decay tick) — this is what makes time-based neglect work without a server, and avoids compounding rounding error from repeatedly decaying an already-decayed number. `growth` is monotonic and completely decoupled from mood/decay.
- **BP** is awarded via `awardBP()`, called from `Quiz.tsx` for MCQ/Fill-in (immediately on grading) and for Long-Answer/Writing-Constrained (from the self-check "✓" handler, guarded by a `bpAwarded` flag on the result item so re-toggling doesn't double-pay).
- **Bag/inventory**: `PetState.inventory` is a `Record<shopItemId, quantity>`. `buyItem()` deducts BP and adds to inventory; it does *not* touch growth/mood. `giveItem()` is the only thing that applies a `ShopItem`'s growth/mood effect (and decrements inventory) — called from `Bag.tsx` once that item's throw animation lands, never directly from the Shop.
- **Naming**: `PetState.name` (default `""`, shown as a placeholder prompt until set), edited via `renameOwl()` (trims, caps at 12 chars).
- Cross-device sync (accounts, Supabase — `@supabase/supabase-js` is already a dependency) is an intentionally separate, not-yet-built later phase; `PetState`'s flat, serializable shape is designed so a future sync layer can push/pull it without a local data-model rewrite.

### Owl art (`OwlArt.tsx` + `pet.ts`)
One static PNG per stage × mood bucket lives in `public/owl/` (`owl-<stage>-<mood>.png`, e.g. `owl-baby-happy.png` — 6 stages × 4 moods = 24 assets, `owlSpritePath()`). A stage/mood combo can instead have a hand-animated **MP4** (H.264 + AAC, sound muxed into the video's own audio track — not a separate audio file) that `OwlArt` prefers over the PNG when present, driven by the `ANIMATED_OWL_VARIANTS` allowlist in `pet.ts` (currently just `"egg-very_happy"`, as a proof of concept before animating the rest). The `<video>` has no `loop` (plays once, holds the last frame) and is only unmuted when `OwlArt`'s `playSound` prop is set — currently only on the Owl screen, so the sound doesn't replay on every trip back to Home (which also renders the animated variant, just muted, via the same `OwlArt` component). `OwlArt` forwards a ref to its root element so `Bag.tsx`'s throw animation can target the owl's on-screen position.

### Sound (`src/lib/sound.ts`)
Everything is synthesized via the Web Audio API — no audio files (aside from the owl MP4's own track). Each effect has a deliberately distinct timbre so they don't get confused: `click()` (filtered-noise tap, generic UI clicks — wired up globally in `App.tsx` via a document-level click listener on `button, .option-label`), `ding()` (warm detuned-oscillator bell arpeggio, correct quiz answers), `purchase()` (metallic square-wave "coin" clink, Shop buys), `gift()` (rising triangle-wave glissando, giving an item to the owl in the Bag), `applause()` (randomized/tapering noise-burst claps, 100% quiz score), `encourage()` (soft descending 2-note chime, sub-100% score).

### History (`src/state/history.ts`)
Persists the last 50 session summaries to `localStorage` under `HISTORY_KEY` (`hanyuPracticeHistory_v2`; bump this key if the stored shape changes, to avoid crashing on old data). Each `HistoryEntry` has an `id` (assigned on save; `loadHistory()` lazily backfills `id` onto any pre-existing entries that predate the delete feature) so `Home.tsx` can delete individual rows or clear all of them.

### Styling (`src/styles/styles.css`)
Single global stylesheet (the "scholar's-study" design system), theme-aware via `@media (prefers-color-scheme: dark)` overriding the same CSS custom properties (`--primary`, `--ink`, `--bg`, `--card-bg`, `--border`, shadow tokens, etc.) defined on `:root`. No CSS modules/CSS-in-JS — components just reference global class names.
