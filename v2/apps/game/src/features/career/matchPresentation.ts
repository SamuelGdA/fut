import { dramaHint, sceneOption, type Locale } from "@craque/content";
import { isKeeperSave, matchActionKind, type KeyMatch, type Position } from "@craque/engine";
import { d74 } from "../../i18n/d74";
export function matchOptionText(locale: Locale, match: KeyMatch, action: string, position: Position): string {
  const contextual = sceneOption(locale, match.scene, action);
  if (contextual) return contextual;
  const copy = d74(locale); const kind = matchActionKind(position, match, action);
  return action === "team" ? copy.team : action === "safe" ? copy.safe : kind === "save" ? copy.keeper : kind === "tackle" ? copy.defensive : kind === "pass" ? copy.pass : copy.shot;
}
export function matchOptionHint(locale: Locale, match: KeyMatch, action: string, position: Position): string {
  // Pênalti contra o goleiro (D91): o canto do cobrador já está escolhido; acertar o lado é defender.
  if (isKeeperSave(position, match.scene) && (action === "left" || action === "right")) return action === "left"
    ? { pt: "O cobrador já escolheu o canto. Acertou o lado, defendeu.", en: "The taker has already picked a side. Guess it and you save.", es: "El lanzador ya eligió el lado. Si aciertas, lo paras." }[locale]
    : { pt: "Metade da chance para cada lado.", en: "Half the chance on each side.", es: "La mitad de probabilidad en cada lado." }[locale];
  if (["left", "right", "take", "leave"].includes(action)) return action === "take" ? { pt: "Mais protagonismo.", en: "More spotlight.", es: "Más protagonismo." }[locale] : action === "leave" ? { pt: "Sem bônus individual.", en: "No personal bonus.", es: "Sin bono individual." }[locale] : dramaHint(locale, action, position);
  return { pt: { bold: "Mais protagonismo.", team: "Bônus individual menor.", safe: "Sem bônus individual." }, en: { bold: "More spotlight.", team: "Smaller personal bonus.", safe: "No personal bonus." }, es: { bold: "Más protagonismo.", team: "Bono individual menor.", safe: "Sin bono individual." } }[locale][action as "bold" | "team" | "safe"] ?? "";
}
