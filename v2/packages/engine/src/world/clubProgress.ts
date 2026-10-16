import { getCompetition, type CompetitionKind } from "@craque/world";

/** Conquistas pequenas também contam, sem permitir crescimento ilimitado. */
export const CLUB_TROPHY_PROGRESS = {
  rewards: { league: 0.4, second: 0.2, cup: 0.15, leagueCup: 0.1, superCup: 0.1, continental1: 0.6, continental2: 0.25, continental3: 0.15, continentalSuper: 0.1, intercontinental: 0.25, clubWorldCup: 0.6, nationsCup: 0, worldCup: 0 } satisfies Record<CompetitionKind, number>,
  annualCap: 1.2,
  droughtGrace: 3,
  droughtStep: 0.02,
  droughtCap: 0.06,
} as const;

/** Mesma régua para todos os clubes, nos dois modos, sem sorteio adicional. */
export function clubTrophyProgress(titles: readonly string[], previousDrought = 0) {
  const reward = [...new Set(titles)].reduce((sum, id) => {
    const competition = getCompetition(id);
    return sum + (competition ? CLUB_TROPHY_PROGRESS.rewards[competition.kind] : 0);
  }, 0);
  const drought = reward > 0 ? 0 : Math.max(0, previousDrought) + 1;
  return {
    drought,
    growth: Math.min(CLUB_TROPHY_PROGRESS.annualCap, reward),
    penalty: drought <= CLUB_TROPHY_PROGRESS.droughtGrace ? 0 : -Math.min(CLUB_TROPHY_PROGRESS.droughtCap, (drought - CLUB_TROPHY_PROGRESS.droughtGrace) * CLUB_TROPHY_PROGRESS.droughtStep),
  };
}
