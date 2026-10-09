import type { Position } from "../player/positions";
import type { Rng } from "../rng";
import { ageOf, hasTrait, output, sectorOf } from "./players";
import { expectedGoals, sectorRatings, type OnField, type SectorRatings, type SideSetup } from "./tactics";
import type { CoachPlayer, FormationId, GoalEvent, Philosophy } from "./types";
import { INJURY, MATCH, RATING, SUBSTITUTIONS, TRAIT_EFFECTS } from "./tuning";

/**
 * Partidas (spec 9 e 10). Uma única conta de gols esperados vale para todos os
 * jogos; os do treinador (e os dos rivais contra ele) ganham linha do tempo
 * minuto a minuto: gols com autor, lesões no minuto em que acontecem,
 * substituições dentro das regras e a pausa para o evento de partida.
 */

// ------------------------------------------------------------ jogo rápido

export interface QuickSide {
  readonly club: string;
  readonly ratings: SectorRatings;
  readonly philosophy: Philosophy;
}

export interface QuickResult {
  readonly home: number;
  readonly away: number;
  readonly extraTime: boolean;
  readonly penalties: readonly [number, number] | null;
}

function setupOf(side: QuickSide, home: boolean, neutral: boolean): SideSetup {
  return {
    ratings: side.ratings,
    philosophy: side.philosophy,
    fastPlayers: 0,
    setPiecePlayers: 0,
    forBoost: 1,
    againstBoost: 1,
    home,
    neutral,
    playersOnField: 11,
  };
}

/** Pênaltis: cinco cobranças cada, depois alternadas, com leve peso dos goleiros. */
export function shootout(rng: Rng, homeKeeper: number, awayKeeper: number): readonly [number, number] {
  const conversion = (keeper: number) => Math.max(0.62, Math.min(0.86, 0.76 - 0.004 * (keeper - 70)));
  const homeChance = conversion(awayKeeper);
  const awayChance = conversion(homeKeeper);
  let home = 0;
  let away = 0;
  for (let kick = 0; kick < 5; kick += 1) {
    if (rng.chance(homeChance)) home += 1;
    if (rng.chance(awayChance)) away += 1;
  }
  let guard = 0;
  while (home === away && guard < 30) {
    const scoredHome = rng.chance(homeChance);
    const scoredAway = rng.chance(awayChance);
    if (scoredHome) home += 1;
    if (scoredAway) away += 1;
    guard += 1;
  }
  if (home === away) home += 1;
  return [home, away];
}

/**
 * Jogo sem o treinador: gols por Poisson. Em jogo decisivo empatado (no placar
 * ou no agregado), prorrogação e pênaltis.
 */
export function quickMatch(
  rng: Rng,
  home: QuickSide,
  away: QuickSide,
  neutral: boolean,
  decisive: boolean,
  aggregateBefore: readonly [number, number] | null,
): QuickResult {
  const homeSetup = setupOf(home, true, neutral);
  const awaySetup = setupOf(away, false, neutral);
  const lambdaHome = expectedGoals(homeSetup, awaySetup);
  const lambdaAway = expectedGoals(awaySetup, homeSetup);
  let goalsHome = rng.poisson(lambdaHome);
  let goalsAway = rng.poisson(lambdaAway);
  let extraTime = false;
  let penalties: readonly [number, number] | null = null;
  if (decisive) {
    const tied = () => {
      const [aggHome, aggAway] = aggregateBefore ?? [0, 0];
      return goalsHome + aggHome === goalsAway + aggAway;
    };
    if (tied()) {
      extraTime = true;
      goalsHome += rng.poisson(lambdaHome * MATCH.extraTime);
      goalsAway += rng.poisson(lambdaAway * MATCH.extraTime);
      if (tied()) penalties = shootout(rng, home.ratings.gk, away.ratings.gk);
    }
  }
  return { home: goalsHome, away: goalsAway, extraTime, penalties };
}

// ------------------------------------------------------- jogo detalhado

export interface SideInput {
  readonly club: string;
  readonly isCoach: boolean;
  readonly onField: readonly OnField[];
  readonly bench: readonly CoachPlayer[];
  readonly philosophy: Philosophy;
  readonly formation: FormationId;
  readonly forBoost: number;
  readonly againstBoost: number;
  /** Ids com promessa de minutos: entram primeiro nas trocas (spec 13). */
  readonly priority: readonly string[];
}

export interface DetailedInput {
  readonly year: number;
  readonly home: SideInput;
  readonly away: SideInput;
  readonly neutral: boolean;
  readonly decisive: boolean;
  readonly aggregateBefore: readonly [number, number] | null;
  readonly big: boolean;
  readonly derby: boolean;
  readonly maxSubs: number;
}

interface LivePlayer {
  readonly id: string;
  slot: Position;
  from: number;
}

interface LiveSide {
  readonly club: string;
  onField: LivePlayer[];
  bench: string[];
  used: Array<{ player: string; from: number; to: number }>;
  subs: number;
  windows: number;
  boostFor: number;
  boostAgainst: number;
  philosophy: Philosophy;
  shortHanded: boolean;
}

/** Estado serializável de uma partida em andamento (pausa do evento). */
export interface LiveMatch {
  minute: number;
  score: [number, number];
  sides: [LiveSide, LiveSide];
  goals: GoalEvent[];
  injuries: Array<{ player: string; minute: number; days: number; kind: "light" | "medium" | "serious" }>;
  ratings: Record<string, number>;
  extraTime: boolean;
  penalties: [number, number] | null;
  eventOption: string | null;
}

export interface DetailedOutcome {
  readonly live: LiveMatch;
  readonly finished: boolean;
}

const SCORER_WEIGHT: Readonly<Record<Position, number>> = {
  st: 0.32,
  lw: 0.2,
  rw: 0.2,
  cam: 0.16,
  lm: 0.12,
  rm: 0.12,
  cm: 0.07,
  cdm: 0.04,
  cb: 0.045,
  lb: 0.03,
  rb: 0.03,
  gk: 0,
};

const ASSIST_WEIGHT: Readonly<Record<Position, number>> = {
  cam: 0.22,
  lw: 0.2,
  rw: 0.2,
  lm: 0.18,
  rm: 0.18,
  cm: 0.14,
  st: 0.12,
  lb: 0.1,
  rb: 0.1,
  cdm: 0.06,
  cb: 0.02,
  gk: 0.005,
};

const TACTICAL_WINDOWS = [60, 71, 81];

export function startLive(input: DetailedInput): LiveMatch {
  const side = (entry: SideInput): LiveSide => ({
    club: entry.club,
    onField: entry.onField.map((field) => ({ id: field.player.id, slot: field.slot, from: 0 })),
    bench: entry.bench.map((player) => player.id),
    used: [],
    subs: 0,
    windows: 0,
    boostFor: entry.forBoost,
    boostAgainst: entry.againstBoost,
    philosophy: entry.philosophy,
    shortHanded: false,
  });
  const ratings: Record<string, number> = {};
  for (const entry of [input.home, input.away]) {
    for (const field of entry.onField) ratings[field.player.id] = RATING.base;
  }
  return {
    minute: 0,
    score: [0, 0],
    sides: [side(input.home), side(input.away)],
    goals: [],
    injuries: [],
    ratings,
    extraTime: false,
    penalties: null,
    eventOption: null,
  };
}

type Lookup = (id: string) => CoachPlayer;

function sideSetup(input: DetailedInput, live: LiveMatch, index: 0 | 1, lookup: Lookup): SideSetup {
  const side = live.sides[index];
  const source = index === 0 ? input.home : input.away;
  const onField: OnField[] = side.onField.map((entry) => ({ player: lookup(entry.id), slot: entry.slot }));
  const rate = (entry: OnField) =>
    source.isCoach
      ? output(entry.player, { slot: entry.slot, big: input.big, derby: input.derby })
      : entry.player.level + entry.player.form + (entry.player.position === entry.slot ? 0 : -3);
  const ratings = sectorRatings(onField, rate);
  return {
    ratings,
    philosophy: side.philosophy,
    fastPlayers: onField.filter((entry) => hasTrait(entry.player, "fast")).length,
    setPiecePlayers: onField.filter((entry) => hasTrait(entry.player, "setPiece")).length,
    forBoost: side.boostFor,
    againstBoost: side.boostAgainst,
    home: index === 0,
    neutral: input.neutral,
    playersOnField: side.onField.length,
  };
}

/** Gols esperados por 90 minutos de cada lado, com quem está em campo agora. */
export function currentLambdas(live: LiveMatch, input: DetailedInput, lookup: Lookup): readonly [number, number] {
  const home = sideSetup(input, live, 0, lookup);
  const away = sideSetup(input, live, 1, lookup);
  return [expectedGoals(home, away), expectedGoals(away, home)];
}

function pickWeighted(rng: Rng, entries: ReadonlyArray<readonly [string, number]>): string | null {
  const total = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
  if (total <= 0) return null;
  return rng.weighted(entries);
}

function injuryDays(rng: Rng): { days: number; kind: "light" | "medium" | "serious" } {
  const severity = rng.weighted(INJURY.severity.map((entry) => [entry, entry.weight] as const));
  return { days: rng.int(severity.days[0], severity.days[1]), kind: severity.kind };
}

/** Melhor reserva para a vaga: mesma posição primeiro, prioridade para promessas. */
function bestSubstitute(side: LiveSide, slot: Position, lookup: Lookup, priority: readonly string[]): string | null {
  let best: string | null = null;
  let bestValue = -Infinity;
  for (const id of side.bench) {
    const player = lookup(id);
    if (player.injury) continue;
    let value = player.level - (player.position === slot ? 0 : player.alternates.includes(slot) ? 1 : sectorOf(player.position) === sectorOf(slot) ? 3 : 8);
    if (slot === "gk" && player.position !== "gk") value -= 30;
    if (slot !== "gk" && player.position === "gk") value -= 30;
    if (priority.includes(id)) value += 6;
    if (value > bestValue) {
      best = id;
      bestValue = value;
    }
  }
  return best;
}

function substitute(live: LiveMatch, side: LiveSide, outId: string, inId: string, minute: number): void {
  const index = side.onField.findIndex((entry) => entry.id === outId);
  if (index < 0) return;
  const leaving = side.onField[index] as LivePlayer;
  side.used.push({ player: outId, from: leaving.from, to: minute });
  side.onField[index] = { id: inId, slot: leaving.slot, from: minute };
  side.bench = side.bench.filter((id) => id !== inId);
  side.subs += 1;
  live.ratings[inId] = RATING.base;
}

function canSubstitute(side: LiveSide, maxSubs: number, minute: number, opensWindow: boolean): boolean {
  if (side.subs >= maxSubs) return false;
  // O intervalo não conta como parada; fora dele, só três janelas.
  return minute === 46 || !opensWindow || side.windows < SUBSTITUTIONS.windows;
}

function tacticalSubs(live: LiveMatch, input: DetailedInput, index: 0 | 1, minute: number, lookup: Lookup, rng: Rng): void {
  const side = live.sides[index];
  const source = index === 0 ? input.home : input.away;
  if (!canSubstitute(side, input.maxSubs, minute, true) || side.bench.length === 0) return;
  const diff = index === 0 ? live.score[0] - live.score[1] : live.score[1] - live.score[0];
  const wanted = minute === TACTICAL_WINDOWS[0] ? 2 : 1 + (Math.abs(diff) >= 2 ? 1 : 0);
  // Sai quem está rendendo menos ou mais cansado (idade), nunca o goleiro.
  const candidates = side.onField
    .filter((entry) => entry.slot !== "gk")
    .map((entry) => {
      const player = lookup(entry.id);
      const tired = Math.max(0, ageOf(player, input.year) - 29) * 0.15 + (hasTrait(player, "tireless") ? -0.6 : 0);
      return { entry, score: (live.ratings[entry.id] ?? RATING.base) - tired + rng.real(-0.3, 0.3) };
    })
    .sort((a, b) => a.score - b.score);
  let done = 0;
  let windowUsed = false;
  for (const { entry } of candidates) {
    if (done >= wanted || side.subs >= input.maxSubs) break;
    const replacement = bestSubstitute(side, entry.slot, lookup, source.priority);
    if (!replacement) break;
    const incoming = lookup(replacement);
    const current = lookup(entry.id);
    // Só troca se o reserva não for muito pior, a não ser que haja promessa.
    if (incoming.level < current.level - 6 && !source.priority.includes(replacement)) continue;
    substitute(live, side, entry.id, replacement, minute);
    done += 1;
    windowUsed = true;
  }
  if (windowUsed) side.windows += 1;
}

function playMinute(live: LiveMatch, input: DetailedInput, minute: number, lookup: Lookup, rng: Rng, extraTime: boolean): void {
  const setups = [sideSetup(input, live, 0, lookup), sideSetup(input, live, 1, lookup)] as const;
  const lambdas = [expectedGoals(setups[0], setups[1]), expectedGoals(setups[1], setups[0])];
  for (const index of [0, 1] as const) {
    const side = live.sides[index];
    const perMinute = (lambdas[index] ?? 0) / 90;
    if (rng.next() < perMinute) {
      live.score[index] += 1;
      const scorerWeights = side.onField.map((entry) => {
        const player = lookup(entry.id);
        const weight = SCORER_WEIGHT[entry.slot] * Math.pow(Math.max(40, player.level) / 70, 3);
        return [entry.id, weight] as const;
      });
      const scorer = pickWeighted(rng, scorerWeights);
      let assist: string | null = null;
      if (rng.chance(0.78)) {
        const assistWeights = side.onField
          .filter((entry) => entry.id !== scorer)
          .map((entry) => [entry.id, ASSIST_WEIGHT[entry.slot] * Math.pow(Math.max(40, lookup(entry.id).level) / 70, 2)] as const);
        assist = pickWeighted(rng, assistWeights);
      }
      const setPieceTakers = side.onField.filter((entry) => hasTrait(lookup(entry.id), "setPiece")).length;
      const setPiece = rng.chance(0.18 + 0.05 * setPieceTakers);
      live.goals.push({ minute, side: index === 0 ? "home" : "away", scorer, assist, setPiece });
      if (scorer) live.ratings[scorer] = (live.ratings[scorer] ?? RATING.base) + RATING.goal;
      if (assist) live.ratings[assist] = (live.ratings[assist] ?? RATING.base) + RATING.assist;
    }
  }
  // Lesões: risco por minuto jogado, maior com a idade (spec 10).
  for (const index of [0, 1] as const) {
    const side = live.sides[index];
    const source = index === 0 ? input.home : input.away;
    for (const entry of [...side.onField]) {
      const player = lookup(entry.id);
      const age = ageOf(player, input.year);
      const ageFactor = 1 + Math.max(0, age - INJURY.ageFrom) * INJURY.agePerYear;
      const traitFactor = hasTrait(player, "tireless") ? TRAIT_EFFECTS.tireless : 1;
      if (!rng.chance((INJURY.per90 / 90) * ageFactor * traitFactor)) continue;
      const { days, kind } = injuryDays(rng);
      live.injuries.push({ player: entry.id, minute, days, kind });
      const replacement = canSubstitute(side, input.maxSubs, minute, true) ? bestSubstitute(side, entry.slot, lookup, source.priority) : null;
      if (replacement) {
        substitute(live, side, entry.id, replacement, minute);
        if (minute !== 46) side.windows += 1;
      } else {
        // Sem troca legal: o time segue com um a menos (Lei 3).
        side.used.push({ player: entry.id, from: entry.from, to: minute });
        side.onField = side.onField.filter((field) => field.id !== entry.id);
        side.shortHanded = true;
      }
    }
  }
  if (!extraTime && TACTICAL_WINDOWS.includes(minute)) {
    tacticalSubs(live, input, 0, minute, lookup, rng);
    tacticalSubs(live, input, 1, minute, lookup, rng);
  }
}

function tied(live: LiveMatch, input: DetailedInput): boolean {
  const [aggHome, aggAway] = input.aggregateBefore ?? [0, 0];
  return live.score[0] + aggHome === live.score[1] + aggAway;
}

/**
 * Joga do minuto atual até `stopAt` (inclusive). Se o jogo terminar antes,
 * fecha prorrogação e pênaltis quando for decisivo.
 */
export function playUntil(live: LiveMatch, input: DetailedInput, lookup: Lookup, rng: Rng, stopAt: number | null): DetailedOutcome {
  const limit = stopAt ?? 90;
  for (let minute = live.minute + 1; minute <= Math.min(90, limit); minute += 1) {
    playMinute(live, input, minute, lookup, rng, false);
    live.minute = minute;
  }
  if (stopAt !== null && stopAt < 90) return { live, finished: false };
  if (input.decisive && tied(live, input) && live.minute <= 90) {
    live.extraTime = true;
    for (let minute = 91; minute <= 120; minute += 1) {
      playMinute(live, input, minute, lookup, rng, true);
      live.minute = minute;
    }
    if (tied(live, input)) {
      const keeper = (index: 0 | 1) => {
        const gk = live.sides[index].onField.find((entry) => entry.slot === "gk");
        return gk ? lookup(gk.id).level : 50;
      };
      const result = shootout(rng, keeper(0), keeper(1));
      live.penalties = [result[0], result[1]];
    }
  }
  finishRatings(live, rng);
  return { live, finished: true };
}

function finishRatings(live: LiveMatch, rng: Rng): void {
  const [home, away] = live.score;
  for (const index of [0, 1] as const) {
    const side = live.sides[index];
    const own = index === 0 ? home : away;
    const other = index === 0 ? away : home;
    const result = own > other ? RATING.win : own < other ? RATING.loss : 0;
    const ids = [...side.onField.map((entry) => entry.id), ...side.used.map((entry) => entry.player)];
    for (const id of new Set(ids)) {
      const base = live.ratings[id] ?? RATING.base;
      const clean = other === 0 ? RATING.cleanSheet : 0;
      const slot = side.onField.find((entry) => entry.id === id)?.slot;
      const defensive = slot === "gk" || slot === "cb" || slot === "lb" || slot === "rb";
      live.ratings[id] = Math.max(3, Math.min(10, base + result + (defensive ? clean : 0) + rng.normal(0, RATING.noise)));
    }
    for (const entry of side.onField) side.used.push({ player: entry.id, from: entry.from, to: live.extraTime ? 120 : 90 });
  }
}

/** Aplica a escolha do evento de partida: muda gols a favor e contra até o fim. */
export function applyMatchChoice(live: LiveMatch, coachIndex: 0 | 1, option: string, forMult: number, againstMult: number): void {
  const side = live.sides[coachIndex];
  side.boostFor *= forMult;
  side.boostAgainst *= againstMult;
  live.eventOption = option;
}

/** Placar de um lado para o outro, do ponto de vista do treinador. */
export function coachScore(live: LiveMatch, coachIndex: 0 | 1): readonly [number, number] {
  return coachIndex === 0 ? [live.score[0], live.score[1]] : [live.score[1], live.score[0]];
}
