import { describe, expect, it } from "vitest";
import { canRedraw, choose, createCareer, MAX_DECISIONS, policyChoice, REDRAW, replay, redrawsLeft, saveOf, type Career } from "../src";
import { windowDecision } from "../src/career/decisions";

const setup = (seed: string, challengeId?: string) => ({
  seed,
  startYear: 2026,
  pace: "intense" as const,
  difficulty: "normal" as const,
  identity: { surname: "TESTE", nationality: "BRA", foot: "right" as const, position: "st" as const, dreamNumber: null },
  ...(challengeId ? { challengeId } : {}),
});

/** Joga pela política até a primeira janela com proposta. */
function toWindow(seed: string, challengeId?: string): Career | null {
  let career = createCareer(setup(seed, challengeId));
  for (let guard = 0; guard < MAX_DECISIONS && career.decision; guard++) {
    if (career.decision.kind === "window" && career.decision.options.some((option) => option.kind === "club")) return career;
    const choice = policyChoice(career, "balanced");
    if (!choice) return null;
    career = choose(career, choice).career;
  }
  return null;
}

const clubs = (career: Career) => career.decision?.options.flatMap((option) => option.kind === "club" ? [option.offer.club] : []) ?? [];
const redraw = (career: Career) => choose(career, { decision: career.decision!.id, option: REDRAW.option }).career;

describe("D118: novo sorteio de clubes na janela", () => {
  const windows = Array.from({ length: 12 }, (_, index) => toWindow(`d118-${index}`)).filter((career): career is Career => career !== null);

  it("acha janelas para testar", () => {
    expect(windows.length).toBeGreaterThan(5);
  });

  it("até duas vezes por carreira, sem repetir clube da mesma janela", () => {
    for (const start of windows) {
      expect(canRedraw(start)).toBe(true);
      expect(redrawsLeft(start)).toBe(2);
      const first = redraw(start);
      expect(first.decision?.kind).toBe("window");
      expect(first.decision?.id).toBe(start.decision!.id + 1);
      expect(redrawsLeft(first)).toBe(1);
      for (const club of clubs(first)) expect(clubs(start)).not.toContain(club);
      const second = redraw(first);
      expect(redrawsLeft(second)).toBe(0);
      expect(canRedraw(second)).toBe(false);
      for (const club of clubs(second)) expect([...clubs(start), ...clubs(first)]).not.toContain(club);
      expect(second.decision?.redrawn).toEqual([...clubs(start), ...clubs(first)]);
      expect(() => redraw(second)).toThrow(/indisponível/);
      // Ficar continua lá, e a carreira segue normalmente.
      expect(second.decision?.options.some((option) => option.kind === "stay")).toBe(true);
      const after = choose(second, policyChoice(second, "balanced")!).career;
      expect(after.decision?.id).toBeGreaterThan(second.decision!.id);
    }
  });

  it("o mesmo nível: o sorteio troca as opções, não melhora o mercado", () => {
    let before = 0;
    let after = 0;
    let count = 0;
    for (const start of windows) {
      const original = start.decision!.options.flatMap((option) => option.kind === "club" ? [option.offer.strength] : []);
      const redrawn = redraw(start).decision!.options.flatMap((option) => option.kind === "club" ? [option.offer.strength] : []);
      if (!original.length || !redrawn.length) continue;
      before += Math.max(...original);
      after += Math.max(...redrawn);
      count++;
    }
    expect(count).toBeGreaterThan(0);
    // Na média, o melhor clube do novo sorteio fica perto do primeiro (nunca um salto de nível).
    expect(Math.abs(after - before) / count).toBeLessThan(6);
  });

  it("entra no save e o replay refaz o mesmo sorteio", () => {
    const start = windows[0]!;
    const redrawn = redraw(start);
    const save = saveOf(redrawn);
    expect(save.choices.at(-1)).toEqual({ decision: start.decision!.id, option: REDRAW.option });
    const again = replay(save);
    expect(clubs(again)).toEqual(clubs(redrawn));
    expect(again.redraws).toBe(1);
  });

  it("não vale no Desafio do dia nem fora da janela", () => {
    const challenge = toWindow("d118-desafio", "2026-11-01");
    if (challenge) expect(canRedraw(challenge)).toBe(false);
    const fresh = createCareer(setup("d118-base"));
    expect(fresh.decision?.kind).not.toBe("window");
    expect(canRedraw(fresh)).toBe(false);
    expect(() => choose(fresh, { decision: fresh.decision!.id, option: REDRAW.option })).toThrow();
  });

  it("escolha velha é recusada", () => {
    const start = windows[0]!;
    expect(() => choose(start, { decision: start.decision!.id - 1, option: REDRAW.option })).toThrow(/decisão/);
  });

  it("janela sem sorteio anterior não marca clubes vistos", () => {
    const start = windows[0]!;
    expect(start.decision?.redrawn).toBeUndefined();
    expect(windowDecision(start).decision?.redrawn).toBeUndefined();
  });
});
