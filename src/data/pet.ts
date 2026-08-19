/* =========================================================
   PET / BP CONFIG for the Chinese Practice app's gamification
   layer. Read only by state/PetContext.tsx (PET_STAGES,
   MOOD_DECAY_PER_HOUR, BP_AWARD, SHOP_ITEMS, PET_DEFAULT_STATE).
   Persisted pet state itself lives in localStorage/Supabase, not
   here -- this file only holds tunable config, never per-user
   state.

   Owl art is 24 fully-illustrated PNGs or MP4 (6 growth stages x 4 mood) 
   ========================================================= */
import type { PetState, PetStage, ShopItem, MoodBucket } from "./types";

// Growth points (earned by feeding/play -- see giveItem()/applyPlayReward()
// in PetContext.tsx -- and lost to prolonged neglect, see
// GROWTH_DECAY_PER_DAY_AT_ZERO_MOOD below) needed for the pet to age by 1
// year. Age is purely derived (Math.floor(growth / GROWTH_PER_AGE_YEAR)),
// never stored -- same pattern as computeCurrentMood() deriving mood from a
// checkpoint pair rather than storing an already-decayed value.
export const GROWTH_PER_AGE_YEAR: number = 100;

export const PET_STAGES: PetStage[] = [
  { key: "egg",      label: "蛋 Egg",                minAgeYears: 0  },
  { key: "baby",     label: "雏鸟 Baby Owl",         minAgeYears: 3  },
  { key: "toddler",  label: "幼鸟 Toddler Owl",      minAgeYears: 7  },
  { key: "young",    label: "少年鸟 Young Owl",      minAgeYears: 11 },
  { key: "teenager", label: "青年鸟 Teenager Owl",   minAgeYears: 16 },
  { key: "adult",    label: "成鸟 Adult Owl",        minAgeYears: 21 }
];

// How fast neglect sets in: mood points lost per hour since last feed/play.
export const MOOD_DECAY_PER_HOUR: number = 4;

// Growth points lost per full day the pet's mood sits at rock bottom (0) --
// severe, prolonged neglect, not just "a bit hungry." Unlike mood (always
// derived fresh from a checkpoint, see computeCurrentMood()), growth is a
// real stored value read/compared directly all over the app (age, stage,
// shop math), so this decay is applied as an actual decrement rather than
// derived for display -- see PetContext.tsx's settleGrowthDecay(), which
// only accrues while mood is genuinely at 0 (pauses/resets the moment a
// feed/play lifts mood above 0) and never takes growth below 0.
export const GROWTH_DECAY_PER_DAY_AT_ZERO_MOOD: number = 1;
export const GROWTH_DECAY_DAY_MS: number = 24 * 60 * 60 * 1000;

// Flat BP payout per correctly-answered question, by format.
export const BP_AWARD: Record<string, number> = {
  MCQ: 1,
  "Fill-in": 1,
  "Long-Answer": 2,
  "Writing-Constrained": 2
};

// Tingxie-mode BP awards -- per-unit (not flat per-activity any more), so a
// lesson with more vocab/sentences pays out proportionally more. Each
// activity's actual award is this rate times however many vocab
// words/sentences that lesson visit covered -- see the awardBP() call sites
// in components/Tingxie/Learn.tsx, Apply.tsx, Practice.tsx. Tunable, not
// gospel.
export const TINGXIE_BP_PER_UNIT = {
  VOCAB_LEARN: 1, // 学习(学词语) -- BP per vocab word flipped at least once, this visit
  SENTENCE_LEARN: 2, // 学习(学默写) -- BP per sentence solved correctly, this visit
  APPLY: 1, // 词语应用 -- BP per word in the apply queue (incl. requeued misses)
  PRACTICE_VOCAB: 1, // 听写练习 phase 1 -- BP per vocab word
  PRACTICE_SENTENCE: 2 // 听写练习 phase 2 -- BP per sentence
};

// Dictation Practice's "Play" (词云游戏) minigame -- a fixed-length timed
// round where falling word-clouds must be tapped to fill in a blanked
// sentence's missing word before time runs out. Unlike every other Tingxie
// activity's TINGXIE_BP_PER_UNIT rate (a per-word/sentence multiplier), this
// one's payout is earned live (CORRECT_BP/WRONG_BP per tap) and only
// totalled + awarded once the round ends (see components/Tingxie/Play.tsx)
// -- clamped to 0 if the round nets negative, never a debit against the
// pet's existing BP.
export const TINGXIE_PLAY_CONFIG = {
  DURATION_SEC: 60,
  CORRECT_BP: 1,
  WRONG_BP: -2,
  SPAWN_INTERVAL_MS: 900,
  MIN_FALL_SEC: 4.5,
  MAX_FALL_SEC: 7,
  MAX_CLOUDS: 8,
  // Anti-farming cap: only the first this-many rounds *finished* each
  // calendar day actually award BP (see state/tingxiePlayLimit.ts) -- every
  // round beyond that still plays normally, it just scores 0 BP regardless
  // of in-round performance. A round counts toward this the moment it's
  // finished (timer hits 0), whether or not it happened to net positive BP,
  // so deliberately playing badly can't be used to "save" a free extra slot.
  DAILY_BP_ROUND_LIMIT: 3
};

// Flat BP awarded once per story finished in Read a Story mode (see
// components/Story/Story.tsx's "完成 Finish" button) -- Read a Story is
// otherwise still independent of the Quiz/achievements pipeline (no
// history entry, no Today's Mission credit), this is its only BP hook.
export const STORY_COMPLETE_BP_AWARD = 10;

// One-time-per-day bonus awarded the moment all 3 Today's Mission entries
// (lesson, reading, dictation) are complete -- on top of each mission's own
// normal BP. Deliberately smaller than a full Tingxie activity award since
// it's a top-up, not a fourth activity's worth of reward.
export const MISSION_COMPLETE_BONUS_BP = 100;

// Shop catalogue: buying an item puts it in the Bag (PetState.inventory).
// Food's growth/mood effect applies immediately when given to the owl from
// the Bag screen (see giveItem() in PetContext.tsx). Toys instead launch a
// minigame from the Bag (see TOY_GAMES below and components/Play/) -- a
// toy's `mood` here is its *maximum* possible payout (flat + bonus, see
// TOY_GAMES), shown in the Shop/Bag as "up to" a stat, not a guaranteed one.
export const SHOP_ITEMS: ShopItem[] = [
  { id: "seed",   label: "🌾 谷粒 Seeds",       type: "food", cost: 25,  growth: 1,  mood: 10 },
  { id: "worm",   label: "🐛 虫子 Worm",        type: "food", cost: 65,  growth: 3,  mood: 30 },
  { id: "fish",   label: "🐟 小鱼干 Dried Fish", type: "food", cost: 100, growth: 5, mood: 40 },
  { id: "ball",   label: "⚽ 小球 Play Ball",    type: "toy",  cost: 20,  growth: 1,  mood: 8 },
  { id: "kite",   label: "🪁 风筝 Kite",         type: "toy",  cost: 38, growth: 2,  mood: 16 },
  { id: "puzzle", label: "🃏 记忆卡牌 Memory Cards", type: "toy", cost: 48, growth: 2, mood: 24 }
];

// Extracts the terse Chinese name out of a SHOP_ITEMS label
// ("<emoji> <Chinese name> <English words...>") -- every label follows this
// exact shape, and the Chinese name is always exactly one space-delimited
// token (no internal spaces). Used anywhere a Shop/Bag card shows just the
// name rather than the full bilingual label; the leading emoji itself is no
// longer used for display (see shopItemIconPath() below for the real icon).
export function shopItemName(item: ShopItem): string {
  const [, name] = item.label.split(" ");
  return name ?? item.label;
}

// public/icons/ file for each SHOP_ITEMS id -- "puzzle"'s icon is
// "memory.png" (not "puzzle.png") since the toy's game changed to a
// memory-match but its id stayed "puzzle" for backward-compatible inventory
// keys (see TOY_GAMES's comment above); every other id matches its filename.
const SHOP_ITEM_ICON_FILES: Record<string, string> = {
  seed: "seeds.png",
  worm: "worm.png",
  fish: "fish.png",
  ball: "ball.png",
  kite: "kite.png",
  puzzle: "memory.png"
};

export function shopItemIconPath(item: ShopItem): string {
  return `/icons/${SHOP_ITEM_ICON_FILES[item.id]}`;
}

// Icons for the Growth/Hunger pet stats -- shown next to the growth/mood
// bars on PetHeroCard (Home), PetStatBars (Owl/Bag), and each Shop/Bag food
// item's stat line, so the same two icons mean "growth"/"hunger" everywhere
// they appear rather than each screen picking its own emoji.
export const GROWTH_ICON = "/icons/heart.png";
export const HUNGER_ICON = "/icons/rice.png";

// One minigame per toy ShopItem (keyed by ShopItem.id, `id` kept as "puzzle"
// even after the game itself changed from a leaf-picking guess to a memory
// match, so existing bagged/purchased inventory keys don't break), rendered
// from the Play screen (components/Play/PlayGame.tsx) when the student taps
// that toy in the Bag. flatMood + bonusMood always equals the toy's
// ShopItem.mood (its "max" stat shown in the Shop/Bag), so buying/feeding
// math doesn't need rebalancing when a game's reward mechanic changes.
//
// Two shapes of game, distinguished by `game`:
// - "catch"/"feather" (round-based -- CatchGame/FeatherGame): `attempts` is
//   the number of rounds the game reports back; `bonusThreshold` is the
//   hits-out-of-attempts needed for the bonus.
// - "memory" (MemoryGame, a 12-card/6-pair match game): `pairCount` is how
//   many pairs to lay out; `bonusTimeSeconds` is the completion time (from
//   first card flip to the last match) needed for the bonus -- there's no
//   "fail" state, the flat reward always applies once every pair is found.
// Fields are optional here (rather than a discriminated union) so one flat
// Record type covers both shapes; each game component only ever reads the
// fields that apply to its own `game` id -- see components/Play/.
export interface ToyGameConfig {
  game: "catch" | "feather" | "memory";
  flatMood: number;
  bonusMood: number;
  bonusLabel: string;
  attempts?: number;
  bonusThreshold?: number;
  pairCount?: number;
  bonusTimeSeconds?: number;
}

export const TOY_GAMES: Record<string, ToyGameConfig> = {
  ball: {
    game: "catch",
    attempts: 10,
    bonusThreshold: 8,
    flatMood: 5,
    bonusMood: 3,
    bonusLabel: "接住 8 个以上！Near-perfect run!"
  },
  kite: {
    game: "feather",
    attempts: 8,
    bonusThreshold: 7,
    flatMood: 10,
    bonusMood: 6,
    bonusLabel: "接住 7 个以上！Near-perfect catch!"
  },
  puzzle: {
    game: "memory",
    pairCount: 6,
    bonusTimeSeconds: 20,
    flatMood: 15,
    bonusMood: 9,
    bonusLabel: "20 秒内配对成功！Matched within 20 seconds!"
  }
};

// The Home dashboard's "Special Quest" wheel (components/Home/SpecialQuest.tsx):
// once a day, spinning picks one of these at random; completing it (see the
// completion hooks in PetContext.tsx/PlayGame.tsx/Result.tsx) pays bonusBP on
// top of whatever BP the underlying activity already earns. `icon` is either
// an emoji (vocab100/comprehension1, which have no matching SHOP_ITEMS/stat
// icon) or an existing /icons/*.png path reused from SHOP_ITEM_ICON_FILES/
// HUNGER_ICON so the quest card matches the icon already used for that same
// item/stat elsewhere in the app.
export interface SpecialQuestConfig {
  id: string;
  label: string;
  icon: string;
  bonusBP: number;
}

export const SPECIAL_QUEST_TYPES: SpecialQuestConfig[] = [
  { id: "vocab100", label: "词语测验满分 Get 100% on a Vocab Quiz", icon: "📚", bonusBP: 50 },
  { id: "ballPlay", label: "玩一次小球游戏 Play the Ball Game", icon: "/icons/ball.png", bonusBP: 20 },
  { id: "petFull", label: "把宠物喂到饱食度 100% Fill Your Pet's Hunger to 100%", icon: "/icons/rice.png", bonusBP: 40 },
  { id: "memoryFast", label: "20 秒内完成记忆卡牌 Beat the Memory Game in 20s", icon: "/icons/memory.png", bonusBP: 20 },
  { id: "comprehension1", label: "完成一篇阅读理解 Complete One Comprehension Passage", icon: "📖", bonusBP: 100 }
];

export function specialQuestConfig(id: string): SpecialQuestConfig | undefined {
  return SPECIAL_QUEST_TYPES.find((q) => q.id === id);
}

export const PET_DEFAULT_STATE: PetState = {
  name: "",
  bp: 0,
  growth: 0,
  moodAtCheckpoint: 100,
  lastFedAt: Date.now(),
  growthDecayCheckpointAt: Date.now(),
  inventory: {},
  questionsLifetime: 0
};

// e.g. owlSpritePath("baby", "happy") -> "/owl/owl-baby-happy.png"
export function owlSpritePath(stageKey: string, mood: MoodBucket): string {
  return `/owl/owl-${stageKey}-${mood}.png`;
}

// Some stage x mood combos have a hand-animated video (with its sound effect
// muxed in as the video's own audio track) instead of just a static PNG --
// which combos do isn't tracked here as a hardcoded list any more. OwlArt.tsx
// always tries the .mp4 first and falls back to the .png only if the video
// fails to load (404/decode error) -- see that component. Source art is
// authored as GIF but shipped as MP4 (H.264+AAC) -- far smaller than GIF at
// the same visual quality, and plays natively via <video playsInline>. A
// variant with only a video and no PNG fallback (its source PNG removed when
// the video replaced it) works fine too, since the fallback `<img>` is only
// ever rendered after a genuine video load failure.
export function owlAnimatedSpritePath(stageKey: string, mood: MoodBucket): string {
  return `/owl/owl-${stageKey}-${mood}.mp4`;
}
