import { playerClubImpact } from "./tuning";
import { performanceSpots, rankedWorldCupClubs, rememberContinentalRanking } from "./qualification";
import { clubTrophyProgress } from "./clubProgress";
import {
  CLUBS,
  CONFEDERATIONS,
  type Confederation,
  type Country,
  type CountryCode,
  type Division,
  getCompetition,
  getCountry,
  type League,
  leagueAt,
  PLAYABLE_COUNTRIES,
} from "@craque/world";
import { clamp } from "../math";
import { titleKeepChance } from "../records/pressure";
import { type Rng, stream } from "../rng";
import {
  BASE_DIVISION,
  BASE_STRENGTH,
  CLUB_CONFEDERATION,
  CLUB_COUNT,
  clubIndex,
  CONFEDERATION_CLUBS,
  COUNTRY_CLUBS,
  countryLeagues,
  groupsFormat,
  hasClub,
  KNOCKOUT,
  NATIONS_BY_CONFEDERATION,
  WORLD_CUP_FORMAT,
} from "./model";
import {
  CALENDAR,
  CLUB_DRIFT,
  CLUB_IMPACT,
  CLUB_WORLD_CUP_QUOTA,
  GENERIC_CHAMPIONS,
  genericClubStrength,
  LEAGUE,
  NATIONAL_IMPACT,
  NATIONS_CUP_SIZE,
  NOISE,
  PRIMARY_HISTORY,
  QUALIFICATION,
  SINGLE_MATCH_SCALE,
  WARM_UP_SEASONS,
  WORLD_CUP_HOSTS,
  WORLD_CUP_PLAYOFFS,
  WORLD_CUP_QUOTA,
} from "./tuning";
import type {
  BoostGroup,
  IntercontinentalResult,
  KnockoutFormat,
  KnockoutResult,
  LeagueResult,
  MatchResult,
  PlayerImpact,
  Podium,
  SeasonMemory,
  SeasonResults,
  TableRow,
  WorldState,
} from "./types";

/**
 * Uma temporada do mundo inteiro (GDD 8), na ordem do GDD 11.1:
 * supercopas, ligas, copas, continentais, Intercontinental, Mundial de
 * Clubes, seleções e, por fim, acesso, rebaixamento e a nova força dos clubes.
 *
 * Função pura: recebe o estado e devolve resultados e o estado seguinte.
 * Cada torneio sorteia no próprio fluxo, então mudar um não mexe nos outros.
 */

interface Context {
  readonly seed: string;
  readonly year: number;
  readonly world: WorldState;
  readonly impact: PlayerImpact | null;
  readonly impactIndex: number;
}

function rngFor(context: Context, ...parts: ReadonlyArray<string | number>): Rng {
  return stream(context.seed, "world", context.year, ...parts);
}

/**
 * Força de um clube na temporada, com o jogador somando ao dele (GDD 8.2) e a
 * força extra de evento no tipo de torneio, se houver.
 */
function clubEffective(context: Context, index: number, group?: BoostGroup): number {
  const base = context.world.strength[index] ?? 0;
  const { impact } = context;
  if (index !== context.impactIndex || !impact) return base;
  const boost = group ? (impact.boosts?.[group] ?? 0) : 0;
  return base + boost + playerClubImpact(base, impact.ovr, impact.participation);
}

/** O grupo de força extra de cada competição pelo prefixo do id. */
function boostGroupOf(competition: string): BoostGroup | undefined {
  if (competition.startsWith("league:")) return "league";
  if (competition.startsWith("cup:") || competition.startsWith("leaguecup:")) return "cup";
  if (/^cont[123]:/.test(competition)) return "continental";
  return undefined;
}

/** Força de quem disputa um torneio de clubes: clube dos dados ou campeão genérico. */
function entrantEffective(context: Context, id: string, group?: BoostGroup): number {
  const generic = genericClubStrength(id);
  if (generic !== null) return generic;
  return clubEffective(context, clubIndex(id), group);
}

function nationEffective(context: Context, country: Country): number {
  const { impact } = context;
  if (!impact || impact.nationality !== country.code || !impact.nationalParticipation) return country.strength;
  return (
    country.strength +
    NATIONAL_IMPACT.kappa *
      impact.nationalParticipation *
      clamp(impact.ovr - country.strength, NATIONAL_IMPACT.below, NATIONAL_IMPACT.above)
  );
}

/** Ordena por nota (força + ruído). Empate exato fica com a ordem de entrada. */
function rankByNote<T>(entries: readonly T[], strengthOf: (entry: T) => number, noise: number, rng: Rng): T[] {
  return entries
    .map((entry, position) => ({ entry, position, note: strengthOf(entry) + rng.normal(0, noise) }))
    .sort((a, b) => b.note - a.note || a.position - b.position)
    .map((item) => item.entry);
}

function singleMatch(competition: string, home: string, away: string, strengthOf: (id: string) => number, rng: Rng): MatchResult {
  const chance = 1 / (1 + Math.exp(-(strengthOf(home) - strengthOf(away)) / SINGLE_MATCH_SCALE));
  return { competition, home, away, winner: rng.chance(chance) ? home : away };
}

function idOf(index: number): string {
  return CLUBS[index]?.id ?? "";
}

// ------------------------------------------------------------------ ligas

function leagueMembers(context: Context, league: League): number[] {
  return (COUNTRY_CLUBS.get(league.country) ?? []).filter(
    (index) => context.world.division[index] === league.division,
  );
}

/** Tabela (GDD 8.3): nota, ordem, pontos por jogo e pontos que nunca crescem com a posição. */
function simulateLeague(context: Context, league: League): LeagueResult {
  const rng = rngFor(context, "league", league.id);
  const members = leagueMembers(context, league);
  const notes = members.map((index, position) => ({
    index,
    position,
    note: clubEffective(context, index, "league") + rng.normal(0, LEAGUE.noise),
  }));
  notes.sort((a, b) => b.note - a.note || a.position - b.position);
  const mean = notes.reduce((total, item) => total + item.note, 0) / Math.max(1, notes.length);

  const rows: TableRow[] = [];
  let previous = Number.POSITIVE_INFINITY;
  notes.forEach((item, position) => {
    const perGame = clamp(LEAGUE.pointsBase + LEAGUE.pointsPerNote * (item.note - mean), LEAGUE.pointsMin, LEAGUE.pointsMax);
    let points = Math.round(perGame * league.games);
    if (points >= previous) points = previous > 0 ? previous - 1 : previous;
    previous = points;
    rows.push({ club: idOf(item.index), position: position + 1, points });
  });

  return {
    league: league.id,
    competition: `league:${league.id}`,
    country: league.country,
    division: league.division,
    games: league.games,
    rows,
  };
}

// ------------------------------------------------------------------ copas

function knockout(
  context: Context,
  competition: string,
  entrants: readonly string[],
  noise: number,
  format: KnockoutFormat,
): KnockoutResult {
  const rng = rngFor(context, "knockout", competition);
  const group = boostGroupOf(competition);
  return { competition, order: rankByNote(entrants, (id) => entrantEffective(context, id, group), noise, rng), format };
}

/**
 * Uma final decidida por evento ("a dor na semana da final", "o pênalti
 * decisivo"). O evento conta que há uma final, então há: entre as copas e
 * continentais em que o clube chegou à final, vale a mais importante; se ele
 * não chegou a nenhuma, ele chega à final do torneio mais importante que
 * disputou. "win" faz dele o campeão; "lose", o vice.
 */
function decideFinal(
  context: Context,
  cups: Record<string, KnockoutResult>,
  continental: Record<string, KnockoutResult>,
): void {
  const { impact } = context;
  if (!impact?.final) return;
  const club = impact.club;
  const weight = (competition: string) =>
    competition.startsWith("cont1:") ? 4 : competition.startsWith("cont2:") ? 3 : competition.startsWith("cont3:") ? 2 : 1;
  const entered = [...Object.entries(continental), ...Object.entries(cups)]
    .filter(([, result]) => result.order.includes(club))
    .sort((a, b) => weight(b[0]) - weight(a[0]));
  const finals = entered.filter(([, result]) => result.order.indexOf(club) <= 1);
  const target = finals[0] ?? entered[0];
  if (!target) return;
  const [competition, result] = target;
  const others = result.order.filter((id) => id !== club);
  const [champion, ...rest] = others;
  if (!champion) return;
  // Campeão: ele no topo e o adversário da final em segundo. Vice: o adversário no topo.
  const order = impact.final === "win" ? [club, champion, ...rest] : [champion, club, ...rest];
  if (competition in continental) continental[competition] = { ...result, order };
  else cups[competition] = { ...result, order };
}

function simulateCups(context: Context): Record<string, KnockoutResult> {
  const cups: Record<string, KnockoutResult> = {};
  for (const country of PLAYABLE_COUNTRIES) {
    const entrants = (COUNTRY_CLUBS.get(country) ?? []).map(idOf);
    if (getCompetition(`cup:${country}`)) {
      cups[`cup:${country}`] = knockout(context, `cup:${country}`, entrants, NOISE.cup, KNOCKOUT);
    }
    if (getCompetition(`leaguecup:${country}`)) {
      const leagueEntrants = country === "CHI" ? entrants.filter((id) => context.world.division[clubIndex(id)] === 1) : entrants;
      cups[`leaguecup:${country}`] = knockout(context, `leaguecup:${country}`, leagueEntrants, NOISE.leagueCup, KNOCKOUT);
    }
  }
  return cups;
}

// -------------------------------------------------------------- supercopas

/** Campeão da liga contra o da copa do ano anterior; se for o mesmo, entra o vice (GDD 8.6). */
function simulateSuperCups(context: Context): Record<string, MatchResult> {
  const { memory } = context.world;
  const strengthOf = (id: string) => entrantEffective(context, id);
  const results: Record<string, MatchResult> = {};

  for (const country of PLAYABLE_COUNTRIES) {
    const competition = `super:${country}`;
    if (!getCompetition(competition)) continue;
    const first = leagueAt(country, 1);
    const table = first ? memory.tables[first.id] : undefined;
    const champion = table?.[0];
    if (!champion) continue;
    const cupWinner = memory.cups[`cup:${country}`]?.winner;
    const opponent = cupWinner && cupWinner !== champion ? cupWinner : table[1];
    if (!opponent) continue;
    results[competition] = singleMatch(competition, champion, opponent, strengthOf, rngFor(context, "super", competition));
  }

  for (const confederation of CONFEDERATIONS) {
    const competition = `contsuper:${confederation}`;
    if (!getCompetition(competition)) continue;
    const primary = memory.continental[`cont1:${confederation}`]?.winner;
    const secondary = memory.continental[`cont2:${confederation}`]?.winner;
    if (!primary || !secondary || primary === secondary) continue;
    results[competition] = singleMatch(competition, primary, secondary, strengthOf, rngFor(context, "super", competition));
  }
  return results;
}

// ------------------------------------------------------------ continentais

/**
 * Quem joga cada torneio continental na temporada (GDD 8.7), pela tabela e
 * pela copa do ano anterior. Vaga repetida desce para o próximo da tabela; o
 * campeão da primária volta a ela mesmo sem vaga.
 */
export function continentalEntrants(memory: SeasonMemory, elite?: (club: string) => boolean, seed="qualifications"): Record<string, string[]> {
  const lists: Record<string, string[]> = {};
  const holders = new Map<string, string>();
  for (const confederation of CONFEDERATIONS) {
    if (confederation === "UEFA" || confederation === "CONMEBOL") {
      for (const tier of ["cont1", "cont2"]) {
        const winner = memory.continental[`${tier}:${confederation}`]?.winner;
        if (winner && hasClub(winner)) holders.set(winner, `cont1:${confederation}`);
      }
    }
    if (confederation === "UEFA") {
      const winner = memory.continental["cont3:UEFA"]?.winner;
      if (winner && hasClub(winner) && !holders.has(winner)) holders.set(winner, "cont2:UEFA");
    }
  }
  const add = (competition: string, id: string) => {
    if (!getCompetition(competition)) return;
    const list = lists[competition] ??= [];
    if (!list.includes(id)) list.push(id);
  };

  for (const country of PLAYABLE_COUNTRIES) {
    const rule = QUALIFICATION[country];
    const first = leagueAt(country, 1);
    const confederation = getCountry(country)?.confederation;
    if (!rule || !first || !confederation) continue;
    const table = memory.tables[first.id] ?? [];
    const cupWinner = memory.cups[`cup:${country}`]?.winner;
    const cupRunner = memory.cups[`cup:${country}`]?.runnerUp;
    const taken = new Set<string>();
    // Na CONMEBOL os campeões continentais são vagas adicionais; não usam
    // as indicações nacionais nem podem aparecer também na Sul-Americana.
    if (confederation === "CONMEBOL") for (const id of holders.keys()) taken.add(id);
    let cursor = 0;

    const nextFromTable = (): string | undefined => {
      while (cursor < table.length && taken.has(table[cursor] ?? "")) cursor += 1;
      const id = table[cursor];
      cursor += 1;
      return id;
    };
    const take = (count: number, competition: string) => {
      for (let slot = 0; slot < count; slot += 1) {
        const id = nextFromTable();
        if (!id) return;
        taken.add(id);
        add(competition, id);
      }
    };
    const allowed = (id: string | undefined): id is string => Boolean(id && !taken.has(id) && (!rule.cupEliteOnly || (elite ? elite(id) : table.includes(id))));
    const takeCup = (competition: string, preferred = cupWinner, fallback?: string) => {
      const id = allowed(preferred) ? preferred : allowed(fallback) ? fallback : nextFromTable();
      if (!id) return;
      taken.add(id);
      add(competition, id);
    };

    take(rule.primary, `cont1:${confederation}`);
    for (const [id, destination] of holders) {
      if (destination === `cont1:${confederation}`) taken.add(id);
    }
    if (confederation === "UEFA" && memory.performanceSpots?.includes(country)) take(1,`cont1:${confederation}`);
    if (rule.leagueCup === "primary") takeCup(`cont1:${confederation}`,memory.cups[`leaguecup:${country}`]?.winner,rule.leagueCupRunnerFallback?memory.cups[`leaguecup:${country}`]?.runnerUp:undefined);
    let playoffLoser:string|undefined;
    if(rule.cupPlayoff) {
      const leagueCandidate=nextFromTable();
      if(leagueCandidate)taken.add(leagueCandidate);
      const cupCandidate=allowed(cupWinner)?cupWinner:allowed(cupRunner)?cupRunner:nextFromTable();
      if(leagueCandidate&&cupCandidate) {
        const result=singleMatch(`qualify:${country}`,leagueCandidate,cupCandidate,(id)=>BASE_STRENGTH[clubIndex(id)] ?? 70,stream(seed,"world","qualification",memory.year,country));
        add(`cont1:${confederation}`,result.winner);taken.add(cupCandidate);
        playoffLoser=result.winner===leagueCandidate?cupCandidate:leagueCandidate;
      } else if(leagueCandidate) add(`cont1:${confederation}`,leagueCandidate);
    } else if (rule.cup === "primary") {
      takeCup(`cont1:${confederation}`, cupWinner, rule.cupRunnerFallback ? cupRunner : undefined);
      if (rule.cupSlots === 2) takeCup(`cont1:${confederation}`, cupRunner);
    }
    // Conference só promove à Europa quando o campeão não foi para a Champions.
    for (const [id, destination] of holders) if (destination === `cont2:${confederation}` && !taken.has(id)) taken.add(id);
    take(rule.secondary, `cont2:${confederation}`);
    if (rule.cup === "secondary") takeCup(`cont2:${confederation}`);
    if (rule.cupRunnerSecondary) takeCup(`cont2:${confederation}`, cupRunner);
    if(playoffLoser)add(`cont2:${confederation}`,playoffLoser);
    take(rule.tertiary, `cont3:${confederation}`);
    if (rule.leagueCup === "tertiary") takeCup(`cont3:${confederation}`, memory.cups[`leaguecup:${country}`]?.winner);
  }

  for (const [holder, destination] of holders) {
    if (destination === "cont2:UEFA" && lists["cont1:UEFA"]?.includes(holder)) continue;
    add(destination, holder);
    for (const [competition, list] of Object.entries(lists)) {
      if (competition !== destination) lists[competition] = list.filter((id) => id !== holder);
    }
  }
  return lists;
}

/** Continentais com fase de grupos de 32 e preliminares para quem passar disso. */
const CONTINENTAL_FORMAT = groupsFormat(32);

function simulateContinental(context: Context): Record<string, KnockoutResult> {
  const results: Record<string, KnockoutResult> = {};
  const entrants = continentalEntrants(context.world.memory,(id)=>context.world.division[clubIndex(id)]===1,context.seed);
  for (const [competition, list] of Object.entries(entrants)) {
    if (list.length < 2) continue;
    results[competition] = knockout(context, competition, list, NOISE.continental, CONTINENTAL_FORMAT);
  }
  return results;
}

/**
 * Copa Intercontinental (GDD 8.10): o campeão europeu da temporada contra
 * quem vencer o chaveamento dos campeões de fora da Europa deste ano.
 */
function simulateIntercontinental(
  context: Context,
  continental: Readonly<Record<string, KnockoutResult>>,
): IntercontinentalResult | null {
  const europe = continental["cont1:UEFA"]?.order[0];
  if (!europe || !hasClub(europe)) return null;
  const clubs = (["CONMEBOL", "CONCACAF"] as const).flatMap((confederation) => {
    const winner = continental[`cont1:${confederation}`]?.order[0];
    return winner ? [winner] : [];
  });
  const entrants = [...clubs, ...GENERIC_CHAMPIONS.map((entry) => entry.id)];
  const strengthOf = (id: string) => entrantEffective(context, id);
  const bracket = rankByNote(entrants, strengthOf, NOISE.intercontinental, rngFor(context, "intercontinental", "bracket"));
  const finalist = bracket[0];
  if (!finalist) return null;
  return {
    competition: "intercontinental",
    bracket,
    final: singleMatch("intercontinental", europe, finalist, strengthOf, rngFor(context, "intercontinental", "final")),
  };
}

/**
 * Mundial de Clubes (GDD 8.11): campeões das primárias das quatro temporadas
 * anteriores, completados pelo ranking das campanhas nesse mesmo período.
 */
function simulateClubWorldCup(context: Context): KnockoutResult | null {
  if (context.year % 4 !== CALENDAR.clubWorldCup || !getCompetition("clubworldcup")) return null;
  const entrants: string[] = [];
  for (const confederation of CONFEDERATIONS) {
    const quota = CLUB_WORLD_CUP_QUOTA[confederation] ?? 0;
    if (quota === 0) continue;
    const chosen = rankedWorldCupClubs(context.world.memory.primaryChampions[confederation] ?? [], context.world.memory.primaryRanking ?? [], quota,
      id => { const index = hasClub(id) ? clubIndex(id) : -1; const club = CLUBS[index]; return club && getCountry(club.country)?.confederation === confederation ? club.country : undefined; });
    // Países cujas ligas ainda não existem são representados explicitamente,
    // em vez de entregar suas vagas a clubes nacionais sem campanha continental.
    for (let index = 0; chosen.length < quota; index++) chosen.push(`generic:${confederation}:${index}`);
    entrants.push(...chosen);
  }
  for (const [confederation,count] of [["AFC",4],["CAF",4],["OFC",1]] as const) {
    for(let index=0;index<count;index+=1) entrants.push(`generic:${confederation}:${index}`);
  }
  // A sede futura é condensada na mesma indicação norte-americana do Técnico.
  const host=[...(COUNTRY_CLUBS.get("USA") ?? [])].filter(index=>!entrants.includes(idOf(index)))
    .sort((a,b)=>(context.world.strength[b] ?? 0)-(context.world.strength[a] ?? 0) || a-b)[0];
  if(host!==undefined)entrants.push(idOf(host));
  return knockout(context, "clubworldcup", entrants, NOISE.clubWorldCup, groupsFormat(32));
}

// ---------------------------------------------------------------- seleções

function nationsKnockout(
  context: Context,
  competition: string,
  nations: readonly Country[],
  format: KnockoutFormat,
): KnockoutResult {
  const rng = rngFor(context, "nations", competition, "tournament");
  const order = rankByNote(nations, (country) => nationEffective(context, country), NOISE.nations, rng);
  return { competition, order: order.map((country) => country.code), format };
}

/** Copa do Mundo (GDD 8.12): eliminatórias por confederação, sedes direto, duas repescagens. */
function simulateWorldCup(context: Context): KnockoutResult | null {
  if (context.year % 4 !== CALENDAR.worldCup || !getCompetition("worldcup")) return null;
  const hosts = (WORLD_CUP_HOSTS[context.year] ?? []).flatMap((code) => {
    const country = getCountry(code);
    return country ? [country] : [];
  });
  const qualified: Country[] = [...hosts];
  const pool: Array<{ country: Country; note: number }> = [];
  const rng = rngFor(context, "nations", "worldcup", "qualifying");

  for (const confederation of CONFEDERATIONS) {
    const hostsHere = hosts.filter((country) => country.confederation === confederation).length;
    const quota = Math.max(0, WORLD_CUP_QUOTA[confederation] - hostsHere);
    const ranked = (NATIONS_BY_CONFEDERATION.get(confederation) ?? [])
      .filter((country) => !hosts.includes(country))
      .map((country, position) => ({ country, position, note: nationEffective(context, country) + rng.normal(0, NOISE.nations) }))
      .sort((a, b) => b.note - a.note || a.position - b.position);
    ranked.forEach((entry, position) => {
      if (position < quota) qualified.push(entry.country);
      else pool.push({ country: entry.country, note: entry.note });
    });
  }
  pool.sort((a, b) => b.note - a.note);
  for (const entry of pool.slice(0, WORLD_CUP_PLAYOFFS)) qualified.push(entry.country);

  return nationsKnockout(context, "worldcup", qualified, WORLD_CUP_FORMAT);
}

/** Continentais de seleções (GDD 8.12): todos da confederação, a Eurocopa com 24. */
function simulateNationsCups(context: Context): Record<string, KnockoutResult> {
  const results: Record<string, KnockoutResult> = {};
  if (context.year % 4 !== CALENDAR.nationsCup) return results;
  for (const confederation of CONFEDERATIONS) {
    const competition = `nations:${confederation}`;
    if (!getCompetition(competition)) continue;
    let nations = NATIONS_BY_CONFEDERATION.get(confederation) ?? [];
    const size = NATIONS_CUP_SIZE[confederation];
    if (size && nations.length > size) {
      const rng = rngFor(context, "nations", competition, "qualifying");
      nations = nations
        .map((country, position) => ({ country, position, note: nationEffective(context, country) + rng.normal(0, NOISE.nations) }))
        .sort((a, b) => b.note - a.note || a.position - b.position)
        .slice(0, size)
        .map((entry) => entry.country);
    }
    results[competition] = nationsKnockout(context, competition, nations, groupsFormat(nations.length));
  }
  return results;
}

// ------------------------------------------------- acesso e força dos clubes

interface Movement {
  readonly division: Division[];
  readonly promoted: Record<CountryCode, string[]>;
  readonly relegated: Record<CountryCode, string[]>;
}

/** Os últimos da primeira trocam com os primeiros da segunda (GDD 8.4). */
function applyPromotion(context: Context, leagues: Readonly<Record<string, LeagueResult>>): Movement {
  const division = [...context.world.division];
  const promoted: Record<CountryCode, string[]> = {};
  const relegated: Record<CountryCode, string[]> = {};
  for (const country of PLAYABLE_COUNTRIES) {
    const [first, second] = countryLeagues(country);
    if (!first || !second) continue;
    const slots = first.promotionSlots;
    const top = leagues[first.id]?.rows ?? [];
    const lower = leagues[second.id]?.rows ?? [];
    const down = top.slice(Math.max(0, top.length - slots)).map((row) => row.club);
    const up = lower.slice(0, slots).map((row) => row.club);
    for (const id of down) division[clubIndex(id)] = 2;
    for (const id of up) division[clubIndex(id)] = 1;
    relegated[country] = down;
    promoted[country] = up;
  }
  return { division, promoted, relegated };
}

/** Volta à média mais o que a temporada rendeu (GDD 8.13). */
function evolveStrength(
  context: Context,
  results: Omit<SeasonResults, "promoted" | "relegated">,
  movement: Movement,
): { strength: number[]; titleDrought: number[] } {
  const success = new Array<number>(CLUB_COUNT).fill(0);
  const titles = Array.from({ length: CLUB_COUNT }, () => [] as string[]);
  const title = (id: string | undefined, competition: string) => {
    if (id && hasClub(id)) titles[clubIndex(id)]?.push(competition);
  };
  const bump = (id: string | undefined, amount: number) => {
    if (!id || !hasClub(id)) return;
    const index = clubIndex(id);
    success[index] = (success[index] ?? 0) + amount;
  };

  for (const league of Object.values(results.leagues)) {
    title(league.rows[0]?.club, league.competition);
    if (league.division !== 1) continue;
    const relegated = new Set(movement.relegated[league.country] ?? []);
    for (const row of league.rows.slice(-CLUB_DRIFT.bottomPlaces)) {
      if (!relegated.has(row.club)) bump(row.club, CLUB_DRIFT.bottomSurvivor);
    }
  }
  for (const [competition, result] of Object.entries(results.continental)) {
    title(result.order[0], competition);
  }
  for (const [competition, result] of Object.entries(results.cups)) {
    title(result.order[0], competition);
  }
  for (const [competition, result] of Object.entries(results.superCups)) title(result.winner, competition);
  title(results.intercontinental?.final.winner, "intercontinental");
  title(results.clubWorldCup?.order[0], "clubworldcup");
  for (const ids of Object.values(movement.promoted)) for (const id of ids) bump(id, CLUB_DRIFT.promotion);
  for (const ids of Object.values(movement.relegated)) for (const id of ids) bump(id, CLUB_DRIFT.relegation);

  const rng = rngFor(context, "drift");
  const titleDrought: number[] = [];
  const strength = context.world.strength.map((current, index) => {
    const progress = clubTrophyProgress(titles[index] ?? [], context.world.titleDrought?.[index]);
    titleDrought.push(progress.drought);
    const base = BASE_STRENGTH[index] ?? current;
    const impact = context.impact;
    const investment = impact && index === context.impactIndex ? CLUB_IMPACT.investment * impact.participation * clamp(impact.ovr - current, 0, CLUB_IMPACT.eliteAbove) : 0;
    const next = current + CLUB_DRIFT.reversion * (base - current) + (success[index] ?? 0) + progress.growth + progress.penalty + investment + rng.normal(0, CLUB_DRIFT.noise);
    return clamp(next, Math.max(CLUB_DRIFT.min, base - 10), Math.min(CLUB_DRIFT.max, base + 10));
  });
  return { strength, titleDrought };
}

function podium(order: readonly string[]): Podium | null {
  const [winner, runnerUp] = order;
  return winner && runnerUp ? { winner, runnerUp } : null;
}

function rememberSeason(year: number, previous: SeasonMemory, results: Omit<SeasonResults, "promoted" | "relegated">): SeasonMemory {
  const tables: Record<string, string[]> = {};
  for (const [id, league] of Object.entries(results.leagues)) tables[id] = league.rows.map((row) => row.club);
  const cups: Record<string, Podium> = {};
  for (const [id, cup] of Object.entries(results.cups)) {
    const entry = podium(cup.order);
    if (entry) cups[id] = entry;
  }
  const continental: Record<string, Podium> = {};
  for (const [id, result] of Object.entries(results.continental)) {
    const entry = podium(result.order);
    if (entry) continental[id] = entry;
  }
  const primaryChampions: Partial<Record<Confederation, readonly string[]>> = { ...previous.primaryChampions };
  for (const confederation of CONFEDERATIONS) {
    const winner = continental[`cont1:${confederation}`]?.winner;
    if (!winner) continue;
    primaryChampions[confederation] = [winner, ...(previous.primaryChampions[confederation] ?? [])].slice(0, PRIMARY_HISTORY);
  }
  const points: Record<string, number> = {};
  for (const [id, result] of Object.entries(results.continental)) if (id.startsWith("cont1:")) result.order.forEach((club, rank) => { points[club] = Math.max(1, 18 - 3 * Math.ceil(Math.log2(rank + 1))); });
  return { year,tables,cups,continental,primaryChampions,primaryRanking:rememberContinentalRanking(previous.primaryRanking,points),performanceSpots:performanceSpots(Object.fromEntries(Object.entries(results.continental).map(([id,result])=>[id,result.order]))) };
}

// ------------------------------------------------------------- a temporada

export interface WorldSeason {
  readonly results: SeasonResults;
  readonly next: WorldState;
}

export interface WorldSeasonOptions {
  /**
   * Aplica acesso, rebaixamento e a nova força dos clubes. Desligado só no
   * aquecimento antes da carreira, para a carreira começar com as divisões e
   * as forças reais dos dados.
   */
  readonly settle?: boolean;
}

export function simulateWorldSeason(
  world: WorldState,
  seed: string,
  impact: PlayerImpact | null = null,
  options: WorldSeasonOptions = {},
): WorldSeason {
  const settle = options.settle ?? true;
  const context: Context = {
    seed,
    year: world.year,
    world,
    impact,
    impactIndex: impact && hasClub(impact.club) ? clubIndex(impact.club) : -1,
  };

  // Cada torneio passa pela pressão do recorde logo que termina (D44), antes
  // de alimentar o seguinte: o campeão continental que a pressão escolheu é
  // quem vai à Intercontinental.
  const superCups = recordSuperCups(context, simulateSuperCups(context));
  const leagues: Record<string, LeagueResult> = {};
  for (const country of PLAYABLE_COUNTRIES) {
    for (const league of countryLeagues(country)) leagues[league.id] = recordLeague(context, simulateLeague(context, league));
  }
  const cups = recordKnockouts(context, simulateCups(context), context.impact?.club);
  const continental = recordKnockouts(context, simulateContinental(context), context.impact?.club);
  decideFinal(context, cups, continental);
  const intercontinental = recordIntercontinental(context, simulateIntercontinental(context, continental));
  const clubWorldCup = recordKnockout(context, simulateClubWorldCup(context), context.impact?.club);
  const nations: Record<string, KnockoutResult> = recordKnockouts(context, simulateNationsCups(context), context.impact?.nationality);
  const worldCup = recordKnockout(context, simulateWorldCup(context), context.impact?.nationality);
  if (worldCup) nations.worldcup = worldCup;

  const played = { year: world.year, leagues, cups, superCups, continental, intercontinental, clubWorldCup, nations };
  const movement: Movement = settle
    ? applyPromotion(context, leagues)
    : { division: [...world.division], promoted: {}, relegated: {} };
  const growth = settle ? evolveStrength(context, played, movement) : { strength: [...world.strength], titleDrought: [...(world.titleDrought ?? new Array<number>(CLUB_COUNT).fill(0))] };

  return {
    results: { ...played, promoted: movement.promoted, relegated: movement.relegated },
    next: {
      year: world.year + 1,
      strength: growth.strength,
      titleDrought: growth.titleDrought,
      division: movement.division,
      memory: rememberSeason(world.year, world.memory, played),
      awards: world.awards,
    },
  };
}

// ------------------------------------------------------- pressão do recorde

/**
 * Pressão do recorde (D44): o título que o clube (ou a seleção) do jogador
 * acabou de ganhar fica com ele se a sorte vier. Longe dos recordes, a chance
 * é 1 e nada é sorteado; perto, cai a cada título.
 */
function keepsTitle(context: Context, competition: string): boolean {
  const records = context.impact?.records;
  if (!records) return true;
  const chance = titleKeepChance(records, competition);
  return chance >= 1 || rngFor(context, "record", competition).chance(chance);
}

/** Supercopa: sem a sorte, o adversário vence o jogo único. */
function recordSuperCups(context: Context, matches: Record<string, MatchResult>): Record<string, MatchResult> {
  const club = context.impact?.club;
  if (!club) return matches;
  const result: Record<string, MatchResult> = { ...matches };
  for (const [competition, match] of Object.entries(matches)) {
    if (match.winner !== club || keepsTitle(context, competition)) continue;
    result[competition] = { ...match, winner: match.home === club ? match.away : match.home };
  }
  return result;
}

/** Liga: sem a sorte, o vice passa na última rodada (os dois trocam de linha, os pontos ficam). */
function recordLeague(context: Context, league: LeagueResult): LeagueResult {
  const club = context.impact?.club;
  const [first, second, ...rest] = league.rows;
  if (!club || !first || !second || first.club !== club || keepsTitle(context, league.competition)) return league;
  return { ...league, rows: [{ ...first, club: second.club }, { ...second, club: first.club }, ...rest] };
}

/** Mata-mata: sem a sorte, a final fica com o vice. */
function recordKnockout(context: Context, result: KnockoutResult | null, holder: string | undefined): KnockoutResult | null {
  if (!result || !holder) return result;
  const [first, second, ...rest] = result.order;
  if (!first || !second || first !== holder || keepsTitle(context, result.competition)) return result;
  return { ...result, order: [second, first, ...rest] };
}

function recordKnockouts(
  context: Context,
  results: Record<string, KnockoutResult>,
  holder: string | undefined,
): Record<string, KnockoutResult> {
  if (!holder) return results;
  const changed: Record<string, KnockoutResult> = {};
  for (const [competition, result] of Object.entries(results)) {
    changed[competition] = recordKnockout(context, result, holder) ?? result;
  }
  return changed;
}

/** Intercontinental: sem a sorte, o adversário vence a final. */
function recordIntercontinental(context: Context, result: IntercontinentalResult | null): IntercontinentalResult | null {
  const club = context.impact?.club;
  if (!result || !club || result.final.winner !== club || keepsTitle(context, result.competition)) return result;
  const { final } = result;
  return { ...result, final: { ...final, winner: final.home === club ? final.away : final.home } };
}

// ------------------------------------------------------------ o mundo novo

/** Memória inicial, antes do aquecimento: tudo pela força dos dados. */
function bootstrapMemory(year: number): SeasonMemory {
  const byStrength = (indexes: readonly number[]) =>
    [...indexes].sort((a, b) => (BASE_STRENGTH[b] ?? 0) - (BASE_STRENGTH[a] ?? 0) || a - b).map(idOf);
  const tables: Record<string, string[]> = {};
  const cups: Record<string, Podium> = {};
  for (const country of PLAYABLE_COUNTRIES) {
    const clubs = COUNTRY_CLUBS.get(country) ?? [];
    for (const league of countryLeagues(country)) {
      tables[league.id] = byStrength(clubs.filter((index) => BASE_DIVISION[index] === league.division));
    }
    const ranked = byStrength(clubs);
    const [winner, runnerUp] = ranked;
    if (winner && runnerUp && getCompetition(`cup:${country}`)) cups[`cup:${country}`] = { winner, runnerUp };
  }
  const continental: Record<string, Podium> = {};
  const primaryChampions: Partial<Record<Confederation, readonly string[]>> = {};
  for (const confederation of CONFEDERATIONS) {
    const ranked = byStrength(CONFEDERATION_CLUBS.get(confederation) ?? []);
    const [winner, runnerUp] = ranked;
    if (!winner || !runnerUp) continue;
    if (getCompetition(`cont1:${confederation}`)) {
      continental[`cont1:${confederation}`] = { winner, runnerUp };
      primaryChampions[confederation] = [winner];
    }
  }
  return { year, tables, cups, continental, primaryChampions };
}

/**
 * O mundo pronto para a primeira temporada da carreira. Antes dela, algumas
 * temporadas de aquecimento enchem a memória (tabelas, copas, campeões
 * continentais) sem mexer em divisões nem forças: a carreira começa com o
 * mundo real dos dados.
 */
export function createWorld(seed: string, startYear: number): WorldState {
  let world: WorldState = {
    year: startYear - WARM_UP_SEASONS,
    strength: [...BASE_STRENGTH],
    division: [...BASE_DIVISION],
    memory: bootstrapMemory(startYear - WARM_UP_SEASONS - 1),
    awards: {},
  };
  for (let season = 0; season < WARM_UP_SEASONS; season += 1) {
    world = simulateWorldSeason(world, seed, null, { settle: false }).next;
  }
  return world;
}

/** Força atual de um clube no mundo. */
export function currentStrength(world: WorldState, club: string): number {
  return world.strength[clubIndex(club)] ?? 0;
}

/** Divisão atual de um clube no mundo (invariante 13: a liga exibida é a atual). */
export function currentDivision(world: WorldState, club: string): Division {
  return world.division[clubIndex(club)] ?? 1;
}

/** Confederação do clube, que decide a importância dos títulos dele (invariante 11). */
export function confederationOfClub(club: string): Confederation {
  const index = clubIndex(club);
  return CLUB_CONFEDERATION[index] ?? "UEFA";
}
