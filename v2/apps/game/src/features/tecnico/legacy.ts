import type { CoachCareer } from "@craque/engine/coach";

/** Totais do treinador: todas as partidas registradas, incluindo as copas. */
export function coachTotals(career: CoachCareer) {
  const record = career.history.reduce((total, entry) => {
    if (entry.record) for (const key of ["won", "drawn", "lost", "goalsFor", "goalsAgainst"] as const) total[key] += entry.record[key];
    return total;
  }, { won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 });
  const games = record.won + record.drawn + record.lost;
  return { ...record, games, rate: games ? (record.won * 3 + record.drawn) / (games * 3) : 0, seasons: career.history.filter((entry) => !entry.partial).length, clubs: new Set(career.history.map((entry) => entry.club)).size, titles: career.history.flatMap((entry) => entry.titles).length };
}

export function coachPeak(career: CoachCareer) {
  return career.history.reduce((best, season) => !best || season.reputationAfter > best.reputationAfter
    || (season.reputationAfter === best.reputationAfter && season.titles.length > best.titles.length) ? season : best, career.history[0]);
}
