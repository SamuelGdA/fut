import { describe, expect, it } from "vitest";
import { type CoachCareer, cloneCareer, squadOf } from "../../src/coach";
import { addPromise } from "../../src/coach/events";
import { must, playStage, started } from "./helpers";

describe("promessas (spec 12): registradas com prazo e cobradas sozinhas", () => {
  const base = started("teste-promessas");
  const coach = base.coach;
  if (!coach) throw new Error("sem clube");
  // Um reserva saudável de linha recebe promessa de titularidade em metade dos jogos.
  const reserve = squadOf(base, coach.club).filter((player) => player.position !== "gk" && !player.injury)[16];
  if (!reserve) throw new Error("sem reserva");
  const promised: CoachCareer = cloneCareer(base);
  addPromise(promised, "starts", reserve.id, 0.5, "talk");
  addPromise(promised, "keep", reserve.id, 1, "talk");

  it("a promessa fica guardada com prazo e números de partida", () => {
    const starts = promised.promises.find((promise) => promise.kind === "starts");
    expect(starts?.status).toBe("active");
    expect(starts?.until).toBeGreaterThan(promised.day);
    expect(starts?.baseline.starts).toBe(0);
  });

  it("vender quem tem promessa de ficar é bloqueado", () => {
    let career = must(promised, { type: "openAction", kind: "sell" });
    career = must(career, { type: "confirmAction", payload: { kind: "sell", players: [reserve.id] } });
    const offer = career.flow?.kind === "sell" ? career.flow.offers[0] : undefined;
    if (offer?.status === "pending") {
      const result = must(career, { type: "closeAction" });
      expect(result.players[reserve.id]?.club).toBe(coach.club);
    }
  });

  it("no fim do prazo, a promessa é avaliada sozinha e a escalação automática a respeita", () => {
    const after = playStage(promised);
    const starts = after.promises.find((promise) => promise.kind === "starts");
    const keep = after.promises.find((promise) => promise.kind === "keep");
    expect(starts?.status).not.toBe("active");
    expect(keep?.status).toBe("kept");
    const player = after.players[reserve.id];
    if (player && player.season.available >= 3) {
      expect(player.season.starts / player.season.available).toBeGreaterThanOrEqual(0.5);
      expect(starts?.status).toBe("kept");
    }
    expect(after.lastReport?.promises.map((promise) => promise.id)).toContain(starts?.id);
  }, 60_000);
});
