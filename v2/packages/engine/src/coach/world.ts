import { CLUBS } from "@craque/world";
import type { SquadPlayer } from "@craque/world/squads";
import { clamp } from "../math";
import { baseMarketValue } from "../player/value";
import { createWorld } from "../world/season";
import { ageOf, createPlayer, sectorOf } from "./players";
import { displayStrength } from "./tactics";
import type { CoachCareer, CoachClub, CoachPlayer, PreviousSeason, Role } from "./types";
import { FINANCE } from "./tuning";
import { unit } from "./util";

/**
 * O mundo do Técnico (spec 15): clubes do Craque com elencos de verdade. A
 * força de cada clube sai do elenco (média do OVR do melhor time), e a receita
 * sai do valor desse elenco: o Flamengo é forte no Brasil e nas Américas, mas
 * o Real Madrid tem elenco melhor, e é só isso que decide entre os dois.
 */

export interface WorldData {
  readonly players: readonly SquadPlayer[];
  readonly free: readonly SquadPlayer[];
}

export function squadValue(squad: readonly CoachPlayer[], year: number): number {
  return squad.reduce((total, player) => total + baseMarketValue(player.ovr, ageOf(player, year)), 0);
}

export function createWorldState(
  seed: string,
  year: number,
  data: WorldData,
): { players: Record<string, CoachPlayer>; clubs: Record<string, CoachClub>; memory: PreviousSeason } {
  const players: Record<string, CoachPlayer> = {};
  for (const row of [...data.players, ...data.free]) players[row.id] = createPlayer(seed, row, year);
  const index = squadIndex(players);
  const clubs: Record<string, CoachClub> = {};
  for (const club of CLUBS) {
    const squad = index.get(club.id) ?? [];
    const strength = displayStrength(squad);
    const revenue = FINANCE.revenueShare * squadValue(squad, year) * FINANCE.divisionFactor[club.division];
    const [low, high] = FINANCE.cashRange;
    clubs[club.id] = {
      id: club.id,
      country: club.country,
      division: club.division,
      anchor: strength,
      baseAnchor: strength,
      strength,
      revenue,
      cash: revenue * (low + (high - low) * unit(`${seed}:cash:${club.id}`)),
      prestige: club.prestige,
    };
    assignRoles(squad, year, strength);
  }
  // A memória da temporada anterior (classificação continental e supercopas)
  // vem do aquecimento do mundo do Craque, com a mesma semente.
  const warm = createWorld(seed, year).memory;
  const memory: PreviousSeason = {
    year: warm.year,
    tables: warm.tables,
    cups: warm.cups,
    continental: warm.continental,
    primaryChampions: warm.primaryChampions as PreviousSeason["primaryChampions"],
  };
  return { players, clubs, memory };
}

/** Elenco de cada clube, montado a partir do vínculo único `player.club`. */
export function squadIndex(players: Readonly<Record<string, CoachPlayer>>): Map<string, CoachPlayer[]> {
  const index = new Map<string, CoachPlayer[]>();
  for (const player of Object.values(players)) {
    if (!player.club) continue;
    const list = index.get(player.club);
    if (list) list.push(player);
    else index.set(player.club, [player]);
  }
  for (const list of index.values()) list.sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id));
  return index;
}

/**
 * Índice de elencos guardado por objeto de jogadores. Quem muda o clube de
 * alguém (transferência, base, aposentadoria, mercado) chama
 * `invalidateSquads`; uma cópia nova do estado começa sem índice.
 */
const SQUAD_CACHE = new WeakMap<object, Map<string, CoachPlayer[]>>();

export function invalidateSquads(career: Pick<CoachCareer, "players">): void {
  SQUAD_CACHE.delete(career.players);
}

export function squadOf(career: Pick<CoachCareer, "players">, club: string): CoachPlayer[] {
  let index = SQUAD_CACHE.get(career.players);
  if (!index) {
    index = squadIndex(career.players);
    SQUAD_CACHE.set(career.players, index);
  }
  // A ordem por OVR pode mudar com a evolução: ordena a cópia na hora.
  return [...(index.get(club) ?? [])].sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id));
}

const STARTERS_PER_SECTOR = { gk: 1, def: 4, mid: 3, att: 3 } as const;

/**
 * Papel esperado (spec 7 e 8): posto do jogador no setor dele. Craque do time
 * é titular bem acima da força do clube; jovem até 20 anos que não é titular
 * é promessa. O papel é definido na chegada e na virada da temporada.
 */
export function roleFor(player: CoachPlayer, squad: readonly CoachPlayer[], year: number, strength: number): Role {
  const sector = sectorOf(player.position);
  const peers = squad
    .filter((other) => sectorOf(other.position) === sector)
    .sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id));
  const rank = peers.findIndex((other) => other.id === player.id);
  const starters = STARTERS_PER_SECTOR[sector];
  if (rank < starters) return player.ovr >= strength + 3 ? "star" : "starter";
  if (ageOf(player, year) <= 20) return "prospect";
  if (rank < starters + (sector === "gk" ? 0 : 2)) return "rotation";
  return "backup";
}

export function assignRoles(squad: readonly CoachPlayer[], year: number, strength: number): void {
  for (const player of squad) player.role = roleFor(player, squad, year, strength);
}

/** Papel na virada: cai no máximo um degrau por temporada (spec 8, sem choque). */
export function seasonRole(previous: Role, computed: Role): Role {
  const order: Role[] = ["star", "starter", "rotation", "backup"];
  if (previous === "prospect" || computed === "prospect") return computed;
  const before = order.indexOf(previous);
  const after = order.indexOf(computed);
  if (after > before + 1) return order[before + 1] ?? computed;
  return computed;
}

export function refreshStrength(club: CoachClub, squad: readonly CoachPlayer[]): void {
  club.strength = squad.length ? displayStrength(squad) : clamp(club.anchor, 40, 95);
}
