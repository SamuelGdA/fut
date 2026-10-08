import { clamp, fallingLogistic } from "../math";
import type { Rng } from "../rng";
import { ageOf, sectorOf } from "./players";
import type { CoachCareer, CoachPlayer, CoachTrait, PlayerChange } from "./types";
import { DEVELOP, EVOLUTION, TRAIT_EFFECTS } from "./tuning";
import { coachRng, stageKey } from "./util";
import { squadIndex } from "./world";

/**
 * Evolução do OVR (spec 7 e 5). Uma atualização por período simulado, com o
 * ganho esperado da temporada vezes a fração que passou: no lento, as duas
 * metades somam o mesmo que o período único do rápido. Idade, folga até o
 * potencial, minutos e desempenho pesam; a sorte entra com um desvio
 * pequeno. Velho tende a cair, mas é chance: há quem jogue muito aos 39.
 */

/** Folga até o potencial: rende muito longe do teto, pouco perto dele. */
function gapDrive(level: number, potential: number): number {
  const gap = Math.max(potential - level, 0) + 0.3;
  return gap / (gap + 5);
}

/** Ritmo pela idade: quase inteiro até perto do pico, metade 2 anos antes dele. */
function ageRate(age: number, peak: number): number {
  return fallingLogistic(age, peak - 2, 1.6);
}

function minutesFactor(games: number, fraction: number): number {
  const perSeason = games / Math.max(0.25, fraction);
  return 0.45 + 0.55 * Math.min(1, perSeason / 32);
}

/** Bônus do Desenvolver, aplicado inteiro na próxima atualização (spec 6.4). */
export function developBonus(player: CoachPlayer, year: number): number {
  const age = ageOf(player, year);
  const raw = clamp(DEVELOP.gapShare * (player.potential - player.level), DEVELOP.minBonus, DEVELOP.maxBonus);
  for (const [limit, factor] of DEVELOP.ageFactor) if (age <= limit) return raw * factor;
  return 0;
}

interface AiMinutes {
  readonly games: number;
}

function aiMinutes(career: CoachCareer, index: Map<string, CoachPlayer[]>): Map<string, AiMinutes> {
  const minutes = new Map<string, AiMinutes>();
  for (const [club, squad] of index) {
    if (club === career.coach?.club) continue;
    squad.forEach((player, rank) => {
      const games = rank < 11 ? 30 : rank < 18 ? 12 : ageOf(player, career.year) <= 20 ? 6 : 3;
      minutes.set(player.id, { games });
    });
  }
  return minutes;
}

export interface GrowthInput {
  readonly year: number;
  /** Fração da temporada: 1 no rápido, 0,5 em cada metade do lento. */
  readonly fraction: number;
  /** Jogos no período (os da IA vêm do posto no elenco). */
  readonly games: number;
  /** Desempenho de −1 a 1 pela nota média (só no clube do treinador). */
  readonly performance: number;
  /** Multiplicador do mentor para jovens (1 sem mentor). */
  readonly mentor: number;
  /** Marcado pelo Desenvolver nesta etapa. */
  readonly developed: boolean;
}

/**
 * Novo nível oculto de um jogador depois de um período. Função pura (o
 * sorteio vem de fora) para o laboratório e o harness compararem o mesmo
 * jogador com e sem o Desenvolver, com a mesma sorte.
 */
export function growthStep(player: CoachPlayer, input: GrowthInput, rng: Rng): number {
  const age = ageOf(player, input.year);
  const sector = sectorOf(player.position);
  const peak = EVOLUTION.peakAge[sector];
  let gain =
    input.fraction *
    EVOLUTION.growthBase *
    ageRate(age, peak) *
    gapDrive(player.level, player.potential) *
    minutesFactor(input.games, input.fraction) *
    (1 + EVOLUTION.performanceWeight * input.performance) *
    input.mentor;
  const declineAge = EVOLUTION.declineStart + (sector === "gk" ? 2 : sector === "def" ? 1 : 0) + player.longevity;
  const over = age - declineAge;
  if (over > 0) {
    let decline = input.fraction * (EVOLUTION.declineLinear * over + EVOLUTION.declineQuadratic * over * over);
    decline *= 1 - 0.2 * input.performance;
    gain -= decline;
  }
  gain += rng.normal(0, EVOLUTION.noise * Math.sqrt(input.fraction));
  if (input.developed) {
    if (age <= 29) gain += developBonus(player, input.year) + Math.abs(rng.normal(0, 0.25));
    else if (gain < 0) gain *= DEVELOP.veteranDeclineCut;
  }
  const ceiling = player.potential + EVOLUTION.potentialTolerance;
  let level = player.level + gain;
  if (gain > 0 && level > ceiling) level = Math.max(player.level, ceiling);
  return clamp(level, 30, 97);
}

/**
 * Atualiza todos os jogadores do mundo para um período de fração `fraction`
 * (1 no rápido, 0,5 em cada metade do lento). Devolve as mudanças de OVR do
 * elenco do treinador para o resumo.
 */
export function evolvePeriod(career: CoachCareer, fraction: number): PlayerChange[] {
  const index = squadIndex(career.players);
  const ai = aiMinutes(career, index);
  const coachClub = career.coach?.club ?? null;
  const key = stageKey(career.year, career.half);
  const mentorBoost = coachClub && (index.get(coachClub) ?? []).some((player) => player.traits.includes("mentor")) ? TRAIT_EFFECTS.mentor : 0;
  const changes: PlayerChange[] = [];
  for (const player of Object.values(career.players)) {
    const rng = coachRng(career.setup.seed, "growth", key, player.id);
    const age = ageOf(player, career.year);
    const inCoachClub = player.club === coachClub && coachClub !== null;
    const games = inCoachClub ? player.season.apps : (ai.get(player.id)?.games ?? 4) * fraction;
    const average = player.season.rated > 0 ? player.season.ratingSum / player.season.rated : 6.6;
    const performance = inCoachClub ? clamp((average - 6.6) / 0.6, -1, 1) : 0;
    const mentor = inCoachClub && age <= 21 ? 1 + mentorBoost : 1;
    const developed = player.developedAt === key;
    const before = player.ovr;
    player.level = growthStep(player, { year: career.year, fraction, games, performance, mentor, developed }, rng);
    player.ovr = Math.round(player.level);
    if (developed) player.developedAt = null;
    if (inCoachClub && (player.ovr !== before || developed)) changes.push({ player: player.id, from: before, to: player.ovr, developed });
    if (!inCoachClub) player.form = clamp(rng.normal(0, 0.7), -2, 2);
    if (inCoachClub) maybeTrait(career, player, rng.next());
  }
  return changes;
}

/**
 * Características novas (spec 7): raras, exigem boa fase e o histórico que
 * combina com elas. Nunca por qualquer boa campanha.
 */
function maybeTrait(career: CoachCareer, player: CoachPlayer, roll: number): void {
  if (player.traits.length >= EVOLUTION.maxTraits || player.form < 1) return;
  const stats = player.season;
  const age = ageOf(player, career.year);
  const candidates: CoachTrait[] = [];
  if (stats.bigGoals >= 2) candidates.push("clutch");
  if (stats.derbyGoals >= 2) candidates.push("derby");
  if (stats.setPieceGoals >= 2) candidates.push("setPiece");
  if (age >= 28 && stats.starts >= 15 && stats.rated > 0 && stats.ratingSum / stats.rated >= 7) candidates.push("leader");
  if (stats.available > 10 && stats.minutes >= stats.available * 85) candidates.push("tireless");
  const fresh = candidates.filter((trait) => !player.traits.includes(trait));
  if (fresh.length === 0 || roll >= EVOLUTION.traitChance * fresh.length) return;
  const trait = fresh[Math.floor((roll / (EVOLUTION.traitChance * fresh.length)) * fresh.length)] ?? fresh[0];
  if (!trait) return;
  player.traits = [...player.traits, trait];
  career.ledger.newTraits.push({ player: player.id, trait });
}
