import { mkdirSync, writeFileSync } from "node:fs";
import { CLUB_POLICIES, ENGINE_VERSION, type ClubPolicy } from "@craque/engine";
import { computeMetrics } from "./metrics";
import { markdownReport, type PolicyRow, type ReportSection, terminalReport } from "./report";
import { runBatch } from "./runs";
import { evolutionTargets, hardTargets, paceTargets, talentTargets } from "./targets";
import { ATTACKING, careerTargets, computeCareerMetrics, runCareers } from "./career";
import { computeFlowMetrics, flowTargets, runFlowBatches } from "./flow";
import { careerReport } from "./reportCareer";
import { flowReport } from "./reportFlow";
import { worldReport } from "./reportWorld";
import { challengeReport, challengeTargets, computeChallengeMetrics, runCalibration } from "./challenge";
import { computeWorldMetrics, runWorlds, worldTargets } from "./world";

/**
 * pnpm balance [--carreiras N] [--semente texto] [--check] [--sem-arquivo]
 *
 * Roda os lotes, imprime as metas no terminal e grava os relatórios em
 * tools/balance/relatorios/ (evolucao.md, mundo.md, carreira.md, fluxo.md e
 * desafio.md).
 * Com --check, sai com erro se alguma meta falhar (é assim que o `pnpm verify`
 * usa).
 */

function readArgs(argv: readonly string[]) {
  const value = (name: string) => {
    const index = argv.indexOf(name);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const careers = Number(value("--carreiras") ?? 6000);
  if (!Number.isInteger(careers) || careers < 100) throw new Error("--carreiras precisa ser um inteiro de 100 para cima");
  return {
    careers,
    seed: value("--semente") ?? "balanco-m2",
    check: argv.includes("--check"),
    writeFile: !argv.includes("--sem-arquivo"),
  };
}

const POLICY_NAME: Readonly<Record<ClubPolicy, string>> = {
  balanced: "Equilibrada (clube do nível)",
  minutes: "Minutos (clube abaixo)",
  ambitious: "Ambiciosa (clube acima)",
  random: "Sorteada",
};

function main() {
  const args = readArgs(process.argv.slice(2));
  const started = performance.now();
  const base = { seed: args.seed, careers: args.careers, pace: "intense", focusPolicy: "best" } as const;

  const mainRuns = runBatch({ ...base, difficulty: "normal", clubPolicy: "balanced" });
  const mainMetrics = computeMetrics(mainRuns);
  const normalPaceMetrics = computeMetrics(
    runBatch({ ...base, pace: "normal", difficulty: "normal", clubPolicy: "balanced" }),
  );
  const main: ReportSection = {
    title: "Normal, ritmo Intensa, política equilibrada",
    description:
      "O lote de referência: clube do nível do jogador, foco de treino que mais sobe o OVR, uma temporada por decisão.",
    metrics: mainMetrics,
    targets: [
      ...talentTargets(mainMetrics, "normal"),
      ...evolutionTargets(mainMetrics),
      ...paceTargets(mainMetrics, normalPaceMetrics),
    ],
  };

  const hardMetrics = computeMetrics(runBatch({ ...base, difficulty: "hard", clubPolicy: "balanced" }));
  const hard: ReportSection = {
    title: "Difícil, ritmo Intensa, política equilibrada",
    description: "Talento mais raro, crescimento 14% mais lento e declínio 25% mais rápido.",
    metrics: hardMetrics,
    targets: hardTargets(hardMetrics, mainMetrics),
  };

  const policies: PolicyRow[] = CLUB_POLICIES.map((policy) => ({
    policy: POLICY_NAME[policy],
    metrics:
      policy === "balanced"
        ? mainMetrics
        : computeMetrics(runBatch({ ...base, careers: Math.min(args.careers, 3000), difficulty: "normal", clubPolicy: policy })),
  }));

  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  console.log(`CRAQUE: relatório de evolução (motor ${ENGINE_VERSION}, ${args.careers} carreiras por lote, ${seconds} s)`);
  console.log(terminalReport([main, hard]));

  // Mundo sozinho e carreiras dentro dele (M3). No --check, lotes menores.
  const quick = args.check;
  const worldBatch = runWorlds(`${args.seed}:mundo`, quick ? 20 : 60, 25);
  const worldMetrics = computeWorldMetrics(worldBatch);
  const worldGoals = worldTargets(worldMetrics, 25);
  const batches = {
    // Os Fenômenos de ataque jogam o lote inteiro também no --check: com só os
    // 150 primeiros, a média de Bolas de Ouro oscilava acima do teto (2,40
    // contra 2,11 nos 400), uma falha de amostra e não de regra (D57).
    phenoms: runCareers({ seed: `${args.seed}:fen`, careers: 400, band: "phenom", positions: ATTACKING, region: "europe" }),
    phenomStrikers: runCareers({ seed: `${args.seed}:fen-ca`, careers: quick ? 80 : 160, band: "phenom", positions: ["st"], region: "europe" }),
    classStrikers: runCareers({ seed: `${args.seed}:cra-ca`, careers: quick ? 100 : 200, band: "class", positions: ["st"], region: "europe" }),
    smallLeague: runCareers({ seed: `${args.seed}:chi`, careers: quick ? 50 : 80, band: "star", positions: ATTACKING, region: "home", nationality: "CHI" }),
  } as const;
  const careerMetrics = computeCareerMetrics(batches);
  const careerGoals = careerTargets(careerMetrics);

  // O fluxo com o mercado de verdade (M4).
  const flowBatches = runFlowBatches(`${args.seed}:fluxo`, quick ? 100 : 300);
  const flowMetrics = computeFlowMetrics(flowBatches);
  const flowGoals = flowTargets(flowMetrics);

  // O Desafio do dia (M7): amostra própria, com outra semente que a da calibragem.
  const challengeFirstDay = "2026-01-01";
  const challengeRuns = runCalibration(`${args.seed}:desafio`, quick ? 120 : 240);
  const challengeMetrics = computeChallengeMetrics(challengeRuns, challengeFirstDay, 3650, quick ? 40 : 120);
  const challengeGoals = challengeTargets(challengeMetrics);

  for (const [title, targets] of [["MUNDO", worldGoals], ["CARREIRA", careerGoals], ["FLUXO", flowGoals], ["DESAFIO", challengeGoals]] as const) {
    console.log("", "", title, "");
    for (const target of targets) {
      console.log(`  ${target.pass ? "✓" : "✗"} ${target.label}`);
      console.log(`      alvo ${target.target}  |  medido ${target.measured}`);
    }
  }

  const all = [...main.targets, ...hard.targets, ...worldGoals, ...careerGoals, ...flowGoals, ...challengeGoals];
  const failed = all.filter((target) => !target.pass);
  console.log("");
  console.log(failed.length === 0 ? `Todas as ${all.length} metas atendidas.` : `${failed.length} de ${all.length} metas falharam.`);

  if (args.writeFile) {
    const folder = new URL("../relatorios/", import.meta.url);
    mkdirSync(folder, { recursive: true });
    const file = new URL("evolucao.md", folder);
    writeFileSync(
      file,
      markdownReport({ engineVersion: ENGINE_VERSION, seed: args.seed, careers: args.careers, main, hard, policies }),
    );
    writeFileSync(
      new URL("mundo.md", folder),
      worldReport({ engineVersion: ENGINE_VERSION, seed: args.seed, worlds: worldBatch.worlds, seasons: 25, metrics: worldMetrics, targets: worldGoals }),
    );
    writeFileSync(
      new URL("carreira.md", folder),
      careerReport({ engineVersion: ENGINE_VERSION, seed: args.seed, batches, metrics: careerMetrics, targets: careerGoals }),
    );
    writeFileSync(
      new URL("fluxo.md", folder),
      flowReport({ engineVersion: ENGINE_VERSION, seed: args.seed, batches: flowBatches, metrics: flowMetrics, targets: flowGoals }),
    );
    writeFileSync(
      new URL("desafio.md", folder),
      challengeReport({ engineVersion: ENGINE_VERSION, seed: args.seed, firstDay: challengeFirstDay, metrics: challengeMetrics, targets: challengeGoals }),
    );
    console.log("Relatórios: tools/balance/relatorios/evolucao.md, mundo.md, carreira.md, fluxo.md e desafio.md");
  }

  if (args.check && failed.length > 0) process.exitCode = 1;
}

main();
