import { predictabilityHint } from "./tactics";
import { leaguePosition, leagueState } from "./review";
import type { CoachCareer, Moment, PeriodReport, PlayerChange, RelationChange } from "./types";
import { squadOf } from "./world";

/**
 * O resumo de cada período (spec 16): classificação, competições, objetivo,
 * destaques, revelações, decepções, OVR, lesões, relações, finanças e
 * momentos. No lento, o primeiro é parcial e o segundo, final.
 */
export function buildReport(career: CoachCareer, changes: readonly PlayerChange[], relations: readonly RelationChange[], final: boolean, partial: boolean): PeriodReport {
  const coach = career.coach;
  if (!coach) throw new Error("coach: relatório sem clube");
  const squad = squadOf(career, coach.club);
  const league = leagueState(career, coach.club);
  const row = league?.table?.find((entry) => entry.club === coach.club);
  const average = (id: string) => {
    const player = career.players[id];
    if (!player || player.season.rated === 0) return 0;
    return player.season.ratingSum / player.season.rated;
  };
  const regulars = squad.filter((player) => player.season.apps >= 3);
  const highlights = [...regulars].sort((a, b) => average(b.id) - average(a.id) || b.season.goals - a.season.goals).slice(0, 3).map((player) => player.id);
  const revelations = squad
    .filter((player) => career.year - player.birthYear <= 21 && player.season.apps >= 4 && (average(player.id) >= 6.8 || changes.some((change) => change.player === player.id && change.to - change.from >= 2)))
    .map((player) => player.id)
    .slice(0, 3);
  const disappointments = squad
    .filter((player) => (player.role === "star" || player.role === "starter") && player.season.apps >= 4 && average(player.id) < 6.3)
    .map((player) => player.id)
    .slice(0, 3);
  const competitions = Object.values(career.competitions)
    .filter((state) => state.entrants.includes(coach.club) && state.kind !== "league")
    .map((state) => ({ competition: state.id, reached: state.reached[coach.club] ?? "entered", champion: state.champion === coach.club }));
  const moments: Moment[] = [...career.ledger.moments];
  for (const state of Object.values(career.competitions)) {
    if (state.champion === coach.club && final) moments.push({ kind: "title", competition: state.id });
  }
  const club = career.clubs[coach.club];
  return {
    year: career.year,
    half: career.half,
    final,
    partial,
    club: coach.club,
    league: league?.id ?? "",
    position: leaguePosition(career, coach.club),
    tableSize: league?.table?.length ?? 0,
    objective: coach.objective,
    record: {
      won: row?.won ?? 0,
      drawn: row?.drawn ?? 0,
      lost: row?.lost ?? 0,
      goalsFor: row?.goalsFor ?? 0,
      goalsAgainst: row?.goalsAgainst ?? 0,
    },
    competitions,
    highlights,
    revelations,
    disappointments,
    ovrChanges: [...changes].sort((a, b) => Math.abs(b.to - b.from) - Math.abs(a.to - a.from)),
    injuries: career.ledger.injuries.filter((injury) => injury.days >= 10),
    relations,
    finance: {
      revenue: career.ledger.revenue,
      wages: career.ledger.wages,
      transfers: career.ledger.transfersIn - career.ledger.transfersOut,
      prizes: career.ledger.prizes,
      cash: club?.cash ?? 0,
      budget: coach.budget,
    },
    moments,
    predictabilityHint: predictabilityHint(coach.predictability.value),
    promises: career.promises.filter((promise) => promise.status !== "active" && promise.until <= career.day).map((promise) => ({ id: promise.id, status: promise.status })),
    newTraits: [...career.ledger.newTraits],
  };
}
