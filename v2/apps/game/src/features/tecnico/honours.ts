import type { CoachAward } from "@craque/engine/coach";
import { compareHonours, type AwardKey } from "@craque/world";

export function coachAwardArt(award: CoachAward): AwardKey {
  return award.kind === "kingOfAmerica" ? "kingOfAmerica" : award.kind === "scorer" ? "topScorer" : award.kind === "coachWorld" || award.kind === "playerWorld" ? "ballonDor" : "bestPlayer";
}
export function compareCoachHonours(a: { id: string; award?: CoachAward }, b: { id: string; award?: CoachAward }): number {
  const entry = (item: typeof a) => item.award ? { kind: "award" as const, id: coachAwardArt(item.award), competition: item.award.competition ?? undefined } : { kind: "title" as const, id: item.id };
  return compareHonours(entry(a), entry(b));
}
