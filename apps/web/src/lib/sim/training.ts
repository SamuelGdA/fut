import type { Locale } from "@/lib/i18n/context";
import type { PositionCode } from "./constants";
import type { AttributeKey } from "./attributes";

/**
 * Training focuses are this project's own addition (the hybrid progression
 * mode): growth stays automatic, but every so often the player picks an area
 * to push, which biases where the next season's gains land.
 */

export type TrainingFocusKey =
  | "explosiveness"
  | "technique"
  | "strength"
  | "finishing"
  | "vision"
  | "shotStopping"
  | "distribution"
  | "command";

export interface TrainingFocus {
  key: TrainingFocusKey;
  icon: string;
  /** Extra weighting added to these attributes when the next season's growth is distributed. */
  shares: Partial<Record<AttributeKey, number>>;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
}

const OUTFIELD_FOCUSES: TrainingFocus[] = [
  {
    key: "explosiveness",
    icon: "⚡",
    shares: { pace: 0.45, physical: 0.15 },
    label: { pt: "Explosão", es: "Explosividad", en: "Explosiveness" },
    description: {
      pt: "Tiros curtos e pliometria. Puxa Ritmo, com um pouco de Físico.",
      es: "Piques cortos y pliometría. Empuja Ritmo, con algo de Físico.",
      en: "Short sprints and plyometrics. Pushes Pace, with some Physical.",
    },
  },
  {
    key: "technique",
    icon: "🎯",
    shares: { dribbling: 0.35, passing: 0.25 },
    label: { pt: "Técnica", es: "Técnica", en: "Technique" },
    description: {
      pt: "Trabalho de bola no pé. Puxa Condução e Passe.",
      es: "Trabajo de balón al pie. Empuja Regate y Pase.",
      en: "Close-control ball work. Pushes Dribbling and Passing.",
    },
  },
  {
    key: "strength",
    icon: "🏋️",
    shares: { physical: 0.45, defending: 0.15 },
    label: { pt: "Academia", es: "Gimnasio", en: "Gym work" },
    description: {
      pt: "Musculação e duelos. Puxa Físico, com um pouco de Defesa.",
      es: "Pesas y duelos. Empuja Físico, con algo de Defensa.",
      en: "Weights and duels. Pushes Physical, with some Defending.",
    },
  },
  {
    key: "finishing",
    icon: "🥅",
    shares: { shooting: 0.45, dribbling: 0.1 },
    label: { pt: "Finalização", es: "Definición", en: "Finishing" },
    description: {
      pt: "Centenas de chutes por semana. Puxa Finalização.",
      es: "Cientos de remates por semana. Empuja Definición.",
      en: "Hundreds of shots a week. Pushes Shooting.",
    },
  },
  {
    key: "vision",
    icon: "🧠",
    shares: { passing: 0.45, defending: 0.1 },
    label: { pt: "Leitura de jogo", es: "Lectura de juego", en: "Game reading" },
    description: {
      pt: "Vídeo e posicionamento. Puxa Passe e leitura defensiva.",
      es: "Vídeo y posicionamiento. Empuja Pase y lectura defensiva.",
      en: "Film study and positioning. Pushes Passing and defensive reading.",
    },
  },
];

const GOALKEEPER_FOCUSES: TrainingFocus[] = [
  {
    key: "shotStopping",
    icon: "🧤",
    shares: { reflexes: 0.4, diving: 0.25 },
    label: { pt: "Defesa de chute", es: "Parar disparos", en: "Shot stopping" },
    description: {
      pt: "Reação a curta distância. Puxa Reflexos e Elasticidade.",
      es: "Reacción a corta distancia. Empuja Reflejos y Elasticidad.",
      en: "Close-range reactions. Pushes Reflexes and Diving.",
    },
  },
  {
    key: "distribution",
    icon: "🦶",
    shares: { kicking: 0.45, handling: 0.15 },
    label: { pt: "Saída de bola", es: "Salida de balón", en: "Distribution" },
    description: {
      pt: "Jogo com os pés e lançamentos. Puxa Chute e Manejo.",
      es: "Juego con los pies y lanzamientos. Empuja Saque y Manejo.",
      en: "Playing out and long balls. Pushes Kicking and Handling.",
    },
  },
  {
    key: "command",
    icon: "📣",
    shares: { positioning: 0.4, handling: 0.2 },
    label: { pt: "Domínio da área", es: "Dominio del área", en: "Command of area" },
    description: {
      pt: "Cruzamentos e posicionamento. Puxa Posicionamento e Manejo.",
      es: "Centros y posicionamiento. Empuja Posicionamiento y Manejo.",
      en: "Crosses and positioning. Pushes Positioning and Handling.",
    },
  },
  {
    key: "explosiveness",
    icon: "⚡",
    shares: { speed: 0.4, diving: 0.15 },
    label: { pt: "Explosão", es: "Explosividad", en: "Explosiveness" },
    description: {
      pt: "Saída rápida do gol. Puxa Velocidade e Elasticidade.",
      es: "Salida rápida del arco. Empuja Velocidad y Elasticidad.",
      en: "Rushing off the line. Pushes Speed and Diving.",
    },
  },
];

export function trainingFocusesFor(position: PositionCode): TrainingFocus[] {
  return position === "GK" ? GOALKEEPER_FOCUSES : OUTFIELD_FOCUSES;
}

export function findTrainingFocus(position: PositionCode, key: string): TrainingFocus | null {
  return trainingFocusesFor(position).find((f) => f.key === key) ?? null;
}

export const TRAINING_EVENT_COPY: Record<Locale, { eyebrow: string; title: string; description: string }> = {
  pt: {
    eyebrow: "Pré-temporada",
    title: "Foco de treino",
    description: "Escolha em que o seu trabalho vai bater mais forte neste ciclo.",
  },
  es: {
    eyebrow: "Pretemporada",
    title: "Foco de entrenamiento",
    description: "Elegí en qué va a pegar más fuerte tu trabajo en este ciclo.",
  },
  en: {
    eyebrow: "Preseason",
    title: "Training focus",
    description: "Choose where your work will bite hardest this cycle.",
  },
};
