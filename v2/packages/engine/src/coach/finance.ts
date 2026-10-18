import type { CoachClub } from "./types";
import { FINANCE } from "./tuning";

/** Toda entrada respeita o teto; dívidas continuam possíveis e não são perdoadas. */
export function changeCash(club: Pick<CoachClub, "cash">, amount: number): void {
  club.cash = Math.min(FINANCE.cashCap, club.cash + amount);
}
