import { describe, expect, it } from "vitest";
import { attributesAt, autoplay, choose, createCareer, EVENT_CATALOG, FOCUS_SLOT, matchActionKind, matchChance, matchScenes, MAX_DECISIONS, ovrAt, peakSeason, policyChoice, POSITIONS, replay, saveOf, type Career, type KeyMatch, type Position } from "../src";
import { hasPublicRole, promiseOptions, veteranDue } from "../src/career/drama";
import { eligibleEvents } from "../src/career/events";
import { eventContext } from "../src/career/context";
import { nextDecision } from "../src/career/decisions";
import { applyFocusNow, guaranteeFocus } from "../src/evolution/training";

const setup = (seed: string, position: Position = "st", pace: "normal" | "intense" = "intense") => ({ seed, startYear: 2026, pace, difficulty: "normal" as const, identity: { surname: "TESTE", foot: "right" as const, nationality: "BRA", position, dreamNumber: null } });
const match: KeyMatch = { competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 86, score: [1, 1], scene: "breakaway" };
const advance = (career: Career) => choose(career, policyChoice(career, "balanced")!).career;

describe("D74: decisões coerentes com o jogador", () => {
  it("metas crescem de dez em dez; sem espaço não há vitrine pública", () => {
    const base = advance(createCareer(setup("d74-public")));
    const low: Career = { ...base, player: { ...base.player, capacity: 25 } };
    expect(hasPublicRole(low)).toBe(false);
    const events = eligibleEvents(low, eventContext(low));
    expect(events.some((event) => event.tags.some((tag) => ["fame", "fans", "leadership", "legacy", "shirt", "final"].includes(tag)) || event.id === "silentWeek")).toBe(false);
    for (const position of POSITIONS) {
      const promises = promiseOptions({ ...base, player: { ...base.player, position } });
      expect(promises.map((item) => item.target % 10)).toEqual([0, 0, 0]);
      expect(promises[0]!.target).toBeGreaterThanOrEqual(10);
      expect(promises[2]!.target - promises[0]!.target).toBe(20);
    }
    expect(EVENT_CATALOG.some((event) => event.id === "painBeforeFinal")).toBe(false);
  });

  it("a oferta obrigatória adia o acontecimento agendado sem apagá-lo", () => {
    const base = advance(createCareer(setup("d74-queued-event")));
    const career = { ...base, age: 21, agenda: [18], eventsSeen: [], lastOfferYear: base.world.year };
    expect(nextDecision(career).decision?.kind).toBe("event");
    const offer = nextDecision({ ...career, lastOfferYear: base.world.year - 3 });
    expect(offer.decision?.kind).toBe("window");
    expect(offer.agenda).toEqual([18]);
    expect(nextDecision({ ...offer, decision: null, lastOfferYear: base.world.year }).decision?.kind).toBe("event");
  });

  it("OVR e atributo específico ajudam separadamente, sem transformar defesa em gol", () => {
    const base = createCareer(setup("d74-chances"));
    const career = { ...base, age: 25, player: { ...base.player, capacity: 65 } };
    const raised = { ...career, player: { ...career.player, capacity: 75 } };
    expect(matchChance(raised, match, "bold")).toBeGreaterThan(matchChance(career, match, "bold"));
    const technique = { ...career, player: { ...career.player, training: [0, 8, 0, 0, 0, 0] as const } };
    const unrelated = { ...career, player: { ...career.player, training: [0, 0, 0, 0, 8, 0] as const } };
    expect(matchChance(technique, match, "bold")).toBeGreaterThan(matchChance(unrelated, match, "bold"));
    expect(new Set(POSITIONS.flatMap((position) => matchScenes(position, true))).size).toBe(53);
    expect(matchActionKind("gk", { ...match, scene: "keeper" }, "bold")).toBe("save");
    expect(matchActionKind("cb", { ...match, scene: "interception" }, "bold")).toBe("tackle");
    expect(matchActionKind("rb", { ...match, scene: "cross" }, "bold")).toBe("pass");
    expect(matchActionKind("cm", { ...match, scene: "throughBall" }, "bold")).toBe("pass");
    expect(matchActionKind("st", match, "bold")).toBe("shot");
  });

  it("as políticas de partida não consultam probabilidades ocultas", () => {
    const base = createCareer(setup("d74-policy-information"));
    const decision = { ...base.decision!, kind: "match" as const, match, options: ["bold", "team", "safe"].map((action, index) => ({ id: `drama:${action}`, kind: "drama" as const, action, chance: index / 2 })) };
    const career = { ...base, decision };
    const reversed = { ...career, decision: { ...decision, options: decision.options.map((option) => ({ ...option, chance: 1 - option.chance })) } };
    for (const policy of ["ambitious", "balanced", "loyal"] as const) expect(policyChoice(career, policy)).toEqual(policyChoice(reversed, policy));
    expect(policyChoice(career, "ambitious")?.option).toBe("drama:bold");
    expect(policyChoice({ ...career, age: 35 }, "loyal")?.option).toBe("drama:safe");
  });

  it("a política fiel permanece enquanto joga e aceita empréstimo se perdeu espaço", () => {
    const base = autoplay(createCareer(setup("d74-loyal-window")), "balanced");
    const record = base.history[0]!;
    const born = createCareer(setup("d74-loyal-window"));
    const offer = born.decision!.options.find((option) => option.kind === "club")!;
    const ongoing = advance(born);
    const career: Career = { ...ongoing, age: 25, history: [{ ...record, club: ongoing.contract!.club, role: "starter", games: 30 }], decision: { ...ongoing.decision!, kind: "window", options: [{ id: "stay", kind: "stay", shirt: null }, offer] } };
    expect(policyChoice(career, "loyal")?.option).toBe("stay");
    const loan: Career = { ...career, age: 20, history: [{ ...career.history[0]!, clubStrength: 80, role: "reserve", games: 4 }], decision: { ...career.decision!, kind: "loan", options: [{ id: "stay", kind: "stay", shirt: null }, { ...offer, offer: { ...offer.offer, strength: 80, role: "starter", loan: true } }] } };
    expect(policyChoice(loan, "loyal")?.option).toBe(offer.id);
  });

  it("reinvenção exige queda do OVR pela idade, e só aparece uma vez", () => {
    const base = createCareer(setup("d74-veteran"));
    const player = { ...base.player, capacity: 80, longevity: 0 };
    for (let age = 25; age < 40; age++) {
      const career = { ...base, player, age };
      if (veteranDue(career)) { expect(age).toBeGreaterThanOrEqual(33); expect(ovrAt(player, age - 2) - ovrAt(player, age)).toBeGreaterThanOrEqual(2); }
      expect(veteranDue({ ...career, veteran: "maestro" })).toBe(false);
    }
  });

  it("treino é imediato e a garantia cobre declínio mesmo após oito pontos acumulados", () => {
    const base = createCareer(setup("d74-training"));
    const player = { ...base.player, capacity: 72, potential: 72, longevity: 0, training: [12, 0, 0, 0, 0, 0] as const };
    const before = attributesAt(player, 31);
    const trained = applyFocusNow(player, "burst", 31);
    expect(attributesAt(trained, 31)[0]).toBeGreaterThanOrEqual(Math.min(99, before[0] + 2));
    const later = guaranteeFocus({ ...trained, capacity: trained.capacity - 4 }, "burst", before, 33);
    expect(attributesAt(later, 33)[0]).toBeGreaterThanOrEqual(Math.min(99, before[0] + 2));
  });

  it("auge empatado segue gols, assistências ou defesa conforme a posição", () => {
    const record = autoplay(createCareer(setup("d74-peak")), "balanced").history[0]!;
    for (const position of ["st", "cm", "cb", "gk"] as const) {
      const first = { ...record, year: 2030, position, ovrEnd: 90, production: { ...record.production, goals: 40, assists: 2, cleanSheets: 3 } };
      const second = { ...first, year: 2031, production: { ...first.production, goals: 10, assists: 25, cleanSheets: 5 } };
      const third = { ...first, year: 2032, production: { ...first.production, goals: 5, assists: 8, cleanSheets: 24 } };
      expect(peakSeason([first, second, third])?.year).toBe(position === "st" ? 2030 : position === "cm" ? 2031 : 2032);
    }
  });
});

describe("D74: laço real e replay", () => {
  for (const pace of ["intense", "normal"] as const) it(`${pace}: ofertas em até três anos, seleção por último e treino antes do próximo lance`, () => {
    let career = createCareer(setup(`d74-loop-${pace}`, "cm", pace));
    let lastOffer = career.setup.startYear, training = 0, matches = 0;
    const floors: Array<{ year: number; slot: number; goal: number }> = [];
    const nationalYears = new Set<number>();
    for (let guard = 0; guard < MAX_DECISIONS && career.decision; guard++) {
      const decision = career.decision;
      const external = decision.options.some((option) => option.kind === "club" && option.offer.club !== career.contract?.club || option.kind === "event" && option.target?.club && option.target.club.club !== career.contract?.club);
      if (external) lastOffer = decision.year;
      expect(decision.year - lastOffer).toBeLessThanOrEqual(3);
      expect(decision.kind === "window" && decision.options.length === 1 && decision.options[0]!.kind === "stay").toBe(false);
      if (decision.progress) {
        expect(decision.progress.index).toBeLessThanOrEqual(decision.progress.total);
        expect(decision.progress.total).toBeLessThanOrEqual(5);
      }
      if (decision.match) {
        matches++;
        if (decision.match.national) nationalYears.add(decision.year);
        else expect(nationalYears.has(decision.year)).toBe(false);
      }
      if (decision.kind === "promise") expect(hasPublicRole(career)).toBe(true);
      if (decision.kind === "veteran") expect(veteranDue(career)).toBe(true);
      const choice = policyChoice(career, "balanced")!;
      const option = decision.options.find((item) => item.id === choice.option)!;
      const before = attributesAt(career.player, career.age);
      career = choose(career, choice).career;
      if (option.kind === "focus") {
        training++;
        const slot = FOCUS_SLOT[option.focus];
        floors.push({ year: decision.year, slot, goal: Math.min(99, before[slot] + 2) });
        expect(attributesAt(career.player, career.age)[slot]).toBeGreaterThanOrEqual(Math.min(99, before[slot] + 2));
      }
    }
    expect(career.end).not.toBeNull();
    expect(matches).toBeGreaterThan(0);
    expect(training).toBeGreaterThan(0);
    for (const floor of floors) for (let year = floor.year; year < floor.year + (pace === "normal" ? 2 : 1); year++) {
      const record = career.history.find((item) => item.year === year);
      if (record) expect(record.attributes[floor.slot]).toBeGreaterThanOrEqual(floor.goal);
    }
    expect(replay(saveOf(career))).toEqual(career);
  });
});
