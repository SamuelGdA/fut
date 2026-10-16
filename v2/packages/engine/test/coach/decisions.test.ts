import { describe, expect, it } from "vitest";
import { cloneCareer, squadOf } from "../../src/coach";
import { must, started } from "./helpers";

describe("decisões do vestiário têm consequências reais (D59)", () => {
  const base = started("decisoes-d59");
  const id = base.coach?.tactics.lineup[0];
  if (!id) throw new Error("sem titular");

  it("apoio melhora o grupo e custa confiança, sem mutar a entrada", () => {
    const before = base.coach?.board ?? 0;
    const opened = must(base, { type: "openAction", kind: "locker" });
    const next = must(opened, { type: "confirmAction", payload: { kind: "locker", mode: "meeting", choice: "support" } });
    expect(next.coach?.board).toBe(before - 2);
    expect(base.coach?.board).toBe(before);
    expect(next.flow?.kind === "locker" && next.flow.meeting?.outcome).toBe("good");
    const old = squadOf(base, base.coach?.club ?? "");
    for (const player of old) expect(next.players[player.id]?.satisfaction).toBeGreaterThan(player.satisfaction);
  });

  const outcomes = new Set<string>();
  it.each(Array.from({ length: 24 }, (_, index) => index))("descanso conserva efeito e replay na semente %i", (index) => {
      const career = cloneCareer({ ...base, setup: { ...base.setup, seed: `descanso-d59-${index}` } });
      const player = career.players[id];
      if (!player) throw new Error("sem jogador");
      player.form = -1;
      player.satisfaction = 70;
      const opened = must(career, { type: "openAction", kind: "locker" });
      const confirmed = must(opened, { type: "confirmAction", payload: { kind: "locker", mode: "talk", players: [id] } });
      const talk = confirmed.flow?.kind === "locker" ? confirmed.flow.talks[0] : null;
      if (!talk) throw new Error("sem conversa");
      const command = { type: "respond" as const, item: talk.id, decision: "rest" };
      const next = must(confirmed, command);
      const outcome = next.flow?.kind === "locker" ? next.flow.talks[0]?.outcome : null;
      outcomes.add(outcome ?? "");
      expect(next.players[id]?.form).toBe(outcome === "good" ? -0.5 : -1.5);
      expect(next.players[id]?.satisfaction).toBe((confirmed.players[id]?.satisfaction ?? 0) + (outcome === "good" ? 2 : -2));
      expect(must(confirmed, command)).toEqual(next);
      expect(confirmed.players[id]?.form).toBe(-1);
  });
  it("o lote determinístico inclui sucesso e falha", () => {
    expect([...outcomes].sort()).toEqual(["bad", "good"]);
  });
});
