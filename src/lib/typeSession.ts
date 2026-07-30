import type { QuestionGroup } from "../data/types";
import { shuffle } from "./shuffle";

// How many standalone single-question groups (pinyin/vocab/phrase/...) to
// pull into a "practice by type" session -- picking a broad type selection
// shouldn't dump the entire matching pool on the student in one sitting.
const INDIVIDUAL_QUESTION_COUNT = 10;

// Builds a "practice by type" session from every group matching the
// student's chosen subject + categories:
//  - passage-based categories (cloze, comprehension, dialogue, ...) each
//    contribute exactly one randomly chosen passage, so e.g. selecting both
//    "comprehension" and "cloze" yields one of each, not a pile of both.
//  - standalone single-question categories (pinyin, vocab, ...) are pooled
//    together across every selected one and capped at a fixed count.
export function selectTypeSessionGroups(candidates: QuestionGroup[]): QuestionGroup[] {
  const byCategory = new Map<string, QuestionGroup[]>();
  for (const g of candidates) {
    const list = byCategory.get(g.category);
    if (list) list.push(g);
    else byCategory.set(g.category, [g]);
  }

  const selected: QuestionGroup[] = [];
  const individualPool: QuestionGroup[] = [];
  for (const groups of byCategory.values()) {
    if (groups[0].passage !== null) {
      selected.push(shuffle(groups)[0]);
    } else {
      individualPool.push(...groups);
    }
  }
  selected.push(...shuffle(individualPool).slice(0, INDIVIDUAL_QUESTION_COUNT));

  return shuffle(selected);
}
