import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { type CareerSandboxInput, ovrOf, POSITIONS, REGIONS, runCareerSandbox } from "../src";

/**
 * Carreiras inteiras dentro do mundo (invariantes da seção 39), sorteadas pelo
 * fast-check com semente fixa. Cada carreira custa ~30 ms; poucas bastam para
 * pegar regra quebrada.
 */

const input: fc.Arbitrary<CareerSandboxInput> = fc.record({
  seed: fc.string({ minLength: 1, maxLength: 16 }),
  position: fc.constantFrom(...POSITIONS),
  nationality: fc.constantFrom("BRA", "ARG", "ESP", "ENG", "NGA", "JPN", "NZL"),
  difficulty: fc.constantFrom("normal", "hard"),
  pace: fc.constantFrom("intense", "normal"),
  clubPolicy: fc.constantFrom("balanced", "minutes", "ambitious", "random"),
  region: fc.constantFrom(...REGIONS),
  focusPolicy: fc.constantFrom("best", "first", "random", "none"),
});

const settings = { numRuns: 12, seed: 20261001 } as const;

describe("carreiras inteiras dentro do mundo", () => {
  it("cada temporada respeita as regras do jogador e do mundo", () => {
    fc.assert(
      fc.property(input, (career) => {
        const run = runCareerSandbox(career);
        if (run.seasons.length !== 24) return false;
        for (const season of run.seasons) {
          if (season.ovrEnd !== ovrOf(career.position, season.attributes)) return false;
          if (season.games > season.clubGames || season.games < 0) return false;
          if (season.production.leagueGoals > season.production.goals) return false;
          const won = [...season.competitions, ...season.national.competitions].filter((entry) => entry.champion);
          if (!season.titles.every((title) => won.some((entry) => entry.competition === title))) return false;
          const leagues = season.competitions.filter((entry) => entry.kind === "league" || entry.kind === "second");
          if (leagues.length !== 1) return false;
        }
        return run.world.year === (career.startYear ?? 2026) + 24;
      }),
      settings,
    );
  });

  it("a mesma entrada dá a mesma carreira, byte a byte (invariante 5)", () => {
    fc.assert(
      fc.property(input, (career) => JSON.stringify(runCareerSandbox(career)) === JSON.stringify(runCareerSandbox(career))),
      { ...settings, numRuns: 4 },
    );
  });

  it("os gols da temporada são a soma dos gols de cada competição (D42)", () => {
    fc.assert(
      fc.property(input, (career) => {
        const run = runCareerSandbox(career);
        return run.seasons.every((season) => {
          const lines = season.production.lines;
          const leagueGoals = lines.filter((line) => line.kind === "league" || line.kind === "second").reduce((sum, line) => sum + line.goals, 0);
          return (
            lines.reduce((sum, line) => sum + line.goals, 0) === season.production.goals &&
            lines.reduce((sum, line) => sum + line.games, 0) === season.games &&
            leagueGoals === season.production.leagueGoals
          );
        });
      }),
      settings,
    );
  });
});

describe("custo", () => {
  it("uma carreira de 24 temporadas cabe com folga num quadro de interface", () => {
    const career: CareerSandboxInput = {
      seed: "custo",
      position: "st",
      nationality: "BRA",
      difficulty: "normal",
      pace: "intense",
      clubPolicy: "balanced",
      region: "europe",
      focusPolicy: "best",
    };
    runCareerSandbox(career);
    const started = performance.now();
    runCareerSandbox({ ...career, seed: "custo-2" });
    expect(performance.now() - started).toBeLessThan(400);
  });
});
