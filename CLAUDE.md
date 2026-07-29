# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, no-build-tools, no-dependencies web app for practicing Chinese-language exam questions (Primary school Chinese / Higher Chinese, Singapore-style "语文应用", cloze, error correction, reading comprehension, dialogue completion), with a Tamagotchi-style gamification layer (earn BP for correct answers, grow a pet owl). The app is:

- `index.html` — loads `data/questions.js`, `data/pet.js`, then `app.js`, mounts into `#app`.
- `data/questions.js` — the question "database" (plain JS globals, no JSON/build step).
- `data/pet.js` — pet/BP config: growth stages, shop items, mood decay rate, owl SVG art (plain JS globals, no build step).
- `app.js` — all rendering, state, grading, history, and pet/BP logic (vanilla JS, no framework).
- `styles.css` — all styling.

## Running / testing

There is no build, package manager, or test suite — it's plain HTML/CSS/JS opened directly in a browser (works fully offline, including sound effects via Web Audio API — no external audio files). To develop:

- Open `index.html` directly in a browser, or serve the folder with any static file server.
- To verify a change, open the app and click through the flow manually (there is no automated test runner to invoke).

## Architecture

### Data layer (`data/questions.js`)
This is the only file that should change when adding/editing practice content. It defines:

- `LESSON_COUNT` — number of lessons shown in the "practice by lesson" picker.
- `CATEGORIES` — map of category key → `{ label, lessonMode }`. `lessonMode: true` categories are single-sentence items eligible for "practice by lesson"; `lessonMode: false` are passage-based items only offered under "practice by type" (cloze, error correction, comprehension, dialogue, practical text).
- `SUBJECTS` — e.g. `["Chinese", "Higher Chinese"]`, used as a filter in the type picker.
- `QUESTION_GROUPS` — the array of all groups. A **group** is either a standalone question (`passage: null`) or a passage plus every question that shares it — groups are always presented and graded together, never split apart. Each group has:
  - `groupId`, `subject`, `paper`, `section`, `category`
  - `lessonEligible` (bool) + `lessonIds` (array of lesson numbers this group belongs to) — drives the lesson picker
  - `passage: { title, source, text }` or `null`
  - `optionBank` (optional) — a shared MCQ option list referenced by all questions in the group (e.g. dialogue completion), rendered once instead of repeating per-question
  - `questions[]` — each with `qNo`, `marks`, `format` (`"MCQ" | "Fill-in" | "Long-Answer"`), `text` (supports `__word__` markers rendered as underlined spans via `richText()`), plus format-specific fields:
    - MCQ: `options` (or relies on group `optionBank`) + `correctKey`
    - Fill-in: `accepted` (array of accepted normalized answers) + `displayAnswer`
    - Long-Answer / writing-constrained: `displayAnswer` only — these are self-graded by the student (see below)

`app.js` reads only these globals; adding new questions/lessons/categories of the existing shape requires no changes to `app.js`.

### App layer (`app.js`)
Single-file, no-framework render loop:

- `state` is the one source of truth (`screen`, `mode`, `groups`, `groupIndex`, `results`, picker selections). `render()` clears `#app` and dispatches to one of `renderHome / renderLessonPicker / renderTypePicker / renderQuiz / renderResult` based on `state.screen`. Every state mutation is followed by a manual `render()` call — there is no reactivity/diffing.
- `el(tag, attrs, children)` is the DOM-builder helper used everywhere instead of templates/innerHTML strings.
- Quiz flow: groups for the session are shuffled once (`shuffle`) and stepped through one at a time (`state.groupIndex`). Submitting a group calls `gradeGroup`, which grades MCQ/Fill-in automatically and renders a model answer + self-check (right/wrong) buttons for Long-Answer items — those results are mutated into `state.results` in place via the button click handlers.
- `saveHistory` / `loadHistory` persist the last 50 session summaries to `localStorage` under `HISTORY_KEY` (bump this key if the stored shape changes, to avoid crashing on old data).
- `Sound` is a small Web Audio synth (click + correct-answer ding) — no audio assets.
- Leaving a quiz mid-session goes through `hasQuizProgress()` + `showConfirmModal()` (a custom in-page modal, not `window.confirm`) to avoid silently discarding progress.

### Pet / BP layer (`data/pet.js` + `app.js`)
Persists separately from quiz history, under its own localStorage key (`PET_KEY`, next to `HISTORY_KEY`):

- `data/pet.js` holds tunable config: `PET_STAGES` (growth thresholds for egg/baby/toddler/adult), `MOOD_DECAY_PER_HOUR`, `BP_AWARD` (per question format), `SHOP_ITEMS` (cost/growth/mood per item), `PET_DEFAULT_STATE`, and the owl art (`OWL_BODY_SVG`/`OWL_FACE_SVG` — one SVG per growth stage body, one per mood-bucket face overlay, composed together via `renderOwlArt()` so 4 stages + 4 moods only need 8 assets, not a 16-way cross-product).
- Mood is **derived, not stored as a live value**: `petState` keeps a `moodAtCheckpoint` + `lastFedAt` pair, and `computeCurrentMood()` decays from that pair on demand (called at render time only) — this is what makes neglect (time-based mood decay) work without a server, and avoids compounding drift from repeatedly decaying an already-decayed number. `growth` is monotonic and never affected by decay.
- BP is awarded per correct answer, hooked directly into `gradeGroup()` (MCQ/Fill-in, immediately) and into the Long-Answer self-check "✓ 我答对了" button handler (guarded by a `bpAwarded` flag so re-toggling doesn't double-pay).
- Buying a shop item (`buyItem()`) applies its growth/mood effect immediately — there's no separate "unused inventory" state.
- Cross-device sync (accounts, Supabase) is an intentionally separate, not-yet-built later phase — `petState`'s flat, serializable shape is designed so a future sync layer can push/pull it without a local data-model rewrite.

### Adding new practice content
To add a new paper/lesson's worth of questions: append new group objects to `QUESTION_GROUPS` in `data/questions.js` following the existing shape (copy a similar group as a template — e.g. an MCQ-only lesson group like `CH-Q1`, or a passage+Long-Answer group like `HC-G3`). Bump `LESSON_COUNT` if introducing a new lesson number, and add new keys to `CATEGORIES` if introducing a new question type.
