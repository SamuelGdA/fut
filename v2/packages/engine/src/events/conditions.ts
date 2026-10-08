import type { Condition, EventContext } from "./model";

/** Avalia uma condição contra o momento da carreira. */
export function holds(condition: Condition, context: EventContext): boolean {
  switch (condition.kind) {
    case "age":
      return context.age >= (condition.min ?? 0) && context.age <= (condition.max ?? 99);
    case "lastGames":
      return context.lastGames >= condition.min;
    case "role":
      return context.lastRole !== null && condition.in.includes(context.lastRole);
    case "seasonsAtClub":
      return context.seasonsAtClub >= condition.min;
    case "continental":
      return context.continental;
    case "knockout":
      return context.knockout;
    case "rivalClubInterested":
      return context.rivalClubInterested;
    case "derby":
      return context.derby;
    case "clubDecline":
      return context.clubDecline >= condition.min;
    case "tenFree":
      return context.tenFree;
    case "abroad":
      return context.abroadSeasons >= condition.min;
    case "value":
      return context.value >= condition.min;
    case "nationWeakOrUncapped":
      return context.nationWeakOrUncapped;
    case "residenceEligible":
      return context.residenceEligible === true;
    case "legacyElsewhere":
      return context.legacyClub !== null;
    case "tournamentSquad":
      return context.tournamentSquad;
    case "fans":
      return context.fans >= (condition.min ?? 0) && context.fans <= (condition.max ?? 100);
    case "ovr":
      return context.ovr >= condition.min;
    case "trait":
      return condition.in.includes(context.trait);
    case "neighbourPosition":
      return context.neighbourPosition !== null;
    case "prestigeNumberFree":
      return context.prestigeNumbers.length > 0;
    case "homage":
      return context.homageNumbers.length > 0;
    case "any":
      return condition.of.some((inner) => holds(inner, context));
  }
}

export function allHold(conditions: readonly Condition[], context: EventContext): boolean {
  return conditions.every((condition) => holds(condition, context));
}
