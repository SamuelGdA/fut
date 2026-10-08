import { getCountry, getLeague } from "@craque/world";
import { type CoachCareer, type ObjectiveKind, sortTable, squadOf } from "@craque/engine/coach";
import type { PolicyCounters } from "./run";

/**
 * Retrato de uma temporada para as metas do harness: o mundo (ligas, copas,
 * continentais, elencos) e o treinador. Só números simples, para os
 * trabalhadores devolverem ao processo principal sem copiar a carreira.
 */

export interface LeagueSnap {
  readonly id: string;
  readonly country: string;
  readonly division: number;
  readonly clubs: number;
  readonly champion: string;
  /** Posto do campeão pela força no começo da temporada (1 = o mais forte). */
  readonly championRank: number;
  readonly championPoints: number;
  readonly games: number;
  /** Força média dos clubes da liga no fim da temporada. */
  readonly meanStrength: number;
}

export interface CoachSnap {
  readonly club: string;
  readonly country: string;
  readonly division: number;
  readonly objective: ObjectiveKind;
  readonly expected: number;
  readonly position: number | null;
  readonly met: boolean;
  readonly dismissed: boolean;
  readonly confidence: number;
  /** Nota da temporada na avaliação (s). */
  readonly score: number;
  readonly promoted: boolean;
  readonly relegated: boolean;
  readonly titles: number;
  readonly majorTitles: number;
  readonly reputation: number;
  readonly injuries: number;
  readonly seriousInjuries: number;
  readonly injuryDays: number;
  readonly purchases: number;
  readonly purchaseTries: number;
  readonly available: number;
  readonly cash: number;
  readonly revenue: number;
  readonly wageShare: number;
  readonly strength: number;
  readonly strengthStart: number;
}

export interface SeasonSnap {
  readonly seasonIndex: number;
  readonly year: number;
  readonly leagues: readonly LeagueSnap[];
  /** Confederação do campeão do Mundial de Clubes (quando houve). */
  readonly clubWorldCup: { readonly winner: string; readonly runnerUp: string; readonly europeans: number; readonly entrants: number } | null;
  readonly intercontinental: { readonly winner: string } | null;
  readonly continental: readonly { readonly id: string; readonly championCountry: string }[];
  readonly squadSizes: readonly number[];
  readonly activePlayers: number;
  readonly coach: CoachSnap | null;
}

function confederation(career: CoachCareer, club: string | null): string {
  if (!club) return "";
  const country = career.clubs[club]?.country;
  return country ? (getCountry(country)?.confederation ?? "") : "GEN";
}

/** Força de cada clube no começo da temporada (para o posto do campeão). */
export function strengthsAtStart(career: CoachCareer): Map<string, number> {
  return new Map(Object.values(career.clubs).map((club) => [club.id, club.strength]));
}

export function snapshot(career: CoachCareer, start: ReadonlyMap<string, number>, counters: PolicyCounters): SeasonSnap {
  const leagues: LeagueSnap[] = [];
  for (const state of Object.values(career.competitions)) {
    if (state.kind !== "league" || !state.table || !state.country) continue;
    const league = getLeague(state.id.replace(/^league:/, ""));
    if (!league) continue;
    const table = sortTable(state.table, (club) => career.clubs[club]?.strength ?? 0);
    const champion = table[0];
    if (!champion) continue;
    const byStrength = [...state.entrants].sort((a, b) => (start.get(b) ?? 0) - (start.get(a) ?? 0) || a.localeCompare(b));
    const strengths = state.entrants.map((club) => career.clubs[club]?.strength ?? 0);
    leagues.push({
      id: league.id,
      country: league.country,
      division: league.division,
      clubs: state.entrants.length,
      champion: champion.club,
      championRank: byStrength.indexOf(champion.club) + 1,
      championPoints: champion.points,
      games: champion.played,
      meanStrength: strengths.reduce((total, value) => total + value, 0) / Math.max(1, strengths.length),
    });
  }
  const cwc = career.competitions.clubworldcup;
  const inter = career.competitions.intercontinental;
  const continental = Object.values(career.competitions)
    .filter((state) => state.kind === "cont1" && state.champion)
    .map((state) => ({ id: state.id, championCountry: career.clubs[state.champion ?? ""]?.country ?? "" }));
  const squadSizes = Object.keys(career.clubs).map((club) => squadOf(career, club).length);
  let coach: CoachSnap | null = null;
  const state = career.coach;
  const review = career.review;
  const history = career.history[career.history.length - 1];
  if (state && review && history) {
    const club = career.clubs[state.club];
    const reports = career.stageReports.filter((report) => report.year === career.year);
    const injuries = reports.flatMap((report) => report.injuries);
    const wages = squadOf(career, state.club).reduce((total, player) => total + player.wage, 0) * 12;
    coach = {
      club: state.club,
      country: club?.country ?? "",
      division: history.division,
      objective: history.objective.kind,
      expected: history.objective.expected,
      position: history.position,
      met: review.objectiveMet,
      dismissed: review.dismissed,
      confidence: review.confidence,
      score: review.score,
      promoted: history.promoted,
      relegated: history.relegated,
      titles: history.titles.length,
      majorTitles: history.titles.filter((title) => title.startsWith("league:") || title.startsWith("cont1") || title === "clubworldcup").length,
      reputation: career.reputation,
      injuries: injuries.length,
      seriousInjuries: injuries.filter((injury) => injury.kind === "serious").length,
      injuryDays: injuries.reduce((total, injury) => total + injury.days, 0),
      purchases: counters.purchases,
      purchaseTries: counters.purchaseTries,
      available: counters.available,
      cash: club?.cash ?? 0,
      revenue: club?.revenue ?? 0,
      wageShare: club ? wages / Math.max(1, club.revenue) : 0,
      strength: club?.strength ?? 0,
      strengthStart: start.get(state.club) ?? 0,
    };
  }
  return {
    seasonIndex: career.seasonIndex,
    year: career.year,
    leagues,
    clubWorldCup: cwc?.champion
      ? {
          winner: confederation(career, cwc.champion),
          runnerUp: confederation(career, cwc.runnerUp),
          europeans: cwc.entrants.filter((club) => confederation(career, club) === "UEFA").length,
          entrants: cwc.entrants.length,
        }
      : null,
    intercontinental: inter?.champion ? { winner: confederation(career, inter.champion) } : null,
    continental,
    squadSizes,
    activePlayers: Object.keys(career.players).length,
    coach,
  };
}
