// Most effects are synthesized with the Web Audio API, so the app needs no
// external sound files for them -- click()/encourage()/gift() stay pure
// code-generated waveforms. A handful of effects instead play real MP3
// files dropped into public/sounds/ (see SOUND_FILES below) -- correct/wrong
// answers, a good session score, shop purchases, and owl level-ups, i.e. the
// moments a human-recorded/produced sound adds more character than a
// synthesized one. click() is a filtered-noise "tap" (not a square-wave
// beep); encourage() is a short detuned-oscillator bell arpeggio with a
// filter sweep, aiming for something warmer than a flat MIDI blip.
let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function ensureCtx(): AudioContext | null {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const len = Math.floor(c.sampleRate * 0.08);
  noiseBuffer = c.createBuffer(1, len, c.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

// Soft filtered-noise tap, used for generic UI clicks.
function tap(startTime: number, peakGain: number): void {
  const c = ensureCtx();
  if (!c) return;
  const t0 = c.currentTime + startTime;
  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);
  const bandpass = c.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.setValueAtTime(2400, t0);
  bandpass.Q.value = 0.9;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
  src.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(c.destination);
  src.start(t0);
  src.stop(t0 + 0.06);
}

// Warm bell-like chime: two slightly-detuned oscillators through a lowpass
// filter whose cutoff sweeps down as the note decays. Still used by
// encourage() (sub-90% score).
function chime(freq: number, startTime: number, duration: number, peakGain: number): void {
  const c = ensureCtx();
  if (!c) return;
  const t0 = c.currentTime + startTime;
  const osc1 = c.createOscillator();
  const osc2 = c.createOscillator();
  osc1.type = "sine";
  osc2.type = "triangle";
  osc1.frequency.setValueAtTime(freq, t0);
  osc2.frequency.setValueAtTime(freq * 1.004, t0);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(freq * 5, t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.2, 200), t0 + duration);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  osc1.start(t0);
  osc2.start(t0);
  osc1.stop(t0 + duration + 0.05);
  osc2.stop(t0 + duration + 0.05);
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
  correct: "/sounds/correct.mp3", // a correct answer (Quiz MCQ/Fill-in/self-check, Tingxie self-grade/sentence-order)
  wrong: "/sounds/wrong-answer.mp3", // a wrong self-graded answer (Tingxie only -- Quiz stays silent on wrong by design)
  goodResult: "/sounds/good-result.mp3", // a quiz session scoring 90% or higher
  purchase: "/sounds/purchase.mp3", // buying an item in the Shop
  levelUp: "/sounds/level-up.mp3" // the owl evolves to a new growth stage
};

// Plays an MP3 from public/sounds/. Each call creates a fresh <audio>
// element (rather than reusing one) so overlapping/rapid re-triggers -- e.g.
// several correct() dings staggered via `delaySec` when a group has
// multiple right answers -- don't cut each other off.
function playFile(path: string, delaySec: number = 0): void {
  const fire = () => {
    try {
      const audio = new Audio(path);
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

export const Sound = {
  click(): void {
    try {
      tap(0, 0.14);
    } catch {
      // ignore -- sound is a nice-to-have, never block interaction on it
    }
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
  // Quiz session scored 90% or higher (see Result.tsx).
  applause(): void {
    playFile(SOUND_FILES.goodResult);
  },
  // Gentle two-note descending chime for a sub-90% score -- still
  // encouraging, not a "wrong answer" buzzer, just descending and softer.
  encourage(): void {
    try {
      chime(659.25, 0, 0.3, 0.08); // E5
      chime(523.25, 0.18, 0.42, 0.09); // C5
    } catch {
      // ignore
    }
  },
  miss(): void {
    playFile(SOUND_FILES.wrong);
  },
  // The owl evolves to a new growth stage (e.g. egg -> baby) -- see
  // PetContext.tsx's giveItem() return value and Bag.tsx's handleClick().
  levelUp(): void {
    playFile(SOUND_FILES.levelUp);
  }
};
