import { type CareerSetup, type ChallengeHand, challengeSetup, dailyHand } from "@craque/engine";
import { upperName } from "../../i18n/format";
import type { Locale } from "../../i18n/types";
import { type DraftData, SURNAME_MAX } from "../career/draft";

/**
 * Como a tentativa do desafio nasce (GDD 27.1): a mão do dia decide semente,
 * ano, nação e posição; do rascunho vêm só o que é livre (sobrenome, pé,
 * número dos sonhos e aparência).
 */

const hands = new Map<string, ChallengeHand>();

/** A mão do dia, calculada uma vez por dia e guardada. */
export function handOf(day: string): ChallengeHand {
  let hand = hands.get(day);
  if (!hand) {
    hand = dailyHand(day);
    hands.set(day, hand);
  }
  return hand;
}

export function challengeCareerSetup(day: string, draft: DraftData, locale: Locale): CareerSetup {
  return challengeSetup(handOf(day), {
    surname: upperName(draft.surname, locale).slice(0, SURNAME_MAX),
    foot: draft.foot,
    dreamNumber: draft.dreamNumber,
  });
}
