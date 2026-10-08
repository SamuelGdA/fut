import { describe, expect, it } from "vitest";
import { calibrateTargets, type CalibrationRun } from "../src/challenge";
import { computeMetrics, seasonDeltas } from "../src/metrics";
import { careerValue, RECORD_BATCHES, RECORD_TARGETS, recordRows, runRecordCareers } from "../src/records";
import { markdownReport, sparkline } from "../src/report";
import { runBatch } from "../src/runs";
import { maxOf, median, minOf, quantile, share } from "../src/stats";
import { evolutionTargets, hardTargets, talentTargets } from "../src/targets";

describe("estatística", () => {
  it("quantis interpolam entre vizinhos", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(quantile([0, 10], 0.1)).toBeCloseTo(1);
    expect(Number.isNaN(median([]))).toBe(true);
  });

  it("máximo e mínimo aguentam listas enormes", () => {
    const big = Array.from({ length: 300_000 }, (_, index) => index % 1000);
    expect(maxOf(big)).toBe(999);
    expect(minOf(big)).toBe(0);
    expect(share(big, (value) => value < 500)).toBe(0.5);
  });
});

describe("relatório", () => {
  const spec = {
    seed: "teste-relatorio",
    careers: 240,
    difficulty: "normal",
    pace: "intense",
    clubPolicy: "balanced",
    focusPolicy: "best",
  } as const;
  const runs = runBatch(spec);
  const metrics = computeMetrics(runs);

  it("o lote revezando posições tem a quantidade pedida", () => {
    expect(runs).toHaveLength(240);
    expect(new Set(runs.map((run) => run.born.position)).size).toBe(12);
  });

  it("cada carreira rende 24 variações de OVR", () => {
    expect(seasonDeltas(runs[0]!)).toHaveLength(24);
  });

  it("a curva tem um caractere por idade", () => {
    expect(sparkline(metrics.ovrCurve.class)).toHaveLength(24);
    expect(sparkline([40, 99])).toBe("▁█");
  });

  it("monta o relatório completo sem perder nenhuma meta", () => {
    const targets = [...talentTargets(metrics, "normal"), ...evolutionTargets(metrics)];
    const hard = hardTargets(metrics, metrics);
    const text = markdownReport({
      engineVersion: "teste",
      seed: spec.seed,
      careers: spec.careers,
      main: { title: "Lote", description: "Teste.", metrics, targets },
      hard: { title: "Difícil", description: "Teste.", metrics, targets: hard },
      policies: [{ policy: "Equilibrada", metrics }],
    });
    for (const target of [...targets, ...hard]) expect(text).toContain(target.label);
    expect(text).toContain("# Relatório de evolução do jogador");
  });
});

describe("recordes ao alcance (D33 e D42)", () => {
  const perPosition = 2;
  const byPosition = runRecordCareers("teste-recordes", perPosition);
  const rows = recordRows(byPosition);

  it("cada posição tem os Fenômenos pedidos em cada lote, jogados até o fim sem aposentar por vontade própria", () => {
    for (const careers of byPosition.values()) {
      expect(careers).toHaveLength(perPosition * RECORD_BATCHES.length);
      for (const career of careers) {
        expect(career.player.talent).toBe("phenom");
        expect(career.end).not.toBeNull();
        expect(career.end?.reason).not.toBe("voluntary");
      }
    }
  });

  it("uma linha por recorde, com o melhor, a mediana e quem alcançou dentro do lote", () => {
    expect(rows.map((row) => row.target.id)).toEqual(RECORD_TARGETS.map((target) => target.id));
    for (const row of rows) {
      expect(row.careers).toBe(row.target.positions.length * perPosition * RECORD_BATCHES.length);
      expect(row.best).toBeGreaterThanOrEqual(row.median);
      expect(row.reached).toBeGreaterThanOrEqual(0);
      expect(row.reached).toBeLessThanOrEqual(row.careers);
    }
  });

  it("soma, melhor temporada e sequência medem a mesma carreira de jeitos diferentes", () => {
    const career = byPosition.get("st")?.[0];
    if (!career) throw new Error("sem carreira");
    const goals = RECORD_TARGETS.find((target) => target.id === "seasonGoals");
    const total = RECORD_TARGETS.find((target) => target.id === "careerGoals");
    if (!goals || !total) throw new Error("recorde sumiu");
    const seasons = career.history.map((record) => record.production.goals);
    expect(careerValue(goals, career.history)).toBe(Math.max(...seasons));
    expect(careerValue(total, career.history)).toBe(
      career.history.reduce((sum, record) => sum + record.production.goals + record.national.goals, 0),
    );
  });
});


describe("missões de legado com objetivo fixo", () => {
  it("mantém uma lenda e dois ídolos, omitindo talentos em que o objetivo é raro demais", () => {
    const runs: CalibrationRun[] = Array.from({ length: 100 }, (_, index) => ({
      band: "class", measures: { clubLegend: index < 30 ? 1 : 0, twoClubIdol: index < 10 ? 2 : 0 }, brokenEdicts: [],
    }));
    const targets = calibrateTargets(runs);
    expect(targets.clubLegend?.class).toBe(1);
    expect(targets.twoClubIdol?.class).toBe(0);
    expect(targets.clubLegend?.journeyman).toBe(0);
    const viable = runs.map((run, index) => ({ ...run, measures: { ...run.measures, twoClubIdol: index < 40 ? 2 : 0 } }));
    expect(calibrateTargets(viable).twoClubIdol?.class).toBe(2);
  });
});
