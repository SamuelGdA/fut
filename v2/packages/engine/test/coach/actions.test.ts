import { describe, expect, it } from "vitest";
import {
  ACTIONS_PER_STAGE,
  type CoachCareer,
  FUNDS,
  fundsPreview,
  purchaseChance,
  purchasePreview,
  squadOf,
  valueOf,
} from "../../src/coach";
import { must, refused, started } from "./helpers";

/** Alvos com negócio quase certo e preço bem abaixo da verba. */
function easyTargets(career: CoachCareer, count: number): string[] {
  const coach = career.coach;
  if (!coach) throw new Error("sem clube");
  const strength = career.clubs[coach.club]?.strength ?? 60;
  return Object.values(career.players)
    .filter((player) => player.club && player.club !== coach.club && player.ovr <= strength - 2 && player.ovr >= strength - 6)
    .filter((player) => valueOf(player, career.year) * 1.6 < coach.budget / 3)
    .map((player) => ({ player, chance: purchaseChance(career, player, coach.club).total }))
    .sort((a, b) => b.chance - a.chance || a.player.id.localeCompare(b.player.id))
    .slice(0, count)
    .map((entry) => entry.player.id);
}

describe("as sete ações e o limite por etapa (spec 6)", () => {
  const base = started("teste-acoes");

  it("três ações por etapa; a quarta é recusada; ações podem se repetir", () => {
    let career = base;
    for (let index = 0; index < ACTIONS_PER_STAGE; index += 1) {
      career = must(career, { type: "openAction", kind: "train" });
      career = must(career, { type: "confirmAction", payload: { kind: "train", sector: "def" } });
    }
    expect(career.actionsUsed).toBe(3);
    expect(career.coach?.training.def).toBe(3);
    expect(refused(career, { type: "openAction", kind: "train" })).toBe("noActions");
  });

  it("abrir e cancelar não gasta ação; com um processo aberto não se abre outro nem se simula", () => {
    let career = must(base, { type: "openAction", kind: "buy" });
    expect(career.actionsUsed).toBe(0);
    expect(refused(career, { type: "openAction", kind: "train" })).toBe("flowOpen");
    career = must(career, { type: "cancelAction" });
    expect(career.flow).toBeNull();
    expect(career.actionsUsed).toBe(0);
  });

  it("comandos nunca mudam o estado recebido", () => {
    const before = JSON.stringify({ coach: base.coach, actions: base.actionsUsed, flow: base.flow });
    must(base, { type: "openAction", kind: "train" });
    expect(JSON.stringify({ coach: base.coach, actions: base.actionsUsed, flow: base.flow })).toBe(before);
  });

  it("contratar: nada muda até aceitar; aceitar muda uma vez; o pendente vira recusa ao concluir", () => {
    const targets = easyTargets(base, 3);
    expect(targets).toHaveLength(3);
    let career = must(base, { type: "openAction", kind: "buy" });
    career = must(career, { type: "confirmAction", payload: { kind: "buy", players: targets } });
    expect(career.actionsUsed).toBe(1);
    const coach = career.coach;
    if (!coach || career.flow?.kind !== "buy") throw new Error("fluxo de compra");
    // Ainda nada mudou: ninguém trocou de clube, verba e caixa iguais.
    for (const id of targets) expect(career.players[id]?.club).toBe(base.players[id]?.club);
    expect(coach.budget).toBe(base.coach?.budget);
    expect(career.clubs[coach.club]?.cash).toBe(base.clubs[coach.club]?.cash);
    const available = career.flow.responses.filter((response) => response.status === "pending");
    expect(available.length).toBeGreaterThan(0);
    const first = available[0];
    if (!first) throw new Error("sem resposta");
    expect(purchasePreview(career, first).ok).toBe(true);
    const accepted = must(career, { type: "respond", item: first.id, decision: "accept" });
    expect(accepted.players[first.player]?.club).toBe(coach.club);
    expect(accepted.coach?.budget).toBeCloseTo(coach.budget - first.price, 6);
    expect(accepted.players[first.player]?.wage).toBe(first.wage);
    // Aceitar de novo não faz nada: a resposta não está mais pendente.
    expect(refused(accepted, { type: "respond", item: first.id, decision: "accept" })).toBe("notPending");
    const closed = must(accepted, { type: "closeAction" });
    expect(closed.flow).toBeNull();
    const responses = accepted.flow?.kind === "buy" ? accepted.flow.responses : [];
    for (const response of responses.filter((item) => item.status === "pending")) {
      expect(closed.players[response.player]?.club).toBe(base.players[response.player]?.club);
    }
  });

  it("contratar sem verba é bloqueado no aceite e não muda nada", () => {
    const targets = easyTargets(base, 3);
    let career = must(base, { type: "openAction", kind: "buy" });
    career = must(career, { type: "confirmAction", payload: { kind: "buy", players: targets } });
    const poor: CoachCareer = { ...career, coach: career.coach ? { ...career.coach, budget: 0 } : null };
    const pending = career.flow?.kind === "buy" ? career.flow.responses.find((item) => item.status === "pending") : undefined;
    if (!pending) throw new Error("sem resposta");
    expect(refused(poor, { type: "respond", item: pending.id, decision: "accept" })).toBe("blocked:budget");
  });

  it("vender: proposta só muda o elenco no aceite; o mesmo jogador não é oferecido duas vezes na etapa", () => {
    const coach = base.coach;
    if (!coach) throw new Error("sem clube");
    const squad = squadOf(base, coach.club);
    const targets = squad.filter((player) => player.position !== "gk").slice(0, 3).map((player) => player.id);
    let career = must(base, { type: "openAction", kind: "sell" });
    career = must(career, { type: "confirmAction", payload: { kind: "sell", players: targets } });
    for (const id of targets) expect(career.players[id]?.club).toBe(coach.club);
    const offers = career.flow?.kind === "sell" ? career.flow.offers : [];
    expect(offers).toHaveLength(3);
    const pending = offers.find((offer) => offer.status === "pending");
    if (pending) {
      const sold = must(career, { type: "respond", item: pending.id, decision: "accept" });
      expect(sold.players[pending.player]?.club).toBe(pending.buyer);
      expect(sold.clubs[coach.club]?.cash).toBeCloseTo((career.clubs[coach.club]?.cash ?? 0) + pending.price, 6);
    }
    career = must(career, { type: "closeAction" });
    career = must(career, { type: "openAction", kind: "sell" });
    expect(refused(career, { type: "confirmAction", payload: { kind: "sell", players: [targets[0] ?? ""] } })).toBe("alreadyOffered");
  });

  it("vender não pode deixar o elenco inviável (menos de 2 goleiros)", () => {
    const coach = base.coach;
    if (!coach) throw new Error("sem clube");
    const keepers = squadOf(base, coach.club).filter((player) => player.position === "gk");
    let career = base;
    // Deixa só dois goleiros no elenco e tenta vender um.
    for (const extra of keepers.slice(2)) career = { ...career, players: { ...career.players, [extra.id]: { ...extra, club: "" } } };
    const target = keepers[0];
    if (!target) throw new Error("sem goleiro");
    career = must(career, { type: "openAction", kind: "sell" });
    career = must(career, { type: "confirmAction", payload: { kind: "sell", players: [target.id] } });
    const offer = career.flow?.kind === "sell" ? career.flow.offers[0] : undefined;
    if (offer?.status === "pending") expect(refused(career, { type: "respond", item: offer.id, decision: "accept" })).toBe("blocked:squad");
  });

  it("desenvolver marca até 3 jogadores, uma vez por etapa", () => {
    const coach = base.coach;
    if (!coach) throw new Error("sem clube");
    const ids = squadOf(base, coach.club).slice(0, 3).map((player) => player.id);
    let career = must(base, { type: "openAction", kind: "develop" });
    career = must(career, { type: "confirmAction", payload: { kind: "develop", players: ids } });
    for (const id of ids) expect(career.players[id]?.developedAt).not.toBeNull();
    career = must(career, { type: "openAction", kind: "develop" });
    expect(refused(career, { type: "confirmAction", payload: { kind: "develop", players: [ids[0] ?? ""] } })).toBe("notDevelopable");
  });

  it("base: candidatos fixos na etapa, um por ação, e o promovido entra com o OVR escondido", () => {
    expect(base.youth.length).toBeGreaterThan(0);
    const again = must(must(base, { type: "openAction", kind: "youth" }), { type: "cancelAction" });
    expect(again.youth.map((candidate) => candidate.id)).toEqual(base.youth.map((candidate) => candidate.id));
    const candidate = base.youth[0];
    if (!candidate) throw new Error("sem candidato");
    let career = must(base, { type: "openAction", kind: "youth" });
    career = must(career, { type: "confirmAction", payload: { kind: "youth", candidate: candidate.id } });
    const player = career.players[candidate.id];
    expect(player?.club).toBe(base.coach?.club);
    expect(player?.ovr).toBe(candidate.hiddenOvr);
    expect(player?.potential).toBe(candidate.hiddenPotential);
    career = must(career, { type: "openAction", kind: "youth" });
    expect(refused(career, { type: "confirmAction", payload: { kind: "youth", candidate: candidate.id } })).toBe("candidate");
  });

  it("pedir verba: as chances aparecem antes, cancelar é de graça, confirmar gasta a ação e só vale no aceite; limite por temporada", () => {
    const preview = fundsPreview(base);
    expect(preview.large + preview.small + preview.refused).toBeCloseTo(1, 9);
    expect(preview.largeAmount).toBeGreaterThan(preview.smallAmount);
    let career = must(base, { type: "openAction", kind: "funds" });
    expect(career.actionsUsed).toBe(0);
    const cancelled = must(career, { type: "cancelAction" });
    expect(cancelled.actionsUsed).toBe(0);
    expect(cancelled.coach?.fundsRequests).toBe(base.coach?.fundsRequests);
    career = must(career, { type: "confirmAction", payload: { kind: "funds" } });
    expect(career.actionsUsed).toBe(1);
    const response = career.flow?.kind === "funds" ? career.flow.response : null;
    if (response && response.outcome !== "refused") expect(response.amount).toBe(response.outcome === "large" ? preview.largeAmount : preview.smallAmount);
    expect(response).not.toBeNull();
    if (response?.status === "pending") {
      const budget = career.coach?.budget ?? 0;
      career = must(career, { type: "respond", item: "funds", decision: "accept" });
      expect(career.coach?.budget).toBeCloseTo(budget + response.amount, 6);
    }
    const capped: CoachCareer = { ...base, coach: base.coach ? { ...base.coach, fundsGranted: FUNDS.maxGrants } : null };
    expect(refused(capped, { type: "openAction", kind: "funds" })).toBe("fundsLimit");
  });

  it("vestiário: conversa com até 3, cada um diz o problema e a decisão tem opções", () => {
    const coach = base.coach;
    if (!coach) throw new Error("sem clube");
    const ids = squadOf(base, coach.club).slice(10, 13).map((player) => player.id);
    let career = must(base, { type: "openAction", kind: "locker" });
    career = must(career, { type: "confirmAction", payload: { kind: "locker", mode: "talk", players: ids } });
    const talks = career.flow?.kind === "locker" ? career.flow.talks : [];
    expect(talks).toHaveLength(3);
    for (const talk of talks) {
      expect(talk.concern).toBeTruthy();
      expect(talk.options.length).toBeGreaterThanOrEqual(2);
    }
    const talk = talks[0];
    if (!talk) throw new Error("sem conversa");
    career = must(career, { type: "respond", item: talk.id, decision: talk.options[0] ?? "" });
    career = must(career, { type: "closeAction" });
    expect(career.flow).toBeNull();
  });
});
