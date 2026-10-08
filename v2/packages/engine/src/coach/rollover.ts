import { leagueAt, PLAYABLE_COUNTRIES } from "@craque/world";
import { clamp } from "../math";
import type { Position } from "../player/positions";
import { finishLeagues, sortTable } from "./competitions";
import { viableSquad } from "./lineup";
import { ageOf, emptySeason, valueOf, wageFor } from "./players";
import { bestEleven } from "./tactics";
import type { CoachCareer, CoachClub, CoachPlayer } from "./types";
import { AI_MARKET, AI_YOUTH, FINANCE, RETIREMENT } from "./tuning";
import { coachRng } from "./util";
import { assignRoles, invalidateSquads, refreshStrength, roleFor, seasonRole, squadIndex, squadValue } from "./world";

/**
 * A virada da temporada (spec 15), numa ordem fixa e uma vez só: acesso e
 * queda, aposentadorias, jovens, mercado da IA, força, receita e papéis. Os
 * clubes continuam existindo sem o treinador e os jogadores vendidos seguem a
 * trajetória deles.
 */

export interface Movement {
  readonly promoted: Set<string>;
  readonly relegated: Set<string>;
}

/** Fecha as ligas e troca os últimos da primeira com os primeiros da segunda. */
export function closeLeagues(career: CoachCareer): Movement {
  const seeder = (club: string) => career.clubs[club]?.strength ?? 0;
  finishLeagues(career.competitions, seeder);
  const promoted = new Set<string>();
  const relegated = new Set<string>();
  for (const country of PLAYABLE_COUNTRIES) {
    const first = leagueAt(country, 1);
    const second = leagueAt(country, 2);
    if (!first || !second) continue;
    const top = career.competitions[`league:${first.id}`]?.table;
    const lower = career.competitions[`league:${second.id}`]?.table;
    if (!top || !lower) continue;
    const slots = first.promotionSlots;
    const down = sortTable(top, seeder).slice(-slots).map((row) => row.club);
    const up = sortTable(lower, seeder).slice(0, slots).map((row) => row.club);
    for (const id of down) {
      relegated.add(id);
      const club = career.clubs[id];
      if (club) club.division = 2;
    }
    for (const id of up) {
      promoted.add(id);
      const club = career.clubs[id];
      if (club) club.division = 1;
    }
  }
  return { promoted, relegated };
}

/** Aposentadoria por idade, OVR e longevidade; aos 41, todos param. */
function retirements(career: CoachCareer): string[] {
  const retired = new Set<string>();
  for (const player of Object.values(career.players)) {
    const age = ageOf(player, career.year);
    if (age < RETIREMENT.fromAge) continue;
    const rng = coachRng(career.setup.seed, "retire", career.year, player.id);
    let chance = RETIREMENT.base + RETIREMENT.perYear * (age - RETIREMENT.fromAge) - 0.04 * player.longevity;
    if (player.ovr >= RETIREMENT.highOvr) chance *= RETIREMENT.highOvrRelief;
    if (!player.club) chance += 0.25;
    if (age >= RETIREMENT.maxAge || rng.chance(clamp(chance, 0, 1))) retired.add(player.id);
  }
  // Sem clube por uma temporada inteira, muitos largam o futebol profissional.
  for (const player of Object.values(career.players)) {
    if (player.club || retired.has(player.id)) continue;
    const age = ageOf(player, career.year);
    const rng = coachRng(career.setup.seed, "retireFree", career.year, player.id);
    if (rng.chance(clamp(0.35 + 0.08 * Math.max(0, age - 26), 0, 0.95))) retired.add(player.id);
  }
  for (const id of retired) {
    const player = career.players[id];
    const legacy = career.legacy[id];
    if (legacy && player) legacy.bestOvr = Math.max(legacy.bestOvr, player.ovr);
    delete career.players[id];
  }
  invalidateSquads(career);
  return [...retired];
}

const YOUTH_POSITIONS: readonly Position[] = ["gk", "cb", "cb", "lb", "rb", "cdm", "cm", "cm", "cam", "lm", "rm", "lw", "rw", "st", "st"];

function newYouth(career: CoachCareer, club: CoachClub, index: number, position?: Position): CoachPlayer {
  const id = `a:${career.year}:${club.id}:${index}`;
  const rng = coachRng(career.setup.seed, "aiYouth", id);
  const star = rng.chance(AI_YOUTH.starChance);
  const ovr = clamp(Math.round(club.anchor - AI_YOUTH.ovrBelowAnchor + rng.normal(0, AI_YOUTH.ovrSpread) + (star ? 5 : 0)), 42, 80);
  const potential = clamp(club.anchor - 3 + rng.normal(0, 5) + (star ? 10 : 0), ovr + 2, 95);
  const age = rng.int(17, 18);
  return {
    id,
    name: "",
    nationality: rng.chance(0.88) ? club.country : rng.pick(["ARG", "BRA", "URU", "COL", "FRA", "ESP", "POR", "NGA", "SEN", "GHA"]),
    position: position ?? rng.pick(YOUTH_POSITIONS),
    alternates: [],
    birthYear: career.year - age,
    origin: "y",
    level: ovr + rng.real(-0.4, 0.4),
    ovr,
    potential,
    longevity: rng.normal(0, 1.5),
    form: 0,
    recentRatings: [],
    traits: [],
    club: club.id,
    joinedYear: career.year,
    wage: Math.max(1_500, Math.round(wageFor(ovr) * 0.6 / 500) * 500),
    satisfaction: 65,
    role: "prospect",
    acceptsBench: true,
    injury: null,
    youthClub: club.id,
    developedAt: null,
    listed: false,
    offeredAt: null,
    consecutiveStarts: 0,
    season: emptySeason(),
  };
}

/** Jovens da IA: dois ou três por clube (um se o elenco está cheio), em torno da âncora menos 14. */
function aiYouth(career: CoachCareer): void {
  const squadSizes = new Map<string, number>();
  for (const player of Object.values(career.players)) if (player.club) squadSizes.set(player.club, (squadSizes.get(player.club) ?? 0) + 1);
  for (const club of Object.values(career.clubs)) {
    if (club.id === career.coach?.club) continue;
    const rng = coachRng(career.setup.seed, "aiYouthCount", career.year, club.id);
    const size = squadSizes.get(club.id) ?? 0;
    // Elenco cheio sobe menos garotos: a base renova sem inchar o mundo.
    const [low, high] = AI_YOUTH.bySquad.find(([minimum]) => size >= minimum)?.[1] ?? [1, 2];
    const count = rng.int(low, high);
    for (let index = 0; index < count; index += 1) {
      const player = newYouth(career, club, index);
      career.players[player.id] = player;
    }
  }
  invalidateSquads(career);
}

/** Garante que nenhum clube (nem o do treinador) comece a temporada sem elenco viável. */
function ensureViable(career: CoachCareer): string[] {
  const index = squadIndex(career.players);
  const added: string[] = [];
  for (const club of Object.values(career.clubs)) {
    const squad = index.get(club.id) ?? [];
    let extra = 10;
    while ((squad.filter((player) => player.position === "gk").length < 2 || !viableSquad(squad)) && extra > 0) {
      const needKeeper = squad.filter((player) => player.position === "gk").length < 2;
      const player = newYouth(career, club, 90 + extra, needKeeper ? "gk" : undefined);
      career.players[player.id] = player;
      squad.push(player);
      added.push(player.id);
      extra -= 1;
    }
  }
  invalidateSquads(career);
  return added;
}

/** Move um jogador entre clubes da IA sem recalcular índices (o índice é refeito no fim). */
function moveAi(career: CoachCareer, player: CoachPlayer, to: string, fee: number): void {
  const from = player.club ? career.clubs[player.club] : null;
  const destination = career.clubs[to];
  if (from) from.cash += fee;
  if (destination) destination.cash -= fee;
  player.club = to;
  player.joinedYear = career.year;
  player.listed = false;
  player.wage = Math.max(player.wage, wageFor(player.ovr));
  player.satisfaction = 64;
}

/** Chance de um jogador aceitar um clube da IA: a mesma curva do treinador, pela âncora. */
function aiInterest(player: CoachPlayer, buyerAnchor: number, sellerAnchor: number): number {
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  const gap = player.ovr - buyerAnchor;
  const stepDown = sellerAnchor - buyerAnchor;
  return sigmoid((2.5 - gap) / 1.6) * sigmoid((4 - stepDown) / 2.2);
}

/**
 * Mercado da IA (spec 15): clubes cortam o excesso, completam o elenco com
 * livres e reforçam a vaga mais fraca do time com jogadores de clubes menores,
 * pela mesma curva de interesse do treinador. O clube do treinador fica fora:
 * suas vendas e compras são só dele.
 */
function aiMarket(career: CoachCareer): void {
  const coachClub = career.coach?.club ?? null;
  const clubs = Object.values(career.clubs)
    .filter((club) => club.id !== coachClub)
    .sort((a, b) => b.anchor - a.anchor || a.id.localeCompare(b.id));
  const [minSquad, maxSquad] = AI_MARKET.squadTarget;
  const index = squadIndex(career.players);
  const freeAgents: CoachPlayer[] = Object.values(career.players).filter((player) => !player.club);
  for (const club of clubs) {
    const squad = index.get(club.id) ?? [];
    const seniors = squad.filter((player) => ageOf(player, career.year) > 21).sort((a, b) => a.ovr - b.ovr || a.id.localeCompare(b.id));
    while (squad.length > maxSquad + 2 && seniors.length > 0) {
      const cut = seniors.shift() as CoachPlayer;
      cut.club = "";
      squad.splice(squad.indexOf(cut), 1);
      freeAgents.push(cut);
    }
  }
  freeAgents.sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id));
  for (const club of clubs) {
    const squad = index.get(club.id) ?? [];
    if (!index.has(club.id)) index.set(club.id, squad);
    let guard = 0;
    while (squad.length < minSquad && guard < 12) {
      guard += 1;
      const at = freeAgents.findIndex((player) => player.ovr <= club.anchor + 2 && ageOf(player, career.year) <= 35);
      if (at < 0) break;
      const signing = freeAgents.splice(at, 1)[0] as CoachPlayer;
      moveAi(career, signing, club.id, 0);
      squad.push(signing);
    }
  }
  // Reforços por posição: candidatos de clubes menores, do melhor para o pior.
  const byPosition = new Map<Position, CoachPlayer[]>();
  for (const player of Object.values(career.players)) {
    if (!player.club || player.club === coachClub || ageOf(player, career.year) > 31) continue;
    const list = byPosition.get(player.position);
    if (list) list.push(player);
    else byPosition.set(player.position, [player]);
  }
  for (const list of byPosition.values()) list.sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id));
  for (const club of clubs) {
    const squad = index.get(club.id) ?? [];
    if (squad.length === 0) continue;
    const rng = coachRng(career.setup.seed, "aiMarket", career.year, club.id);
    for (let buy = 0; buy < AI_MARKET.buysPerClub; buy += 1) {
      const eleven = bestEleven(squad, "4-3-3");
      const weakest = [...eleven].sort((a, b) => a.player.ovr - b.player.ovr || a.player.id.localeCompare(b.player.id))[0];
      if (!weakest) break;
      const wanted = weakest.player.ovr + AI_MARKET.upgradeMargin;
      const ceiling = club.anchor + 5;
      const pool = byPosition.get(weakest.slot) ?? [];
      const candidates: CoachPlayer[] = [];
      for (const player of pool) {
        if (player.ovr > ceiling) continue;
        if (player.ovr < wanted) break;
        if (player.club === club.id || player.club === coachClub) continue;
        const seller = career.clubs[player.club];
        if (!seller || seller.anchor >= club.anchor - 1) continue;
        candidates.push(player);
        if (candidates.length >= 5) break;
      }
      if (candidates.length === 0) break;
      const target = candidates[rng.int(0, candidates.length - 1)] as CoachPlayer;
      const fee = valueOf(target, career.year);
      if (club.cash < fee - club.revenue * 0.2) break;
      const sellerId = target.club;
      const seller = career.clubs[sellerId];
      if (!rng.chance(Math.max(0.15, aiInterest(target, club.anchor, seller?.anchor ?? club.anchor)))) continue;
      moveAi(career, target, club.id, fee);
      squad.push(target);
      const sellerSquad = index.get(sellerId);
      if (sellerSquad) {
        const at = sellerSquad.indexOf(target);
        if (at >= 0) sellerSquad.splice(at, 1);
      }
      const list = byPosition.get(target.position);
      if (list) {
        const at = list.indexOf(target);
        if (at >= 0) list.splice(at, 1);
      }
    }
  }
  invalidateSquads(career);
}

/** Âncora deriva como a força no Craque: volta à base, soma sucesso, ruído pequeno. */
function driftAnchors(career: CoachCareer, movement: Movement): void {
  const drift = AI_MARKET.anchorDrift;
  for (const club of Object.values(career.clubs)) {
    const rng = coachRng(career.setup.seed, "anchor", career.year, club.id);
    let success = 0;
    for (const state of Object.values(career.competitions)) {
      if (state.champion !== club.id) continue;
      if (state.kind === "league") success += drift.title;
      if (state.kind === "cont1") success += drift.continental;
    }
    if (movement.promoted.has(club.id)) success += drift.promotion;
    if (movement.relegated.has(club.id)) success += drift.relegation;
    const next = club.anchor + drift.reversion * (club.baseAnchor - club.anchor) + success + rng.normal(0, drift.noise);
    club.anchor = clamp(next, club.baseAnchor - drift.range, club.baseAnchor + drift.range);
  }
}

/** Receita da próxima temporada: parte memória, parte valor atual do elenco, com acesso e queda. */
function updateRevenues(career: CoachCareer, movement: Movement): void {
  const index = squadIndex(career.players);
  for (const club of Object.values(career.clubs)) {
    const target = FINANCE.revenueShare * squadValue(index.get(club.id) ?? [], career.year) * FINANCE.divisionFactor[club.division];
    let next = (1 - FINANCE.nextRevenue.reversion) * club.revenue + FINANCE.nextRevenue.reversion * target;
    if (movement.promoted.has(club.id)) next *= FINANCE.nextRevenue.promotion;
    if (movement.relegated.has(club.id)) next *= FINANCE.nextRevenue.relegation;
    if (Object.values(career.competitions).some((state) => state.champion === club.id)) next *= FINANCE.nextRevenue.titleBonus;
    club.revenue = Math.max(500_000, next);
  }
}

/**
 * Tudo o que acontece nas férias, depois que a temporada fechou e antes da
 * próxima ser montada. `career.year` ainda é o ano que terminou.
 */
export function offseason(career: CoachCareer, movement: Movement): { retired: string[]; added: string[] } {
  driftAnchors(career, movement);
  updateRevenues(career, movement);
  career.year += 1;
  career.seasonIndex += 1;
  const retired = retirements(career);
  aiYouth(career);
  aiMarket(career);
  const added = ensureViable(career);
  const index = squadIndex(career.players);
  for (const club of Object.values(career.clubs)) {
    const squad = index.get(club.id) ?? [];
    refreshStrength(club, squad);
    if (club.id === career.coach?.club) {
      for (const player of squad) player.role = seasonRole(player.role, roleFor(player, squad, career.year, club.strength));
    } else {
      assignRoles(squad, career.year, club.strength);
    }
  }
  for (const player of Object.values(career.players)) {
    player.season = emptySeason();
    player.recentRatings = player.recentRatings.slice(-2);
    player.offeredAt = null;
    player.consecutiveStarts = 0;
    player.listed = player.listed && player.club === career.coach?.club;
  }
  return { retired, added };
}
