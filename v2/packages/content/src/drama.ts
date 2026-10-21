import type { Career, Decision, DecisionOption, KeyMatchResult } from "@craque/engine";
import { getClub, getCompetition, getCountry } from "@craque/world";
import type { Locale } from "./i18n";
import { EXTRA_MATCH_TEXTS, sceneOption } from "./matchScenes";

const pt = {
  draw: "Empate",
  keeperSpecialist: "Especialista em pênaltis", keeperSpecialistHint: "Defesas de pênalti +10 pontos de chance, até 45%. Jogos -14%.",
  match: "A bola da vez", promise: "A palavra fica", veteran: "A experiência muda o jogo",
  promiseBody: "A imprensa abriu os microfones. Que marca você quer deixar nesta temporada?", veteranBody: "O corpo mudou. Escolha como a sua experiência vai continuar decidindo jogos.",
  live: "Jogo-chave", fulfilled: "Promessa Cumprida!", failed: "Promessa Falhou", active: "Promessa", promiseAccepted: "Palavra dada", veteranChosen: "Novo capítulo",
  success: "Deu certo!", failure: "Não deu!", fullTime: "Placar final", penalties: "Pênaltis", advanced: "Classificado", eliminated: "Eliminado", champion: "Campeão", runnerUp: "Vice-campeão",
  outcomeGoal: "Você marcou o gol decisivo.", outcomeAssist: "Seu passe virou gol.", outcomeKeeper: "Sua intervenção decidiu a partida.", outcomeTeam: "A equipe resolveu o jogo.", outcomeMiss: "A chance escapou. O adversário resolveu a partida.", preserved: "Você preservou o físico, sem bônus individual.",
  fans: "Torcida", legacy: "Legado", evolution: "Evolução", chance: "de sucesso", simulated: "Projeção da temporada", games: "jogos", contributions: "gols + assistências", cleanSheets: "jogos sem sofrer gol", glory: "Artilharia, continental principal ou Bola de Ouro",
  stages: { league: "Jogo decisivo de liga", quarter: "Quartas de final", semi: "Semifinal", final: "Final" },
  scenes: {
    ...EXTRA_MATCH_TEXTS.pt,
    distribution: ["O campo inteiro à sua frente", "O adversário adiantou as linhas. Reponha com precisão ou procure uma saída curta."],
    penaltySave: ["Olho no cobrador", "O pênalti pode decidir a classificação. Leia a corrida e escolha o canto."],
    aerialDuel: ["Dono do espaço", "A bola sobe na sua área. Ataque o cruzamento ou coordene a cobertura."],
    buildUp: ["A primeira linha", "O ataque começa nos seus pés. Rompa a pressão ou faça a bola circular."],
    lastBlock: ["O último obstáculo", "O atacante prepara o chute. Encurte o espaço antes da finalização."],
    overlap: ["O corredor apareceu", "O ponta puxou a marcação. Passe por fora para chegar ao fundo."],
    cross: ["Uma bola na medida", "Há um companheiro entrando na área. Escolha o tempo do cruzamento."],
    cover: ["Nas costas da defesa", "O rival acelera pelo lado. Feche o corredor e proteja a área."],
    pressEscape: ["Cercado no meio", "Dois adversários apertam. Gire com a bola ou encontre um apoio."],
    switchPlay: ["O outro lado está livre", "A defesa fechou um lado. Uma inversão pode mudar o ataque."],
    throughBall: ["Entre as linhas", "O atacante pede a bola no espaço. O passe precisa atravessar a defesa."],
    dribble: ["Um contra um", "O marcador ficou isolado. Parta para cima ou combine com quem chega."],
    header: ["No alto da área", "O cruzamento vem na sua direção. Antecipe o zagueiro ou prepare a segunda bola."],

    penalty: ["A responsabilidade é sua", "Pênalti no fim do jogo. O goleiro tenta adivinhar seu canto."],
    shootout: ["Na marca da cal", "Tudo se resolve nos pênaltis. Escolha seu canto."],
    breakaway: ["Cara a cara", "Você escapou da marcação. Um companheiro chega livre ao lado."],
    freeKick: ["A última bola parada", "Falta perto da área. Bater direto ou encontrar quem está livre?"],
    lastAttack: ["Mais uma chance", "A defesa fechou o espaço. Ainda existe um passe entre as linhas."],
    counter: ["Campo aberto", "O rival perdeu a bola. Acelerar exige fôlego; o passe pode desmontar a defesa."],
    keeper: ["Mãos decisivas", "O atacante invade a área. Saia no tempo certo ou organize a cobertura."],
    interception: ["A leitura do lance", "O passe atravessa sua zona. Antecipe ou feche a linha de passe."],
  },
  actions: { bold: "Assumir a jogada", team: "Confiar no coletivo", safe: "Preservar a posição", left: "Canto esquerdo", right: "Canto direito", humble: "Um passo de cada vez", protagonist: "Assumir a responsabilidade", legend: "Buscar uma temporada histórica", maestro: "Maestro", captain: "Capitão", poacher: "Letal na área", guardian: "Guardião", athlete: "Motor incansável", mentor: "Mentor" },
  hints: {
    bold: "Mais protagonismo. Falhar custa torcida.", team: "Jogo coletivo. Bônus individual menor.", safe: "Protege o físico. Sem bônus individual.", left: "Escolha o canto. A qualidade da execução decide a chance.", right: "Mesma chance do outro canto. Sem lado sempre vencedor.",
    humble: "Meta acessível. Sem punição.", protagonist: "Mais evolução e legado. Falha: torcida -3.", legend: "Mais legado e evolução. Falha: torcida -7.",
    maestro: "Passe coletivo +8 pontos de chance e sem penalidade etária. Jogos -5%.", captain: "Mata-mata +4 pontos de chance e força +0,7. Queda básica de torcida limitada a 3; sem bônus técnico.", poacher: "Finalização decisiva +10 pontos de chance. Jogos -14%.", guardian: "Ações defensivas +7 pontos de chance e risco de lesão menor. Produção ofensiva -8%.", athlete: "Arrancadas +8 pontos de chance e jogos +6%. Exige mais do corpo.", mentor: "Legado +2 por ano com 12 jogos. Evolução -20%, produção -4%.",
  },
} as const;
type Copy = { [K in keyof typeof pt]: typeof pt[K] extends string ? string : typeof pt[K] extends Record<string, readonly string[]> ? { [P in keyof typeof pt[K]]: readonly [string, string, ...string[]] } : { [P in keyof typeof pt[K]]: string } };
const en: Copy = {
  draw: "Draw",
  keeperSpecialist: "Penalty specialist", keeperSpecialistHint: "Penalty saves +10 percentage points, up to 45%. Games -14%.",
  match: "Your moment", promise: "Your word matters", veteran: "Experience changes the game", promiseBody: "The microphones are open. What mark will you leave this season?", veteranBody: "Your body has changed. Choose how your experience will keep deciding matches.",
  live: "Key match", fulfilled: "Promise kept!", failed: "Promise missed", active: "Promise", promiseAccepted: "Your word is given", veteranChosen: "A new chapter", success: "It worked!", failure: "Missed opportunity!", fullTime: "Full time", penalties: "Penalties", advanced: "Through to the next round", eliminated: "Eliminated", champion: "Champion", runnerUp: "Runner-up",
  outcomeGoal: "You scored the decisive goal.", outcomeAssist: "Your pass set up the goal.", outcomeKeeper: "Your intervention decided the match.", outcomeTeam: "The team settled the match.", outcomeMiss: "The chance slipped away. The opposition settled the match.", preserved: "You protected your fitness, with no individual bonus.", fans: "Support", legacy: "Legacy", evolution: "Development", chance: "success chance", simulated: "Season projection", games: "games", contributions: "goals + assists", cleanSheets: "clean sheets", glory: "Top scorer, primary continental title or Ballon d'Or",
  stages: { league: "Decisive league match", quarter: "Quarter-final", semi: "Semi-final", final: "Final" },
  scenes: {
    ...EXTRA_MATCH_TEXTS.en,
    distribution: ["The whole pitch ahead", "The opposition pushed up. Pick an accurate long ball or a short outlet."],
    penaltySave: ["Read the taker", "A penalty could settle qualification. Read the run-up and choose a side."],
    aerialDuel: ["Own your space", "A cross enters your box. Attack the ball or organise cover."],
    buildUp: ["The first line", "The attack starts at your feet. Break the press or keep the ball moving."],
    lastBlock: ["The last obstacle", "The striker prepares to shoot. Close the space before the strike."],
    overlap: ["A lane opens", "Your winger drew the marker. Overlap towards the byline."],
    cross: ["A perfectly timed ball", "A teammate is arriving in the box. Time your cross."],
    cover: ["Behind the defence", "The opposition accelerates down the wing. Close the lane and protect the box."],
    pressEscape: ["Surrounded in midfield", "Two opponents close in. Turn with the ball or find support."],
    switchPlay: ["The far side is free", "The defence crowded one side. A switch could transform the attack."],
    throughBall: ["Between the lines", "Your striker wants the ball in space. Thread it through the defence."],
    dribble: ["One against one", "The defender is isolated. Take them on or combine with a teammate."],
    header: ["Above the crowd", "The cross is coming your way. Beat the defender or set up the second ball."],
 penalty: ["The responsibility is yours", "A late penalty. The keeper is trying to read your mind."], shootout: ["From the spot", "The shootout will settle it. Choose your side."], breakaway: ["One on one", "You have beaten the defence. A teammate is arriving unmarked."], freeKick: ["One last set piece", "A free kick near the box. Shoot or find a teammate?"], lastAttack: ["One more chance", "The defence has closed the space. A passing lane is still open."], counter: ["Open field", "The opposition lost the ball. Sprinting takes energy; a pass could unlock them."], keeper: ["Decisive hands", "The striker enters the box. Time your charge or organise the cover."], interception: ["Read the play", "The pass crosses your zone. Step in or close the passing lane."] },
  actions: { bold: "Take responsibility", team: "Trust the team", safe: "Hold your position", left: "Left corner", right: "Right corner", humble: "One step at a time", protagonist: "Take responsibility", legend: "Aim for a historic season", maestro: "Maestro", captain: "Captain", poacher: "Penalty-box specialist", guardian: "Guardian", athlete: "Tireless engine", mentor: "Mentor" },
  hints: { bold: "More spotlight. Errors cost support.", team: "Team play. Smaller individual reward.", safe: "Protect your fitness. No personal bonus.", left: "Choose a side. Execution quality determines your chance.", right: "The same chance as the other side. Neither side always wins.", humble: "An accessible target. No penalty.", protagonist: "More growth and legacy. Failure: support -3.", legend: "More legacy and growth. Failure: support -7.", maestro: "Team passes +8 percentage points, no age penalty. Games -5%.", captain: "Knockout chance +4 percentage points, strength +0.7. Base support loss limited to 3; no technical bonus.", poacher: "Decisive finishing +10 percentage points. Games -14%.", guardian: "Defensive actions +7 percentage points, lower injury risk. Attacking output -8%.", athlete: "Breakaways +8 percentage points, games +6%. More strain on your body.", mentor: "Legacy +2 per year with 12 games. Development -20%, production -4%." },
};
const es: Copy = {
  draw: "Empate",
  keeperSpecialist: "Especialista en penaltis", keeperSpecialistHint: "Paradas de penalti +10 puntos de probabilidad, hasta 45%. Partidos -14%.",
  match: "Tu momento", promise: "Tu palabra cuenta", veteran: "La experiencia cambia el juego", promiseBody: "Micrófonos abiertos. ¿Qué huella quieres dejar esta temporada?", veteranBody: "El cuerpo cambió. Elige cómo tu experiencia seguirá decidiendo partidos.", live: "Partido clave", fulfilled: "¡Promesa cumplida!", failed: "Promesa fallida", active: "Promesa", promiseAccepted: "Palabra dada", veteranChosen: "Nuevo capítulo", success: "¡Salió bien!", failure: "¡No salió!", fullTime: "Marcador final", penalties: "Penaltis", advanced: "Clasificado", eliminated: "Eliminado", champion: "Campeón", runnerUp: "Subcampeón",
  outcomeGoal: "Marcaste el gol decisivo.", outcomeAssist: "Tu pase terminó en gol.", outcomeKeeper: "Tu intervención decidió el partido.", outcomeTeam: "El equipo resolvió el partido.", outcomeMiss: "La ocasión escapó. El rival resolvió el partido.", preserved: "Preservaste el físico, sin premio individual.", fans: "Afición", legacy: "Legado", evolution: "Evolución", chance: "de éxito", simulated: "Proyección de temporada", games: "partidos", contributions: "goles + asistencias", cleanSheets: "porterías a cero", glory: "Goleador, título continental principal o Balón de Oro",
  stages: { league: "Partido decisivo de liga", quarter: "Cuartos de final", semi: "Semifinal", final: "Final" },
  scenes: {
    ...EXTRA_MATCH_TEXTS.es,
    distribution: ["Todo el campo por delante", "El rival adelantó las líneas. Busca un envío preciso o una salida corta."],
    penaltySave: ["Lee al lanzador", "Un penalti puede decidir la clasificación. Lee la carrera y elige el lado."],
    aerialDuel: ["Dueño del espacio", "El centro llega a tu área. Ataca el balón u organiza la cobertura."],
    buildUp: ["La primera línea", "El ataque empieza en tus pies. Rompe la presión o haz circular el balón."],
    lastBlock: ["El último obstáculo", "El delantero prepara el tiro. Cierra el espacio antes del remate."],
    overlap: ["Aparece el carril", "El extremo arrastró la marca. Pasa por fuera hacia el fondo."],
    cross: ["Un balón a medida", "Un compañero entra al área. Elige el momento del centro."],
    cover: ["A espaldas de la defensa", "El rival acelera por la banda. Cierra el carril y protege el área."],
    pressEscape: ["Rodeado en el medio", "Dos rivales presionan. Gira con el balón o encuentra un apoyo."],
    switchPlay: ["El otro lado está libre", "La defensa cerró un lado. Un cambio de orientación puede abrir el ataque."],
    throughBall: ["Entre líneas", "El delantero pide el balón al espacio. El pase debe atravesar la defensa."],
    dribble: ["Uno contra uno", "El defensor quedó aislado. Encáralo o combina con un compañero."],
    header: ["Por encima de todos", "El centro llega hacia ti. Anticipa al defensor o prepara la segunda jugada."],
 penalty: ["La responsabilidad es tuya", "Penalti al final. El portero intenta adivinar tu lado."], shootout: ["Desde el punto penal", "La tanda decide todo. Elige tu lado."], breakaway: ["Mano a mano", "Superaste la marca. Un compañero llega libre a tu lado."], freeKick: ["El último balón parado", "Falta cerca del área. ¿Disparar o buscar un compañero?"], lastAttack: ["Una ocasión más", "La defensa cerró el espacio. Aún queda un pase entre líneas."], counter: ["Campo abierto", "El rival perdió el balón. Correr exige aire; el pase puede romper la defensa."], keeper: ["Manos decisivas", "El delantero entra al área. Sal a tiempo u organiza la cobertura."], interception: ["Leer la jugada", "El pase cruza tu zona. Anticípate o cierra la línea."] },
  actions: { bold: "Asumir la jugada", team: "Confiar en el equipo", safe: "Guardar la posición", left: "Lado izquierdo", right: "Lado derecho", humble: "Paso a paso", protagonist: "Asumir la responsabilidad", legend: "Buscar una temporada histórica", maestro: "Maestro", captain: "Capitán", poacher: "Letal en el área", guardian: "Guardián", athlete: "Motor incansable", mentor: "Mentor" },
  hints: { bold: "Más protagonismo. Fallar cuesta afición.", team: "Juego colectivo. Menor premio individual.", safe: "Protege el físico. Sin premio individual.", left: "Elige el lado. La calidad de ejecución decide la probabilidad.", right: "La misma probabilidad que al otro lado. Ninguno gana siempre.", humble: "Meta accesible. Sin castigo.", protagonist: "Más evolución y legado. Fallo: afición -3.", legend: "Más legado y evolución. Fallo: afición -7.", maestro: "Pase colectivo +8 puntos de probabilidad, sin penalidad de edad. Partidos -5%.", captain: "Eliminatorias +4 puntos de probabilidad y fuerza +0,7. Caída base de afición limitada a 3; sin bono técnico.", poacher: "Definición decisiva +10 puntos de probabilidad. Partidos -14%.", guardian: "Acciones defensivas +7 puntos de probabilidad y menor riesgo de lesión. Producción ofensiva -8%.", athlete: "Arrancadas +8 puntos de probabilidad y partidos +6%. Mayor exigencia física.", mentor: "Legado +2 por año con 12 partidos. Evolución -20%, producción -4%." },
};
export const DRAMA_TEXTS: Readonly<Record<Locale, Copy>> = { pt, en, es };
export const dramaText = (locale: Locale): Copy => DRAMA_TEXTS[locale];
export function dramaAction(locale: Locale, action: string, position?: string): string { if (action === "poacher" && position === "gk") return dramaText(locale).keeperSpecialist; return dramaText(locale).actions[action as keyof Copy["actions"]] ?? action; }
export function dramaHint(locale: Locale, action: string, position?: string): string { if (action === "poacher" && position === "gk") return dramaText(locale).keeperSpecialistHint; return dramaText(locale).hints[action as keyof Copy["hints"]] ?? ""; }
export function dramaDecision(locale: Locale, _career: Career, decision: Decision) {
  const copy = dramaText(locale);
  if (decision.match) {
    const scene = copy.scenes[decision.match.scene];
    return { title: scene[0], body: scene[1] };
  }
  const promise = decision.promises?.[0];
  if (promise?.throughYear && promise.throughYear > promise.year) {
    const body = { pt: `De ${promise.year} a ${promise.throughYear}, a meta soma as duas temporadas. Que marca você quer buscar?`, en: `From ${promise.year} to ${promise.throughYear}, the target combines both seasons. What will you aim for?`, es: `De ${promise.year} a ${promise.throughYear}, la meta suma las dos temporadas. ¿Qué marca quieres buscar?` };
    return { title: copy.promise, body: body[locale] };
  }
  return { title: decision.kind === "veteran" ? copy.veteran : copy.promise, body: decision.kind === "veteran" ? copy.veteranBody : copy.promiseBody };
}
export function dramaOption(locale: Locale, decision: Decision, option: DecisionOption, position?: string): string {
  if (option.kind !== "drama") return option.id;
  if (decision.match) return sceneOption(locale, decision.match.scene, option.action) ?? dramaAction(locale, option.action, position);
  const promise = decision.promises?.find((item) => item.level === option.action);
  const copy = dramaText(locale);
  return `${dramaAction(locale, option.action, position)}${promise ? `: ${promise.metric === "glory" ? copy.glory : `${promise.target}+ ${copy[promise.metric]}`}` : ""}`;
}
export function matchResultText(locale: Locale, result: KeyMatchResult): string {
  const copy = dramaText(locale);
  const { match } = result;
  const team = match.national ? getCountry(match.team)?.names[locale] : getClub(match.team)?.short;
  const opponent = match.national ? getCountry(match.opponent)?.names[locale] : getClub(match.opponent)?.short;
  const score = `${team ?? match.team} ${result.score.join(" × ")} ${opponent ?? match.opponent}`;
  const pens = result.penalties ? ` (${copy.penalties}: ${result.penalties.join(" × ")})` : "";
  const ending = match.stage === "league" ? "" : match.stage === "final" ? result.won ? copy.champion : copy.runnerUp : result.won ? copy.advanced : copy.eliminated;
  return `${getCompetition(match.competition)?.names[locale] ?? match.competition}: ${score}${pens}. ${ending}`;
}
