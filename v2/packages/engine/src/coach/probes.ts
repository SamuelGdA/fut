import { getCountry } from "@craque/world";
import { stream } from "../rng";
import { clubWorldCupEntrants } from "./competitions";
import { growthStep } from "./evolution";
import { askingTerms, chanceTier, purchaseChance, type ChanceTier } from "./market";
import { ageOf } from "./players";
import { initialOfferDivision, seasonBudget, wageBillOf } from "./review";
import { aiFormation, aiPhilosophy, aiRating, bestEleven, expectedGoals, sectorRatings, type SectorRatings, type SideSetup } from "./tactics";
import type { CoachCareer, CoachPlayer, Philosophy } from "./types";
import { DEVELOP, FINANCE, MATCH } from "./tuning";
import { unit } from "./util";
import { squadOf } from "./world";

/**
 * Sondas do Técnico: contas exatas sobre o modelo, sem sortear carreiras.
 * O laboratório e o `pnpm balance:tecnico` usam as mesmas funções, para a
 * tela mostrar exatamente o que o harness mede.
 */

export const PHILOSOPHIES: readonly Philosophy[] = ["attacking", "defensive", "possession", "counter"];

// ---------------------------------------------------------------- partidas

/** Lado de um clube como a IA o escala (melhor time na formação do clube). */
export function clubRatings(career: CoachCareer, clubId: string): SectorRatings {
  const formation = aiFormation(unit(`${career.setup.seed}:formation:${clubId}`));
  return sectorRatings(bestEleven(squadOf(career, clubId), formation), aiRating);
}

/** Lado sintético com o mesmo número nos quatro setores. */
export function flatRatings(value: number): SectorRatings {
  return { gk: value, def: value, mid: value, att: value, attack: value, defense: value };
}

function side(ratings: SectorRatings, philosophy: Philosophy, home: boolean, neutral: boolean): SideSetup {
  return { ratings, philosophy, fastPlayers: 0, setPiecePlayers: 0, forBoost: 1, againstBoost: 1, home, neutral, playersOnField: 11 };
}

function poissonTable(lambda: number, max: number): number[] {
  const table: number[] = [];
  let term = Math.exp(-lambda);
  for (let goals = 0; goals <= max; goals += 1) {
    table.push(term);
    term *= lambda / (goals + 1);
  }
  return table;
}

export interface MatchOdds {
  readonly win: number;
  readonly draw: number;
  readonly loss: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  /** Pontos por jogo esperados (3 por vitória, 1 por empate). */
  readonly points: number;
  /** Chance de passar num jogo único decisivo (prorrogação e pênaltis em 50%). */
  readonly advance: number;
}

/** Resultado exato de um jogo de 90 minutos pelo modelo de Poisson (sem sorteio). */
export function matchOdds(
  own: SectorRatings,
  other: SectorRatings,
  philosophies: readonly [Philosophy, Philosophy],
  venue: "home" | "away" | "neutral" = "neutral",
): MatchOdds {
  const neutral = venue === "neutral";
  const a = side(own, philosophies[0], venue === "home", neutral);
  const b = side(other, philosophies[1], venue === "away", neutral);
  const lambdaFor = expectedGoals(a, b);
  const lambdaAgainst = expectedGoals(b, a);
  const max = 12;
  const pf = poissonTable(lambdaFor, max);
  const pa = poissonTable(lambdaAgainst, max);
  let win = 0;
  let draw = 0;
  let loss = 0;
  for (let i = 0; i <= max; i += 1) {
    for (let j = 0; j <= max; j += 1) {
      const p = (pf[i] ?? 0) * (pa[j] ?? 0);
      if (i > j) win += p;
      else if (i === j) draw += p;
      else loss += p;
    }
  }
  // Normaliza a massa cortada acima de 12 gols (bilionésimos) para a conta ficar simétrica.
  const mass = win + draw + loss;
  win /= mass;
  draw /= mass;
  loss /= mass;
  // Na prorrogação, a mesma conta com um terço do tempo; empate de novo vai aos pênaltis.
  const et = poissonTable(lambdaFor * MATCH.extraTime, max);
  const eta = poissonTable(lambdaAgainst * MATCH.extraTime, max);
  let etWin = 0;
  let etDraw = 0;
  let etLoss = 0;
  for (let i = 0; i <= max; i += 1) {
    for (let j = 0; j <= max; j += 1) {
      const p = (et[i] ?? 0) * (eta[j] ?? 0);
      if (i > j) etWin += p;
      else if (i === j) etDraw += p;
      else etLoss += p;
    }
  }
  const etMass = etWin + etDraw + etLoss;
  etWin /= etMass;
  etDraw /= etMass;
  return {
    win,
    draw,
    loss,
    goalsFor: lambdaFor,
    goalsAgainst: lambdaAgainst,
    points: 3 * win + draw,
    advance: win + draw * (etWin + etDraw * 0.5),
  };
}

/** Distribuição da abordagem da IA pela força relativa (a mesma régua de `aiPhilosophy`). */
export function aiPhilosophyMix(own: number, opponent: number): ReadonlyArray<readonly [Philosophy, number]> {
  const counts = new Map<Philosophy, number>();
  const steps = 100;
  for (let index = 0; index < steps; index += 1) {
    const philosophy = aiPhilosophy(own, opponent, (index + 0.5) / steps);
    counts.set(philosophy, (counts.get(philosophy) ?? 0) + 1);
  }
  return [...counts].map(([philosophy, count]) => [philosophy, count / steps] as const);
}

export interface PhilosophyRow {
  /** Diferença de força em todos os setores (positiva: o time do treinador é mais forte). */
  readonly gap: number;
  /** Pontos por jogo de cada filosofia contra a mistura de abordagens da IA. */
  readonly points: Readonly<Record<Philosophy, number>>;
  readonly best: Philosophy;
}

/** Quadro das filosofias: pontos por jogo em campo neutro contra a IA, por faixa de força. */
export function philosophyGrid(gaps: readonly number[], base = 74): PhilosophyRow[] {
  return gaps.map((gap) => {
    const own = flatRatings(base + gap / 2);
    const other = flatRatings(base - gap / 2);
    const mix = aiPhilosophyMix(base - gap / 2, base + gap / 2);
    const points = {} as Record<Philosophy, number>;
    for (const philosophy of PHILOSOPHIES) {
      points[philosophy] = mix.reduce((total, [theirs, weight]) => total + weight * matchOdds(own, other, [philosophy, theirs]).points, 0);
    }
    const best = [...PHILOSOPHIES].sort((a, b) => points[b] - points[a])[0] ?? "possession";
    return { gap, points, best };
  });
}

export interface ClubDuel {
  readonly a: string;
  readonly b: string;
  readonly strengthA: number;
  readonly strengthB: number;
  /** Jogo de 90 minutos em campo neutro, filosofias da IA. */
  readonly odds: MatchOdds;
  /** As mesmas contas com os elencos trocados de clube: só o elenco decide. */
  readonly swapped: MatchOdds;
}

/** Duelo entre dois clubes reais do mundo, em campo neutro, com as abordagens da IA. */
export function clubDuel(career: CoachCareer, a: string, b: string): ClubDuel {
  const ra = clubRatings(career, a);
  const rb = clubRatings(career, b);
  const sa = career.clubs[a]?.strength ?? 60;
  const sb = career.clubs[b]?.strength ?? 60;
  const mixA = aiPhilosophyMix(sa, sb);
  const mixB = aiPhilosophyMix(sb, sa);
  const average = (own: SectorRatings, other: SectorRatings, own_: typeof mixA, other_: typeof mixB): MatchOdds => {
    const keys: Array<keyof MatchOdds> = ["win", "draw", "loss", "goalsFor", "goalsAgainst", "points", "advance"];
    const total: Record<keyof MatchOdds, number> = { win: 0, draw: 0, loss: 0, goalsFor: 0, goalsAgainst: 0, points: 0, advance: 0 };
    for (const [pa, wa] of own_) {
      for (const [pb, wb] of other_) {
        const odds = matchOdds(own, other, [pa, pb]);
        for (const key of keys) total[key] += wa * wb * odds[key];
      }
    }
    return total;
  };
  return { a, b, strengthA: sa, strengthB: sb, odds: average(ra, rb, mixA, mixB), swapped: average(rb, ra, mixB, mixA) };
}

/** Confederação do clube (para comparar continentes sem que o motor saiba dela). */
export function confederationOf(career: CoachCareer, clubId: string): string {
  const club = career.clubs[clubId];
  return club ? (getCountry(club.country)?.confederation ?? "") : "";
}

// ----------------------------------------------------------- Mundial

export interface ClubWorldCupOdds {
  readonly entrants: number;
  readonly europeans: number;
  /** Fatia dos títulos por confederação no chaveamento do Técnico. */
  readonly share: Readonly<Record<string, number>>;
  /** O sul-americano com mais chance e a chance dele. */
  readonly bestSouth: { readonly club: string; readonly chance: number } | null;
}

/**
 * Mundial de Clubes jogado muitas vezes com as chances exatas de cada jogo
 * (mesmos classificados, mesma preliminar e o mesmo sorteio aberto das
 * fases seguintes). Mede o "difícil, mas possível" sem depender da sorte de
 * uma carreira.
 */
export function clubWorldCupOdds(career: CoachCareer, runs: number): ClubWorldCupOdds {
  const strength = (id: string) => career.clubs[id]?.strength ?? 60;
  const entrants = clubWorldCupEntrants({ seed: career.setup.seed, year: career.year, clubs: career.clubs, memory: career.memory }, strength);
  const advance = new Map<string, number>();
  const chance = (a: string, b: string) => {
    const key = `${a}|${b}`;
    let value = advance.get(key);
    if (value === undefined) {
      value = clubDuel(career, a, b).odds.advance;
      advance.set(key, value);
      advance.set(`${b}|${a}`, 1 - value);
    }
    return value;
  };
  const rng = stream(career.setup.seed, "coach", "probe", "clubworldcup");
  const titles = new Map<string, number>();
  const ordered = [...entrants].sort((a, b) => strength(b) - strength(a) || a.localeCompare(b));
  for (let run = 0; run < runs; run += 1) {
    const extra = Math.max(0, ordered.length - 16);
    const direct = ordered.slice(0, ordered.length - extra * 2);
    const prelim = ordered.slice(ordered.length - extra * 2);
    let alive = [...direct];
    for (let index = 0; index < prelim.length / 2; index += 1) {
      const a = prelim[index] as string;
      const b = prelim[prelim.length - 1 - index] as string;
      alive.push(rng.next() < chance(a, b) ? a : b);
    }
    while (alive.length > 1) {
      const shuffled = rng.shuffle(alive);
      const next: string[] = [];
      for (let index = 0; index + 1 < shuffled.length; index += 2) {
        const a = shuffled[index] as string;
        const b = shuffled[index + 1] as string;
        next.push(rng.next() < chance(a, b) ? a : b);
      }
      alive = next;
    }
    const champion = alive[0];
    if (champion) titles.set(champion, (titles.get(champion) ?? 0) + 1);
  }
  const share: Record<string, number> = {};
  for (const [club, count] of titles) {
    const confederation = confederationOf(career, club) || "OUTRO";
    share[confederation] = (share[confederation] ?? 0) + count / runs;
  }
  const south = entrants.filter((club) => confederationOf(career, club) === "CONMEBOL").sort((a, b) => (titles.get(b) ?? 0) - (titles.get(a) ?? 0));
  const best = south[0];
  return {
    entrants: entrants.length,
    europeans: entrants.filter((club) => confederationOf(career, club) === "UEFA").length,
    share,
    bestSouth: best ? { club: best, chance: (titles.get(best) ?? 0) / runs } : null,
  };
}

// ---------------------------------------------------------------- mercado

export interface PurchasePoint {
  /** OVR do alvo menos a força do comprador. */
  readonly gap: number;
  readonly players: number;
  readonly median: number;
  readonly mean: number;
  readonly tiers: Readonly<Record<ChanceTier, number>>;
}

/** Curva da dificuldade de contratar: chance do negócio existir por diferença de OVR. */
export function purchaseCurve(career: CoachCareer, buyerId: string, gaps: readonly number[]): PurchasePoint[] {
  const buyer = career.clubs[buyerId];
  if (!buyer) return [];
  const strength = Math.round(buyer.strength);
  const pool = Object.values(career.players).filter((player) => player.club && player.club !== buyerId);
  return gaps.map((gap) => {
    const chances = pool
      .filter((player) => player.ovr === strength + gap && ageOf(player, career.year) <= 31)
      .map((player) => purchaseChance(career, player, buyerId).total)
      .sort((x, y) => x - y);
    const tiers: Record<ChanceTier, number> = { veryHard: 0, hard: 0, possible: 0, likely: 0 };
    for (const chance of chances) tiers[chanceTier(chance)] += 1 / Math.max(1, chances.length);
    const mean = chances.reduce((total, chance) => total + chance, 0) / Math.max(1, chances.length);
    return { gap, players: chances.length, median: chances[Math.floor(chances.length / 2)] ?? 0, mean, tiers };
  });
}

export interface Affordability {
  readonly club: string;
  readonly budget: number;
  /** Folga mensal até o teto de salários. */
  readonly wageRoom: number;
  /** Alvos do nível do clube (OVR da força até força + 3, até 29 anos) com chance de pelo menos 5%. */
  readonly targets: number;
  /** Desses, quantos cabem na verba e na folha sem pedir verba. */
  readonly affordable: number;
}

/**
 * A verba de início de temporada dá para contratar? Conta os alvos do nível
 * do clube com chance real e os que cabem no preço e no salário pedidos
 * (mesmo sorteio de preço da resposta, num fluxo próprio da sonda).
 */
export function affordability(career: CoachCareer, clubId: string): Affordability {
  const club = career.clubs[clubId];
  if (!club) return { club: clubId, budget: 0, wageRoom: 0, targets: 0, affordable: 0 };
  const budget = seasonBudget(club, 0);
  const wageRoom = (club.revenue * FINANCE.wageCap) / 12 - wageBillOf(career, clubId);
  const strength = Math.round(club.strength);
  let targets = 0;
  let affordable = 0;
  for (const player of Object.values(career.players)) {
    if (!player.club || player.club === clubId) continue;
    if (player.ovr < strength || player.ovr > strength + 3 || ageOf(player, career.year) > 29) continue;
    if (purchaseChance(career, player, clubId).total < 0.05) continue;
    targets += 1;
    const terms = askingTerms(career, player, clubId, stream(career.setup.seed, "coach", "probe", "ask", clubId, player.id));
    if (terms.price <= budget && terms.wage <= wageRoom) affordable += 1;
  }
  return { club: clubId, budget, wageRoom, targets, affordable };
}

// ------------------------------------------------------------- propostas

/** Fatia de segundas divisões nas propostas iniciais em `careers` sementes (3 sorteios cada). */
export function initialDivisionShare(seedBase: string, careers: number): { second: number; draws: number; anyFirst: number } {
  let second = 0;
  let anyFirst = 0;
  for (let index = 0; index < careers; index += 1) {
    const seed = `${seedBase}:${index}`;
    let first = false;
    for (let draw = 0; draw < 3; draw += 1) {
      if (initialOfferDivision(seed, draw) === 2) second += 1;
      else first = true;
    }
    if (first) anyFirst += 1;
  }
  return { second: second / (careers * 3), draws: careers * 3, anyFirst: anyFirst / careers };
}

// -------------------------------------------------------------- evolução

export interface DevelopTrial {
  readonly players: number;
  /** Chance do OVR subir na próxima atualização com o Desenvolver. */
  readonly treated: number;
  /** A mesma chance sem o Desenvolver, com a mesma sorte. */
  readonly control: number;
  /** Ganho médio de nível oculto com e sem. */
  readonly gainTreated: number;
  readonly gainControl: number;
}

/**
 * O mesmo jogador, a mesma sorte, com e sem a marca do Desenvolver: a
 * diferença é só o efeito da ação. `fraction` 1 é o rápido; 0,5 é uma
 * metade do lento.
 */
export function developTrial(career: CoachCareer, players: readonly CoachPlayer[], fraction: number, games = 30): DevelopTrial {
  let treated = 0;
  let control = 0;
  let gainTreated = 0;
  let gainControl = 0;
  for (const player of players) {
    const input = { year: career.year, fraction, games: games * fraction, performance: 0, mentor: 1 };
    const withMark = growthStep(player, { ...input, developed: true }, stream(career.setup.seed, "coach", "probe", "develop", player.id));
    const without = growthStep(player, { ...input, developed: false }, stream(career.setup.seed, "coach", "probe", "develop", player.id));
    if (Math.round(withMark) > player.ovr) treated += 1;
    if (Math.round(without) > player.ovr) control += 1;
    gainTreated += withMark - player.level;
    gainControl += without - player.level;
  }
  const n = Math.max(1, players.length);
  return { players: players.length, treated: treated / n, control: control / n, gainTreated: gainTreated / n, gainControl: gainControl / n };
}

/** Candidatos típicos do Desenvolver: até `maxAge` anos e com folga mínima até o potencial. */
export function developCandidates(career: CoachCareer, maxAge: number, minGap: number): CoachPlayer[] {
  return Object.values(career.players).filter(
    (player) => player.club && ageOf(player, career.year) <= maxAge && player.potential - player.level >= minGap,
  );
}

export interface PaceTrial {
  readonly players: number;
  /** Variação média do nível em uma temporada no rápido (um período). */
  readonly fast: number;
  /** Variação média do nível em uma temporada no lento (duas metades). */
  readonly slow: number;
}

/** Rápido × lento: a mesma temporada em um período ou em duas metades, sem ações. */
export function paceTrial(career: CoachCareer, players: readonly CoachPlayer[]): PaceTrial {
  let fast = 0;
  let slow = 0;
  for (const player of players) {
    const base = { year: career.year, performance: 0, mentor: 1, developed: false };
    const one = growthStep(player, { ...base, fraction: 1, games: 30 }, stream(career.setup.seed, "coach", "probe", "pace", "fast", player.id));
    const half = growthStep(player, { ...base, fraction: 0.5, games: 15 }, stream(career.setup.seed, "coach", "probe", "pace", "a", player.id));
    const two = growthStep({ ...player, level: half }, { ...base, fraction: 0.5, games: 15 }, stream(career.setup.seed, "coach", "probe", "pace", "b", player.id));
    fast += one - player.level;
    slow += two - player.level;
  }
  const n = Math.max(1, players.length);
  return { players: players.length, fast: fast / n, slow: slow / n };
}

/** Faixa do bônus do Desenvolver por idade (para a tela e o GDD). */
export function developRange(age: number): readonly [number, number] {
  for (const [limit, factor] of DEVELOP.ageFactor) if (age <= limit) return [DEVELOP.minBonus * factor, DEVELOP.maxBonus * factor];
  return [0, 0];
}
