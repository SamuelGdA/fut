import type { CoachCareer, CompetitionStats } from "@craque/engine/coach";
export const EMPTY_STATS:Required<CompetitionStats>={apps:0,starts:0,minutes:0,goals:0,assists:0,cleanSheets:0,goalsConceded:0,ratingSum:0};
export function playerCompetitionStats(career:CoachCareer,player:string):Array<{competition:string;stats:CompetitionStats}> {
  return Object.entries(career.competitionStats).flatMap(([competition,rows])=>rows[player] ? [{competition,stats:rows[player]}] : []);
}
export function totalStats(rows:readonly CompetitionStats[]):Required<CompetitionStats> {
  const result={...EMPTY_STATS};
  for(const row of rows)for(const key of Object.keys(result) as Array<keyof CompetitionStats>)result[key]+=row[key] ?? 0;
  return result;
}
