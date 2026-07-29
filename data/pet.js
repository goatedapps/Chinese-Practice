/* =========================================================
   PET / BP CONFIG for the Chinese Practice app's gamification
   layer. Read only by app.js (PET_STAGES, MOOD_DECAY_PER_HOUR,
   BP_AWARD, SHOP_ITEMS, PET_DEFAULT_STATE, OWL_BODY_SVG,
   OWL_FACE_SVG). Persisted pet state itself lives in
   localStorage (see PET_KEY in app.js) — this file only holds
   tunable config and art, never per-user state.

   Owl art is composed as one body SVG (per growth stage) plus
   one face SVG (per mood bucket) layered on top via CSS, so the
   4 stages x 4 moods only need 4 + 4 = 8 hand-authored assets
   instead of a 16-way cross-product. The egg stage has no face
   — you can't read an egg's mood.
   ========================================================= */

const PET_STAGES = [
  { key: "egg",     label: "蛋 Egg",              minGrowth: 0   },
  { key: "baby",    label: "雏鸟 Baby Owl",        minGrowth: 20  },
  { key: "toddler", label: "幼鸟 Toddler Owl",     minGrowth: 60  },
  { key: "adult",   label: "成鸟 Adult Owl",       minGrowth: 120 }
];

// How fast neglect sets in: mood points lost per hour since last feed/play.
const MOOD_DECAY_PER_HOUR = 3;

// Flat BP payout per correctly-answered question, by format.
const BP_AWARD = { MCQ: 1, "Fill-in": 1, "Long-Answer": 2 };

// Shop catalogue: buying an item immediately feeds/plays with the owl
// (no separate "inventory" step) — cost in BP, growth/mood granted.
const SHOP_ITEMS = [
  { id: "seed",   label: "🌾 谷粒 Seeds",       type: "food", cost: 3,  growth: 4,  mood: 10 },
  { id: "worm",   label: "🐛 虫子 Worm",        type: "food", cost: 8,  growth: 8,  mood: 20 },
  { id: "fish",   label: "🐟 小鱼干 Dried Fish", type: "food", cost: 15, growth: 15, mood: 30 },
  { id: "ball",   label: "⚽ 小球 Play Ball",    type: "toy",  cost: 5,  growth: 2,  mood: 25 },
  { id: "kite",   label: "🪁 风筝 Kite",         type: "toy",  cost: 12, growth: 5,  mood: 35 },
  { id: "puzzle", label: "🧩 拼图 Puzzle Toy",   type: "toy",  cost: 20, growth: 10, mood: 45 }
];

const PET_DEFAULT_STATE = {
  bp: 0,
  bpLifetime: 0,
  growth: 0,
  moodAtCheckpoint: 100,
  lastFedAt: Date.now(),
  purchaseHistory: []
};

/* ---------------------------------------------------------
   Body art — one per growth stage. viewBox 0 0 160 160,
   consistent coordinate space so face overlays line up.
   --------------------------------------------------------- */
const OWL_BODY_SVG = {
  egg: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="80" cy="150" rx="46" ry="8" fill="#c8a36b" opacity="0.35"/>
    <path d="M80 30 C110 30 128 78 128 108 C128 136 106 150 80 150 C54 150 32 136 32 108 C32 78 50 30 80 30 Z" fill="#f3e6c8" stroke="#d8c193" stroke-width="3"/>
    <ellipse cx="62" cy="95" rx="7" ry="10" fill="#dcc596"/>
    <ellipse cx="96" cy="70" rx="6" ry="8" fill="#dcc596"/>
    <ellipse cx="100" cy="115" rx="8" ry="6" fill="#dcc596"/>
    <ellipse cx="68" cy="130" rx="6" ry="5" fill="#dcc596"/>
  </svg>`,
  baby: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="80" cy="150" rx="40" ry="7" fill="#c8a36b" opacity="0.3"/>
    <ellipse cx="52" cy="98" rx="16" ry="20" fill="#d3a86b"/>
    <ellipse cx="108" cy="98" rx="16" ry="20" fill="#d3a86b"/>
    <circle cx="80" cy="92" r="52" fill="#e6bd80"/>
    <ellipse cx="70" cy="140" rx="8" ry="5" fill="#c9975b"/>
    <ellipse cx="90" cy="140" rx="8" ry="5" fill="#c9975b"/>
  </svg>`,
  toddler: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="80" cy="152" rx="44" ry="7" fill="#8f5f2e" opacity="0.3"/>
    <path d="M60 40 L52 20 L68 32 Z" fill="#8f5f2e"/>
    <path d="M100 40 L108 20 L92 32 Z" fill="#8f5f2e"/>
    <ellipse cx="48" cy="105" rx="18" ry="26" fill="#b97f45"/>
    <ellipse cx="112" cy="105" rx="18" ry="26" fill="#b97f45"/>
    <path d="M80 34 C112 34 132 70 132 108 C132 138 108 154 80 154 C52 154 28 138 28 108 C28 70 48 34 80 34 Z" fill="#c9975b"/>
    <path d="M60 100 Q80 108 100 100" fill="none" stroke="#8f5f2e" stroke-width="3" opacity="0.5"/>
    <path d="M62 118 Q80 126 98 118" fill="none" stroke="#8f5f2e" stroke-width="3" opacity="0.5"/>
    <ellipse cx="66" cy="150" rx="9" ry="6" fill="#8f5f2e"/>
    <ellipse cx="94" cy="150" rx="9" ry="6" fill="#8f5f2e"/>
  </svg>`,
  adult: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="146" width="120" height="10" rx="5" fill="#8a6236"/>
    <path d="M56 32 L44 6 L66 24 Z" fill="#5e3b1c"/>
    <path d="M104 32 L116 6 L94 24 Z" fill="#5e3b1c"/>
    <ellipse cx="42" cy="100" rx="20" ry="34" fill="#8a5a2b"/>
    <ellipse cx="118" cy="100" rx="20" ry="34" fill="#8a5a2b"/>
    <path d="M80 26 C118 26 138 66 138 108 C138 140 112 156 80 156 C48 156 22 140 22 108 C22 66 42 26 80 26 Z" fill="#9c6b34"/>
    <path d="M56 92 Q80 100 104 92" fill="none" stroke="#5e3b1c" stroke-width="3" opacity="0.55"/>
    <path d="M58 110 Q80 120 102 110" fill="none" stroke="#5e3b1c" stroke-width="3" opacity="0.55"/>
    <path d="M60 128 Q80 138 100 128" fill="none" stroke="#5e3b1c" stroke-width="3" opacity="0.55"/>
    <ellipse cx="64" cy="150" rx="10" ry="6" fill="#5e3b1c"/>
    <ellipse cx="96" cy="150" rx="10" ry="6" fill="#5e3b1c"/>
  </svg>`
};

/* ---------------------------------------------------------
   Face overlays — one per mood bucket (sad/neutral/content/
   happy), same 0 0 160 160 coordinate space, transparent
   background, only eyes/brows/beak/mouth drawn so they layer
   over any body.
   --------------------------------------------------------- */
const OWL_FACE_SVG = {
  sad: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 72 L72 82" fill="none" stroke="#5a4632" stroke-width="4" stroke-linecap="round"/>
    <path d="M110 72 L88 82" fill="none" stroke="#5a4632" stroke-width="4" stroke-linecap="round"/>
    <circle cx="62" cy="92" r="10" fill="#3a2c1e"/>
    <circle cx="98" cy="92" r="10" fill="#3a2c1e"/>
    <path d="M106 100 q4 8 0 12 q-4 -4 0 -12" fill="#bfe3f5" opacity="0.9"/>
    <path d="M74 108 L86 108 L80 118 Z" fill="#e8973f"/>
    <path d="M65 122 Q80 112 95 122" fill="none" stroke="#5a4632" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  neutral: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 76 L72 76" fill="none" stroke="#5a4632" stroke-width="4" stroke-linecap="round"/>
    <path d="M88 76 L110 76" fill="none" stroke="#5a4632" stroke-width="4" stroke-linecap="round"/>
    <circle cx="62" cy="90" r="9" fill="#3a2c1e"/>
    <circle cx="98" cy="90" r="9" fill="#3a2c1e"/>
    <path d="M74 108 L86 108 L80 118 Z" fill="#e8973f"/>
    <path d="M68 118 L92 118" fill="none" stroke="#5a4632" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  content: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 74 Q61 70 72 74" fill="none" stroke="#5a4632" stroke-width="4" stroke-linecap="round"/>
    <path d="M88 74 Q99 70 110 74" fill="none" stroke="#5a4632" stroke-width="4" stroke-linecap="round"/>
    <circle cx="62" cy="90" r="9" fill="#3a2c1e"/>
    <circle cx="98" cy="90" r="9" fill="#3a2c1e"/>
    <circle cx="59" cy="87" r="2.4" fill="#fff"/>
    <circle cx="95" cy="87" r="2.4" fill="#fff"/>
    <path d="M74 108 L86 108 L80 118 Z" fill="#e8973f"/>
    <path d="M66 114 Q80 122 94 114" fill="none" stroke="#5a4632" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  happy: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 70 Q61 62 72 70" fill="none" stroke="#5a4632" stroke-width="4" stroke-linecap="round"/>
    <path d="M88 70 Q99 62 110 70" fill="none" stroke="#5a4632" stroke-width="4" stroke-linecap="round"/>
    <circle cx="62" cy="88" r="11" fill="#3a2c1e"/>
    <circle cx="98" cy="88" r="11" fill="#3a2c1e"/>
    <circle cx="58" cy="84" r="3" fill="#fff"/>
    <circle cx="94" cy="84" r="3" fill="#fff"/>
    <ellipse cx="52" cy="104" rx="7" ry="4.5" fill="#f2a0a0" opacity="0.7"/>
    <ellipse cx="108" cy="104" rx="7" ry="4.5" fill="#f2a0a0" opacity="0.7"/>
    <path d="M74 108 L86 108 L80 118 Z" fill="#e8973f"/>
    <path d="M62 112 Q80 128 98 112" fill="none" stroke="#5a4632" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 46 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" fill="#f5d76e"/>
    <path d="M128 46 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" fill="#f5d76e"/>
  </svg>`
};
