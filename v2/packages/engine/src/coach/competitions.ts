import {
  CONFEDERATIONS,
  type Confederation,
  type CountryCode,
  getCompetition,
  getCountry,
  LEAGUES,
  leagueAt,
  PLAYABLE_COUNTRIES,
} from "@craque/world";
import { continentalEntrants } from "../world/season";
import { CALENDAR, CLUB_WORLD_CUP_QUOTA, GENERIC_CHAMPIONS } from "../world/tuning";
import type { SeasonMemory } from "../world/types";
import type { CoachClub, CompetitionKind, CompetitionState, Fixture, KnockoutRound, PreviousSeason, TableRow } from "./types";
import { CALENDAR_DAYS } from "./tuning";
import { coachRng, nextPow2 } from "./util";

/**
 * Calendário e competições do Técnico (GDD 56.4): as mesmas competições de
 * clubes do Craque, agora jogadas partida a partida. Liga em turno e returno
 * (método do círculo), copas em mata-mata com folga para os cabeças de chave,
 * continentais com preliminar, grupos e mata-mata conforme o número de
 * classificados, supercopas, Intercontinental e Mundial de Clubes.
 *
 * Toda fase de mata-mata é sorteada quando a anterior termina: o chaveamento
 * é real, e o resultado do treinador muda quem segue.
 */

// --------------------------------------------------------------- dias

/** Dias das fases de cada tipo de torneio, do fim para o começo. */
const DAYS = {
  super: 2,
  cup: [24, 52, 80, 108, 164, 192, 220, 262],
  leaguecup: [17, 45, 73, 101, 157, 185, 213, 241],
  continentalPrelim: 31,
  continentalGroups: [38, 59, 87, 115, 129, 143],
  continentalKnockout: [
    [171, 178],
    [199, 206],
    [227, 234],
    [283],
  ],
  intercontinental: [289, 292, 295, 298],
  clubWorldCup: [303, 306, 310, 314, 318],
} as const;

/** Copas com ida e volta a partir de uma fase (o resto em jogo único). */
const TWO_LEG_FROM: Partial<Record<string, string>> = { "cup:BRA": "R16" };
/** Semifinal da copa da liga inglesa em ida e volta, como na vida real. */
const TWO_LEG_ONLY: Partial<Record<string, readonly string[]>> = { "leaguecup:ENG": ["SF"] };

const ROUND_NAMES = ["F", "SF", "QF", "R16", "R32", "R64", "R128"];

function roundLabels(size: number): string[] {
  const rounds = Math.log2(size);
  return ROUND_NAMES.slice(0, rounds).reverse();
}

// ------------------------------------------------------------ estruturas

export interface SeasonBuild {
  readonly competitions: Record<string, CompetitionState>;
  readonly fixtures: Fixture[];
}

type StagePlan = KnockoutRound;

export function emptyRow(club: string): TableRow {
  return { club, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
}

function competitionKind(id: string): CompetitionKind {
  const prefix = id.split(":")[0] ?? id;
  return prefix as CompetitionKind;
}

function baseState(id: string, entrants: readonly string[], country: CountryCode | null, plan: StagePlan[]): CompetitionState {
  return {
    id,
    kind: competitionKind(id),
    country,
    entrants,
    table: null,
    groups: null,
    knockoutPlan: plan,
    alive: [...entrants],
    reached: Object.fromEntries(entrants.map((club) => [club, "entered"])),
    champion: null,
    runnerUp: null,
    done: false,
  };
}

// ------------------------------------------------------------------ ligas

/**
 * Turno e returno pelo método do círculo. Com número par de clubes, gera
 * exatamente `games` rodadas (cada clube joga `games` vezes, mando alternando
 * a cada volta). Com número ímpar, cada volta tem uma folga por rodada, e o
 * total vira o múltiplo de (n − 1) mais próximo de `games` (D55).
 */
export function leagueRounds(clubs: readonly string[], games: number): Array<Array<readonly [string, string]>> {
  const n = clubs.length;
  if (n < 2) return [];
  const odd = n % 2 === 1;
  const teams: Array<string | null> = odd ? [...clubs, null] : [...clubs];
  const size = teams.length;
  const perCycle = size - 1;
  const totalRounds = odd ? Math.max(1, Math.round(games / (n - 1))) * perCycle : games;
  const rounds: Array<Array<readonly [string, string]>> = [];
  const rotating = teams.slice(1);
  for (let round = 0; round < totalRounds; round += 1) {
    const cycle = Math.floor(round / perCycle);
    const shift = round % perCycle;
    const order = [teams[0] ?? null, ...rotating.slice(shift), ...rotating.slice(0, shift)];
    const pairs: Array<readonly [string, string]> = [];
    for (let index = 0; index < size / 2; index += 1) {
      const a = order[index];
      const b = order[size - 1 - index];
      if (!a || !b) continue;
      // Mando alterna pela rodada e inverte a cada volta.
      const flip = (index === 0 ? shift % 2 === 1 : index % 2 === 1) !== (cycle % 2 === 1);
      pairs.push(flip ? [b, a] : [a, b]);
    }
    rounds.push(pairs);
  }
  return rounds;
}

function leagueDays(rounds: number): number[] {
  const { firstRound, lastRound } = CALENDAR_DAYS;
  if (rounds <= 1) return [firstRound];
  return Array.from({ length: rounds }, (_, index) => firstRound + Math.round((index * (lastRound - firstRound)) / (rounds - 1)));
}

// ----------------------------------------------------------------- forças

export type Seeder = (club: string) => number;

function seedOrder(clubs: readonly string[], seed: Seeder): string[] {
  return [...clubs].sort((a, b) => seed(b) - seed(a) || a.localeCompare(b));
}

// ------------------------------------------------------------- temporada

export interface SeasonInput {
  readonly seed: string;
  readonly year: number;
  readonly clubs: Readonly<Record<string, CoachClub>>;
  readonly memory: PreviousSeason;
}

/** Monta as competições e os jogos já conhecidos da temporada. */
export function buildSeason(input: SeasonInput): SeasonBuild {
  const competitions: Record<string, CompetitionState> = {};
  const fixtures: Fixture[] = [];
  const seed: Seeder = (club) => input.clubs[club]?.strength ?? genericStrength(club);
  const busy = new Map<string, Set<number>>();
  const mark = (club: string, day: number) => {
    if (!busy.has(club)) busy.set(club, new Set());
    busy.get(club)?.add(day);
  };

  // Ligas.
  for (const league of LEAGUES) {
    const members = Object.values(input.clubs)
      .filter((club) => club.country === league.country && club.division === league.division)
      .map((club) => club.id)
      .sort();
    if (members.length < 2) continue;
    const id = `league:${league.id}`;
    const order = coachRng(input.seed, "fixtures", input.year, league.id).shuffle(members);
    const rounds = leagueRounds(order, league.games);
    const days = leagueDays(rounds.length);
    rounds.forEach((pairs, roundIndex) => {
      pairs.forEach(([home, away], index) => {
        const day = days[roundIndex] ?? CALENDAR_DAYS.lastRound;
        fixtures.push({
          id: `${id}|${roundIndex + 1}|${index}`,
          competition: id,
          kind: "league",
          round: String(roundIndex + 1),
          roundKind: "league",
          day,
          home,
          away,
          firstLeg: null,
          decisive: false,
          neutral: false,
          result: null,
        });
        mark(home, day);
        mark(away, day);
      });
    });
    competitions[id] = { ...baseState(id, members, league.country, []), table: members.map(emptyRow) };
  }

  const scheduled: Fixture[] = [];
  const add = (list: Fixture[]) => {
    for (const fixture of list) {
      scheduled.push(fixture);
      mark(fixture.home, fixture.day);
      mark(fixture.away, fixture.day);
    }
  };
  const context: DrawContext = { seed: input.seed, year: input.year, seeder: seed, busy };

  // Supercopas nacionais e continentais (campeões da temporada anterior).
  for (const country of PLAYABLE_COUNTRIES) {
    const id = `super:${country}`;
    if (!getCompetition(id)) continue;
    const first = leagueAt(country, 1);
    const table = first ? input.memory.tables[first.id] : undefined;
    const champion = table?.[0];
    if (!champion || !input.clubs[champion]) continue;
    const cupWinner = input.memory.cups[`cup:${country}`]?.winner;
    const opponent = cupWinner && cupWinner !== champion && input.clubs[cupWinner] ? cupWinner : table?.[1];
    if (!opponent || !input.clubs[opponent]) continue;
    competitions[id] = baseState(id, [champion, opponent], country, [{ label: "F", days: [DAYS.super], drawn: true, roundKind: "knockout" }]);
    add([finalFixture(id, champion, opponent, DAYS.super, context)]);
  }
  for (const confederation of CONFEDERATIONS) {
    const id = `contsuper:${confederation}`;
    if (!getCompetition(id)) continue;
    const primary = input.memory.continental[`cont1:${confederation}`]?.winner;
    const secondary = input.memory.continental[`cont2:${confederation}`]?.winner;
    if (!primary || !secondary || primary === secondary || !input.clubs[primary] || !input.clubs[secondary]) continue;
    competitions[id] = baseState(id, [primary, secondary], null, [{ label: "F", days: [DAYS.super + 2], drawn: true, roundKind: "knockout" }]);
    add([finalFixture(id, primary, secondary, DAYS.super + 2, context)]);
  }

  // Copas nacionais (todos os clubes do país) e copa da liga.
  for (const country of PLAYABLE_COUNTRIES) {
    for (const kind of ["cup", "leaguecup"] as const) {
      const id = `${kind}:${country}`;
      if (!getCompetition(id)) continue;
      const entrants = seedOrder(
        Object.values(input.clubs)
          .filter((club) => club.country === country)
          .map((club) => club.id),
        (club) => seed(club) + (input.clubs[club]?.division === 1 ? 20 : 0),
      );
      if (entrants.length < 2) continue;
      const size = nextPow2(entrants.length);
      const labels = roundLabels(size);
      const pool = kind === "cup" ? DAYS.cup : DAYS.leaguecup;
      const days = pool.slice(pool.length - labels.length);
      const plan: StagePlan[] = labels.map((label, index) => {
        const day = days[index] ?? pool[pool.length - 1] ?? 260;
        const twoLegs = isTwoLegged(id, label);
        return { label, days: twoLegs ? [day, day + 7] : [day], drawn: false, roundKind: "knockout" };
      });
      const state = baseState(id, entrants, country, plan);
      competitions[id] = state;
      add(drawKnockout(state, context, true));
    }
  }

  // Continentais.
  const entrants = continentalEntrants(toSeasonMemory(input.memory));
  for (const [id, list] of Object.entries(entrants)) {
    const valid = list.filter((club) => input.clubs[club]);
    if (valid.length < 2) continue;
    const offset = id.startsWith("cont1") ? 0 : 1;
    const state = continentalState(id, seedOrder(valid, seed), offset);
    competitions[id] = state;
    add(openContinental(state, context));
  }

  // Intercontinental: os campeões de fora da Europa desta temporada (definidos
  // no fim dos continentais) num chaveamento; a final é contra o campeão
  // europeu da temporada anterior, como no Craque.
  const europe = input.memory.continental["cont1:UEFA"]?.winner;
  if (getCompetition("intercontinental") && europe && input.clubs[europe]) {
    const plan: StagePlan[] = ["QF", "SF", "F", "FF"].map((label, index) => ({
      label,
      days: [DAYS.intercontinental[index] ?? 298],
      drawn: false,
      roundKind: "knockout",
    }));
    competitions.intercontinental = { ...baseState("intercontinental", [], null, plan), alive: [] };
  }

  // Mundial de Clubes nos anos do calendário do Craque, nas férias.
  if (getCompetition("clubworldcup") && input.year % 4 === CALENDAR.clubWorldCup) {
    const list = clubWorldCupEntrants(input, seed);
    if (list.length >= 2) {
      const size = 16;
      const labels = roundLabels(size);
      const plan: StagePlan[] = [
        { label: "P1", days: [DAYS.clubWorldCup[0]], drawn: false, roundKind: "prelim" },
        ...labels.map((label, index) => ({ label, days: [DAYS.clubWorldCup[index + 1] ?? 318], drawn: false, roundKind: "knockout" as const })),
      ];
      const state = baseState("clubworldcup", seedOrder(list, seed), null, plan);
      competitions.clubworldcup = state;
      add(drawKnockout(state, context, true));
    }
  }

  fixtures.push(...scheduled);
  fixtures.sort((a, b) => a.day - b.day || a.id.localeCompare(b.id));
  return { competitions, fixtures };
}

function isTwoLegged(competition: string, label: string): boolean {
  const only = TWO_LEG_ONLY[competition];
  if (only) return only.includes(label);
  const from = TWO_LEG_FROM[competition];
  if (!from) return false;
  const order = ["R128", "R64", "R32", "R16", "QF", "SF", "F"];
  return order.indexOf(label) >= order.indexOf(from);
}

function genericStrength(club: string): number {
  return GENERIC_CHAMPIONS.find((entry) => entry.id === club)?.strength ?? 60;
}

function clubWorldCupEntrants(input: SeasonInput, seed: Seeder): string[] {
  const entrants: string[] = [];
  for (const confederation of CONFEDERATIONS) {
    const quota = CLUB_WORLD_CUP_QUOTA[confederation] ?? 0;
    if (quota === 0) continue;
    const chosen: string[] = [];
    for (const id of input.memory.primaryChampions[confederation] ?? []) {
      if (chosen.length < quota && !chosen.includes(id) && input.clubs[id]) chosen.push(id);
    }
    const strongest = Object.values(input.clubs)
      .filter((club) => getCountry(club.country)?.confederation === confederation)
      .map((club) => club.id)
      .sort((a, b) => seed(b) - seed(a) || a.localeCompare(b));
    for (const id of strongest) {
      if (chosen.length >= quota) break;
      if (!chosen.includes(id)) chosen.push(id);
    }
    entrants.push(...chosen);
  }
  return entrants;
}

/** Formato do continental pelo número de classificados (D55). */
function continentalState(id: string, entrants: string[], offset: number): CompetitionState {
  const n = entrants.length;
  const plan: StagePlan[] = [];
  const knockout = DAYS.continentalKnockout;
  if (n >= 16) {
    const target = n >= 32 ? 32 : 16;
    if (n > target) plan.push({ label: "P1", days: [DAYS.continentalPrelim + offset], drawn: false, roundKind: "prelim" });
    plan.push({ label: "G", days: DAYS.continentalGroups.map((day) => day + offset), drawn: false, roundKind: "group" });
    const labels = target === 32 ? ["R16", "QF", "SF", "F"] : ["QF", "SF", "F"];
    const start = knockout.length - labels.length;
    labels.forEach((label, index) => {
      const days = knockout[start + index] ?? [283];
      plan.push({ label, days: days.map((day) => day + offset), drawn: false, roundKind: "knockout" });
    });
  } else {
    const size = nextPow2(n);
    const labels = roundLabels(size);
    const start = knockout.length - labels.length;
    labels.forEach((label, index) => {
      const days = knockout[Math.max(0, start + index)] ?? [283];
      plan.push({ label, days: days.map((day) => day + offset), drawn: false, roundKind: "knockout" });
    });
  }
  return baseState(id, entrants, null, plan);
}

// ---------------------------------------------------------------- sorteios

export interface DrawContext {
  readonly seed: string;
  readonly year: number;
  readonly seeder: Seeder;
  readonly busy: Map<string, Set<number>>;
}

/** Desloca um jogo de copa se algum dos clubes já joga naquele dia. */
function freeDay(context: DrawContext, home: string, away: string, day: number): number {
  for (const delta of [0, 1, -1, 2, -2, 3]) {
    const candidate = day + delta;
    if (!context.busy.get(home)?.has(candidate) && !context.busy.get(away)?.has(candidate)) return candidate;
  }
  return day;
}

function finalFixture(competition: string, home: string, away: string, day: number, context: DrawContext): Fixture {
  return {
    id: `${competition}|F|0|1`,
    competition,
    kind: competitionKind(competition),
    round: "F",
    roundKind: "knockout",
    day: freeDay(context, home, away, day),
    home,
    away,
    firstLeg: null,
    decisive: true,
    neutral: true,
    result: null,
  };
}

function tieFixtures(state: CompetitionState, stage: KnockoutRound, index: number, a: string, b: string, context: DrawContext): Fixture[] {
  const [first, second] = stage.days;
  const kind = state.kind;
  const finalStage = stage.label === "F" || stage.label === "FF";
  if (second === undefined) {
    const day = freeDay(context, a, b, first ?? 0);
    return [
      {
        id: `${state.id}|${stage.label}|${index}|1`,
        competition: state.id,
        kind,
        round: stage.label,
        roundKind: "knockout",
        day,
        home: a,
        away: b,
        firstLeg: null,
        decisive: true,
        neutral: finalStage || kind === "clubworldcup" || kind === "intercontinental",
        result: null,
      },
    ];
  }
  const legOne = `${state.id}|${stage.label}|${index}|1`;
  // O mais forte (a) decide em casa.
  return [
    {
      id: legOne,
      competition: state.id,
      kind,
      round: stage.label,
      roundKind: "knockout",
      day: freeDay(context, b, a, first ?? 0),
      home: b,
      away: a,
      firstLeg: null,
      decisive: false,
      neutral: false,
      result: null,
    },
    {
      id: `${state.id}|${stage.label}|${index}|2`,
      competition: state.id,
      kind,
      round: stage.label,
      roundKind: "knockout",
      day: freeDay(context, a, b, second),
      home: a,
      away: b,
      firstLeg: legOne,
      decisive: true,
      neutral: false,
      result: null,
    },
  ];
}

/**
 * Sorteia a próxima fase de mata-mata com quem está vivo. Na primeira fase de
 * uma copa, os cabeças de chave ganham folga até a potência de 2; nas
 * seguintes, o sorteio é livre (semeado pela temporada e pela fase).
 */
export function drawKnockout(state: CompetitionState, context: DrawContext, first: boolean): Fixture[] {
  const stageIndex = state.knockoutPlan.findIndex((stage) => !stage.drawn);
  const stage = state.knockoutPlan[stageIndex];
  if (!stage) return [];
  stage.drawn = true;
  if (stage.roundKind === "group") return drawGroups(state, stage, context);
  const alive = seedOrder(state.alive, context.seeder);
  let playing: string[];
  if (stage.roundKind === "prelim") {
    const target = state.kind === "clubworldcup" ? 16 : alive.length >= 32 ? 32 : 16;
    const extra = Math.max(0, alive.length - target);
    playing = alive.slice(alive.length - extra * 2);
  } else if (first) {
    const size = nextPow2(alive.length);
    const byes = size - alive.length;
    playing = alive.slice(byes);
  } else {
    playing = alive;
  }
  const rng = coachRng(context.seed, "draw", context.year, state.id, stage.label);
  const pairs: Array<[string, string]> = [];
  if (first || stage.roundKind === "prelim") {
    // Cabeça contra o mais fraco que sobrou.
    for (let index = 0; index < playing.length / 2; index += 1) {
      const a = playing[index];
      const b = playing[playing.length - 1 - index];
      if (a && b) pairs.push([a, b]);
    }
  } else {
    const shuffled = rng.shuffle(playing);
    for (let index = 0; index + 1 < shuffled.length; index += 2) {
      const a = shuffled[index] as string;
      const b = shuffled[index + 1] as string;
      pairs.push(context.seeder(a) >= context.seeder(b) ? [a, b] : [b, a]);
    }
  }
  for (const [a, b] of pairs) {
    state.reached[a] = stage.label;
    state.reached[b] = stage.label;
  }
  return pairs.flatMap(([a, b], index) => tieFixtures(state, stage, index, a, b, context));
}

const GROUP_ROUNDS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [
    [0, 3],
    [1, 2],
  ],
  [
    [2, 0],
    [3, 1],
  ],
  [
    [0, 1],
    [2, 3],
  ],
  [
    [3, 0],
    [2, 1],
  ],
  [
    [0, 2],
    [1, 3],
  ],
  [
    [1, 0],
    [3, 2],
  ],
];

function drawGroups(state: CompetitionState, stage: KnockoutRound, context: DrawContext): Fixture[] {
  const alive = seedOrder(state.alive, context.seeder);
  const groupCount = Math.max(1, Math.floor(alive.length / 4));
  const rng = coachRng(context.seed, "draw", context.year, state.id, "groups");
  const pots = [0, 1, 2, 3].map((pot) => rng.shuffle(alive.slice(pot * groupCount, (pot + 1) * groupCount)));
  const groups = Array.from({ length: groupCount }, (_, index) => ({
    name: String.fromCharCode(65 + index),
    clubs: pots.map((pot) => pot[index]).filter((club): club is string => Boolean(club)),
    rows: [] as TableRow[],
  }));
  for (const group of groups) group.rows.push(...group.clubs.map(emptyRow));
  (state as { groups: CompetitionState["groups"] }).groups = groups;
  const fixtures: Fixture[] = [];
  for (const group of groups) {
    for (const club of group.clubs) state.reached[club] = "G";
    GROUP_ROUNDS.forEach((pairs, round) => {
      const day = stage.days[round] ?? stage.days[stage.days.length - 1] ?? 0;
      pairs.forEach(([a, b], index) => {
        const home = group.clubs[a];
        const away = group.clubs[b];
        if (!home || !away) return;
        fixtures.push({
          id: `${state.id}|G${group.name}|${round + 1}|${index}`,
          competition: state.id,
          kind: state.kind,
          round: `G${round + 1}`,
          roundKind: "group",
          day: freeDay(context, home, away, day),
          home,
          away,
          firstLeg: null,
          decisive: false,
          neutral: false,
          result: null,
        });
      });
    });
  }
  return fixtures;
}

function openContinental(state: CompetitionState, context: DrawContext): Fixture[] {
  return drawKnockout(state, context, state.knockoutPlan[0]?.roundKind === "knockout");
}

// ------------------------------------------------------------ resultados

export function applyToTable(rows: TableRow[], home: string, away: string, goalsHome: number, goalsAway: number): void {
  const homeRow = rows.find((row) => row.club === home);
  const awayRow = rows.find((row) => row.club === away);
  if (!homeRow || !awayRow) return;
  homeRow.played += 1;
  awayRow.played += 1;
  homeRow.goalsFor += goalsHome;
  homeRow.goalsAgainst += goalsAway;
  awayRow.goalsFor += goalsAway;
  awayRow.goalsAgainst += goalsHome;
  if (goalsHome > goalsAway) {
    homeRow.won += 1;
    homeRow.points += 3;
    awayRow.lost += 1;
  } else if (goalsHome < goalsAway) {
    awayRow.won += 1;
    awayRow.points += 3;
    homeRow.lost += 1;
  } else {
    homeRow.drawn += 1;
    awayRow.drawn += 1;
    homeRow.points += 1;
    awayRow.points += 1;
  }
}

/** Classificação: pontos, saldo, gols pró, vitórias e, por fim, a força (sorteio estável). */
export function sortTable(rows: readonly TableRow[], seeder: Seeder): TableRow[] {
  return [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
      b.goalsFor - a.goalsFor ||
      b.won - a.won ||
      seeder(b.club) - seeder(a.club) ||
      a.club.localeCompare(b.club),
  );
}

/**
 * Depois de cada dia: fecha fases terminadas e sorteia as seguintes. Devolve
 * os jogos novos. O Intercontinental abre quando os continentais acabam.
 */
export function advanceCompetitions(
  competitions: Record<string, CompetitionState>,
  byCompetition: ReadonlyMap<string, readonly Fixture[]>,
  touched: ReadonlySet<string> | null,
  context: DrawContext,
  europeChampion: string | null,
): Fixture[] {
  const created: Fixture[] = [];
  for (const state of Object.values(competitions)) {
    if (state.done || state.kind === "league") continue;
    if (touched && !touched.has(state.id) && state.kind !== "intercontinental") continue;
    const current = state.knockoutPlan.filter((stage) => stage.drawn).at(-1);
    if (!current) {
      if (state.kind === "intercontinental") created.push(...openIntercontinental(state, competitions, context));
      continue;
    }
    const own = byCompetition.get(state.id) ?? [];
    const stageFixtures = own.filter((fixture) =>
      current.roundKind === "group" ? fixture.roundKind === "group" : fixture.round === current.label,
    );
    if (stageFixtures.length === 0 || stageFixtures.some((fixture) => !fixture.result)) continue;
    created.push(...closeStage(state, current, stageFixtures, own, context, europeChampion));
  }
  return created;
}

function openIntercontinental(
  state: CompetitionState,
  competitions: Record<string, CompetitionState>,
  context: DrawContext,
): Fixture[] {
  const sources = ["cont1:CONMEBOL", "cont1:CONCACAF"];
  if (sources.some((id) => competitions[id] && !competitions[id]?.done)) return [];
  const champions = sources.map((id) => competitions[id]?.champion).filter((club): club is string => Boolean(club));
  const entrants = [...champions, ...GENERIC_CHAMPIONS.map((entry) => entry.id)];
  state.alive = entrants;
  for (const club of entrants) state.reached[club] = "entered";
  (state as { entrants: readonly string[] }).entrants = entrants;
  return drawKnockout(state, context, true);
}

function winnerOf(fixture: Fixture): string | null {
  return fixture.result?.winner ?? null;
}

function closeStage(
  state: CompetitionState,
  stage: KnockoutRound,
  stageFixtures: readonly Fixture[],
  all: readonly Fixture[],
  context: DrawContext,
  europeChampion: string | null,
): Fixture[] {
  if (stage.roundKind === "group") {
    const qualified: string[] = [];
    for (const group of state.groups ?? []) {
      const sorted = sortTable(group.rows, context.seeder);
      qualified.push(...sorted.slice(0, 2).map((row) => row.club));
    }
    state.alive = qualified;
  } else {
    const winners: string[] = [];
    const losers: string[] = [];
    for (const fixture of stageFixtures) {
      if (!fixture.decisive) continue;
      const winner = winnerOf(fixture);
      if (!winner) continue;
      winners.push(winner);
      losers.push(winner === fixture.home ? fixture.away : fixture.home);
    }
    // Quem teve folga na primeira fase segue vivo.
    const playedThisStage = new Set(stageFixtures.flatMap((fixture) => [fixture.home, fixture.away]));
    const byes = state.alive.filter((club) => !playedThisStage.has(club));
    state.alive = [...byes, ...winners];
    const isLast = state.knockoutPlan.every((plan) => plan.drawn) && (stage.label === "F" || stage.label === "FF");
    if (state.kind === "intercontinental" && stage.label === "F") {
      // Vencedor do chaveamento enfrenta o campeão europeu na final.
      const finalist = winners[0];
      const finalStage = state.knockoutPlan.find((plan) => plan.label === "FF");
      if (finalist && europeChampion && finalStage && !finalStage.drawn) {
        finalStage.drawn = true;
        state.reached[finalist] = "FF";
        state.reached[europeChampion] = "FF";
        state.alive = [europeChampion, finalist];
        return tieFixtures(state, finalStage, 0, europeChampion, finalist, context);
      }
    }
    if (isLast || state.alive.length <= 1) {
      const champion = winners[0] ?? state.alive[0] ?? null;
      state.champion = champion;
      state.runnerUp = losers[0] ?? null;
      if (champion) state.reached[champion] = "champion";
      state.done = true;
      for (const stagePlan of state.knockoutPlan) stagePlan.drawn = true;
      return [];
    }
  }
  void all;
  return drawKnockout(state, context, false);
}

/** Fecha as ligas: tabela final e campeão. */
export function finishLeagues(competitions: Record<string, CompetitionState>, seeder: Seeder): void {
  for (const state of Object.values(competitions)) {
    if (state.kind !== "league" || !state.table) continue;
    const sorted = sortTable(state.table, seeder);
    state.table.splice(0, state.table.length, ...sorted);
    state.champion = sorted[0]?.club ?? null;
    state.runnerUp = sorted[1]?.club ?? null;
    state.done = true;
  }
}

/** Memória da temporada no formato do Craque, para a classificação continental. */
export function toSeasonMemory(previous: PreviousSeason): SeasonMemory {
  return {
    year: previous.year,
    tables: previous.tables,
    cups: previous.cups,
    continental: previous.continental,
    primaryChampions: previous.primaryChampions as SeasonMemory["primaryChampions"],
  };
}

/** Constrói a memória desta temporada para a próxima (tabelas, copas, continentais). */
export function seasonMemory(
  year: number,
  competitions: Readonly<Record<string, CompetitionState>>,
  previous: PreviousSeason,
): PreviousSeason {
  const tables: Record<string, string[]> = {};
  const cups: Record<string, { winner: string; runnerUp: string }> = {};
  const continental: Record<string, { winner: string; runnerUp: string }> = {};
  for (const state of Object.values(competitions)) {
    if (state.kind === "league" && state.table) tables[state.id.slice("league:".length)] = state.table.map((row) => row.club);
    if ((state.kind === "cup" || state.kind === "leaguecup") && state.champion) {
      cups[state.id] = { winner: state.champion, runnerUp: state.runnerUp ?? state.champion };
    }
    if ((state.kind === "cont1" || state.kind === "cont2" || state.kind === "cont3") && state.champion) {
      continental[state.id] = { winner: state.champion, runnerUp: state.runnerUp ?? state.champion };
    }
  }
  const primaryChampions: Record<string, string[]> = {};
  for (const confederation of CONFEDERATIONS) {
    const winner = continental[`cont1:${confederation}`]?.winner;
    const before = previous.primaryChampions[confederation as Confederation] ?? [];
    primaryChampions[confederation] = winner ? [winner, ...before].slice(0, 4) : [...before].slice(0, 4);
  }
  return { year, tables, cups, continental, primaryChampions };
}

export const COMPETITION_DAYS = DAYS;
