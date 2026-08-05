// Home dashboard's "Special Quest" wheel state (components/Home/SpecialQuest.tsx):
// one quest, picked at random from data/pet.ts's SPECIAL_QUEST_TYPES, per
// calendar day. Same day-scoped-reset pattern as state/todaySummary.ts -- a
// stored entry whose dateKey isn't today is treated as "not spun yet" rather
// than migrated/carried over, so the wheel is spinnable again each new day
// with no explicit reset step anywhere else in the app.
import { SPECIAL_QUEST_TYPES } from "../data/pet";
import { dateKey } from "../lib/stats";
import { loadJSON } from "../lib/storage";

const SPECIAL_QUEST_KEY = "hanyuPracticeSpecialQuest_v1";

type SpecialQuestStatus = "pending" | "completed";

interface StoredShape {
  dateKey: string;
  questId: string;
  status: SpecialQuestStatus;
}

function loadStore(): StoredShape | null {
  const saved = loadJSON<StoredShape | null>(SPECIAL_QUEST_KEY, null);
  if (!saved || saved.dateKey !== dateKey(Date.now())) return null;
  return saved;
}

function saveStore(store: StoredShape): void {
  localStorage.setItem(SPECIAL_QUEST_KEY, JSON.stringify(store));
}

export function getTodaySpecialQuest(): { questId: string; status: SpecialQuestStatus } | null {
  const store = loadStore();
  return store ? { questId: store.questId, status: store.status } : null;
}

// Picks a random quest and persists it as "pending" for today. Callers (the
// wheel's Spin button) should only call this when getTodaySpecialQuest() is
// null -- calling it again the same day would silently re-roll, so the "one
// spin a day" rule is enforced by the UI never offering a re-spin, not by
// this function refusing to run.
export function spinSpecialQuest(): string {
  const chosen = SPECIAL_QUEST_TYPES[Math.floor(Math.random() * SPECIAL_QUEST_TYPES.length)];
  saveStore({ dateKey: dateKey(Date.now()), questId: chosen.id, status: "pending" });
  return chosen.id;
}

// Marks today's quest completed -- returns true only if it was genuinely
// "pending" and matched `questId`, which is the dedup guard every completion
// hook (PetContext.tsx/PlayGame.tsx/Result.tsx) checks before awarding the
// bonus BP: a second qualifying session/game/feed the same day (or a replay
// after the quest is already done) returns false and does nothing.
export function completeSpecialQuest(questId: string): boolean {
  const store = loadStore();
  if (!store || store.questId !== questId || store.status !== "pending") return false;
  saveStore({ ...store, status: "completed" });
  return true;
}
