import {
  BASE_STRENGTH,
  createWorld,
  type SeasonResults,
  simulateWorldSeason,
  type WorldState,
} from "@craque/engine";
import { COUNTRIES, getClub, getCountry, LEAGUES } from "@craque/world";
import { mean, median, quantile, share } from "./stats";
import type { TargetResult } from "./targets";

/**
 * O mundo sozinho, sem jogador: dezenas de mundos por algumas décadas, para
 * conferir que tabelas, copas, continentais e seleções se comportam como
 * futebol (GDD 40.1, parte do mundo).
 */

export interface WorldBatch {
  readonly worlds: number;
  readonly seasons: number;
  /** Uma lista de resultados por mundo, temporada a temporada. */
  readonly history: ReadonlyArray<readonly SeasonResults[]>;
  readonly finals: readonly WorldState[];
  /** Tempo por temporada, em milissegundos, já aquecido. */
  readonly msPerSeason: number;
}

export function runWorlds(seed: string, worlds: number, seasons: number, startYear = 2026): WorldBatch {
  const history: SeasonResults[][] = [];
  const finals: WorldState[] = [];
  let elapsed = 0;
  let timed = 0;
  for (let index = 0; index < worlds; index += 1) {
    let world = createWorld(`${seed}:${index}`, startYear);
    const results: SeasonResults[] = [];
    for (let season = 0; season < seasons; season += 1) {
      const started = performance.now();
      const step = simulateWorldSeason(world, `${seed}:${index}`);
      if (index > 0) {
        elapsed += performance.now() - started;
        timed += 1;
      }
      results.push(step.results);
      world = step.next;
    }
    history.push(results);
    finals.push(world);
  }
  return { worlds, seasons, history, finals, msPerSeason: timed > 0 ? elapsed / timed : Number.NaN };
}

export interface LeagueSummary {
  readonly league: string;
  readonly name: string;
  readonly division: 1 | 2;
  readonly championPoints: number;
  readonly lastPoints: number;
  /** Campeões diferentes por mundo (mediana). */
  readonly distinctChampions: number;
  /** Fatia de títulos do clube que mais ganhou, em cada mundo (mediana). */
  readonly topClubShare: number;
  /** O clube que mais ganhou somando todos os mundos. */
  readonly dominant: string;
  readonly dominantShare: number;
  /** Quem subiu e não caiu na temporada seguinte. */
  readonly survival: number | null;
}

export interface WorldMetrics {
  readonly msPerSeason: number;
  readonly leagues: readonly LeagueSummary[];
  readonly championsPerLeague: number;
  readonly winnersByCountry: Readonly<Record<string, Readonly<Record<string, number>>>>;
  /** Fatia de títulos do maior campeão de cada mundo, mediana, por competição continental. */
  readonly continentalTopShare: Readonly<Record<string, number>>;
  readonly intercontinentalUefa: number;
  readonly clubWorldCupUefa: number;
  readonly worldCupWinners: Readonly<Record<string, number>>;
  readonly worldCupTopEight: number;
  readonly worldCupOutsideBig: number;
  readonly nationsCupWinners: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly driftP99: number;
  readonly driftP01: number;
  readonly driftMeanAbs: number;
}

function shareMap(values: readonly string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  for (const key of Object.keys(counts)) counts[key] = (counts[key] ?? 0) / values.length;
  return counts;
}

export function computeWorldMetrics(batch: WorldBatch): WorldMetrics {
  const seasons = batch.history.flat();

  const leagues: LeagueSummary[] = LEAGUES.map((league) => {
    const champions: string[] = [];
    const championPoints: number[] = [];
    const lastPoints: number[] = [];
    const distinct: number[] = [];
    const topShares: number[] = [];
    let promotedCount = 0;
    let survivedCount = 0;

    for (const world of batch.history) {
      const worldChampions: string[] = [];
      world.forEach((season, position) => {
        const table = season.leagues[league.id];
        if (!table) return;
        const first = table.rows[0];
        const last = table.rows[table.rows.length - 1];
        if (first) {
          worldChampions.push(first.club);
          championPoints.push(first.points);
        }
        if (last) lastPoints.push(last.points);
        if (league.division === 1) {
          const promoted = season.promoted[league.country] ?? [];
          const next = world[position + 1];
          if (next) {
            for (const club of promoted) {
              promotedCount += 1;
              if (!(next.relegated[league.country] ?? []).includes(club)) survivedCount += 1;
            }
          }
        }
      });
      champions.push(...worldChampions);
      distinct.push(new Set(worldChampions).size);
      const counts = shareMap(worldChampions);
      topShares.push(Math.max(0, ...Object.values(counts)));
    }

    const overall = shareMap(champions);
    const [dominant, dominantShare] = Object.entries(overall).sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
    return {
      league: league.id,
      name: league.name,
      division: league.division,
      championPoints: median(championPoints),
      lastPoints: median(lastPoints),
      distinctChampions: median(distinct),
      topClubShare: median(topShares),
      dominant,
      dominantShare,
      survival: league.division === 1 && promotedCount > 0 ? survivedCount / promotedCount : null,
    };
  });

  const continentalWinners = (competition: string) =>
    seasons.flatMap((season) => {
      const winner = season.continental[competition]?.order[0];
      return winner ? [getClub(winner)?.country ?? "?"] : [];
    });
  const winnersByCountry: Record<string, Record<string, number>> = {};
  for (const competition of ["cont1:UEFA", "cont2:UEFA", "cont1:CONMEBOL", "cont2:CONMEBOL", "cont1:CONCACAF"]) {
    winnersByCountry[competition] = shareMap(continentalWinners(competition));
  }

  const continentalTopShare: Record<string, number> = {};
  for (const competition of ["cont1:UEFA", "cont1:CONMEBOL"]) {
    const perWorld = batch.history.map((world) => {
      const winners = world.flatMap((season) => {
        const winner = season.continental[competition]?.order[0];
        return winner ? [winner] : [];
      });
      return Math.max(0, ...Object.values(shareMap(winners)));
    });
    continentalTopShare[competition] = median(perWorld);
  }

  const intercontinental = seasons.flatMap((season) => (season.intercontinental ? [season.intercontinental] : []));
  const intercontinentalUefa = share(intercontinental, (result) => result.final.winner === result.final.home);

  const clubWorldCups = seasons.flatMap((season) => (season.clubWorldCup ? [season.clubWorldCup] : []));
  const clubWorldCupUefa = share(clubWorldCups, (result) => {
    const winner = result.order[0];
    return winner ? getCountry(getClub(winner)?.country)?.confederation === "UEFA" : false;
  });

  const worldCupWinners = seasons.flatMap((season) => {
    const winner = season.nations.worldcup?.order[0];
    return winner ? [winner] : [];
  });
  const topEight = new Set(
    [...COUNTRIES]
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 8)
      .map((country) => country.code),
  );
  const nationsCupWinners: Record<string, Record<string, number>> = {};
  for (const confederation of ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"]) {
    nationsCupWinners[confederation] = shareMap(
      seasons.flatMap((season) => {
        const winner = season.nations[`nations:${confederation}`]?.order[0];
        return winner ? [winner] : [];
      }),
    );
  }

  const drift = batch.finals.flatMap((world) =>
    world.strength.map((strength, index) => strength - (BASE_STRENGTH[index] ?? strength)),
  );

  return {
    msPerSeason: batch.msPerSeason,
    leagues,
    championsPerLeague: median(leagues.filter((league) => league.division === 1).map((league) => league.distinctChampions)),
    winnersByCountry,
    continentalTopShare,
    intercontinentalUefa,
    clubWorldCupUefa,
    worldCupWinners: shareMap(worldCupWinners),
    worldCupTopEight: share(worldCupWinners, (code) => topEight.has(code)),
    worldCupOutsideBig: share(worldCupWinners, (code) => {
      const confederation = getCountry(code)?.confederation;
      return confederation !== "UEFA" && confederation !== "CONMEBOL";
    }),
    nationsCupWinners,
    driftP99: quantile(drift, 0.99),
    driftP01: quantile(drift, 0.01),
    driftMeanAbs: mean(drift.map(Math.abs)),
  };
}

const pct = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;
const fixed = (value: number, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : "n/d");

/** As metas do mundo (GDD 40.1). */
export function worldTargets(metrics: WorldMetrics, seasons: number): TargetResult[] {
  const firsts = metrics.leagues.filter((league) => league.division === 1);
  const big = firsts.filter((league) => ["premier-league", "laliga", "serie-a", "bundesliga", "ligue-1", "brasileirao"].includes(league.league));
  const championPoints = big.map((league) => league.championPoints);
  const survival = firsts.flatMap((league) => (league.survival === null ? [] : [league.survival]));
  const survivalMedian = median(survival);
  const libertadores = metrics.winnersByCountry["cont1:CONMEBOL"] ?? {};
  const libertadoresBig = (libertadores.BRA ?? 0) + (libertadores.ARG ?? 0);
  const champions = metrics.winnersByCountry["cont1:UEFA"] ?? {};
  const championsTop = (champions.ENG ?? 0) + (champions.ESP ?? 0);

  const worst = [...firsts].sort((a, b) => b.topClubShare - a.topClubShare)[0];
  return [
    {
      id: "points",
      label: "Pontos do campeão nas grandes ligas (mediana por liga)",
      target: "entre 74 e 95",
      measured: big.map((league) => `${league.name} ${fixed(league.championPoints, 0)}`).join(", "),
      pass: championPoints.every((points) => points >= 74 && points <= 95),
    },
    {
      id: "variety",
      label: `Campeões diferentes por primeira divisão em ${seasons} temporadas (mediana das ligas)`,
      target: "pelo menos 4",
      measured: fixed(metrics.championsPerLeague, 1),
      pass: metrics.championsPerLeague >= 4,
    },
    {
      id: "no-dynasty",
      label: "Dinastia existe, monopólio não: fatia do maior campeão de cada mundo",
      target: "mediana de no máximo 95% em todas as primeiras divisões (o Bayern ganhou 11 seguidos; o PSG, 11 de 13)",
      measured: worst ? `pior: ${worst.name} ${pct(worst.topClubShare)}` : "n/d",
      pass: firsts.every((league) => league.topClubShare <= 0.95),
    },
    {
      id: "survival",
      label: "Quem sobe e se mantém na temporada seguinte (mediana das ligas)",
      target: "entre 30% e 65%",
      measured: pct(survivalMedian),
      pass: survivalMedian >= 0.3 && survivalMedian <= 0.65,
    },
    {
      id: "reversion",
      label: "Tendência à média: força dos clubes depois de todas as temporadas, menos a base",
      target: "99% dos clubes a no máximo 6 pontos da base, nos dois sentidos",
      measured: `p1 ${fixed(metrics.driftP01)}, p99 +${fixed(metrics.driftP99)}`,
      pass: metrics.driftP99 <= 6 && metrics.driftP01 >= -6,
    },
    {
      id: "libertadores",
      label: "Libertadores com Brasil e Argentina à frente",
      target: "pelo menos 70% dos títulos",
      measured: pct(libertadoresBig),
      pass: libertadoresBig >= 0.7,
    },
    {
      id: "champions",
      label: "Champions League com Inglaterra e Espanha à frente",
      target: "pelo menos 50% dos títulos",
      measured: pct(championsTop),
      pass: championsTop >= 0.5,
    },
    {
      id: "continental-dynasty",
      label: "Primária continental sem bola de neve: fatia do maior campeão de cada mundo",
      target: "mediana de no máximo 45% (Flamengo e Palmeiras ganharam 5 das últimas 7 Libertadores)",
      measured: `Champions ${pct(metrics.continentalTopShare["cont1:UEFA"] ?? 0)}, Libertadores ${pct(
        metrics.continentalTopShare["cont1:CONMEBOL"] ?? 0,
      )}`,
      pass: Object.values(metrics.continentalTopShare).every((value) => value <= 0.45),
    },
    {
      id: "intercontinental",
      label: "Intercontinental ganha pelo campeão europeu",
      target: "entre 70% e 95% (clubes europeus ganharam 17 dos últimos 18 mundiais)",
      measured: pct(metrics.intercontinentalUefa),
      pass: metrics.intercontinentalUefa >= 0.7 && metrics.intercontinentalUefa <= 0.95,
    },
    {
      id: "club-world-cup",
      label: "Mundial de Clubes ganho por clube europeu",
      target: "pelo menos 60%",
      measured: pct(metrics.clubWorldCupUefa),
      pass: metrics.clubWorldCupUefa >= 0.6,
    },
    {
      id: "world-cup",
      label: "Copa do Mundo ganha por uma das 8 seleções mais fortes",
      target: "pelo menos 70% das edições; fora de UEFA e CONMEBOL no máximo 10%",
      measured: `${pct(metrics.worldCupTopEight)}; fora ${pct(metrics.worldCupOutsideBig)}`,
      pass: metrics.worldCupTopEight >= 0.7 && metrics.worldCupOutsideBig <= 0.1,
    },
    {
      id: "speed",
      label: "Uma temporada do mundo inteiro (todas as ligas, copas e torneios)",
      target: "no máximo 3 ms",
      measured: `${fixed(metrics.msPerSeason, 2)} ms`,
      pass: metrics.msPerSeason <= 3,
    },
  ];
}

/** O nome curto de um clube ou o código, para o relatório. */
export function clubName(id: string): string {
  if (id.startsWith("generic:")) return `Campeão ${id.slice(8)}`;
  return getClub(id)?.short ?? id;
}
