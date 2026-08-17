import type { QuestionGroup } from "../data/types";
import { getCurrentLevel, isCategoryRelevantForLevel } from "../data/levels";
import { shuffle } from "./shuffle";
import { shuffleMcqOptions } from "./mcqShuffle";

// How many standalone single-question groups (pinyin/vocab/phrase/...) to
// pull into a "practice by type" session -- picking a broad type selection
// shouldn't dump the entire matching pool on the student in one sitting.
const INDIVIDUAL_QUESTION_COUNT = 10;

// Persisted round-robin queues for passage-based categories (cloze,
// comprehension, dialogue, errorcorrect, practical) -- see pickRoundRobin()
// below. Keyed by category; survives across sessions/reloads so a student
// practicing the same category repeatedly cycles through every available
// passage before any of them repeats, instead of a plain random pick
// re-showing the same one or two passages by chance.
const ROTATION_KEY = "hanyuPracticePassageRotation_v1";

type RotationStore = Record<string, string[]>;

function loadRotation(): RotationStore {
  try {
    const raw = localStorage.getItem(ROTATION_KEY);
    return raw ? (JSON.parse(raw) as RotationStore) : {};
  } catch {
    return {};
  }
}

function saveRotation(store: RotationStore): void {
  try {
    localStorage.setItem(ROTATION_KEY, JSON.stringify(store));
  } catch {
    // ignore -- e.g. storage disabled/full; rotation just resets next time
  }
}

// Picks the next passage group for a category from a persisted,
// freshly-shuffled queue of not-yet-served group ids, refilling (and
// reshuffling) only once every group in the category has been served --
// this is what minimizes repeats across sessions rather than each session
// picking independently at random. The queue is filtered down to ids still
// present in `groups` on every draw, so it stays correct even as the
// subject filter changes which groups are in play (a stale id from a since
// hidden subject just gets dropped, not treated as an error).
function pickRoundRobin(category: string, groups: QuestionGroup[], store: RotationStore): QuestionGroup {
  const validIds = new Set(groups.map((g) => g.groupId));
  let queue = (store[category] ?? []).filter((id) => validIds.has(id));
  if (queue.length === 0) queue = shuffle(groups.map((g) => g.groupId));

  const [nextId, ...rest] = queue;
  store[category] = rest;
  return groups.find((g) => g.groupId === nextId)!;
}

// Builds a "practice by type" session from every group matching the
// student's chosen subject + categories:
//  - passage-based categories (cloze, comprehension, dialogue, ...) each
//    contribute exactly one passage, drawn round-robin (see pickRoundRobin)
//    so e.g. selecting both "comprehension" and "cloze" yields one of each,
//    not a pile of both, and repeats stay minimized across sessions.
//  - standalone single-question categories (pinyin, vocab, ...) are pooled
//    together across every selected one and capped at a fixed count.
export function selectTypeSessionGroups(candidates: QuestionGroup[]): QuestionGroup[] {
  // Defense-in-depth, not just a picker-UI concern: every START_QUIZ
  // dispatch site (Practice, Today's Mission, Special Quest) funnels
  // through this one function, so filtering here guarantees a level's
  // irrelevant categories (see data/levels.ts's relevantCategories) can
  // never end up in a built session regardless of which UI path assembled
  // the candidate groups.
  const level = getCurrentLevel();
  const relevant = candidates.filter((g) => isCategoryRelevantForLevel(g.category, level));

  const byCategory = new Map<string, QuestionGroup[]>();
  for (const g of relevant) {
    const list = byCategory.get(g.category);
    if (list) list.push(g);
    else byCategory.set(g.category, [g]);
  }

  const rotation = loadRotation();
  const selected: QuestionGroup[] = [];
  const individualPool: QuestionGroup[] = [];
  for (const [category, groups] of byCategory) {
    if (groups[0].passage !== null) {
      selected.push(pickRoundRobin(category, groups, rotation));
    } else {
      individualPool.push(...groups);
    }
  }
  saveRotation(rotation);
  selected.push(...shuffle(individualPool).slice(0, INDIVIDUAL_QUESTION_COUNT));

  // Fresh MCQ option order every time a session is actually built (not at
  // fetch/cache time) -- see lib/mcqShuffle.ts.
  return shuffle(selected).map(shuffleMcqOptions);
}
