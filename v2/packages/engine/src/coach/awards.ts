import { clamp } from "../math";
import type { CoachAward, CoachCareer, CoachPlayer, CompetitionStats, Fixture, MatchResult } from "./types";
import { coachRng } from "./util";
import { leagueState, leaguePosition } from "./review";
import { getCountry, getLeague } from "@craque/world";
import { RATING } from "./tuning";

/** Estatísticas de todos os clubes, por competição. O treinador não recebe concorrentes fictícios. */
export function recordCompetitionStats(career: CoachCareer, fixture: Fixture, result: MatchResult, home: readonly CoachPlayer[], away: readonly CoachPlayer[]): void {
  const stats = career.competitionStats[fixture.competition] ??= {};
  for (const [side, squad] of [["home", home], ["away", away]] as const) {
    const own = result[side], other = result[side === "home" ? "away" : "home"];
    const rng = coachRng(career.setup.seed, "competitionStats", fixture.id, side);
    const mine = result.coach?.side === side;
    const goals = new Map<string, number>(), assists = new Map<string, number>();
    const increment = (map: Map<string, number>, id: string) => map.set(id, (map.get(id) ?? 0) + 1);
    if (result.coach) {
      for (const goal of result.goals.filter((entry) => entry.side === side)) {
        if (goal.scorer) increment(goals, goal.scorer);
        if (goal.assist) increment(assists, goal.assist);
      }
    } else {
      const weight = (player: CoachPlayer) => player.position === "st" ? 8 : ["lw", "rw", "cam"].includes(player.position) ? 4 : ["cm", "lm", "rm"].includes(player.position) ? 2 : player.position === "gk" ? 0 : 0.5;
      const pool = squad.map((player) => [player.id, weight(player)] as const).filter(([, chance]) => chance > 0);
      for (let goal = 0; goal < own && pool.length; goal += 1) {
        const scorer = rng.weighted(pool); increment(goals, scorer);
        const assistants = pool.filter(([id]) => id !== scorer);
        if (assistants.length && rng.chance(0.7)) increment(assists, rng.weighted(assistants));
      }
    }
    // Todos usam a mesma régua de notas, inclusive gols, assistências e clean
    // sheets. Antes a IA ficava perto de 6,5 enquanto nossos goleadores iam a 9.
    const sideUsage=result.participants?.[side] ?? (mine ? result.coach!.used : null);
    const used = sideUsage ? sideUsage.map((entry) => ({ player: career.players[entry.player], rating: entry.rating,from:entry.from,to:entry.to,starter:entry.from===0 })) : squad.map((player) => ({ player,from:0,to:90,starter:true,rating: clamp(RATING.base
      + (own > other ? RATING.win : own < other ? RATING.loss : 0)
      + (goals.get(player.id) ?? 0) * RATING.goal + (assists.get(player.id) ?? 0) * RATING.assist
      + (other === 0 ? RATING.cleanSheet : 0) + rng.normal(0, RATING.noise), 3, 10) }));
    for (const entry of used) {
      if (!entry.player) continue;
      const row: CompetitionStats = stats[entry.player.id] ??= { apps: 0, goals: 0, assists: 0, ratingSum: 0 };
      const minutes=entry.to-entry.from;
      if(minutes<=0)continue;
      row.apps += 1; row.ratingSum += entry.rating;
      row.starts=(row.starts ?? 0)+Number(entry.starter);row.minutes=(row.minutes ?? 0)+minutes;
      const conceded=result.coach ? result.goals.filter(goal=>goal.side!==side && goal.minute>entry.from && goal.minute<=entry.to).length : other;
      row.goalsConceded=(row.goalsConceded ?? 0)+conceded;
      row.cleanSheets=(row.cleanSheets ?? 0)+Number(minutes>=60 && conceded===0);
      row.goals += goals.get(entry.player.id) ?? 0; row.assists += assists.get(entry.player.id) ?? 0;
    }
  }
}

function coachingScore(career: CoachCareer, club: string): number {
  const league = leagueState(career, club), rank = leaguePosition(career, club);
  const ranked = [...(league?.entrants ?? [])].sort((a,b) => (career.clubs[b]?.strength ?? 0) - (career.clubs[a]?.strength ?? 0) || a.localeCompare(b));
  const expected = ranked.indexOf(club) + 1;
  const over = rank === null || expected === 0 ? 0 : clamp((expected - rank) / Math.max(2, ranked.length / 5), -2, 2);
  let score = over * 2;
  for (const state of Object.values(career.competitions)) if (state.champion === club) score += state.kind === "cont1" ? 6 : state.kind === "clubworldcup" ? 7 : state.kind === "league" ? 4 : state.kind === "cup" ? 2 : 1;
  return score;
}

/** Prêmios anuais e bônus de OVR: concorrência do mesmo mundo e uma entrega por temporada. */
export function seasonAwards(career: CoachCareer): CoachAward[] {
  const coach = career.coach;
  if (!coach || career.seasonAwardsYear === career.year || career.seasonAwards.length) return career.seasonAwards;
  const awards: CoachAward[] = [], wonByPlayer = new Map<string, CoachAward[]>();
  const addPlayer = (kind: "scorer" | "playerCompetition" | "playerWorld" | "kingOfAmerica", player: string, competition: string | null) => {
    const award: CoachAward = { year: career.year, kind, player, competition };
    wonByPlayer.set(player, [...(wonByPlayer.get(player) ?? []), award]);
    if (career.players[player]?.club === coach.club) awards.push(award);
  };
  const global = new Map<string, { apps: number; goals: number; assists: number; ratingSum: number; honours: number }>();
  for (const [id, stats] of Object.entries(career.competitionStats)) {
    const state = career.competitions[id];
    if (!state?.done) continue;
    const rows = Object.entries(stats).filter(([player]) => career.players[player]);
    const maxApps = Math.max(1, ...rows.map(([, row]) => row.apps));
    const qualified = rows.filter(([, row]) => row.apps >= Math.max(2, Math.ceil(maxApps * 0.3)));
    const scorer = [...qualified].sort((a, b) => b[1].goals - a[1].goals || b[1].assists - a[1].assists || a[0].localeCompare(b[0]))[0];
    if (scorer && scorer[1].goals > 0 && state.kind !== "super" && state.kind !== "contsuper") addPlayer("scorer", scorer[0], id);
    if (!["cont2", "cont3", "super", "contsuper"].includes(state.kind)) {
      const score = ([player, row]: typeof rows[number]) => row.ratingSum / row.apps
        + 0.3 * (row.goals + 0.6 * row.assists) / row.apps + (career.players[player]?.club === state.champion ? 0.2 : 0);
      const finalists = qualified.filter(([player, row]) => row.apps >= Math.max(3, Math.ceil(maxApps * 0.6))
        && (state.kind === "league" || ["champion", "F", "FF", "SF"].includes(state.reached[career.players[player]!.club] ?? "")));
      const best = [...finalists].sort((a, b) => score(b) - score(a) || a[0].localeCompare(b[0]))[0];
      if (best) addPlayer("playerCompetition", best[0], id);
    }
    for (const [player, row] of rows) {
      const total = global.get(player) ?? { apps: 0, goals: 0, assists: 0, ratingSum: 0, honours: 0 };
      total.apps += row.apps; total.goals += row.goals; total.assists += row.assists; total.ratingSum += row.ratingSum;
      if (career.players[player]?.club === state.champion) total.honours += state.kind === "cont1" ? 1.2 : state.kind === "league" ? 0.8 : 0.3;
      global.set(player, total);
    }
  }
  const bestScore = ([player, row]: [string, typeof global extends Map<string, infer T> ? T : never]) => row.ratingSum / row.apps + 0.009 * row.goals + 0.004 * row.assists + row.honours + (career.players[player]?.ovr ?? 60) * 0.008;
  const eliteClub = (player: string) => getLeague(leagueState(career, career.players[player]?.club ?? "")?.id.replace(/^league:/, "") ?? "")?.division === 1;
  const qualifiedGlobal = [...global].filter(([player, row]) => eliteClub(player) && row.apps >= 25 && row.ratingSum / row.apps >= 7 && (career.players[player]?.ovr ?? 0) >= 78);
  const europe = (id: string) => getCountry(career.clubs[career.players[id]?.club ?? ""]?.country ?? "")?.confederation === "UEFA";
  const worldCandidates = qualifiedGlobal.filter(([id,row]) => europe(id) || (
    (career.players[id]?.ovr ?? 0) >= 92 && row.apps >= 40 && row.ratingSum / row.apps >= 8 && row.honours >= 2
    && coachRng(career.setup.seed,"worldAwardOutsideEurope",career.year,id).chance(0.025)
  ));
  const worldScore = (entry: typeof qualifiedGlobal[number]) => bestScore(entry) - (europe(entry[0]) ? 0 : 2.5);
  const best = [...worldCandidates].sort((a, b) => worldScore(b) - worldScore(a) || a[0].localeCompare(b[0]))[0];
  if (best) addPlayer("playerWorld", best[0], null);
  const america = qualifiedGlobal.filter(([player]) => {
    const country = career.clubs[career.players[player]?.club ?? ""]?.country;
    return country && ["CONMEBOL", "CONCACAF"].includes(getCountry(country)?.confederation ?? "");
  }).sort((a, b) => bestScore(b) - bestScore(a) || a[0].localeCompare(b[0]))[0];
  if (america) addPlayer("kingOfAmerica", america[0], null);
  const rankCoaches = (ids: readonly string[]) => [...ids].sort((a, b) => coachingScore(career, b) - coachingScore(career, a) || a.localeCompare(b))[0];
  const league = leagueState(career, coach.club);
  if (league && rankCoaches(league.entrants) === coach.club) awards.push({ year: career.year, kind: "coachLeague", competition: league.id, player: null });
  for (const state of Object.values(career.competitions)) if (state.kind === "cont1" && state.champion === coach.club) awards.push({ year: career.year, kind: "coachContinental", competition: state.id, player: null });
  if (rankCoaches(Object.values(career.clubs).filter((club)=>club.division===1).map((club)=>club.id)) === coach.club) awards.push({ year: career.year, kind: "coachWorld", competition: null, player: null });
  for (const [id, won] of wonByPlayer) {
    const player = career.players[id];
    if (!player) continue;
    player.level = Math.min(99, player.level + Math.min(3, won.length)); player.ovr = Math.min(99, Math.round(player.level));
    const legacy = career.legacy[id];
    if (legacy && player.club === coach.club) legacy.awards = [...(legacy.awards ?? []), ...won];
  }
  career.seasonAwards = awards;
  career.seasonAwardsYear = career.year;
  return awards;
}
