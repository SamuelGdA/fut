import { matchActionKind, type KeyMatchResult, type Position } from "@craque/engine";
import { getClub, getCountry } from "@craque/world";
import type { Locale } from "./i18n";
import { sceneOption } from "./matchScenes";
import { matchOutcomeText } from "./matchOutcome";
import { textSeed } from "./matchHeadlines";

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
  // D106: cada lance escolhe a própria variante (o mesmo lance, sempre a mesma), para o jornal não repetir frases de um ano para o outro.
  const seed = textSeed(match.competition, match.opponent, match.minute, match.scene, result.action);
  const pick = <T,>(items: readonly T[], salt = 0): T => items[(seed + salt) % items.length] as T;
  const endingPools = {
    pt: match.stage === "final"
      ? won ? ["A taça veio depois de uma final para guardar na memória.", "Na volta olímpica, o estádio inteiro cantava o nome dele.", "A taça subiu, e aquele lance vai ser contado por anos.", "Choro, abraço e taça erguida: uma final para a história do clube."] : ["A taça ficou com o adversário.", "O troféu passou perto e foi parar nas mãos do adversário.", "A medalha de prata pesou no peito na volta para o vestiário.", "O adversário fez a festa, e o lance ficou como o que podia ter sido."]
      : match.stage === "league" ? won ? ["Três pontos para guardar na memória.", "A arquibancada explodiu, e a tabela sentiu o golpe.", "Vitória suada, daquelas que mudam o humor de uma temporada.", "O apito final veio com o estádio de pé."] : ["A derrota deixou esse lance atravessado.", "O vestiário ficou em silêncio depois do apito.", "Três pontos escaparam, e a rodada terminou amarga.", "A torcida saiu cabisbaixa, ainda remoendo o lance."]
      : won ? ["O time seguiu em frente.", "A classificação veio, e o sonho da taça continua vivo.", "O mata-mata ficou para trás, com festa no gramado.", "Vaga garantida, e a confiança do grupo foi lá em cima."] : ["A campanha terminou ali.", "A eliminação doeu, e o lance ficou na garganta.", "O sonho da taça acabou naquela noite.", "Fim da linha na competição, com o elenco de cabeça baixa."],
    en: match.stage === "final"
      ? won ? ["The team lifted the trophy after a final to remember.", "On the lap of honour, the whole stadium sang his name.", "The trophy went up, and that moment will be retold for years.", "Tears, hugs and a raised trophy: a final for the history books."] : ["The opposition lifted the trophy.", "The trophy came close and ended up in the opposition's hands.", "The silver medal felt heavy on the walk back to the dressing room.", "The opposition celebrated, and the moment became a what-if."]
      : match.stage === "league" ? won ? ["Three points to remember.", "The stands erupted, and the table felt it.", "A hard-fought win, the kind that changes the mood of a season.", "The final whistle came with the whole stadium on its feet."] : ["That moment lingered after the defeat.", "The dressing room went quiet after the whistle.", "Three points slipped away, and the matchday ended bitter.", "The fans left with heads bowed, still replaying the moment."]
      : won ? ["The team went through.", "Qualification came, and the dream of the trophy lives on.", "The tie was won, with celebrations on the pitch.", "Through to the next round, and the squad's belief soared."] : ["The campaign ended there.", "Elimination hurt, and the moment stuck in the throat.", "The dream of the trophy ended that night.", "The end of the road, with the squad heads down."],
    es: match.stage === "final"
      ? won ? ["El equipo levantó la copa tras una final para recordar.", "En la vuelta olímpica, todo el estadio coreaba su nombre.", "La copa subió, y esa jugada se va a contar durante años.", "Lágrimas, abrazos y copa en alto: una final para la historia del club."] : ["El rival levantó la copa.", "El trofeo pasó cerca y terminó en manos del rival.", "La medalla de plata pesó en el regreso al vestuario.", "El rival hizo la fiesta, y la jugada quedó como lo que pudo ser."]
      : match.stage === "league" ? won ? ["Tres puntos para recordar.", "La grada explotó, y la tabla sintió el golpe.", "Una victoria sufrida, de esas que cambian el ánimo de una temporada.", "El pitido final llegó con el estadio de pie."] : ["La derrota dejó esa jugada pendiente.", "El vestuario quedó en silencio después del pitido.", "Se escaparon tres puntos, y la jornada terminó amarga.", "La afición se fue cabizbaja, todavía pensando en la jugada."]
      : won ? ["El equipo siguió adelante.", "Llegó la clasificación, y el sueño de la copa sigue vivo.", "La eliminatoria quedó atrás, con fiesta en el césped.", "Pase asegurado, y la confianza del grupo se fue por las nubes."] : ["La campaña terminó allí.", "La eliminación dolió, y la jugada quedó atragantada.", "El sueño de la copa terminó esa noche.", "Fin del camino en la competición, con el plantel cabizbajo."],
  };
  const endings = { pt: pick(endingPools.pt, 1), en: pick(endingPools.en, 1), es: pick(endingPools.es, 1) };
  // A manchete nasce do que o lance fez e da fase (D88): dois lances do mesmo ano não repetem título.
  const stage = {
    pt: { final: "a final", semi: "a semifinal", quarter: "as quartas", league: "a rodada" },
    en: { final: "the final", semi: "the semi-final", quarter: "the quarter-final", league: "the matchday" },
    es: { final: "la final", semi: "la semifinal", quarter: "los cuartos", league: "la jornada" },
  }[locale][match.stage];
  const plural = match.stage === "quarter";
  // D106: três a quatro manchetes para cada desfecho, todas presas ao que o lance fez.
  const category = safe ? "safe" : !success ? "miss" : result.goals ? "goal" : result.assists ? "assist" : kind === "save" ? "save" : kind === "tackle" ? "tackle" : "trust";
  const titles = {
    pt: {
      safe: [`o time decidiu ${stage}`, `o coletivo falou mais alto`, `paciência para resolver ${stage}`],
      miss: [`${stage} ${plural ? "escaparam" : "escapou"} por um detalhe`, `por centímetros, ${stage} ${plural ? "fugiram" : "fugiu"}`, `o lance que ainda dói`, `quase: ${stage} ${plural ? "ficaram" : "ficou"} no caminho`],
      goal: [`o gol que marcou ${stage}`, `${name} balança a rede`, `um gol para a história`, `explosão: gol de ${name}`],
      assist: [`o passe que mudou ${stage}`, `a assistência que ninguém viu chegar`, `${name} serve, o time comemora`, `visão de jogo decide ${stage}`],
      save: [`as mãos que seguraram ${stage}`, `um paredão em noite grande`, `${name} fecha o gol`, `a defesa que salvou ${stage}`],
      tackle: [`o corte que salvou ${stage}`, `${name} não deixa passar`, `a muralha resistiu`, `a interceptação do jogo`],
      trust: [`confiança em ${stage}`, `cabeça fria em ${stage}`, `o lance pensado`],
    },
    en: {
      safe: [`the team settled ${stage}`, `the collective won ${stage}`, `patience settled ${stage}`],
      miss: [`${stage} slipped away`, `inches from glory`, `the moment that still hurts`, `so close: ${stage} got away`],
      goal: [`the goal that defined ${stage}`, `${name} finds the net`, `a goal for the history books`, `bedlam: ${name} scores`],
      assist: [`the pass that changed ${stage}`, `the assist nobody saw coming`, `${name} serves, the team celebrates`, `vision decides ${stage}`],
      save: [`the hands that held ${stage}`, `a brick wall on a big night`, `${name} shuts the door`, `the save that rescued ${stage}`],
      tackle: [`the challenge that saved ${stage}`, `${name} lets nothing through`, `the wall held firm`, `the interception of the night`],
      trust: [`trust in ${stage}`, `a cool head in ${stage}`, `the thinking move`],
    },
    es: {
      safe: [`el equipo decidió ${stage}`, `el colectivo pesó más en ${stage}`, `paciencia para resolver ${stage}`],
      miss: [`${stage} ${plural ? "se escaparon" : "se escapó"} por un detalle`, `por centímetros, ${stage} ${plural ? "se fueron" : "se fue"}`, `la jugada que todavía duele`, `casi: ${stage} ${plural ? "quedaron" : "quedó"} en el camino`],
      goal: [`el gol que marcó ${stage}`, `${name} rompe la red`, `un gol para la historia`, `locura: gol de ${name}`],
      assist: [`el pase que cambió ${stage}`, `la asistencia que nadie vio venir`, `${name} sirve, el equipo celebra`, `la visión decide ${stage}`],
      save: [`las manos que sostuvieron ${stage}`, `un muro en una noche grande`, `${name} cierra la portería`, `la parada que salvó ${stage}`],
      tackle: [`el corte que salvó ${stage}`, `${name} no deja pasar nada`, `la muralla resistió`, `la intercepción de la noche`],
      trust: [`confianza en ${stage}`, `cabeza fría en ${stage}`, `la jugada pensada`],
    },
  };
  const raw = pick(titles[locale][category]);
  const title = raw.charAt(0).toLocaleUpperCase(locale) + raw.slice(1);
  const stakes = { pt: match.stage === "final" ? "Com a taça em jogo" : match.stage === "league" ? "Com o placar empatado" : "Com a vaga em jogo", en: match.stage === "final" ? "With the trophy at stake" : match.stage === "league" ? "With the scores level" : "With qualification at stake", es: match.stage === "final" ? "Con la copa en juego" : match.stage === "league" ? "Con el marcador empatado" : "Con el pase en juego" }[locale];
  const context = match.score[0] < match.score[1] ? { pt: `Perdendo por ${match.score.join(" × ")}`, en: `Trailing ${match.score.join(" × ")}`, es: `Perdiendo por ${match.score.join(" × ")}` }[locale] : stakes;
  const openings = {
    pt: [`${context}, aos ${match.minute} minutos contra ${opponent}, ${name} decidiu ${action}.`, `Minuto ${match.minute} contra ${opponent}. ${context}, o estádio prendeu a respiração quando ${name} decidiu ${action}.`, `${context} contra ${opponent}, aos ${match.minute} minutos, a bola chegou a ${name}, que decidiu ${action}.`],
    en: [`${context}, in minute ${match.minute} against ${opponent}, ${name} chose to ${action}.`, `Minute ${match.minute} against ${opponent}. ${context}, the stadium held its breath as ${name} chose to ${action}.`, `${context} against ${opponent}, in minute ${match.minute}, the ball reached ${name}, who chose to ${action}.`],
    es: [`${context}, en el minuto ${match.minute} ante ${opponent}, ${name} eligió ${action}.`, `Minuto ${match.minute} ante ${opponent}. ${context}, el estadio contuvo el aliento cuando ${name} eligió ${action}.`, `${context} ante ${opponent}, en el minuto ${match.minute}, el balón llegó a ${name}, que eligió ${action}.`],
  };
  const opening = pick(openings[locale], 2);
  const pens = penalties ? { pt: ` Nos pênaltis: ${penalties}.`, en: ` On penalties: ${penalties}.`, es: ` En los penaltis: ${penalties}.` }[locale] : "";
  const ending = draw ? match.score[0] < match.score[1]
    ? { pt: "A reação arrancou um ponto quando a derrota parecia próxima.", en: "The comeback rescued a point when defeat looked close.", es: "La reacción rescató un punto cuando la derrota parecía cerca." }[locale]
    : { pt: "Ninguém marcou depois do lance e o empate resistiu até o apito final.", en: "Neither side scored after the move and the draw lasted until the final whistle.", es: "Nadie marcó después de la jugada y el empate resistió hasta el pitido final." }[locale]
    : endings[locale];
  const consequence = matchOutcomeText(locale, result, position, true, "newspaper");
  return { title, body: `${opening} ${consequence} ${ending}${pens}` };
}
