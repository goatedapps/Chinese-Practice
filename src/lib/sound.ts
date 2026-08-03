// Most effects are synthesized with the Web Audio API, so the app needs no
// external sound files for them -- gift() stays a pure code-generated
// waveform. Everything else plays real MP3 files dropped into public/sounds/
// (see SOUND_FILES below) -- button presses, correct/wrong answers, a
// good/sub-par session score, shop/bag entry, shop purchases, and owl
// level-ups, i.e. the moments a human-recorded/produced sound adds more
// character than a synthesized one.
let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// Rising "sparkle" glide for giving a bagged item to the owl -- a single
// triangle-wave glissando. Only plays when giveItem() *doesn't* trigger a
// stage evolution -- that bigger moment gets levelUp()'s MP3 instead (see
// Bag.tsx), not both layered together.
function sparkleGlide(startTime: number): void {
  const c = ensureCtx();
  if (!c) return;
  const t0 = c.currentTime + startTime;
  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, t0);
  osc.frequency.exponentialRampToValueAtTime(1600, t0 + 0.22);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(0.14, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + 0.32);
}

// MP3 files live in public/sounds/ -- drop replacements in with these exact
// filenames and they're picked up automatically, no code change needed.
const SOUND_FILES = {
  button: "/sounds/button.mp3", // any button press, app-wide (see App.tsx's global click listener)
  correct: "/sounds/correct.mp3", // a correct answer (Quiz MCQ/Fill-in/self-check, Tingxie self-grade/sentence-order)
  wrong: "/sounds/wrong-answer.mp3", // a wrong answer (Quiz MCQ/Fill-in/self-check, Tingxie self-grade/sentence-order)
  goodResult: "/sounds/good-result.mp3", // a quiz/practice session scoring 90% or higher
  needImprovement: "/sounds/need-improvement.mp3", // a quiz/practice session scoring below 90%
  purchase: "/sounds/purchase.mp3", // buying an item in the Shop
  levelUp: "/sounds/level-up.mp3", // the owl evolves to a new growth stage
  enterShop: "/sounds/enter-shop.mp3", // opening the Shop screen
  bagOpen: "/sounds/bag-open.mp3", // opening the Bag/Feed screen
  background: "/sounds/background.mp3" // looping background music, started once on the app's first click
};

// Computed once per page load, appended to every sound file URL as a query
// param. Without this, a browser that already cached a stale response for a
// given filename (e.g. the pre-launch 404, or a since-replaced MP3) keeps
// serving that stale response even after the file on disk changes, since the
// URL itself never changes -- a fresh page load always busts it.
const CACHE_BUST = Date.now();

// Plays an MP3 from public/sounds/. Each call creates a fresh <audio>
// element (rather than reusing one) so overlapping/rapid re-triggers -- e.g.
// several correct() dings staggered via `delaySec` when a group has
// multiple right answers -- don't cut each other off.
function playFile(path: string, delaySec: number = 0): void {
  const fire = () => {
    try {
      const audio = new Audio(`${path}?v=${CACHE_BUST}`);
      audio.play().catch(() => {
        // Autoplay can be blocked before the student has interacted with the
        // page at all; sound is a nice-to-have, never block on it.
      });
    } catch {
      // ignore -- e.g. Audio() unavailable in some embedded/test environments
    }
  };
  if (delaySec > 0) setTimeout(fire, delaySec * 1000);
  else fire();
}

// Background music is a single persistent <audio> element at module scope
// (not a fresh one per call like playFile()'s fire-and-forget effects) --
// created once and left playing/looping for the rest of the page session, so
// it survives every screen navigation (React unmounting/remounting
// components never touches this module-level reference) and is never
// restarted from the beginning by a later call.
let bgMusic: HTMLAudioElement | null = null;

// True only while we've deliberately paused the track ourselves (tab
// hidden -- see pauseBackgroundMusic()). Guards the self-heal listener
// below from fighting that intentional pause.
let bgMusicExplicitlyPaused = false;

function newBgMusicElement(): HTMLAudioElement {
  const el = new Audio(`${SOUND_FILES.background}?v=${CACHE_BUST}`);
  el.loop = true;
  el.volume = 0.35;
  // Something outside our control can pause this element without ever
  // calling pauseBackgroundMusic() -- e.g. on Windows, speechSynthesis
  // (used heavily by Dictation Practice's/Quiz's 🔊 Listen buttons) shares
  // the OS audio session and can steal focus, silently pausing other
  // playing audio. Self-heal: if a pause happens while the tab is visible
  // and we didn't ask for it, resume right away instead of waiting for the
  // student's next click.
  el.addEventListener("pause", () => {
    if (bgMusic === el && !bgMusicExplicitlyPaused && !document.hidden) {
      el.play().catch(() => {
        // Next click's startBackgroundMusic() call will retry.
      });
    }
  });
  // A genuine playback failure (dropped network request, decode error --
  // not just an autoplay-policy rejection) leaves the element permanently
  // broken; every future .play() on it keeps failing, which is what made
  // this look "stuck off" even after a later click. Drop the reference so
  // the next start attempt builds a fresh element instead of retrying a
  // dead one.
  el.addEventListener("error", () => {
    if (bgMusic === el) bgMusic = null;
  });
  return el;
}

function playBackgroundMusic(): void {
  try {
    if (!bgMusic) bgMusic = newBgMusicElement();
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {
        // Still blocked (e.g. this "first interaction" wasn't a real user
        // gesture) -- the next click retries via the same App.tsx listener.
      });
    }
  } catch {
    // ignore -- e.g. Audio() unavailable in some embedded/test environments
  }
}

export const Sound = {
  // Any button press, app-wide (see App.tsx's global click listener).
  click(): void {
    playFile(SOUND_FILES.button);
  },
  ding(delay: number = 0): void {
    playFile(SOUND_FILES.correct, delay);
  },
  purchase(): void {
    playFile(SOUND_FILES.purchase);
  },
  gift(): void {
    try {
      sparkleGlide(0);
    } catch {
      // ignore
    }
  },
  // Quiz/practice session scored 90% or higher (see Result.tsx).
  applause(): void {
    playFile(SOUND_FILES.goodResult);
  },
  // Quiz/practice session scored below 90% -- still encouraging, not a
  // "wrong answer" buzzer.
  encourage(): void {
    playFile(SOUND_FILES.needImprovement);
  },
  miss(): void {
    playFile(SOUND_FILES.wrong);
  },
  // The owl evolves to a new growth stage (e.g. egg -> baby) -- see
  // PetContext.tsx's giveItem() return value and Bag.tsx's handleClick().
  levelUp(): void {
    playFile(SOUND_FILES.levelUp);
  },
  // Opening the Shop screen (see Owl.tsx/Bag.tsx's Shop buttons).
  enterShop(): void {
    playFile(SOUND_FILES.enterShop);
  },
  // Opening the Bag/Feed screen (see Owl.tsx's Feed button).
  bagOpen(): void {
    playFile(SOUND_FILES.bagOpen);
  },
  // Starts the looping background track on the app's first click (see
  // App.tsx) and is a no-op on every call after that -- idempotent, so it's
  // safe to call from a listener that fires on every click for the entire
  // page session, not just the first. Also used to resume playback after a
  // pauseBackgroundMusic() call (e.g. the tab becoming visible again) --
  // resuming an <audio> element that already played once doesn't need a
  // fresh user gesture, so this just works.
  startBackgroundMusic(): void {
    bgMusicExplicitlyPaused = false;
    playBackgroundMusic();
  },
  // Pauses the background track without resetting its position, e.g. when
  // the tab is hidden/backgrounded (see App.tsx's visibilitychange
  // listener) -- startBackgroundMusic() resumes from the same spot.
  pauseBackgroundMusic(): void {
    bgMusicExplicitlyPaused = true;
    try {
      bgMusic?.pause();
    } catch {
      // ignore
    }
  }
};
