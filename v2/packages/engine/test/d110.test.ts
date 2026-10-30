import { describe, expect, it } from "vitest";
import { EVENT_CATALOG, type Career } from "../src";
import { outcomeStream } from "../src/career/outcome";
import { pickMatchScene } from "../src/career/matchMoments";
import { stream } from "../src/rng";
import { productionRates, setPieceSkill } from "../src/season/production";

describe("D110: no hipotético, a mesma escolha tem a chance sorteada de novo", () => {
  const career = (rerolls?: Career["setup"]["rerolls"]) => ({ setup: { seed: "d110", rerolls } }) as unknown as Career;

  it("antes do ponto de troca o sorteio é o da linha original; depois, outro", () => {
    const original = outcomeStream(career(), 12, "events", "outcome", 12).next();
    const branched = career([{ from: 12, salt: "linha-b" }]);
    expect(outcomeStream(branched, 11, "events", "outcome", 11).next()).toBe(outcomeStream(career(), 11, "events", "outcome", 11).next());
    expect(outcomeStream(branched, 12, "events", "outcome", 12).next()).not.toBe(original);
  });

  it("um hipotético dentro de outro guarda as trocas anteriores", () => {
    const first = career([{ from: 5, salt: "a" }]);
    const second = career([{ from: 5, salt: "a" }, { from: 9, salt: "b" }]);
    expect(outcomeStream(second, 7, "drama", "outcome", 7).next()).toBe(outcomeStream(first, 7, "drama", "outcome", 7).next());
    expect(outcomeStream(second, 9, "drama", "outcome", 9).next()).not.toBe(outcomeStream(first, 9, "drama", "outcome", 9).next());
  });
});

describe("D110: briga com a diretoria", () => {
  it("não recuar é a transferência certa; retratar-se custa 10 de torcida", () => {
    const event = EVENT_CATALOG.find((item) => item.id === "rowBoard")!;
    const stand = event.options.find((option) => option.id === "standGround")!;
    expect(stand.kind).toBe("choice");
    expect(stand.chance).toBeUndefined();
    expect(stand.success).toContainEqual({ kind: "transfer", to: "offer" });
    expect(event.options.find((option) => option.id === "apologize")!.success).toEqual([{ kind: "fans", amount: -10 }]);
  });
});

describe("D110: o batedor do time fora do ataque", () => {
  const input = (position: "cb" | "st", finishing: number) => ({
    position, ovr: 82, attributes: [80, finishing, 75, 75, 82, 80] as const, trait: "professional" as const,
    teamStrength: 80, clubStrength: 80, opposition: 75, games: 40,
  });

  it("finalização alta dá mais gols ao zagueiro; o atacante não ganha esse bônus", () => {
    expect(setPieceSkill("cb", 79)).toBe(0);
    expect(setPieceSkill("cb", 99)).toBe(1);
    expect(setPieceSkill("st", 99)).toBe(0);
    expect(productionRates(input("cb", 95)).goalsPerGame).toBeGreaterThan(productionRates(input("cb", 70)).goalsPerGame * 1.8);
  });

  it("o zagueiro batedor cai mais em pênalti e falta no jogo-chave", () => {
    const share = (finishing: number) => {
      let kicks = 0;
      for (let index = 0; index < 2000; index++) {
        const scene = pickMatchScene("cb", true, new Set(), stream(`cena:${index}`, "drama"), finishing);
        if (scene === "penalty" || scene === "freeKick" || scene === "decisivePenalty") kicks++;
      }
      return kicks / 2000;
    };
    expect(share(60)).toBeLessThan(0.02);
    expect(share(97)).toBeGreaterThan(0.2);
  });
});
