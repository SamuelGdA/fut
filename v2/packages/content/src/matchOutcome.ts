import { matchActionKind, type KeyMatchResult, type Position } from "@craque/engine";
import type { Locale } from "./i18n";
import { sceneOption } from "./matchScenes";

/** Relata a ação e o desfecho separadamente: acertar uma cobertura não garante vitória. */
export function matchOutcomeText(locale: Locale, result: KeyMatchResult, position: Position, executionOnly = false, voice: "player" | "newspaper" = "player"): string {
  const { match, success } = result;
  const choice = sceneOption(locale, match.scene, result.action) ?? "";
  const kind = matchActionKind(position, match, result.action);
  const scored = result.score[0] > match.score[0];
  const conceded = result.score[1] > match.score[1];
  const draw = result.score[0] === result.score[1];
  const shootout = match.scene === "shootout";
  const covering = ["interception", "aerialDuel", "cover", "lastBlock", "recoveryRun", "secondBall", "backPost", "offsideTrap", "defensiveHeader", "goalLine", "keeper", "nearPost", "lowCross", "cornerClaim", "longShot", "sweeper", "penaltySave"].includes(match.scene);
  const holding = ["bicycle", "volley", "firstTouch", "chipShot", "cutback"].includes(match.scene);
  const execution = result.action === "leave" ? "teammate"
    : kind === "hold" ? !success ? "holdMiss" : match.scene === "corner" ? "shortCorner" : match.scene === "keeperCorner" ? "stayKeeper" : covering ? "cover" : holding ? "shield" : "recycle"
    : !success ? kind === "shot" ? match.scene === "bicycle" ? "bicycleMiss" : "shotMiss" : kind === "pass" ? "passMiss" : "defenceMiss"
    : shootout ? position === "gk" ? "penaltySave" : "penaltyGoal"
    : result.goals ? match.scene === "bicycle" ? "bicycle" : match.scene === "volley" ? "volley" : match.scene === "keeperCorner" ? "keeperGoal" : "goal" : result.assists ? ["bicycle", "volley", "header", "farPost"].includes(match.scene) ? "layoff" : "assist" : kind === "save" ? "save" : match.scene === "goalLine" ? "line" : "tackle";
  const copies = {
    pt: {
      choice: `Você escolheu “${choice.toLocaleLowerCase("pt")}”.`,
      holdMiss: "A tentativa de controlar o lance não encaixou, sem bônus individual.",
      shortCorner: "A cobrança curta manteve o apoio perto da bola, sem bônus individual.", stayKeeper: "Você ficou no gol; a busca pelo empate ficou com os companheiros, sem bônus individual.", cover: "Você guardou a posição e cobriu a sequência da jogada, sem bônus individual.", shield: "Você protegeu a bola para esperar apoio, sem bônus individual.", recycle: "Você deu tempo ao time para reorganizar o ataque, sem bônus individual.",
      bicycle: "Você acertou a bicicleta e a bola entrou!", bicycleMiss: "A bicicleta não pegou como você queria e a bola não entrou.", volley: "Você pegou de primeira, sem deixar cair, e marcou!", keeperGoal: "Você subiu para a área e marcou de cabeça!", line: "Você tirou a bola antes de cruzar a linha do gol.", layoff: "Você escorou para o companheiro finalizar: assistência!",
      teammate: success ? "O companheiro converteu a cobrança." : "O companheiro desperdiçou a cobrança.",
      shotMiss: "Sua finalização não entrou.", passMiss: "O passe não encontrou o companheiro.", defenceMiss: "Você não conseguiu resolver o perigo nessa intervenção.",
      goal: match.scene === "corner" ? "A cobrança entrou direto. Um gol olímpico para contar por anos." : "Sua finalização encontrou a rede.", assist: "Seu passe deixou o companheiro em condição de marcar: assistência!", save: "Sua defesa parou a chance adversária.", tackle: "Sua intervenção cortou a jogada adversária.",
      penaltySave: "Você defendeu a cobrança no desempate.", penaltyGoal: "Você converteu a cobrança no desempate.",
      win: "O time terminou com a vitória.", loss: "O time terminou derrotado.", equalised: "O gol arrancou o empate.", held: "O adversário também não marcou e o empate permaneceu.", conceded: "O adversário marcou e definiu a derrota.", teamGoal: "Depois, a equipe marcou o gol da vitória.",
    },
    en: {
      choice: `You chose “${choice.toLocaleLowerCase("en")}”.`,
      holdMiss: "The attempt to control the move did not work, without a personal bonus.",
      shortCorner: "The short corner kept support close to the ball, without a personal bonus.", stayKeeper: "You stayed in goal; your teammates chased the equaliser, without a personal bonus.", cover: "You held your position and covered the next phase, without a personal bonus.", shield: "You shielded the ball to wait for support, without a personal bonus.", recycle: "You gave the team time to reset the attack, without a personal bonus.",
      bicycle: "You connected with the bicycle kick and scored!", bicycleMiss: "You did not connect cleanly with the bicycle kick and it stayed out.", volley: "You struck it before it bounced and scored!", keeperGoal: "You went up into the box and scored a header!", line: "You cleared the ball before it crossed the goal line.", layoff: "You laid it off for your teammate to finish: an assist!",
      teammate: success ? "Your teammate converted the penalty." : "Your teammate missed the penalty.",
      shotMiss: "Your shot did not go in.", passMiss: "Your pass did not reach your teammate.", defenceMiss: "You could not stop the danger with that intervention.",
      goal: match.scene === "corner" ? "The corner went straight in!" : "Your finish found the net.", assist: "Your pass set up a teammate to score: an assist!", save: "Your save stopped the opposition's chance.", tackle: "Your intervention broke up the opposition's move.",
      penaltySave: "You saved the penalty in the shootout.", penaltyGoal: "You scored your shootout penalty.",
      win: "The team finished with a win.", loss: "The team finished with a defeat.", equalised: "The goal rescued a draw.", held: "The opposition did not score either and the draw stood.", conceded: "The opposition scored to settle the defeat.", teamGoal: "The team then scored the winner.",
    },
    es: {
      choice: `Elegiste “${choice.toLocaleLowerCase("es")}”.`,
      holdMiss: "El intento de controlar la jugada no salió, sin bono individual.",
      shortCorner: "El saque corto mantuvo el apoyo cerca del balón, sin bono individual.", stayKeeper: "Te quedaste en portería; tus compañeros buscaron el empate, sin bono individual.", cover: "Guardaste la posición y cubriste la continuación, sin bono individual.", shield: "Protegiste el balón para esperar apoyo, sin bono individual.", recycle: "Diste tiempo al equipo para reorganizar el ataque, sin bono individual.",
      bicycle: "¡Conectaste la chilena y marcaste!", bicycleMiss: "La chilena no salió como querías y el balón no entró.", volley: "¡Remataste antes del bote y marcaste!", keeperGoal: "¡Subiste al área y marcaste de cabeza!", line: "Sacaste el balón antes de que cruzara la línea de gol.", layoff: "Dejaste el balón al compañero para rematar: ¡asistencia!",
      teammate: success ? "El compañero convirtió el penalti." : "El compañero falló el penalti.",
      shotMiss: "Tu remate no entró.", passMiss: "El pase no llegó al compañero.", defenceMiss: "No pudiste resolver el peligro en esa intervención.",
      goal: match.scene === "corner" ? "¡El córner entró directo: gol olímpico!" : "Tu remate encontró la red.", assist: "Tu pase dejó al compañero en posición de marcar: ¡asistencia!", save: "Tu parada frenó la ocasión rival.", tackle: "Tu intervención cortó la jugada rival.",
      penaltySave: "Paraste el penalti en la tanda.", penaltyGoal: "Convertiste tu penalti en la tanda.",
      win: "El equipo terminó con la victoria.", loss: "El equipo terminó derrotado.", equalised: "El gol rescató el empate.", held: "El rival tampoco marcó y se mantuvo el empate.", conceded: "El rival marcó y decidió la derrota.", teamGoal: "Después, el equipo marcó el gol de la victoria.",
    },
  };
  const copy = copies[locale];
  // A crônica tem voz própria; o feedback da escolha continua falando com quem joga.
  const newspaper = {
    pt: {
      ...copy,
      choice: `A escolha foi “${choice.toLocaleLowerCase("pt")}”.`,
      holdMiss: "A tentativa de controlar o lance não encaixou.", shortCorner: "A cobrança curta manteve o apoio perto da bola.",
      stayKeeper: "O goleiro permaneceu no gol e deixou a busca pelo empate com os companheiros.",
      cover: "A cobertura fechou o espaço para a sequência da jogada.", shield: "O domínio protegeu a bola até a chegada do apoio.", recycle: "A equipe ganhou tempo para reorganizar o ataque.",
      bicycle: "A bicicleta saiu limpa e a bola entrou!", bicycleMiss: "A bicicleta não saiu como o jogador esperava e a bola ficou fora.", volley: "O voleio encontrou a rede antes que a bola tocasse o chão!", keeperGoal: "O goleiro foi à área e marcou de cabeça!", line: "O corte impediu que a bola cruzasse a linha do gol.", layoff: "A escorada deixou o companheiro na cara do gol: assistência!",
      teammate: success ? "O companheiro converteu a cobrança." : "O companheiro desperdiçou a cobrança.",
      shotMiss: "A finalização não entrou.", passMiss: "O passe não encontrou o companheiro.", defenceMiss: "A intervenção não conseguiu afastar o perigo.",
      goal: match.scene === "corner" ? copy.goal : "A finalização encontrou a rede.", assist: "O passe deixou o companheiro em condição de marcar: assistência!", save: "A defesa parou a chance adversária.", tackle: "A intervenção cortou a jogada adversária.",
      penaltySave: "O goleiro defendeu a cobrança no desempate.", penaltyGoal: "A cobrança no desempate terminou na rede.",
    },
    en: {
      ...copy,
      choice: `The choice was “${choice.toLocaleLowerCase("en")}”.`,
      holdMiss: "The attempt to control the move did not work.", shortCorner: "The short corner kept support close to the ball.",
      stayKeeper: "The goalkeeper stayed in goal while the teammates chased the equaliser.",
      cover: "The covering position closed the space for the next phase.", shield: "The ball was shielded until support arrived.", recycle: "The team gained time to reset the attack.",
      bicycle: "The bicycle kick connected cleanly and went in!", bicycleMiss: "The bicycle kick did not connect cleanly and stayed out.", volley: "The volley found the net before the ball bounced!", keeperGoal: "The goalkeeper went up into the box and scored a header!", line: "The clearance stopped the ball before it crossed the goal line.", layoff: "The layoff left a teammate with a clear finish: an assist!",
      teammate: success ? "The teammate converted the penalty." : "The teammate missed the penalty.",
      shotMiss: "The shot did not go in.", passMiss: "The pass did not reach a teammate.", defenceMiss: "The intervention could not stop the danger.",
      goal: match.scene === "corner" ? copy.goal : "The finish found the net.", assist: "The pass set up a teammate to score: an assist!", save: "The save stopped the opposition's chance.", tackle: "The intervention broke up the opposition's move.",
      penaltySave: "The goalkeeper saved the penalty in the shootout.", penaltyGoal: "The shootout penalty found the net.",
    },
    es: {
      ...copy,
      choice: `La elección fue “${choice.toLocaleLowerCase("es")}”.`,
      holdMiss: "El intento de controlar la jugada no salió.", shortCorner: "El saque corto mantuvo el apoyo cerca del balón.",
      stayKeeper: "El portero se quedó en la portería y los compañeros buscaron el empate.",
      cover: "La cobertura cerró el espacio para la continuación de la jugada.", shield: "El control protegió el balón hasta que llegó el apoyo.", recycle: "El equipo ganó tiempo para reorganizar el ataque.",
      bicycle: "¡La chilena conectó limpia y el balón entró!", bicycleMiss: "La chilena no salió limpia y el balón no entró.", volley: "¡La volea encontró la red antes del bote!", keeperGoal: "¡El portero subió al área y marcó de cabeza!", line: "El despeje impidió que el balón cruzara la línea de gol.", layoff: "La dejada dejó al compañero frente al gol: ¡asistencia!",
      teammate: success ? "El compañero convirtió el penalti." : "El compañero falló el penalti.",
      shotMiss: "El remate no entró.", passMiss: "El pase no llegó al compañero.", defenceMiss: "La intervención no pudo alejar el peligro.",
      goal: match.scene === "corner" ? copy.goal : "El remate encontró la red.", assist: "El pase dejó al compañero en posición de marcar: ¡asistencia!", save: "La parada frenó la ocasión rival.", tackle: "La intervención cortó la jugada rival.",
      penaltySave: "El portero paró el penalti en la tanda.", penaltyGoal: "El penalti en la tanda terminó en la red.",
    },
  };
  const narrative = voice === "newspaper" ? newspaper[locale] : copy;
  const executionText = narrative[execution];
  const ending = match.stage !== "league" ? "" : draw ? scored ? copy.equalised : copy.held : result.won ? kind === "hold" && scored ? copy.teamGoal : copy.win : conceded ? copy.conceded : copy.loss;
  return executionOnly ? executionText : [narrative.choice, executionText, ending].filter(Boolean).join(" ");
}
