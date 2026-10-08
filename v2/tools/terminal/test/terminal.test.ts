import { LOCALES } from "@craque/content";
import { type Career, choose, createCareer, policyChoice } from "@craque/engine";
import { describe, expect, it } from "vitest";
import { ArgsError, parseArgs } from "../src/args";
import { decisionBlock, header, historyLines, stepLines, summaryLines } from "../src/render";

describe("argumentos", () => {
  it("sem nada, um centroavante brasileiro no ritmo Normal (uma temporada por decisão), jogando no teclado", () => {
    const args = parseArgs([], "padrao");
    expect(args.setup).toMatchObject({
      seed: "padrao",
      pace: "intense",
      difficulty: "normal",
      identity: { position: "st", nationality: "BRA", surname: "SILVA", dreamNumber: null },
    });
    expect(args.auto).toBeNull();
    expect(args.locale).toBe("pt");
  });

  it("lê os nomes em português e aceita o que o jogador escreveria", () => {
    const args = parseArgs(
      ["--posicao", "CAM", "--pais", "arg", "--ritmo", "rápida", "--dificuldade", "difícil", "--idioma", "es", "--numero", "10", "--sobrenome", "riquelme"],
      "x",
    );
    expect(args.setup.identity).toMatchObject({ position: "cam", nationality: "ARG", dreamNumber: 10, surname: "RIQUELME" });
    expect(args.setup.pace).toBe("normal");
    expect(args.setup.difficulty).toBe("hard");
    expect(args.locale).toBe("es");
  });

  it("o ritmo tem os nomes da tela: normal é uma temporada por decisão, rapida são duas", () => {
    expect(parseArgs(["--ritmo", "normal"], "x").setup.pace).toBe("intense");
    expect(parseArgs(["--ritmo", "intensa"], "x").setup.pace).toBe("intense");
    expect(parseArgs(["--ritmo", "rapida"], "x").setup.pace).toBe("normal");
  });

  it("--auto sem valor usa a política equilibrada; com valor, a pedida", () => {
    expect(parseArgs(["--auto"], "x").auto).toBe("balanced");
    expect(parseArgs(["--auto", "random", "--resumo"], "x")).toMatchObject({ auto: "random", summaryOnly: true });
  });

  it.each([
    [["--posicao", "zz"]],
    [["--pais", "XXX"]],
    [["--ritmo", "lenta"]],
    [["--numero", "100"]],
    [["--auto", "maluca"]],
    [["--semente"]],
    [["--inventado"]],
  ])("recusa %j com uma mensagem clara", (argv) => {
    expect(() => parseArgs(argv, "x")).toThrow(ArgsError);
  });
});

function textOf(lines: readonly string[]): string {
  return lines.join("\n");
}

function expectClean(lines: readonly string[], where: string) {
  const text = textOf(lines);
  expect(text, where).not.toMatch(/[{}]|undefined|NaN|\[object/);
}

describe("o que o terminal escreve", () => {
  it.each(LOCALES)("%s: uma carreira inteira sem marcador sobrando nem valor quebrado", (locale) => {
    for (const [index, policy] of (["balanced", "random", "ambitious"] as const).entries()) {
      let career: Career = createCareer({
        seed: `terminal-${locale}-${index}`,
        startYear: 2026,
        pace: index === 1 ? "normal" : "intense",
        difficulty: "normal",
        identity: { surname: "TESTE", foot: "left", nationality: index === 2 ? "NGA" : "BRA", position: index === 1 ? "gk" : "cam", dreamNumber: 8 },
      });
      while (career.decision) {
        const decision = career.decision;
        expectClean([...header(career, locale), ...decisionBlock(career, locale)], `${locale} decisão ${decision.id}`);
        const choice = policyChoice(career, policy);
        if (!choice) break;
        const option = decision.options.find((candidate) => candidate.id === choice.option);
        if (!option) throw new Error("opção sumiu");
        const step = choose(career, choice);
        expectClean(stepLines(career, decision, option, step, locale), `${locale} passo ${decision.id}`);
        career = step.career;
      }
      const summary = summaryLines(career, locale);
      expectClean(summary, `${locale} resumo`);
      expectClean(historyLines(career, locale), `${locale} histórico`);
      expect(summary.length).toBeGreaterThan(8);
    }
  });

  it("cada temporada jogada aparece uma vez nos passos", () => {
    let career = createCareer({
      seed: "contagem",
      startYear: 2026,
      pace: "normal",
      difficulty: "normal",
      identity: { surname: "TESTE", foot: "right", nationality: "ENG", position: "st", dreamNumber: null },
    });
    let seasonsShown = 0;
    while (career.decision) {
      const decision = career.decision;
      const choice = policyChoice(career, "balanced");
      if (!choice) break;
      const option = decision.options.find((candidate) => candidate.id === choice.option);
      if (!option) throw new Error("opção sumiu");
      const step = choose(career, choice);
      const lines = stepLines(career, decision, option, step, "pt");
      seasonsShown += lines.filter((line) => /^ \d{4} · /.test(line)).length;
      career = step.career;
    }
    expect(seasonsShown).toBe(career.history.length);
  });
});
