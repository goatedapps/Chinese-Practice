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
  }
};
