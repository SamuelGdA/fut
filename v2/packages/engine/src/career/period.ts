import { getClub } from "@craque/world";
import { guaranteeFocus } from "../evolution/training";
import { clamp } from "../math";
import { attributesAt, ovrAt } from "../player/player";
import { baseMarketValue } from "../player/value";
import { recordTally } from "../records/pressure";
import type { SquadRole } from "../season/role";
import { simulatePlayerSeason, type PlayerSeasonStats, type SeasonModifiers } from "../season/playerSeason";
import { LAST_AGE, SEASONS_PER_PERIOD, type Six } from "../types";
import { clubIndex } from "../world/model";
import type { SeasonResults, WorldState } from "../world/types";
import { bondLegacy } from "./context";
import { applyLaterCapacity } from "./effects";
import { fanDelta, legacySeasonPoints } from "./fans";
import { newBond } from "./move";
import type { Career, CareerNotice, ClubBond, SeasonRecord } from "./types";

/**
 * O período depois de uma escolha (GDD 14.3, passos 6 e 7): uma temporada no
 * ritmo Intensa, duas no Normal. Cada temporada passa pelo mundo inteiro com
 * os modificadores do evento, e depois a carreira anota torcida, legado,
 * banco (para a dispensa) e primeira convocação.
 */

/** Sem espaço no elenco: conta para a dispensa (GDD 15.6). */
export const BENCH_ROLES: readonly SquadRole[] = ["reserve", "surplus", "third"];

/** Quanto do período uma meia suspensão tira. */
const HALF_SUSPENSION_GAMES = 0.5;

function relegated(results: SeasonResults, club: string): boolean {
  const country = getClub(club)?.country;
  return country ? (results.relegated[country] ?? []).includes(club) : false;
}

/** Posição na tabela e posição esperada pela força, para "acima do esperado". */
function tableReading(world: WorldState, results: SeasonResults, stats: PlayerSeasonStats): { position: number; expected: number } {
  const league = stats.league ? results.leagues[stats.league] : undefined;
  if (!league) return { position: 0, expected: 0 };
  const position = league.rows.find((row) => row.club === stats.club)?.position ?? 0;
  const byStrength = [...league.rows].sort(
    (a, b) => (world.strength[clubIndex(b.club)] ?? 0) - (world.strength[clubIndex(a.club)] ?? 0),
  );
  return { position, expected: byStrength.findIndex((row) => row.club === stats.club) + 1 };
}

/** Os modificadores da temporada, com a suspensão que ainda falta cumprir. */
function seasonPlan(modifiers: SeasonModifiers, suspension: number): { modifiers: SeasonModifiers; suspended: boolean; remaining: number } {
  if (suspension >= 1) return { modifiers, suspended: true, remaining: suspension - 1 };
  if (suspension > 0) {
    return {
      modifiers: { ...modifiers, gamesScale: (modifiers.gamesScale ?? 1) * HALF_SUSPENSION_GAMES },
      suspended: false,
      remaining: 0,
    };
  }
  return { modifiers, suspended: false, remaining: 0 };
}

export function simulatePeriod(
  career: Career,
  notices: CareerNotice[],
  event: SeasonRecord["event"],
  traitorMove: boolean,
): Career {
  if (!career.contract) return career;
  const length = Math.min(SEASONS_PER_PERIOD[career.setup.pace], LAST_AGE - career.age + 1);
  const periodStart: Six = attributesAt(career.player, career.age);
  let next = career;
  let suspension = career.pending.suspension;

  for (let season = 0; season < length; season += 1) {
    const contract = next.contract;
    if (!contract) break;
    const age = next.age;
    const club = contract.club;
    const bond = next.bonds[club] ?? newBond();
    const plan = seasonPlan(next.pending.modifiers, suspension);
    suspension = plan.remaining;

    const result = simulatePlayerSeason({
      seed: next.setup.seed,
      world: next.world,
      player: next.player,
      age,
      nationality: next.nationality,
      club,
      difficulty: next.setup.difficulty,
      fans: bond.fans,
      // O foco treina uma vez, na primeira temporada do período que vem depois da escolha.
      focus: season === 0 && next.focusAge === career.age ? next.focus : null,
      suspended: plan.suspended,
      modifiers: plan.modifiers,
      tally: recordTally(next.history),
    });
    const { stats, results } = result;

    // Torcida (GDD 17.2) e legado (GDD 17.4).
    const table = tableReading(next.world, results, stats);
    const delta = fanDelta({
      stats,
      debutSeason: next.history.length === 0,
      position: next.player.position,
      contract,
      fans: bond.fans,
      trait: next.player.trait,
      difficulty: next.setup.difficulty,
      champion: table.position === 1,
      aboveExpected: table.expected > 0 && table.position > 0 && table.position <= table.expected - 2,
      relegated: relegated(results, club),
    });
    const fans = clamp(bond.fans + delta, 0, 100);
    const updatedBond: ClubBond = {
      ...bond,
      fans,
      peakFans: Math.max(bond.peakFans, fans),
      seasons: bond.seasons + 1,
      legacyPoints: bond.legacyPoints + legacySeasonPoints(stats, fans, next.player.trait),
    };

    // Garantia do foco no fim do período (GDD 10.5).
    const lastOfPeriod = season === length - 1;
    const trained = next.focus !== null && next.focusAge === career.age;
    const player = lastOfPeriod && trained && next.focus ? guaranteeFocus(result.player, next.focus, periodStart, age) : result.player;
    const ovrEnd = ovrAt(player, age);

    // Avisos da temporada: entram depois dela, na ordem em que aconteceram.
    const seasonNotices: CareerNotice[] = [];
    let firstCapAge = next.firstCapAge;
    if (firstCapAge === null && stats.national.games > 0) {
      firstCapAge = age;
      seasonNotices.push({ kind: "firstCap", age });
    }

    const benchSeasons = BENCH_ROLES.includes(stats.role) ? contract.benchSeasons + 1 : 0;
    const updated: Career = {
      ...next,
      world: result.world,
      player,
      bonds: { ...next.bonds, [club]: updatedBond },
      contract: { ...contract, benchSeasons },
      firstCapAge,
      age: age + 1,
    };

    const record: SeasonRecord = {
      ...stats,
      ovrEnd,
      attributes: attributesAt(player, age),
      shirt: contract.shirt,
      mission: contract.mission,
      pressure: contract.pressure,
      fans,
      loan: contract.loan !== null,
      legacy: bondLegacy(updated, club),
      traitor: season === 0 && traitorMove,
      nationality: next.nationality,
      position: player.position,
      event: season === 0 ? event : null,
      marketValue: baseMarketValue(ovrEnd, age),
    };
    notices.push({ kind: "season", year: stats.year }, ...seasonNotices);
    next = { ...updated, history: [...updated.history, record] };
  }

  // Fim do período: capacidade adiada, modificadores zerados, suspensão que sobrou.
  return {
    ...next,
    player: applyLaterCapacity(next.player, next.pending.laterCapacity),
    pending: { modifiers: {}, laterCapacity: 0, suspension },
  };
}
