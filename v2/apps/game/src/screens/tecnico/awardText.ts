import type { CoachAward } from "@craque/engine/coach";
import { revisionText } from "../../i18n/tecnico/revision";
import { competitionName } from "./text";
import { d64 } from "../../i18n/tecnico/d64";
export { coachAwardArt as awardArtKey } from "../../features/tecnico/honours";

export function awardName(award: CoachAward, locale: "pt" | "es" | "en"): string {
  return `${award.kind === "kingOfAmerica" ? d64(locale, "kingOfAmerica") : revisionText(locale, award.kind)}${award.competition ? ` · ${competitionName(award.competition, locale)}` : ""}`;
}
