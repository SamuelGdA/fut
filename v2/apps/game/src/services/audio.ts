/**
 * Kit de som sintetizado em tempo real (GDD 33.2). Nenhum arquivo de áudio.
 *
 * O volume é um multiplicador aplicado no momento do agendamento, e não um
 * nó de ganho compartilhado: um som já agendado termina no volume em que
 * começou, mesmo que o jogador mexa no controle no meio dele.
 */

export const CUES = [
  "tick",
  "select",
  "confirm",
  "back",
  "rise",
  "trophy",
  "reveal",
  "whistle",
  "unlock",
] as const;

export type Cue = (typeof CUES)[number];

const STEP_GAIN = [0, 0.25, 0.5, 0.75, 1] as const;

/** Ganho mestre para um passo de volume de 0 a 4. Mudo é sempre zero. */
export function volumeGain(step: number, muted: boolean): number {
  if (muted || !Number.isFinite(step)) return 0;
  const index = Math.max(0, Math.min(STEP_GAIN.length - 1, Math.round(step)));
  return STEP_GAIN[index] ?? 0;
}

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

let context: AudioContext | null = null;

/**
 * O contexto nasce no primeiro som, que sempre vem de um gesto do jogador:
 * navegadores só liberam áudio depois disso.
 */
function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
    if (!Ctor) return null;
    try {
      context = new Ctor();
    } catch {
      return null;
    }
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

interface ToneSpec {
  wave: OscillatorType;
  from: number;
  to?: number;
  at?: number;
  duration: number;
  peak: number;
  vibrato?: { rate: number; depth: number };
}

interface NoiseSpec {
  at?: number;
  duration: number;
  peak: number;
  band: number;
  q: number;
}

const ATTACK = 0.012;
const FLOOR = 0.0001;

function envelope(gain: GainNode, start: number, duration: number, peak: number) {
  gain.gain.setValueAtTime(FLOOR, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(FLOOR, peak), start + ATTACK);
  gain.gain.exponentialRampToValueAtTime(FLOOR, start + duration);
}

function tone(ac: AudioContext, master: number, spec: ToneSpec) {
  const start = ac.currentTime + (spec.at ?? 0);
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = spec.wave;
  osc.frequency.setValueAtTime(spec.from, start);
  if (spec.to !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(spec.to, start + spec.duration);
  }

  if (spec.vibrato) {
    const lfo = ac.createOscillator();
    const depth = ac.createGain();
    lfo.frequency.setValueAtTime(spec.vibrato.rate, start);
    depth.gain.setValueAtTime(spec.vibrato.depth, start);
    lfo.connect(depth);
    depth.connect(osc.frequency);
    lfo.start(start);
    lfo.stop(start + spec.duration + 0.02);
  }

  envelope(gain, start, spec.duration, spec.peak * master);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(start);
  osc.stop(start + spec.duration + 0.02);
}

function noise(ac: AudioContext, master: number, spec: NoiseSpec) {
  const start = ac.currentTime + (spec.at ?? 0);
  const length = Math.max(1, Math.floor(ac.sampleRate * spec.duration));
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    // Ruído branco com cauda descendente embutida, para o estalo final sumir.
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }

  const source = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();

  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(spec.band, start);
  filter.Q.setValueAtTime(spec.q, start);
  envelope(gain, start, spec.duration, spec.peak * master);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  source.start(start);
  source.stop(start + spec.duration + 0.02);
}

function render(ac: AudioContext, cue: Cue, master: number) {
  switch (cue) {
    case "tick":
      tone(ac, master, { wave: "sine", from: 1250, duration: 0.04, peak: 0.035 });
      return;

    case "select":
      tone(ac, master, { wave: "triangle", from: 740, duration: 0.07, peak: 0.05 });
      tone(ac, master, { wave: "triangle", from: 988, at: 0.05, duration: 0.09, peak: 0.045 });
      return;

    case "confirm":
      tone(ac, master, { wave: "triangle", from: 392, duration: 0.16, peak: 0.05 });
      tone(ac, master, { wave: "triangle", from: 494, at: 0.06, duration: 0.16, peak: 0.05 });
      tone(ac, master, { wave: "triangle", from: 587.33, at: 0.12, duration: 0.2, peak: 0.05 });
      tone(ac, master, { wave: "sine", from: 784, at: 0.12, duration: 0.22, peak: 0.02 });
      return;

    case "back":
      tone(ac, master, { wave: "sine", from: 520, to: 340, duration: 0.13, peak: 0.05 });
      return;

    case "rise":
      tone(ac, master, { wave: "sine", from: 620, to: 1180, duration: 0.16, peak: 0.045 });
      tone(ac, master, { wave: "sine", from: 1240, to: 2360, duration: 0.16, peak: 0.012 });
      return;

    case "trophy":
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        tone(ac, master, {
          wave: "triangle",
          from: frequency,
          at: index * 0.05,
          duration: 0.5,
          peak: 0.042,
        });
      });
      noise(ac, master, { at: 0.05, duration: 0.6, peak: 0.028, band: 1600, q: 0.8 });
      return;

    case "reveal":
      noise(ac, master, { duration: 0.32, peak: 0.04, band: 1200, q: 0.6 });
      tone(ac, master, { wave: "sine", from: 220, to: 660, duration: 0.36, peak: 0.035 });
      return;

    case "unlock":
      // Conquista (GDD 28.2): um brilho de sino, subindo, diferente do troféu.
      [880, 1318.51, 1760].forEach((frequency, index) => {
        tone(ac, master, { wave: "sine", from: frequency, at: index * 0.07, duration: 0.42, peak: 0.04 });
        tone(ac, master, { wave: "triangle", from: frequency * 2, at: index * 0.07, duration: 0.18, peak: 0.012 });
      });
      return;

    case "whistle":
      tone(ac, master, {
        wave: "sine",
        from: 2750,
        duration: 0.16,
        peak: 0.05,
        vibrato: { rate: 38, depth: 90 },
      });
      tone(ac, master, {
        wave: "sine",
        from: 2750,
        at: 0.24,
        duration: 0.3,
        peak: 0.05,
        vibrato: { rate: 38, depth: 90 },
      });
      return;
  }
}

/** Toca um sinal no ganho mestre dado. Ganho zero não agenda nada. */
export function playCue(cue: Cue, master: number): void {
  if (!(master > 0)) return;
  const ac = getContext();
  if (!ac) return;
  try {
    render(ac, cue, master);
  } catch {
    // Um som que falha nunca pode quebrar a tela que o pediu.
  }
}
