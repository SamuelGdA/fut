import type { CoachCareer } from "./types";

/** A cobrança acompanha o porte do clube dentro de cada competição em que entrou. */
export function cupObjectivesFor(career: CoachCareer, club: string): Array<{ competition: string; target: string }> {
  return Object.values(career.competitions).filter((state) => state.kind !== "league" && state.entrants.includes(club)).map((state) => {
    const sorted = [...state.entrants].sort((a, b) => (career.clubs[b]?.strength ?? 70) - (career.clubs[a]?.strength ?? 70) || a.localeCompare(b));
    const rank = sorted.indexOf(club) + 1;
    const rounds = state.knockoutPlan.map((entry) => entry.label);
    const wanted = state.entrants.length <= 2 ? "champion" : rank <= 2 ? "F" : rank <= 4 ? "SF" : rank <= 8 ? "QF" : rank <= 16 ? "R16" : state.groups || rounds.includes("G") ? "G" : "R32";
    return { competition: state.id, target: wanted === "champion" || rounds.includes(wanted) ? wanted : rounds[0] ?? "entered" };
  });
}

/** Metas de copas também pesam um pouco na avaliação, sem duplicar o valor dos títulos. */
export function cupObjectiveScore(career: CoachCareer): number {
  const coach = career.coach;
  if (!coach) return 0;
  let total = 0;
  for (const goal of coach.cupObjectives ?? []) {
    const state = career.competitions[goal.competition];
    if (!state?.done) continue;
    const reached = state.reached[coach.club] ?? "entered";
    const rounds = ["entered", ...state.knockoutPlan.map((phase) => phase.label), "champion"];
    const met = reached === "champion" || rounds.indexOf(reached) >= rounds.indexOf(goal.target);
    total += met ? 0.12 : -0.12;
  }
  return Math.max(-0.3, Math.min(0.3, total));
}
