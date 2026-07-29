// Synthesized with the Web Audio API so the app needs no external sound
// files -- keeps it deployable as a static bundle with zero asset weight.
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

function tone(freq: number, startTime: number, duration: number, type: OscillatorType, peakGain: number): void {
  const c = ensureCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + startTime);
  gain.gain.setValueAtTime(0, c.currentTime + startTime);
  gain.gain.linearRampToValueAtTime(peakGain, c.currentTime + startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + startTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + startTime);
  osc.stop(c.currentTime + startTime + duration + 0.03);
}

export const Sound = {
  click(): void {
    try {
      tone(700, 0, 0.05, "square", 0.06);
    } catch {
      // ignore -- sound is a nice-to-have, never block interaction on it
    }
  },
  ding(delay: number = 0): void {
    try {
      tone(880, delay, 0.12, "sine", 0.16);
      tone(1318.51, delay + 0.09, 0.16, "sine", 0.14);
    } catch {
      // ignore
    }
  }
};
