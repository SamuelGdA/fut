import { type Career, challengeStatus, choose, createCareer, HIDDEN_REVEAL_AGE, policyChoice } from "@craque/engine";
import { describe, expect, it } from "vitest";
import { formatChallengeDay, formatCountdown } from "../../i18n/format";
import { EMPTY_DRAFT } from "../career/draft";
import { buildPlay, challengePage } from "../career/play";
import { readChallengeClock } from "./clock";
import { challengeCareerSetup, handOf } from "./start";

/** O Desafio do dia na interface (GDD 27): o relógio, a mão do dia e a revelação. */

describe("relógio do desafio (GDD 27.1)", () => {
  it("o dia é o de UTC e a contagem acaba exatamente na meia-noite UTC", () => {
    const late = Date.UTC(2026, 9, 2, 23, 59, 58);
    expect(readChallengeClock(late)).toEqual({ day: "2026-10-02", msLeft: 2000 });
    expect(readChallengeClock(Date.UTC(2026, 9, 3)).day).toBe("2026-10-03");
    // 21h em Brasília já é o dia seguinte em UTC.
    expect(readChallengeClock(new Date("2026-10-02T21:00:00-03:00").getTime()).day).toBe("2026-10-03");
  });

  it("contagem regressiva e o dia no jeito de cada idioma, sem escorregar de fuso", () => {
    expect(formatCountdown(2000)).toBe("00:00:02");
    expect(formatCountdown(36_000_000 + 61_000)).toBe("10:01:01");
    expect(formatCountdown(-5)).toBe("00:00:00");
    expect(formatChallengeDay("2026-10-02", "pt")).toBe("2 de outubro");
    expect(formatChallengeDay("2026-10-02", "es")).toBe("2 de octubre");
    expect(formatChallengeDay("2026-10-02", "en")).toBe("2 October");
    expect(formatChallengeDay("2026-01-01", "pt", true)).toBe("1 de janeiro de 2026");
  });
});

describe("a tentativa nasce da mão do dia", () => {
  it("a mão é calculada uma vez por dia, e o setup só leva do rascunho o que é livre", () => {
    expect(handOf("2026-10-02")).toBe(handOf("2026-10-02"));
    const setup = challengeCareerSetup("2026-10-02", { ...EMPTY_DRAFT, surname: " silva ", foot: "left", dreamNumber: 8, nationality: "ARG", position: "gk" }, "pt");
    const hand = handOf("2026-10-02");
    expect(setup.challengeId).toBe("2026-10-02");
    expect(setup.identity).toEqual({ surname: "SILVA", foot: "left", dreamNumber: 8, nationality: hand.nationality, position: hand.position });
    expect(setup).toMatchObject({ seed: hand.seed, difficulty: "hard", pace: "normal" });
  });
});

describe("a página do desafio na revelação (GDD 27.6)", () => {
  /** Joga a tentativa até a decisão que cruza os 24 e devolve o antes e o depois. */
  function crossing(): { before: Career; after: Career } {
    const hand = handOf("2026-10-02");
    let career = createCareer(challengeSetup(hand));
    for (let guard = 0; guard < 60; guard += 1) {
      const choice = policyChoice(career, "balanced");
      if (!choice) break;
      const next = choose(career, choice).career;
      const lastBefore = career.history[career.history.length - 1]?.age ?? 0;
      const lastAfter = next.history[next.history.length - 1]?.age ?? 0;
      if (lastBefore < HIDDEN_REVEAL_AGE && lastAfter >= HIDDEN_REVEAL_AGE) return { before: career, after: next };
      career = next;
    }
    throw new Error("a tentativa não cruzou os 24");
  }

  function challengeSetup(hand: ReturnType<typeof handOf>) {
    return challengeCareerSetup(hand.id, { ...EMPTY_DRAFT, surname: "TESTE" }, "pt");
  }

  it("a missão surpresa aparece com o texto inteiro na jogada que cruza os 24", () => {
    const hand = handOf("2026-10-02");
    const { before, after } = crossing();
    const page = challengePage(challengeStatus(hand, before), challengeStatus(hand, after), after.history[after.history.length - 1]?.ovrEnd ?? 0);
    expect(page?.opened).toBe(hand.hidden);
    expect(page?.after.missions[hand.hidden]?.hidden).toBe(false);
    expect(page?.before.missions[hand.hidden]?.hidden).toBe(true);
  });

  it("sem nada marcante, sem página; a página fecha a revelação, depois das temporadas", () => {
    const hand = handOf("2026-10-02");
    const career = createCareer(challengeSetup(hand));
    const status = challengeStatus(hand, career);
    expect(challengePage(status, status, 0)).toBeNull();

    const { before, after } = crossing();
    const decision = before.decision;
    const choice = policyChoice(before, "balanced");
    const option = decision?.options.find((item) => item.id === choice?.option);
    if (!decision || !choice || !option) throw new Error("sem decisão");
    const step = choose(before, choice);
    expect(step.career).toEqual(after);
    const session = buildPlay(before, decision, option, step, { before: challengeStatus(hand, before), after: challengeStatus(hand, after) });
    expect(session.pages[session.pages.length - 1]?.kind).toBe("challenge");
    expect(session.pages.filter((page) => page.kind === "challenge")).toHaveLength(1);
    // Sem o desafio, a mesma jogada não tem a página.
    expect(buildPlay(before, decision, option, step).pages.some((page) => page.kind === "challenge")).toBe(false);
  });
});
