import { leagueAt, PLAYABLE_COUNTRIES } from "@craque/world";
import { clamp } from "../math";
import { changeCash } from "./finance";
import { seasonBudget } from "./review";
import type { Position } from "../player/positions";
import { finishLeagues, sortTable } from "./competitions";
import { viableSquad } from "./lineup";
import { ageOf, emptySeason, valueOf, wageFor } from "./players";
import { bestEleven } from "./tactics";
import type { CoachCareer, CoachClub, CoachPlayer } from "./types";
import { AI_MARKET, AI_YOUTH, FINANCE, RETIREMENT } from "./tuning";
import { coachRng } from "./util";
import { clubTrophyProgress } from "../world/clubProgress";
import { youthAlternates } from "./eligibility";
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
  const potential = clamp(club.anchor - (club.id === career.coach?.club ? 3 : 1.5) + rng.normal(0, 5) + (star ? 10 : 0), ovr + 2, 95);
  const age = rng.int(17, 18);
  const natural = position ?? rng.pick(YOUTH_POSITIONS);
  return {
    id,
    name: "",
    nationality: rng.chance(0.88) ? club.country : rng.pick(["ARG", "BRA", "URU", "COL", "FRA", "ESP", "POR", "NGA", "SEN", "GHA"]),
    position: natural,
    alternates: youthAlternates(natural, rng),
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
  if (from) { changeCash(from, fee); from.investment=(from.investment ?? 0)-fee; }
  if (destination) { destination.cash -= fee; destination.investment=(destination.investment ?? 0)+fee; }
  player.club = to;
  player.joinedYear = career.year;
  player.arrival = { year: career.year, kind: "purchase" };
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
    let budget=seasonBudget(club,club.transferReserve ?? 0);
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
        const remaining = (index.get(seller.id) ?? []).filter(other => other.id !== player.id);
        if (remaining.length < 18 || remaining.filter(other => other.position === "gk").length < 2 || !viableSquad(remaining)) continue;
        candidates.push(player);
        if (candidates.length >= 5) break;
      }
      if (candidates.length === 0) break;
      const target = candidates[rng.int(0, candidates.length - 1)] as CoachPlayer;
      const fee = valueOf(target, career.year);
      if (fee > budget || club.cash < fee - club.revenue * 0.15) break;
      const sellerId = target.club;
      const seller = career.clubs[sellerId];
      if (!rng.chance(Math.max(0.15, aiInterest(target, club.anchor, seller?.anchor ?? club.anchor)))) continue;
      moveAi(career, target, club.id, fee);
      budget-=fee;
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
    club.transferReserve=budget;
  }
  invalidateSquads(career);
}

/** Âncora deriva como a força no Craque: volta à base, soma sucesso, ruído pequeno. */
function driftAnchors(career: CoachCareer, movement: Movement): void {
  const drift = AI_MARKET.anchorDrift;
  const titles = new Map<string, string[]>();
  for (const state of Object.values(career.competitions)) {
    if (!state.champion) continue;
    const won = titles.get(state.champion) ?? [];
    won.push(state.id);
    titles.set(state.champion, won);
  }
  for (const club of Object.values(career.clubs)) {
    const rng = coachRng(career.setup.seed, "anchor", career.year, club.id);
    const progress = clubTrophyProgress(titles.get(club.id) ?? [], club.titleDrought);
    club.titleDrought = progress.drought;
    let success = progress.growth + progress.penalty;
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
    // Contratar um craque não cria patrocinador instantaneamente. O crescimento
    // comercial tem tempo próprio, antes dos bônus reais de campanha e acesso.
    next = clamp(next, club.revenue * (1 - FINANCE.nextRevenue.growthCap), club.revenue * (1 + FINANCE.nextRevenue.growthCap));
    if (movement.promoted.has(club.id)) next *= FINANCE.nextRevenue.promotion;
    if (movement.relegated.has(club.id)) next *= FINANCE.nextRevenue.relegation;
    if (Object.values(career.competitions).some((state) => state.champion === club.id)) next *= FINANCE.nextRevenue.titleBonus;
    const league = Object.values(career.competitions).find(state => state.kind === "league" && state.entrants.includes(club.id));
    const position = league?.table ? sortTable(league.table, id => career.clubs[id]?.strength ?? 0).findIndex(row => row.club === club.id) + 1 : 0;
    const expected = league ? [...league.entrants].sort((a,b) => (career.clubs[b]?.strength ?? 0) - (career.clubs[a]?.strength ?? 0)).indexOf(club.id) + 1 : 0;
    if (position > 0 && expected > position) next *= 1 + Math.min(0.04, (expected - position) * 0.004);
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
  for(const club of Object.values(career.clubs)) { club.previousInvestment=club.investment ?? 0;club.investment=0; }
  career.year += 1;
  career.seasonIndex += 1;
  const retired = retirements(career);
  aiYouth(career);
  aiMarket(career);
  const added = ensureViable(career);
  const coachClub = career.coach ? career.clubs[career.coach.club] : null;
  if (coachClub) {
    const rng = coachRng(career.setup.seed, "boardArrivals", career.year, coachClub.id);
    for (let index = 0, count = rng.int(1, 3); index < count; index += 1) {
      const squad = Object.values(career.players).filter((entry) => entry.club === coachClub.id);
      const missing = YOUTH_POSITIONS.filter((slot) => !squad.some((entry) => entry.position === slot || entry.alternates.includes(slot)));
      const room = coachClub.revenue * FINANCE.wageCap / 12 - squad.reduce((sum, entry) => sum + entry.wage, 0);
      let signed: CoachPlayer | undefined;
      if (rng.chance(0.35) && squad.length < 26 && missing.length > 0) {
        const budget = Math.min(Math.max(0, coachClub.cash), coachClub.revenue * FINANCE.budgetShare);
        const currentSquads = squadIndex(career.players);
        const pool = Object.values(career.players).filter((entry) => entry.club !== coachClub.id && !entry.injury
          && entry.ovr >= coachClub.anchor - 6 && entry.ovr <= coachClub.anchor + 4
          && room >= 2 * Math.max(entry.wage, wageFor(entry.ovr))
          && (!entry.club || valueOf(entry, career.year) <= budget)
          && (!missing.length || missing.some((slot) => entry.position === slot || entry.alternates.includes(slot)))
          && (!entry.club || viableSquad((currentSquads.get(entry.club) ?? []).filter((other) => other.id !== entry.id))))
          .sort((a,b) => a.id.localeCompare(b.id));
        if (pool.length) {
          signed = rng.pick(pool);
          moveAi(career, signed, coachClub.id, signed.club ? valueOf(signed, career.year) : 0);
          signed.arrival = { year: career.year, kind: "board" };
        }
      }
      if (!signed) {
        const player = newYouth(career, coachClub, 200 + index, missing.length ? rng.pick(missing) : undefined);
        player.arrival = { year: career.year, kind: "youth" };
        career.players[player.id] = player;
        signed = player;
      }
      added.push(signed.id);
    }
    invalidateSquads(career);
  }
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
    player.wage = Math.max(2000,Math.round((player.wage*0.65+wageFor(player.ovr)*0.35)/500)*500);
    player.improvised={};
    player.season = emptySeason();
    player.recentRatings = player.recentRatings.slice(-2);
    player.offeredAt = null;
    player.consecutiveStarts = 0;
    player.listed = player.listed && player.club === career.coach?.club;
  }
  return { retired, added };
}
