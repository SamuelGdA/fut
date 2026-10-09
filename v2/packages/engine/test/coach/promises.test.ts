import { describe, expect, it } from "vitest";
import { type CoachCareer, cloneCareer, squadOf } from "../../src/coach";
import { addPromise, resolveEventChoice } from "../../src/coach/events";
import { PROMISES } from "../../src/coach/tuning";
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

  it("desfazer a promessa numa conversa não conta como cumprida", () => {
    const career = cloneCareer(base);
    addPromise(career, "minutes", reserve.id, 6, "talk");
    let next = must(career, { type: "openAction", kind: "locker" });
    next = must(next, { type: "confirmAction", payload: { kind: "locker", mode: "talk", players: [reserve.id] } });
    const talk = next.flow?.kind === "locker" ? next.flow.talks[0] : undefined;
    expect(talk?.concern).toBe("promise");
    next = must(next, { type: "respond", item: talk?.id ?? "", decision: "release" });
    expect(next.promises.find((promise) => promise.kind === "minutes")?.status).toBe("released");
  });

  it("os eventos criam as promessas de não vender e de jogos para os jovens", () => {
    const career = cloneCareer(base);
    career.phase = "event";
    career.event = {
      id: "sellReserve",
      kind: "opportunity",
      subject: reserve.id,
      params: {},
      options: [{ id: "keep", chance: null, success: [{ type: "promise", kind: "keep", target: 1 }], failure: [] }],
      match: null,
      chosen: null,
      outcome: null,
    } as unknown as CoachCareer["event"];
    resolveEventChoice(career, "keep");
    expect(career.promises.some((promise) => promise.kind === "keep" && promise.player === reserve.id && promise.status === "active")).toBe(true);
    career.event = {
      id: "veteranYouth",
      kind: "crisis",
      subject: reserve.id,
      params: {},
      options: [{ id: "youth", chance: null, success: [{ type: "promise", kind: "youth", target: PROMISES.youthGames }], failure: [] }],
      match: null,
      chosen: null,
      outcome: null,
    } as unknown as CoachCareer["event"];
    resolveEventChoice(career, "youth");
    const youth = career.promises.find((promise) => promise.kind === "youth");
    expect(youth?.player).toBeNull();
    expect(youth?.target).toBe(PROMISES.youthGames);
  });
});
