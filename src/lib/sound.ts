// Synthesized with the Web Audio API so the app needs no external sound
// files -- keeps it deployable as a static bundle with zero asset weight.
// click() is a filtered-noise "tap" (not a square-wave beep); ding() is a
// short detuned-oscillator bell arpeggio with a filter sweep, aiming for
// something warmer than a flat MIDI blip.
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
// filter whose cutoff sweeps down as the note decays.
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

// Two-tone metallic "coin" clink for Shop purchases -- square-wave blips
// through a highpass filter, deliberately harder-edged than the warm bell
// chime used for correct quiz answers, so the two never get confused.
function coin(startTime: number): void {
  const c = ensureCtx();
  if (!c) return;
  [1567.98, 2093.0].forEach((freq, i) => {
    const t0 = c.currentTime + startTime + i * 0.055;
    const osc = c.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, t0);
    const filter = c.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 900;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.09, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.13);
  });
}

// Rising "sparkle" glide for giving a bagged item to the owl -- a single
// triangle-wave glissando, distinct in shape (not a multi-note chime) from
// both the quiz ding and the shop coin sound.
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

// Irregular noise-burst "claps" for a perfect score -- reuses the same
// noise buffer as tap() but with randomized timing/pitch/gain per burst,
// and a taper toward the end, so it doesn't sound like a mechanical repeat.
function clapBurst(startTime: number): void {
  const c = ensureCtx();
  if (!c) return;
  const clapCount = 14;
  let t = startTime;
  for (let i = 0; i < clapCount; i++) {
    const t0 = c.currentTime + t;
    const src = c.createBufferSource();
    src.buffer = getNoiseBuffer(c);
    const bandpass = c.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1500 + Math.random() * 1500;
    bandpass.Q.value = 0.6;
    const gain = c.createGain();
    const taper = 1 - i / (clapCount + 4);
    const peak = (0.08 + Math.random() * 0.06) * taper;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
    src.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(c.destination);
    src.start(t0);
    src.stop(t0 + 0.07);
    t += 0.07 + Math.random() * 0.07;
  }
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
    try {
      chime(783.99, delay, 0.32, 0.12); // G5
      chime(1046.5, delay + 0.07, 0.38, 0.1); // C6
      chime(1567.98, delay + 0.15, 0.5, 0.07); // G6 -- bright top note
    } catch {
      // ignore
    }
  },
  purchase(): void {
    try {
      coin(0);
    } catch {
      // ignore
    }
  },
  gift(): void {
    try {
      sparkleGlide(0);
    } catch {
      // ignore
    }
  },
  applause(): void {
    try {
      clapBurst(0);
    } catch {
      // ignore
    }
  },
  // Gentle two-note descending chime for a sub-100% score -- reuses the
  // warm bell timbre from ding() (still encouraging, not a "wrong answer"
  // buzzer) but descending and softer.
  encourage(): void {
    try {
      chime(659.25, 0, 0.3, 0.08); // E5
      chime(523.25, 0.18, 0.42, 0.09); // C5
    } catch {
      // ignore
    }
  }
};
