import { matchActionKind, type KeyMatchResult, type Position } from "@craque/engine";
import { getClub, getCountry } from "@craque/world";
import type { Locale } from "./i18n";
import { sceneOption } from "./matchScenes";
import { matchOutcomeText } from "./matchOutcome";

/** Crônica do lance real: não inventa um gol, uma taça ou uma defesa que não houve. */
export function matchStory(locale: Locale, result: KeyMatchResult, position: Position, surname?: string): { title: string; body: string } {
  const { match, success, won } = result;
  const draw = match.stage === "league" && result.score[0] === result.score[1];
  const name = surname || { pt: "o protagonista", en: "the player", es: "el protagonista" }[locale];
  const opponent = (match.national ? getCountry(match.opponent)?.names[locale] : getClub(match.opponent)?.short) ?? match.opponent;
  const choice = sceneOption(locale, match.scene, result.action) ?? "";
  const editorialChoices: Partial<Record<KeyMatchResult["match"]["scene"], string>> = {
    bicycle: "Control facing away from goal",
    firstTouch: "Shield facing away from goal",
    lastBlock: "Stay upright",
  };
  const editorialChoice = locale === "en" && result.action === "safe" ? editorialChoices[match.scene] : undefined;
  const chosen = (editorialChoice ?? choice).toLocaleLowerCase(locale);
  const action = ["left", "right"].includes(result.action) ? {
    pt: position === "gk" ? `se lançar para o ${chosen}` : `bater no ${chosen}`,
    en: position === "gk" ? `dive towards the ${chosen}` : `aim for the ${chosen}`,
    es: position === "gk" ? `lanzarse hacia ${chosen.startsWith("lado") ? "el" : "la"} ${chosen}` : `rematar a la ${chosen}`,
  }[locale] : chosen;
  const kind = matchActionKind(position, match, result.action);
  const safe = result.action === "safe";
  const penalties = result.penalties?.join(" × ");
  const endings = {
    pt: match.stage === "final" ? won ? "A taça veio depois de uma final para guardar na memória." : "A taça ficou com o adversário." : match.stage === "league" ? won ? "Três pontos para guardar na memória." : "A derrota deixou esse lance atravessado." : won ? "O time seguiu em frente." : "A campanha terminou ali.",
    en: match.stage === "final" ? won ? "The team lifted the trophy after a final to remember." : "The opposition lifted the trophy." : match.stage === "league" ? won ? "Three points to remember." : "That moment lingered after the defeat." : won ? "The team went through." : "The campaign ended there.",
    es: match.stage === "final" ? won ? "El equipo levantó la copa tras una final para recordar." : "El rival levantó la copa." : match.stage === "league" ? won ? "Tres puntos para recordar." : "La derrota dejó esa jugada pendiente." : won ? "El equipo siguió adelante." : "La campaña terminó allí.",
  };
  // A manchete nasce do que o lance fez e da fase (D88): dois lances do mesmo ano não repetem título.
  const stage = {
    pt: { final: "a final", semi: "a semifinal", quarter: "as quartas", league: "a rodada" },
    en: { final: "the final", semi: "the semi-final", quarter: "the quarter-final", league: "the matchday" },
    es: { final: "la final", semi: "la semifinal", quarter: "los cuartos", league: "la jornada" },
  }[locale][match.stage];
  const plural = match.stage === "quarter";
  const raw = {
    pt: safe ? `o time decidiu ${stage}` : !success ? `${stage} ${plural ? "escaparam" : "escapou"} por um detalhe` : result.goals ? `o gol que marcou ${stage}` : result.assists ? `o passe que mudou ${stage}` : kind === "save" ? `as mãos que seguraram ${stage}` : kind === "tackle" ? `o corte que salvou ${stage}` : `confiança em ${stage}`,
    en: safe ? `the team settled ${stage}` : !success ? `${stage} slipped away` : result.goals ? `the goal that defined ${stage}` : result.assists ? `the pass that changed ${stage}` : kind === "save" ? `the hands that held ${stage}` : kind === "tackle" ? `the challenge that saved ${stage}` : `trust in ${stage}`,
    es: safe ? `el equipo decidió ${stage}` : !success ? `${stage} ${plural ? "se escaparon" : "se escapó"} por un detalle` : result.goals ? `el gol que marcó ${stage}` : result.assists ? `el pase que cambió ${stage}` : kind === "save" ? `las manos que sostuvieron ${stage}` : kind === "tackle" ? `el corte que salvó ${stage}` : `confianza en ${stage}`,
  }[locale];
  const title = raw.charAt(0).toLocaleUpperCase(locale) + raw.slice(1);
  const stakes = { pt: match.stage === "final" ? "Com a taça em jogo" : match.stage === "league" ? "Com o placar empatado" : "Com a vaga em jogo", en: match.stage === "final" ? "With the trophy at stake" : match.stage === "league" ? "With the scores level" : "With qualification at stake", es: match.stage === "final" ? "Con la copa en juego" : match.stage === "league" ? "Con el marcador empatado" : "Con el pase en juego" }[locale];
  const context = match.score[0] < match.score[1] ? { pt: `Perdendo por ${match.score.join(" × ")}`, en: `Trailing ${match.score.join(" × ")}`, es: `Perdiendo por ${match.score.join(" × ")}` }[locale] : stakes;
  const opening = { pt: `${context}, aos ${match.minute} minutos contra ${opponent}, ${name} decidiu ${action}.`, en: `${context}, in minute ${match.minute} against ${opponent}, ${name} chose to ${action}.`, es: `${context}, en el minuto ${match.minute} ante ${opponent}, ${name} eligió ${action}.` }[locale];
  const pens = penalties ? { pt: ` Nos pênaltis: ${penalties}.`, en: ` On penalties: ${penalties}.`, es: ` En los penaltis: ${penalties}.` }[locale] : "";
  const ending = draw ? match.score[0] < match.score[1]
    ? { pt: "A reação arrancou um ponto quando a derrota parecia próxima.", en: "The comeback rescued a point when defeat looked close.", es: "La reacción rescató un punto cuando la derrota parecía cerca." }[locale]
    : { pt: "Ninguém marcou depois do lance e o empate resistiu até o apito final.", en: "Neither side scored after the move and the draw lasted until the final whistle.", es: "Nadie marcó después de la jugada y el empate resistió hasta el pitido final." }[locale]
    : endings[locale];
  const consequence = matchOutcomeText(locale, result, position, true, "newspaper");
  return { title, body: `${opening} ${consequence} ${ending}${pens}` };
}
