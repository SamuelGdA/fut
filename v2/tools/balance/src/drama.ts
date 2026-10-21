import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { attributesAt, choose, createCareer, ENGINE_VERSION, FOCUS_SLOT, MAX_DECISIONS, policyChoice, POSITIONS, replay, saveOf, VETERAN_PATHS, type CareerPolicy } from "@craque/engine";
import { hasPublicRole, matchOrder, veteranDue } from "../../../packages/engine/src/career/drama";

/** Auditoria reproduzível do laço real; o lote principal mede o simulador puro. */
let careers = 0, seasons = 0, matches = 0, promises = 0, fulfilled = 0;
let maximum = 0;
const paths = new Map(VETERAN_PATHS.map((path) => [path, 0]));
const policies: readonly CareerPolicy[] = ["balanced", "ambitious", "random"];
for (const position of POSITIONS) for (const pace of ["intense", "normal"] as const) for (const policy of policies) for (let sample = 0; sample < 2; sample++) {
  let career = createCareer({ seed: `d73-audit-${position}-${pace}-${policy}-${sample}`, startYear: 2026, pace, difficulty: "normal", identity: { surname: "AUDITORIA", nationality: "BRA", foot: "right", position, dreamNumber: null } });
  const counts = new Map<number, number>();
  const nationalYears = new Set<number>();
  const priorities = new Map<number, number>();
  let lastOffer = career.setup.startYear;
  for (let guard = 0; guard < MAX_DECISIONS && career.decision; guard++) {
    const decision = career.decision;
    if (decision.options.some((option) => option.kind === "club" && option.offer.club !== career.contract?.club || option.kind === "event" && option.target?.club && option.target.club.club !== career.contract?.club)) lastOffer = decision.year;
    if (decision.year - lastOffer > 3) throw new Error("Mais de três anos sem oferta");
    if (decision.kind === "window" && decision.options.length === 1 && decision.options[0]?.kind === "stay") throw new Error("Janela sem alternativa");
    if (decision.kind === "promise" && !hasPublicRole(career)) throw new Error("Promessa sem espaço no elenco");
    if (decision.kind === "veteran" && !veteranDue(career)) throw new Error("Reinvenção sem queda por idade");
    if (decision.match?.national) nationalYears.add(decision.year);
    else if (decision.match && nationalYears.has(decision.year)) throw new Error("Seleção antes do clube");
    if (decision.match) {
      const priority = matchOrder(decision.match);
      if (priority < (priorities.get(decision.year) ?? 0)) throw new Error("Final continental antes de outro jogo de clube");
      priorities.set(decision.year, priority);
    }
    counts.set(decision.year, (counts.get(decision.year) ?? 0) + 1);
    const choice = policyChoice(career, policy);
    if (!choice) throw new Error("Decisão sem escolha");
    const option = decision.options.find((item) => item.id === choice.option);
    const before = attributesAt(career.player, career.age);
    career = choose(career, choice).career;
    if (option?.kind === "focus") {
      // Se não havia outro lance, a escolha já encerrou o ano. Confira o atributo
      // do período treinado, sem confundir o declínio da próxima idade com treino perdido.
      const trained = career.age === decision.age ? attributesAt(career.player, career.age) : career.history.at(-1)?.attributes;
      if (!trained || trained[FOCUS_SLOT[option.focus]] < Math.min(99, before[FOCUS_SLOT[option.focus]] + 2)) throw new Error(`Treino não entrou no período: ${career.setup.seed}, ${decision.age}, ${option.focus}`);
    }
  }
  if (!career.end) throw new Error("Carreira não terminou");
  maximum = Math.max(maximum, ...counts.values());
  if (maximum > 5) throw new Error("Mais de cinco decisões por ano");
  if (careers % 12 === 0 && JSON.stringify(replay(saveOf(career))) !== JSON.stringify(career)) throw new Error("Replay divergente");
  careers++;
  seasons += career.history.length;
  if (career.veteran) paths.set(career.veteran, (paths.get(career.veteran) ?? 0) + 1);
  for (const season of career.history) {
    const moments = season.keyMatches ?? [];
    if (moments.length > (pace === "normal" ? 1 : 3) || new Set(moments.map((item) => item.match.competition)).size !== moments.length) throw new Error("Momentos repetidos ou em excesso");
    if (season.promise) {
      const promise = season.promise;
      const seasons = career.history.filter(record => record.year >= promise.year && record.year <= (promise.throughYear ?? promise.year));
      const actual = seasons.reduce((sum, record) => sum + (promise.metric === "cleanSheets" ? record.production.cleanSheets : record.production.goals + record.production.assists), 0);
      if (promise.actual !== actual || season.year !== (promise.throughYear ?? promise.year)) throw new Error("Promessa não agregou o prazo correto");
    }
    matches += moments.length;
    if (season.promise) { promises++; if (season.promise.fulfilled) fulfilled++; }
    if (season.games > season.clubGames || season.production.lines.reduce((sum, line) => sum + line.goals, 0) !== season.production.goals) throw new Error("Números inconsistentes");
    if (season.production.conceded < moments.filter((item) => !item.match.national).reduce((sum, item) => sum + item.score[1], 0)) throw new Error("Gols sofridos menores que os placares conhecidos");
    for (const outcome of moments) {
      const entries = outcome.match.national ? season.national.competitions : season.competitions;
      const entry = entries.find((item) => item.competition === outcome.match.competition);
      if (!entry || (outcome.match.stage === "final" && entry.champion !== outcome.won)) throw new Error("Resultado não entrou na competição");
      const line = (outcome.match.national ? season.national.lines : season.production.lines).find((item) => item.competition === outcome.match.competition);
      if (line && line.games > 0 && outcome.score[1] > 0 && line.cleanSheets >= line.games) throw new Error("Placar com gol sofrido contado como jogo sem sofrer");
    }
  }
}
const report = `# Craque: auditoria dos novos momentos\n\nMotor ${ENGINE_VERSION}. Lote fixo: 12 posições × 2 ritmos × 3 políticas × 2 sementes, prefixo d73-audit. Dificuldade Normal, Brasil, início em 2026.\n\n| Medida | Observado |\n|---|---:|\n| Carreiras concluídas | ${careers} |\n| Temporadas | ${seasons} |\n| Máximo de decisões em um ano | ${maximum} |\n| Jogos-chave | ${matches} |\n| Promessas | ${promises} |\n| Promessas cumpridas | ${fulfilled} |\n${[...paths].map(([path, count]) => `| Veterano: ${path} | ${count} |`).join("\n")}\n\nSem falhas: término, teto anual, até três partidas no anual e uma no rápido, finais continentais antes das seleções, promessas agregadas no prazo e apenas com espaço no elenco, reinvenção apenas no declínio por idade, ofertas a cada três anos, treino imediato e seleção por último, soma de gols por competição e campeão da final igual ao resultado escolhido. Replay integral conferido a cada 12 carreiras. Os testes unitários cobrem também replay no meio do lance e as chances de lesão.\n\nO lote confirma coerência e frequência observada, não demonstra igualdade de valor estratégico entre os seis caminhos. Eles trocam benefícios diferentes por minutos, produção, crescimento ou risco físico. Reproduzir: pnpm balance:craque:momentos.\n`;
const folder = fileURLToPath(new URL("../relatorios/", import.meta.url));
mkdirSync(folder, { recursive: true });
writeFileSync(`${folder}craque-momentos.md`, report);
console.log(report);
