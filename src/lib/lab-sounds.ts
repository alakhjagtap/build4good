let ctx: AudioContext | null = null;
let pourSource: AudioBufferSourceNode | null = null;
let pourGain: GainNode | null = null;
let ambientSource: AudioBufferSourceNode | null = null;
let ambientGain: GainNode | null = null;

function ensureCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noiseBuffer(seconds: number): AudioBuffer {
  const c = ensureCtx();
  const len = c.sampleRate * seconds;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

export function playDrip() {
  try {
    const c = ensureCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(680, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, c.currentTime + 0.07);
    g.gain.setValueAtTime(0.12, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.12);
  } catch {
    /* audio not available */
  }
}

export function startPourSound() {
  try {
    if (pourSource) return;
    const c = ensureCtx();
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(4);
    src.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2400;
    bp.Q.value = 0.6;
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.07, c.currentTime + 0.25);
    src.connect(bp).connect(g).connect(c.destination);
    src.start();
    pourSource = src;
    pourGain = g;
  } catch {
    /* audio not available */
  }
}

export function stopPourSound() {
  try {
    if (!pourGain || !pourSource || !ctx) return;
    pourGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
    const s = pourSource;
    setTimeout(() => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }, 350);
    pourSource = null;
    pourGain = null;
  } catch {
    /* ignore */
  }
}

export function startAmbient() {
  try {
    if (ambientSource) return;
    const c = ensureCtx();
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(6);
    src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 280;
    const g = c.createGain();
    g.gain.value = 0.012;
    src.connect(lp).connect(g).connect(c.destination);
    src.start();
    ambientSource = src;
    ambientGain = g;
  } catch {
    /* audio not available */
  }
}

export function stopAmbient() {
  try {
    if (!ambientGain || !ambientSource || !ctx) return;
    ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    const s = ambientSource;
    setTimeout(() => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }, 600);
    ambientSource = null;
    ambientGain = null;
  } catch {
    /* ignore */
  }
}

export function disposeSounds() {
  stopPourSound();
  stopAmbient();
  if (ctx) {
    void ctx.close();
    ctx = null;
  }
}
