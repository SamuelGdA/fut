import type { KeyMatch } from "@craque/engine";
import type { Locale } from "./i18n";

/**
 * D106: o título grande do jogo-chave fala do momento (a final, a virada, os
 * acréscimos, a seleção), não só do nome da cena, que se repete de um ano para
 * o outro. A escolha é determinística (a decisão e o lance), então o replay
 * mostra sempre o mesmo título, e duas decisões seguidas nunca repetem.
 */
const HEADLINES = {
  pt: {
    final: ["A taça na ponta da chuteira", "Uma bola vale a taça", "O lance que a final vai lembrar", "A final pede um nome", "Tudo ou nada pela taça"],
    finalBehind: ["A taça escapando", "Ainda dá para virar a final", "A final contra o relógio"],
    semi: ["A porta da final", "Um lance da decisão", "Meio caminho da taça", "A semifinal na sua mão"],
    quarter: ["Mata-mata não perdoa", "Um passo da semifinal", "Quartas na balança", "Classificar ou voltar para casa"],
    league: ["Três pontos em jogo", "A rodada pede um herói", "O lance da rodada", "A tabela está olhando"],
    behind: ["O placar contra", "Correndo atrás", "Hora da reação", "O tempo contra você"],
    late: ["Último suspiro", "Nos acréscimos", "O relógio não espera"],
    national: ["A camisa da seleção pesa", "Um país inteiro olhando", "O hino ainda ecoa"],
    penalties: ["Onze metros", "A marca da cal", "Nervos de aço"],
  },
  en: {
    final: ["The trophy at your feet", "One ball for the trophy", "The moment the final will remember", "The final needs a name", "All or nothing for the cup"],
    finalBehind: ["The trophy slipping away", "Still time to turn the final", "The final against the clock"],
    semi: ["The door to the final", "One moment from the final", "Halfway to the trophy", "The semi-final in your hands"],
    quarter: ["Knockouts show no mercy", "One step from the semis", "Quarter-final on a knife edge", "Go through or go home"],
    league: ["Three points at stake", "The matchday needs a hero", "The moment of the round", "The table is watching"],
    behind: ["Behind on the scoreboard", "Chasing the game", "Time to respond", "The clock against you"],
    late: ["Last gasp", "Into stoppage time", "The clock will not wait"],
    national: ["The national shirt weighs heavy", "A whole country watching", "The anthem still echoes"],
    penalties: ["Twelve yards", "The penalty spot", "Nerves of steel"],
  },
  es: {
    final: ["La copa en la punta de la bota", "Un balón vale la copa", "La jugada que la final va a recordar", "La final pide un nombre", "Todo o nada por la copa"],
    finalBehind: ["La copa se escapa", "Todavía se puede remontar la final", "La final contra el reloj"],
    semi: ["La puerta de la final", "A una jugada de la final", "A mitad de camino de la copa", "La semifinal en tus manos"],
    quarter: ["El mata a mata no perdona", "A un paso de la semifinal", "Cuartos en la balanza", "Pasar o volver a casa"],
    league: ["Tres puntos en juego", "La jornada pide un héroe", "La jugada de la jornada", "La tabla está mirando"],
    behind: ["El marcador en contra", "Corriendo detrás", "Hora de reaccionar", "El tiempo en contra"],
    late: ["Último suspiro", "En el descuento", "El reloj no espera"],
    national: ["La camiseta de la selección pesa", "Un país entero mirando", "El himno todavía resuena"],
    penalties: ["Once metros", "El punto de penalti", "Nervios de acero"],
  },
} as const satisfies Record<Locale, Record<string, readonly string[]>>;

const PENALTY_SCENES: readonly KeyMatch["scene"][] = ["penalty", "shootout", "penaltySave", "decisivePenalty", "suddenDeath", "keeperShootout"];

/** Número estável de um texto, para escolher variantes sem sorteio. */
export function textSeed(...parts: readonly (string | number)[]): number {
  let hash = 2166136261;
  for (const char of parts.join("|")) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return hash;
}

/** A manchete do jogo-chave: o momento manda (final, desvantagem, acréscimos), com variantes. */
export function matchHeadline(locale: Locale, match: KeyMatch, decision: number): string {
  const copy = HEADLINES[locale];
  const behind = match.score[0] < match.score[1];
  const base = match.stage === "final" ? (behind ? copy.finalBehind : copy.final)
    : behind ? copy.behind
    : match.stage === "league" ? copy.league : match.stage === "semi" ? copy.semi : copy.quarter;
  const pool: string[] = [...base];
  if (match.minute >= 85) pool.push(...copy.late);
  if (match.national) pool.push(...copy.national);
  if (PENALTY_SCENES.includes(match.scene)) pool.push(...copy.penalties);
  // A decisão anda de um em um: duas seguidas caem em variantes diferentes.
  return pool[(decision + textSeed(match.competition, match.opponent)) % pool.length] ?? base[0] ?? "";
}
