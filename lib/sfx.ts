/**
 * Tiny synthesised sound kit built on the Web Audio API — no audio files to
 * ship, and every cue is generated from a couple of oscillators.
 */

export type SoundName =
  | "tick"
  | "select"
  | "confirm"
  | "back"
  | "statUp"
  | "trophy"
  | "cardReveal"
  | "whistle";

let context: AudioContext | null = null;
let muted = false;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  // Browsers start the context suspended until a user gesture unlocks it.
  if (context.state === "suspended") void context.resume();
  return context;
}

export function setMuted(value: boolean): void {
  muted = value;
}

interface ToneOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  /** Slide to this frequency across the tone's life. */
  slideTo?: number;
}

function tone({ freq, duration, type = "sine", gain = 0.08, delay = 0, slideTo }: ToneOptions): void {
  const audio = ctx();
  if (!audio) return;

  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const amp = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), start + duration);

  // Short attack, exponential release: reads as a soft "pop" rather than a click.
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noise({ duration, gain = 0.05, delay = 0 }: { duration: number; gain?: number; delay?: number }): void {
  const audio = ctx();
  if (!audio) return;

  const frames = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    // Fade the noise out so it lands like a brush rather than a burst.
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }

  const start = audio.currentTime + delay;
  const source = audio.createBufferSource();
  const amp = audio.createGain();
  const filter = audio.createBiquadFilter();

  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 2400;
  amp.gain.value = gain;

  source.connect(filter);
  filter.connect(amp);
  amp.connect(audio.destination);
  source.start(start);
}

export function play(name: SoundName): void {
  if (muted) return;

  switch (name) {
    case "tick":
      tone({ freq: 520, duration: 0.05, type: "triangle", gain: 0.035 });
      break;
    case "select":
      tone({ freq: 660, duration: 0.09, type: "triangle", gain: 0.05 });
      tone({ freq: 880, duration: 0.08, type: "sine", gain: 0.03, delay: 0.04 });
      break;
    case "confirm":
      tone({ freq: 523.25, duration: 0.12, type: "triangle", gain: 0.06 });
      tone({ freq: 659.25, duration: 0.12, type: "triangle", gain: 0.055, delay: 0.07 });
      tone({ freq: 783.99, duration: 0.2, type: "triangle", gain: 0.05, delay: 0.14 });
      break;
    case "back":
      tone({ freq: 420, duration: 0.11, type: "sine", gain: 0.045, slideTo: 300 });
      break;
    case "statUp":
      tone({ freq: 700, duration: 0.14, type: "sine", gain: 0.05, slideTo: 1200 });
      break;
    case "trophy":
      tone({ freq: 659.25, duration: 0.14, type: "triangle", gain: 0.055 });
      tone({ freq: 830.61, duration: 0.14, type: "triangle", gain: 0.05, delay: 0.09 });
      tone({ freq: 987.77, duration: 0.3, type: "triangle", gain: 0.05, delay: 0.18 });
      noise({ duration: 0.35, gain: 0.02, delay: 0.18 });
      break;
    case "cardReveal":
      noise({ duration: 0.28, gain: 0.035 });
      tone({ freq: 300, duration: 0.35, type: "sine", gain: 0.05, slideTo: 900 });
      break;
    case "whistle":
      tone({ freq: 1800, duration: 0.18, type: "sine", gain: 0.04, slideTo: 2200 });
      tone({ freq: 2100, duration: 0.16, type: "sine", gain: 0.025, delay: 0.02 });
      break;
  }
}
