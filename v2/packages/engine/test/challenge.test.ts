import { describe, expect, it } from "vitest";
import {
  autoplay,
  canRetireNow,
  CareerError,
  CHALLENGE_RETIRE_AGE,
  challengeDayId,
  challengeDayStart,
  challengeSetup,
  challengeStatus,
  contradicts,
  createCareer,
  createPlayer,
  daysSinceEpoch,
  dailyHand,
  EDICTS,
  edictState,
  erasedSeasons,
  getEdict,
  getMission,
  HIDDEN_REVEAL_AGE,
  isChallengeDayId,
  MISSION_TARGETS,
  missionFitsPosition,
  missionPoints,
  MISSIONS,
  nextChallengeAt,
  peakBonus,
  replay,
  retireNow,
  saveOf,
  shiftChallengeDay,
  TALENT_BANDS,
} from "../src";
import { rotationPick } from "../src/challenge/hand";
import { CHALLENGE_AXES } from "../src/challenge/missions";
import { POSITIONS } from "../src/player/positions";
import { PLAYABLE_COUNTRIES } from "@craque/world";

/** O Desafio do dia (GDD 27): o mesmo dia para todo mundo, mão sempre possível, pontuação da fórmula. */

describe("o dia (GDD 27.1)", () => {
  it("vira exatamente na meia-noite UTC, não na meia-noite local", () => {
    const beforeMidnight = Date.UTC(2026, 9, 2, 23, 59, 59, 999);
    const midnight = Date.UTC(2026, 9, 3, 0, 0, 0, 0);
    expect(challengeDayId(beforeMidnight)).toBe("2026-10-02");
    expect(challengeDayId(midnight)).toBe("2026-10-03");
    expect(nextChallengeAt(beforeMidnight)).toBe(midnight);
    expect(nextChallengeAt(midnight)).toBe(Date.UTC(2026, 9, 4));
    // Um fuso qualquer não muda o dia: o identificador vem do instante em UTC.
    expect(challengeDayId(new Date("2026-10-02T21:30:00-03:00").getTime())).toBe("2026-10-03");
    // A conta de calendário com inteiros bate com o relógio do sistema do ano 1 ao 9999, bissextos incluídos.
    for (let day = -719_162; day <= 2_932_896; day += 997) {
      const instant = day * 86_400_000;
      expect(challengeDayId(instant)).toBe(new Date(instant).toISOString().slice(0, 10));
    }
    expect(isChallengeDayId("2024-02-29")).toBe(true);
    expect(isChallengeDayId("2100-02-29")).toBe(false);
    expect(isChallengeDayId("2000-02-29")).toBe(true);
  });

  it("só aceita dias do calendário, e conta os dias desde a época", () => {
    expect(isChallengeDayId("2026-02-28")).toBe(true);
    expect(isChallengeDayId("2026-02-30")).toBe(false);
    expect(isChallengeDayId("2026-2-3")).toBe(false);
    expect(isChallengeDayId(20261002)).toBe(false);
    expect(daysSinceEpoch("1970-01-02")).toBe(1);
    expect(shiftChallengeDay("2026-12-31", 1)).toBe("2027-01-01");
    expect(challengeDayStart("2026-10-02")).toBe(Date.UTC(2026, 9, 2));
    expect(() => dailyHand("ontem")).toThrow();
  });
});

describe("a mão do dia (GDD 27.2)", () => {
  const days = Array.from({ length: 730 }, (_, index) => shiftChallengeDay("2026-01-01", index));

  it("é a mesma para todo mundo no mesmo dia e muda de um dia para o outro", () => {
    expect(dailyHand("2026-10-02")).toEqual(dailyHand("2026-10-02"));
    const distinct = new Set(days.slice(0, 30).map((day) => JSON.stringify(dailyHand(day))));
    expect(distinct.size).toBe(30);
  });

  it("dois anos de mãos: três eixos, nenhum par contraditório, posição e talento que podem perseguir, édito que não bloqueia", () => {
    for (const day of days) {
      const hand = dailyHand(day);
      const missions = hand.missions.map((id) => getMission(id));
      expect(missions.every(Boolean), day).toBe(true);
      expect(new Set(missions.map((item) => item?.axis)).size).toBe(3);
      expect(contradicts(hand.missions[0], hand.missions[1]) || contradicts(hand.missions[0], hand.missions[2]) || contradicts(hand.missions[1], hand.missions[2])).toBe(false);
      for (const [index, item] of missions.entries()) {
        if (!item) continue;
        expect(missionFitsPosition(item, hand.position), `${day} ${item.id} ${hand.position}`).toBe(true);
        expect(hand.targets[index]).toBeGreaterThan(0);
        expect(getEdict(hand.edict)?.blocks?.(item, hand.targets[index] ?? 0, hand.nationality) ?? false).toBe(false);
      }
      expect(hand.hidden).toBe(daysSinceEpoch(day) % 3);
    }
  });

  it("rodízio: nação, posição e édito nunca repetem de um dia para o outro, e cada um volta só depois do ciclo", () => {
    const long = Array.from({ length: 1500 }, (_, index) => dailyHand(shiftChallengeDay("2025-06-01", index)));
    for (let index = 1; index < long.length; index += 1) {
      const today = long[index];
      const yesterday = long[index - 1];
      expect(today?.nationality, today?.id).not.toBe(yesterday?.nationality);
      expect(today?.position, today?.id).not.toBe(yesterday?.position);
      expect(today?.edict, today?.id).not.toBe(yesterday?.edict);
    }
    // Dentro de um ciclo de posições (12 dias, alinhado à época), as 12 aparecem.
    const start = long.findIndex((hand) => daysSinceEpoch(hand.id) % POSITIONS.length === 0);
    const cycle = long.slice(start, start + POSITIONS.length).map((hand) => hand.position);
    expect(new Set(cycle).size).toBe(POSITIONS.length);
    // Toda nação com liga jogável aparece no período.
    expect(new Set(long.map((hand) => hand.nationality)).size).toBe(PLAYABLE_COUNTRIES.length);
    // O édito do rodízio quase sempre fecha mão: os dez aparecem com frequência parecida.
    const edictCount = new Map<string, number>();
    for (const hand of long) edictCount.set(hand.edict, (edictCount.get(hand.edict) ?? 0) + 1);
    for (const edict of EDICTS) expect(edictCount.get(edict.id) ?? 0, edict.id).toBeGreaterThan(100);
  });

  it("o rodízio cobre o passado também (dias antes da época)", () => {
    expect(rotationPick(["a", "b", "c"], "teste", -1)).toBe(rotationPick(["a", "b", "c"], "teste", -1));
    for (let day = -30; day < 30; day += 1) {
      expect(rotationPick(["a", "b", "c", "d"], "teste", day)).not.toBe(rotationPick(["a", "b", "c", "d"], "teste", day + 1));
    }
  });

  it("o talento da mão é o do jogador que o desafio cria", () => {
    for (const day of days.slice(0, 40)) {
      const hand = dailyHand(day);
      expect(createPlayer({ seed: hand.seed, position: hand.position, difficulty: "hard" }).talent).toBe(hand.talent);
    }
  });

  it("o catálogo tem 36 missões em nove eixos, e alvo calibrado para cada uma", () => {
    expect(MISSIONS).toHaveLength(36);
    for (const axis of CHALLENGE_AXES) expect(MISSIONS.filter((item) => item.axis === axis)).toHaveLength(4);
    expect(Object.keys(MISSION_TARGETS).sort()).toEqual(MISSIONS.map((item) => item.id).sort());
    for (const item of MISSIONS) {
      const row = MISSION_TARGETS[item.id];
      expect(TALENT_BANDS.some((band) => (row?.[band] ?? 0) > 0), item.id).toBe(true);
    }
    expect(EDICTS).toHaveLength(10);
    expect(EDICTS.filter((edict) => edict.kind === "floor")).toHaveLength(1);
  });
});

describe("o setup e a tentativa", () => {
  const hand = dailyHand("2026-10-02");
  const setup = challengeSetup(hand, { surname: "DESAFIO", foot: "left", dreamNumber: 7 });

  it("Difícil, Normal, semente e ano do dia, nação e posição dadas; aposentar a partir dos 27", () => {
    expect(setup).toMatchObject({ seed: hand.seed, startYear: 2026, pace: "normal", difficulty: "hard", challengeId: "2026-10-02" });
    expect(setup.identity).toMatchObject({ nationality: hand.nationality, position: hand.position, surname: "DESAFIO", foot: "left", dreamNumber: 7 });
    let career = createCareer(setup);
    for (let guard = 0; guard < 40 && career.decision && career.age < 27; guard += 1) {
      expect(career.decision.options.some((option) => option.kind === "retire")).toBe(false);
      // "Encerrar carreira" fora das decisões também espera os 27.
      expect(canRetireNow(career)).toBe(false);
      expect(() => retireNow(career)).toThrow(CareerError);
      const option = career.decision.options[0];
      if (!option) break;
      career = replay({ ...saveOf(career), choices: [...career.choices, { decision: career.decision.id, option: option.id }] });
    }
    expect(CHALLENGE_RETIRE_AGE).toBe(27);
    if (career.age >= 27 && !career.end) {
      expect(canRetireNow(career)).toBe(true);
      expect(retireNow(career).end?.reason).toBe("voluntary");
    }
    // Fora do desafio, encerrar vale depois da primeira temporada (D42).
    const free = createCareer({ ...setup, challengeId: undefined });
    expect(canRetireNow(free)).toBe(false);
    expect(() => retireNow(free)).toThrow(CareerError);
    const firstOption = free.decision?.options[0];
    if (!free.decision || !firstOption) throw new Error("sem primeira decisão");
    const afterFirst = replay({ ...saveOf(free), choices: [{ decision: free.decision.id, option: firstOption.id }] });
    expect(afterFirst.history.length).toBeGreaterThan(0);
    expect(canRetireNow(afterFirst)).toBe(true);
  });

  it("o sobrenome, o pé e o número dos sonhos não mudam o mundo nem o jogador", () => {
    const other = challengeSetup(hand, { surname: "OUTRO", foot: "right", dreamNumber: null });
    const a = createCareer(setup);
    const b = createCareer(other);
    expect(a.player).toEqual(b.player);
    expect(a.world).toEqual(b.world);
  });

  it("a pontuação segue a fórmula; só as duas melhores contam; a escondida abre aos 24", () => {
    const career = autoplay(createCareer(setup), "balanced");
    const status = challengeStatus(hand, career);
    const sorted = [...status.missions].sort((a, b) => b.points - a.points);
    expect(status.raw).toBeCloseTo((sorted[0]?.points ?? 0) + (sorted[1]?.points ?? 0), 6);
    expect(status.missions.filter((item) => item.counted)).toHaveLength(2);
    expect(status.missions.every((item) => !item.hidden)).toBe(true);
    const factor = status.edict.state === "intact" || status.edict.state === "met" ? 1 : 0.5;
    expect(status.total).toBe(Math.round((status.raw + status.peak) * factor * 0.97 ** status.erased));
    expect(status.total).toBeLessThanOrEqual(1000);

    // No começo, a escondida ainda não abriu.
    const young = createCareer(setup);
    expect(challengeStatus(hand, young).missions[hand.hidden]?.hidden).toBe(true);
    expect(HIDDEN_REVEAL_AGE).toBe(24);
  });

  it("curva das missões e bônus de pico", () => {
    expect(missionPoints(0)).toBe(0);
    expect(missionPoints(1)).toBeCloseTo(400, 9);
    expect(missionPoints(0.5)).toBeGreaterThan(200);
    expect(missionPoints(2)).toBeCloseTo(445, 9);
    expect(missionPoints(16)).toBe(450);
    expect(peakBonus(72)).toBe(0);
    expect(peakBonus(99)).toBeCloseTo(100, 9);
    expect(peakBonus(110)).toBeCloseTo(100, 9);
  });

  it("éditos: teto quebra de vez; piso fica pendente até o fim", () => {
    const career = autoplay(createCareer(setup), "ambitious");
    for (const edict of EDICTS) {
      const state = edictState(edict, career);
      if (edict.kind === "ceiling") expect(["intact", "broken"]).toContain(state);
      else expect(["met", "broken"]).toContain(state);
    }
    const floor = EDICTS.find((edict) => edict.kind === "floor");
    if (floor) expect(edictState(floor, createCareer(setup))).toBe("pending");
    expect(erasedSeasons(career.history)).toBeGreaterThanOrEqual(0);
  });
});
