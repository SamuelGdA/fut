import type { SeasonModifiers } from "../src/season/playerSeason";
import { mergeModifiers } from "../src/career/effects";
import { keyProduction, NO_PRODUCTION } from "../src/season/production";
import { describe, expect, it } from "vitest";
import { CLUBS } from "@craque/world";
import { choose, createCareer, drawInjury, EVENT_CATALOG, injuryChance, MAX_DECISIONS, policyChoice, replay, saveOf, VETERAN_PATHS, veteranModifiers, type Career, type KeyMatchResult } from "../src";
import { keyKnockout, keyLeague } from "../src/world/keyMatches";
import { promiseOptions, promiseReport } from "../src/career/drama";

const setup = (seed: string, pace: "normal" | "intense" = "intense", position: "st" | "gk" | "cm" = "st") => ({ seed, startYear: 2026, pace, difficulty: "normal" as const, identity: { surname: "TESTE", foot: "right" as const, nationality: "BRA", position, dreamNumber: null } });
function advance(career: Career): Career {
  const choice = policyChoice(career, "balanced");
  if (!choice) throw new Error("carreira encerrada");
  return choose(career, choice).career;
}

describe("D73: temporada interrompível", () => {
  it("limita cinco decisões por ano, mantém 1–3 momentos elegíveis e refaz o meio do lance", () => {
    let matches = 0;
    for (const pace of ["intense", "normal"] as const) for (const position of ["st", "gk", "cm"] as const) {
      let career = createCareer(setup(`d73-${pace}-${position}`, pace, position));
      const counts = new Map<number, number>();
      const matchCounts = new Map<number, number>();
      for (let guard = 0; guard < MAX_DECISIONS && career.decision; guard++) {
        const decision = career.decision;
        counts.set(decision.year, (counts.get(decision.year) ?? 0) + 1);
        if (decision.match) {
          matches++;
          matchCounts.set(decision.year, (matchCounts.get(decision.year) ?? 0) + 1);
          expect(decision.match.team).not.toBe(decision.match.opponent);
          expect(career.history.at(-1)?.games).toBeGreaterThanOrEqual(12);
          if (matches <= 2) expect(replay(saveOf(career))).toEqual(career);
          if (["penalty", "shootout"].includes(decision.match.scene)) expect(decision.options.map((item) => item.kind === "drama" ? item.chance : null)[0]).toEqual(decision.options.map((item) => item.kind === "drama" ? item.chance : null)[1]);
        }
        const before = career;
        career = advance(career);
        if (decision.kind === "promise") expect(career.promise?.year ?? career.history.find((record) => record.year === decision.year)?.promise?.year).toBe(decision.year);
        if (decision.kind === "match" && career.decision?.kind === "match" && career.world.year === before.world.year) expect(career.age).toBe(before.age);
      }
      expect(career.end).not.toBeNull();
      expect(Math.max(...counts.values())).toBeLessThanOrEqual(5);
      expect(Math.max(0, ...matchCounts.values())).toBeLessThanOrEqual(3);
      expect(career.promiseYears?.length).toBeGreaterThanOrEqual(1);
      expect(career.promiseYears?.length).toBeLessThanOrEqual(3);
      expect(career.history.flatMap((record) => record.promise ? [record.promise.year] : [])).toEqual(career.promiseYears);
      const reinventions = career.history.filter(record => record.veteranChosen);
      expect(reinventions.length).toBe(career.veteran ? 1 : 0);
      if (reinventions[0]) expect(reinventions[0].age).toBeGreaterThanOrEqual(33);
      for (const record of career.history) {
        expect(record.production.lines.reduce((sum, line) => sum + line.goals, 0)).toBe(record.production.goals);
        expect(record.production.lines.reduce((sum, line) => sum + line.assists, 0)).toBe(record.production.assists);
        expect(record.games).toBeLessThanOrEqual(record.clubGames);
        expect(record.keyMatches?.length ?? 0).toBeLessThanOrEqual(3);
        for (const result of record.keyMatches ?? []) {
          if (result.match.scene === "shootout") expect(result.goals).toBe(0);
          const entry = [...record.competitions, ...record.national.competitions].find((item) => item.competition === result.match.competition);
          expect(entry).toBeDefined();
          if (result.match.stage === "final") expect(entry?.champion).toBe(result.won);
        }
      }
      expect(replay(saveOf(career))).toEqual(career);
    }
    expect(matches).toBeGreaterThan(10);
  });

  it("não inventa jogos para quem ainda está sem minutos", () => {
    const career = advance(createCareer(setup("d73-base")));
    expect(career.history[0]?.games).toBeLessThan(12);
    expect(career.decision?.kind).not.toBe("match");
  });

  it("reinvenções são seis, persistentes e têm concessões diferentes", () => {
    expect(new Set(VETERAN_PATHS).size).toBe(6);
    expect(veteranModifiers("poacher", {}).gamesScale).toBe(0.86);
    expect(veteranModifiers("maestro", {}).gamesScale).toBe(0.95);
    expect(veteranModifiers("guardian", {}).productionScale).toBe(0.92);
    expect(veteranModifiers("athlete", {}).injuryScale).toBe(1.3);
    expect(veteranModifiers("mentor", {}).growthScale).toBe(0.8);
    expect(veteranModifiers("captain", {}).boosts?.cup).toBe(0.7);
  });

  it("metas adaptam a posição e a promessa humilde não pune", () => {
    const career = advance(createCareer(setup("d73-meta")));
    const options = promiseOptions(career);
    expect(options.map((item) => item.level)).toEqual(["humble", "protagonist", "legend"]);
    const promise = { ...options[0]!, year: career.history[0]!.year, throughYear: career.history[0]!.year, target: 100 };
    const report = promiseReport({ ...career, promise }, career.history[0]!);
    expect(report?.fulfilled).toBe(false);
    expect(report?.fans).toBe(0);
    expect(promiseOptions({ ...career, player: { ...career.player, position: "gk" } })[1]?.metric).toBe("cleanSheets");
  });

});

describe("D73: consequências restritas ao jogo apresentado", () => {
  const teams = CLUBS.slice(0, 9).map((club) => club.id);
  const outcome: KeyMatchResult = { match: { competition: "cup:BRA", team: teams[1]!, opponent: teams[0]!, national: false, stage: "final", minute: 88, score: [1, 1], scene: "penalty" }, action: "left", success: true, won: true, score: [2, 1], penalties: null, goals: 1, assists: 0, fans: 3, legacy: 2 };
  it("final muda campeão e vice somente no torneio apresentado, sem duplicar times", () => {
    const result = { competition: "cup:BRA", order: teams, format: { kind: "knockout" as const, groupSlots: 0 } };
    const updated = keyKnockout(result, [outcome])!;
    expect(updated.order[0]).toBe(outcome.match.team);
    expect(new Set(updated.order).size).toBe(teams.length);
    expect(keyKnockout({ ...result, competition: "cont1:UEFA" }, [outcome])?.order).toEqual(teams);
    expect(keyKnockout(result, [{ ...outcome, won: false }])?.order[1]).toBe(outcome.match.team);
  });
  it("jogo de liga altera os pontos de ambos e mantém classificação ordenada", () => {
    const result = { competition: "league:brasileirao", league: "brasileirao", country: "BRA", division: 1 as const, games: 38, rows: teams.map((club, index) => ({ club, points: 60 - index, position: index + 1 })) };
    const updated = keyLeague(result, [{ ...outcome, match: { ...outcome.match, competition: result.competition, stage: "league" } }]);
    expect(updated.rows.find((row) => row.club === outcome.match.team)?.points).toBe(61);
    expect(updated.rows.find((row) => row.club === outcome.match.opponent)?.points).toBe(59);
    expect(updated.rows.map((row) => row.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it("quem perde quartas ou semifinal não reaparece na final, mesmo sendo favorito", () => {
    const result = { competition: "cup:BRA", order: teams, format: { kind: "knockout" as const, groupSlots: 0 } };
    for (const stage of ["quarter", "semi"] as const) {
      const updated = keyKnockout(result, [{ ...outcome, match: { ...outcome.match, stage } }])!;
      expect(updated.order.indexOf(outcome.match.opponent)).toBe(stage === "semi" ? 3 : 7);
      expect(updated.order.indexOf(outcome.match.team)).toBe(stage === "semi" ? 1 : 3);
      expect(new Set(updated.order).size).toBe(teams.length);
      const lost = keyKnockout(result, [{ ...outcome, won: false, match: { ...outcome.match, stage } }])!;
      expect(lost.order.indexOf(outcome.match.team)).toBe(stage === "semi" ? 3 : 7);
      expect(lost.order.indexOf(outcome.match.opponent)).toBe(0);
    }
  });
  it("um placar com gol sofrido não pode virar jogo sem sofrer gol nas estatísticas", () => {
    const production = { ...NO_PRODUCTION, cleanSheets: 4, lines: [{ competition: "cup:BRA", kind: "cup" as const, games: 4, goals: 0, assists: 0, cleanSheets: 4 }] };
    const updated = keyProduction(production, [outcome], false);
    expect(updated.lines[0]?.cleanSheets).toBe(3);
    expect(updated.cleanSheets).toBe(3);
    expect(updated.conceded).toBeGreaterThanOrEqual(outcome.score[1]);
    expect(updated.goals).toBe(1);
    expect(keyProduction(production, [outcome], true)).toEqual(production);
  });
  it("Gestão de Carga mantém aumento relativo de 60% e sorteia perdas de tamanhos variados", () => {
    const playAll = EVENT_CATALOG.find((event) => event.id === "loadManagement")!.options.find((option) => option.id === "playAll")!;
    const modifiers = playAll.success.reduce<SeasonModifiers>(mergeModifiers, {});
    expect(modifiers.injuryScale).toBe(1.6);
    const chance = injuryChance(28, 70, "professional", "normal");
    const rng = (roll: number, share: number) => ({ next: (() => { const values = [roll, share, 0]; return () => values.shift() ?? 0; })() });
    expect(drawInjury(rng(chance * 1.3, 0) as Parameters<typeof drawInjury>[0], 40, 28, 70, "professional", "normal", 1)).toBeNull();
    expect(drawInjury(rng(chance * 1.3, 0) as Parameters<typeof drawInjury>[0], 40, 28, 70, "professional", "normal", 1.6)?.lostGames).toBe(2);
    expect(drawInjury(rng(0, 0.99) as Parameters<typeof drawInjury>[0], 40, 28, 70, "professional", "normal", 1.6)?.lostGames).toBe(9);
  });
});
