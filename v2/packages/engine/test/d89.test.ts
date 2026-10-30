import { describe, expect, it } from "vitest";
import { choose, createCareer, MAX_DECISIONS, policyChoice, type Career, type Decision, type KeyMatch, type KeyMatchResult, type Position } from "../src";
import { ballonEliteBonus, BALLON } from "../src/awards/awards";
import { MATCH_REWARD, matchOrder, promiseDue, resolveKeyMatch } from "../src/career/drama";
import { MARKET } from "../src/career/market";

const setup = (seed: string, position: Position = "st", pace: "intense" | "normal" = "intense") => ({ seed, startYear: 2026, pace, difficulty: "normal" as const, identity: { surname: "TESTE", nationality: "BRA", foot: "right" as const, position, dreamNumber: null } });
const base: KeyMatch = { competition: "cup:BRA", team: "flamengo", opponent: "palmeiras", national: false, stage: "quarter", minute: 86, score: [1, 1], scene: "counter" };

function player(seed: string): Career {
  const career = createCareer(setup(seed));
  return { ...career, age: 27, player: { ...career.player, capacity: 80 } };
}
function lance(career: Career, match: KeyMatch, action: string, chance: number): KeyMatchResult {
  return resolveKeyMatch(career, match, { id: `drama:${action}`, kind: "drama", action, chance });
}

/** Todas as decisões de uma carreira jogada pela política, com os resultados dos lances. */
function play(seed: string, position: Position, pace: "intense" | "normal" = "intense") {
  let career = createCareer(setup(seed, position, pace));
  const decisions: Decision[] = [];
  const results: KeyMatchResult[] = [];
  const byDecision = new Map<number, KeyMatchResult>();
  for (let guard = 0; guard < MAX_DECISIONS && career.decision; guard++) {
    decisions.push(career.decision);
    const choice = policyChoice(career, "balanced");
    if (!choice) break;
    const step = choose(career, choice);
    for (const notice of step.notices) if (notice.kind === "matchOutcome") {
      results.push(notice.result);
      byDecision.set(career.decision.id, notice.result);
    }
    career = step.career;
  }
  return { career, decisions, results, byDecision };
}

describe("D89: lance que não deu certo nunca vence", () => {
  it("no mata-mata o erro elimina; na liga segura no máximo o empate", () => {
    for (let i = 0; i < 40; i++) {
      const career = player(`d89-fail-${i}`);
      for (const stage of ["league", "quarter", "semi", "final"] as const) for (const score of [[0, 0], [1, 1], [1, 2]] as const) {
        for (const action of ["bold", "team", "safe"]) {
          const result = lance(career, { ...base, competition: stage === "league" ? "league:brasileirao" : base.competition, stage, score }, action, 0);
          expect(result.success).toBe(false);
          expect(result.won).toBe(false);
          expect(result.penalties).toBeNull();
          expect(result.score[0]).toBe(score[0]);
          if (stage === "league") expect(result.score[0]).toBeLessThanOrEqual(result.score[1]);
          else expect(result.score[1]).toBeGreaterThan(result.score[0]);
          expect(result.recognition).toBe(0);
        }
      }
    }
  });
  it("a cobrança desperdiçada pelo companheiro também elimina", () => {
    const career = player("d89-leave");
    const result = lance(career, { ...base, scene: "decisivePenalty" }, "leave", 0);
    expect(result.won).toBe(false);
    expect(result.fans).toBe(0);
  });
  it("o apoio atrás bem feito mantém o placar, decide nos pênaltis ou vence com o time", () => {
    let wins = 0;
    let shootouts = 0;
    for (let i = 0; i < 300; i++) {
      const career = player(`d89-safe-${i}`);
      const league = lance(career, { ...base, competition: "league:brasileirao", stage: "league" }, "safe", 1);
      expect(league.score[0]).toBeGreaterThanOrEqual(league.score[1]);
      const knockout = lance(career, base, "safe", 1);
      expect(knockout.success).toBe(true);
      if (knockout.penalties) shootouts++;
      if (knockout.won) wins++;
      // Vencer sem jogar o lance vale o resultado do time, sem bônus individual.
      expect(knockout.fans).toBe(0);
      expect(knockout.legacy).toBe(0);
      expect(knockout.recognition).toBe(0);
    }
    expect(shootouts).toBeGreaterThan(100);
    expect(wins).toBeGreaterThan(150);
    expect(wins).toBeLessThan(270);
  });
});

describe("D89: o lance jogado que decide vale mais", () => {
  it("vitória por ação ativa soma torcida pela fase, legado na final e um reconhecimento", () => {
    const career = player("d89-hero");
    for (const stage of ["league", "quarter", "semi", "final"] as const) {
      const bold = lance(career, { ...base, competition: stage === "league" ? "league:brasileirao" : base.competition, stage }, "bold", 1);
      expect(bold.won).toBe(true);
      expect(bold.fans).toBe(3 + MATCH_REWARD.stageFans[stage]);
      expect(bold.legacy).toBe(2 + (stage === "final" ? MATCH_REWARD.finalLegacy : 0));
      expect(bold.recognition).toBe(1);
      const team = lance(career, { ...base, stage }, "team", 1);
      expect(team.fans).toBe(2 + MATCH_REWARD.stageFans[stage]);
      expect(team.recognition).toBe(1);
    }
  });
  it("o reconhecimento entra na evolução da temporada pelo mesmo teto dos títulos", () => {
    const { career } = play("d89-evolution", "st");
    const heroes = career.history.flatMap((record) => record.keyMatches ?? []).filter((result) => result.recognition > 0);
    for (const result of heroes) expect(result.success && result.won && !["safe", "leave"].includes(result.action)).toBe(true);
  });
  it("nas carreiras reais, nenhum lance errado termina em vitória", () => {
    for (const position of ["st", "cm", "cb", "gk"] as const) {
      const { results } = play(`d89-career-${position}`, position);
      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        if (!result.success) expect(result.won).toBe(false);
        // Na disputa de pênaltis o placar não muda: o erro perde a disputa (D91).
        if (!result.success && result.match.stage !== "league") expect(result.penalties ? result.penalties[1] > result.penalties[0] : result.score[1] > result.score[0]).toBe(true);
      }
    }
  });
});

describe("D89: campanha contínua no mesmo ano", () => {
  it("a fase seguinte da mesma copa só aparece depois da anterior, e some com a eliminação", () => {
    const order = { quarter: 1, semi: 2, final: 3, league: 0 } as const;
    let chains = 0;
    for (let i = 0; i < 24; i++) {
      const { decisions, byDecision } = play(`d89-chain-${i}`, i % 2 ? "cam" : "st");
      const years = new Map<string, Decision[]>();
      for (const decision of decisions) if (decision.match && decision.match.stage !== "league") {
        const key = `${decision.year}:${decision.match.competition}`;
        years.set(key, [...(years.get(key) ?? []), decision]);
      }
      for (const list of years.values()) {
        if (list.length < 2) continue;
        chains++;
        const stages = list.map((decision) => order[decision.match!.stage]);
        expect([...stages].sort((a, b) => a - b)).toEqual(stages);
        expect(new Set(stages).size).toBe(stages.length);
        for (const decision of list.slice(0, -1)) {
          expect(byDecision.get(decision.id)?.won).toBe(true);
        }
      }
    }
    expect(chains).toBeGreaterThan(0);
  }, 30000);
});

describe("D89: promessa é decisão principal", () => {
  it("promessa e reinvenção nunca chegam depois de outra decisão principal do mesmo ano", () => {
    let promises = 0;
    for (const pace of ["intense", "normal"] as const) for (const position of ["st", "gk", "cm"] as const) {
      const { decisions } = play(`d89-promise-${pace}-${position}`, position, pace);
      decisions.forEach((decision, index) => {
        if (decision.kind !== "promise" && decision.kind !== "veteran") return;
        promises++;
        expect(decision.progress).toBeUndefined();
        const previous = decisions[index - 1];
        if (previous) expect(previous.year).toBeLessThan(decision.year);
      });
    }
    expect(promises).toBeGreaterThan(0);
  });
  it("não é oferecida no meio de um período nem com outra promessa em curso", () => {
    const career = player("d89-promise-due");
    const drama = { remaining: 1, startAge: career.age, startAttributes: [70, 70, 70, 70, 70, 70] as const, event: null, traitor: false, prepared: true, queue: [], results: [], decisions: 1 };
    expect(promiseDue({ ...career, drama })).toBe(false);
    expect(promiseDue({ ...career, promise: { year: 2030, level: "humble", metric: "contributions", target: 10 } })).toBe(false);
  });
});

describe("D89: Bola de Ouro um pouco mais acessível no topo", () => {
  it("o alívio começa em 90, cresce devagar e tem teto", () => {
    expect(ballonEliteBonus(89)).toBe(0);
    expect(ballonEliteBonus(90)).toBe(BALLON.eliteBase);
    expect(ballonEliteBonus(93)).toBeCloseTo(0.8);
    expect(ballonEliteBonus(95)).toBe(BALLON.eliteMax);
    expect(ballonEliteBonus(99)).toBe(BALLON.eliteMax);
  });
});

describe("D89: propostas mais variadas", () => {
  it("a carreira lembra os clubes das últimas propostas", () => {
    const { career } = play("d89-offers", "st");
    expect(career.recentOffers?.length ?? 0).toBeGreaterThan(0);
    expect(career.recentOffers?.length ?? 0).toBeLessThanOrEqual(MARKET.recentMemory);
    expect(new Set(career.recentOffers).size).toBe(career.recentOffers?.length);
  });
});

describe("D89: eliminação troca o jogo, não pula", () => {
  it("as fases canceladas viram outro jogo do ano quando há reserva", () => {
    let swaps = 0;
    for (let i = 0; i < 20; i++) {
      let career = createCareer(setup(`d89-swap-${i}`, i % 2 ? "cam" : "st"));
      for (let guard = 0; guard < MAX_DECISIONS && career.decision; guard++) {
        const decision = career.decision;
        const before = career.drama;
        const choice = policyChoice(career, "balanced");
        if (!choice) break;
        const step = choose(career, choice);
        const result = step.notices.find((n) => n.kind === "matchOutcome");
        const after = step.career.drama;
        if (decision.match && before && after && result?.kind === "matchOutcome" && !result.result.won && decision.match.stage !== "league") {
          const cancelled = before.queue.slice(1).filter((item) => item.competition === decision.match!.competition).length;
          const spare = (before.reserve ?? []).filter((item) => ![...before.queue, ...before.results.map((r) => r.match)].some((m) => m.competition === item.competition) && matchOrder(item) >= matchOrder(decision.match!)).length;
          expect(after.queue.some((item) => item.competition === decision.match!.competition)).toBe(false);
          expect(after.queue.length).toBe(before.queue.length - 1 - cancelled + Math.min(cancelled, spare));
          if (cancelled && spare) swaps++;
        }
        career = step.career;
      }
    }
    expect(swaps).toBeGreaterThan(0);
  });
});
