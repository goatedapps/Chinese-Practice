/* =========================================================
   PET / BP CONFIG for the Chinese Practice app's gamification
   layer. Read only by state/PetContext.tsx (PET_STAGES,
   MOOD_DECAY_PER_HOUR, BP_AWARD, SHOP_ITEMS, PET_DEFAULT_STATE).
   Persisted pet state itself lives in localStorage/Supabase, not
   here -- this file only holds tunable config, never per-user
   state.

   Owl art is 24 fully-illustrated PNGs (6 growth stages x 4 mood
   buckets, user-supplied sprite sheet sliced by
   scripts/slice_owl_sprites.py into public/owl/) -- see
   owlSpritePath() below. Unlike the old hand-rolled SVG version,
   every stage (including egg) has all 4 mood variants drawn, so
   there's no more "egg has no face" special case.
   ========================================================= */
import type { PetState, PetStage, ShopItem, MoodBucket } from "./types";

export const PET_STAGES: PetStage[] = [
  { key: "egg",      label: "蛋 Egg",                minGrowth: 0   },
  { key: "baby",     label: "雏鸟 Baby Owl",         minGrowth: 20  },
  { key: "toddler",  label: "幼鸟 Toddler Owl",      minGrowth: 50  },
  { key: "young",    label: "少年鸟 Young Owl",      minGrowth: 90  },
  { key: "teenager", label: "青年鸟 Teenager Owl",   minGrowth: 140 },
  { key: "adult",    label: "成鸟 Adult Owl",        minGrowth: 200 }
];

// How fast neglect sets in: mood points lost per hour since last feed/play.
export const MOOD_DECAY_PER_HOUR: number = 3;

// Flat BP payout per correctly-answered question, by format.
export const BP_AWARD: Record<string, number> = {
  MCQ: 1,
  "Fill-in": 1,
  "Long-Answer": 2,
  "Writing-Constrained": 2
};

// Tingxie-mode BP awards -- carried over 1:1 from the source app's point
// values. Larger than the per-question BP_AWARD above because each of these
// covers completing a whole lesson-scale activity (~15-20 vocab words or
// 5+ sentences), not a single question. Tunable, not gospel.
export const TINGXIE_BP_AWARD = {
  VOCAB_LEARN: 10, // 学习(学词语) -- every vocab card flipped at least once, this visit
  SENTENCE_LEARN: 10, // 学习(学默写) -- every sentence solved correctly, this visit
  APPLY: 10, // 词语应用 -- whole apply queue (incl. requeued misses) completed
  PRACTICE: 20 // 听写练习 -- BOTH phases (tingxie + moxie) completed
};

// Shop catalogue: buying an item puts it in the Bag (PetState.inventory);
// the growth/mood effect only applies once the student gives it to the owl
// from the Bag screen -- cost in BP, growth/mood granted on give.
export const SHOP_ITEMS: ShopItem[] = [
  { id: "seed",   label: "🌾 谷粒 Seeds",       type: "food", cost: 3,  growth: 4,  mood: 10 },
  { id: "worm",   label: "🐛 虫子 Worm",        type: "food", cost: 8,  growth: 8,  mood: 20 },
  { id: "fish",   label: "🐟 小鱼干 Dried Fish", type: "food", cost: 15, growth: 15, mood: 30 },
  { id: "ball",   label: "⚽ 小球 Play Ball",    type: "toy",  cost: 5,  growth: 2,  mood: 25 },
  { id: "kite",   label: "🪁 风筝 Kite",         type: "toy",  cost: 12, growth: 5,  mood: 35 },
  { id: "puzzle", label: "🧩 拼图 Puzzle Toy",   type: "toy",  cost: 20, growth: 10, mood: 45 }
];

export const PET_DEFAULT_STATE: PetState = {
  name: "",
  bp: 0,
  bpLifetime: 0,
  growth: 0,
  moodAtCheckpoint: 100,
  lastFedAt: Date.now(),
  purchaseHistory: [],
  inventory: {},
  questionsLifetime: 0
};

// e.g. owlSpritePath("baby", "happy") -> "/owl/owl-baby-happy.png"
export function owlSpritePath(stageKey: string, mood: MoodBucket): string {
  return `/owl/owl-${stageKey}-${mood}.png`;
}

// Stage x mood combos that have a hand-animated video (with its sound
// effect muxed in as the video's own audio track) instead of just a static
// PNG -- "egg-very_happy", "baby-very_happy", "egg-sad", and "egg-neutral"
// so far, with more of the 24 combos to follow. Source art is authored as
// GIF but shipped as MP4 (H.264+AAC) -- far smaller than GIF at the same
// visual quality, and plays natively via <video playsInline> (see
// OwlArt.tsx). Note "egg-sad"/"egg-neutral" have no PNG fallback anymore
// (the source PNGs were removed when the video replaced them) -- unlike
// "egg-very_happy"/"baby-very_happy", which still keep their PNG around.
const ANIMATED_OWL_VARIANTS = new Set<string>(["egg-very_happy", "baby-very_happy", "egg-sad", "egg-neutral"]);

export function hasOwlAnimation(stageKey: string, mood: MoodBucket): boolean {
  return ANIMATED_OWL_VARIANTS.has(`${stageKey}-${mood}`);
}

export function owlAnimatedSpritePath(stageKey: string, mood: MoodBucket): string {
  return `/owl/owl-${stageKey}-${mood}.mp4`;
}
