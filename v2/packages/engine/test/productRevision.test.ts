import { CLUBS } from "@craque/world";
import { describe, expect, it } from "vitest";
import { choose, createCareer, createPlayer, createRng, attributesAt, EVENT_CATALOG, fanDelta, legacySeasonPoints, ovrAt, POSITIONS } from "../src";
import { residenceCountry, eventContext } from "../src/career/context";
import { eventDecision, eligibleEvents, optionChance } from "../src/career/events";
import { nextDecision } from "../src/career/decisions";
import { applyEffects } from "../src/career/effects";
import { marketContext } from "../src/career/context";
import { clubIndex } from "../src/world/model";
import { clubStars } from "../src/career/market";
import { legacyLevel } from "../src/career/fans";
import { focusDueAt, focusesFor } from "../src/evolution/training";
import { evolveSeason } from "../src/evolution/evolve";

function played() {
  const career = createCareer({ seed: "d47-residencia", startYear: 2026, pace: "intense", difficulty: "normal",
    identity: { surname: "TESTE", foot: "right", nationality: "BRA", position: "cb", dreamNumber: null } });
  const option = career.decision?.options[0];
  if (!career.decision || !option) throw new Error("base ausente");
  return choose(career, { decision: career.decision.id, option: option.id }).career;
}

describe("participação e continuidade (D47)", () => {
  it("cinco anos quase sem jogar não fazem uma lenda, mesmo com títulos", () => {
    const season = played().history[0]!;
    const bench = { ...season, games: 4, participation: 0.08, titleImportance: 5 };
    const starter = { ...bench, games: 45, participation: 0.85 };
    expect(legacyLevel(5 * legacySeasonPoints(bench, 90, "leader"), 5, 5, 20)).toBe("respected");
    expect(legacyLevel(5 * legacySeasonPoints(starter, 90, "leader"), 5, 5, 225)).toBe("legend");
    expect(legacyLevel(1000, 24, 5, 59)).toBe("respected");
    expect(legacySeasonPoints({ ...starter, games: 0 }, 100, "leader")).toBe(0);
  });

  it("a torcida respeita a lenda veterana no banco, com consequência para rebaixamento", () => {
    const career = played();
    const input = { stats: { ...career.history[0]!, games: 0 }, debutSeason: false, position: "cb" as const,
      contract: career.contract!, fans: 90, trait: "professional" as const, difficulty: "hard" as const,
      champion: false, aboveExpected: false, relegated: false };
    expect(fanDelta(input)).toBeLessThan(0);
    expect(fanDelta({ ...input, veteranLegend: true })).toBe(0);
    expect(fanDelta({ ...input, veteranLegend: true, relegated: true })).toBe(-2);
  });

  it("eventos de partida não aparecem para quem ficou sem espaço", () => {
    const career = played();
    const context = { ...eventContext(career), derby: true, lastRole: "surplus" as const, lastGames: 1 };
    const ids = eligibleEvents(career, context).map((event) => event.id);
    for (const id of ["derby", "packedStadium", "painBeforeFinal", "decisivePenalty", "redCard"]) expect(ids).not.toContain(id);
    const regular = { ...context, lastRole: "rotation" as const, lastGames: 20 };
    expect(eligibleEvents(career, regular).map((event) => event.id)).toContain("derby");
  });

  it("disputar a vaga é 50/50 também para competidor e frágil", () => {
    const career = played();
    const option = EVENT_CATALOG.find((event) => event.id === "academyJewel")!.options.find((entry) => entry.id === "compete")!;
    for (const trait of ["competitor", "fragile"] as const) {
      expect(optionChance({ ...career, player: { ...career.player, trait } }, option)).toBe(0.5);
    }
    expect(option.success).toContainEqual({ kind: "games", scale: 1.2 });
    expect(option.failure).toContainEqual({ kind: "games", scale: 0.8 });
  });
});

describe("nova seleção por residência (D47)", () => {
  it("exige cinco anos consecutivos no país e nenhuma estreia por seleção", () => {
    const source = played();
    const club = CLUBS.find((entry) => entry.country === "URU")!.id;
    const season = { ...source.history[0]!, club, national: { ...source.history[0]!.national, games: 0 } };
    const career = { ...source, age: 26, player: { ...source.player, capacity: 90 },
      contract: { ...source.contract!, club }, firstCapAge: null,
      history: Array.from({ length: 5 }, (_, index) => ({ ...season, age: 21 + index, year: 2031 + index })) };
    expect(residenceCountry(career)).toBe("URU");
    const abroad = { ...season, club: CLUBS.find((entry) => entry.country === "BRA")!.id };
    const anotherLocalClub = CLUBS.find((entry) => entry.country === "URU" && entry.id !== club)!.id;
    // Cinco anos somados não bastam: uma saída exige começar a sequência de novo.
    expect(residenceCountry({ ...career, history: [season, season, season, abroad, season, season] })).toBeNull();
    expect(residenceCountry({ ...career, history: [season, abroad, ...career.history.slice(1)] })).toBeNull();
    expect(residenceCountry({ ...career, history: [season, abroad, ...career.history] })).toBe("URU");
    expect(residenceCountry({ ...career, history: career.history.map((entry, index) => ({
      ...entry, club: index % 2 === 0 ? anotherLocalClub : club,
    })) })).toBe("URU");
    expect(residenceCountry({ ...career, history: career.history.slice(1) })).toBeNull();
    expect(residenceCountry({ ...career, firstCapAge: 21 })).toBeNull();
    expect(residenceCountry({ ...career, history: [{ ...season, national: { ...season.national, games: 1 } }, ...career.history] })).toBeNull();
    expect(residenceCountry({ ...career, player: { ...career.player, capacity: 45 } })).toBeNull();
    const event = EVENT_CATALOG.find((entry) => entry.id === "residencePassport")!;
    const decision = eventDecision(career, event, eventContext(career), 100)!;
    expect(decision.options.find((entry) => entry.kind === "event" && entry.option === "switch")?.kind).toBe("event");
    const accepted = choose({ ...career, decision }, { decision: 100, option: "switch" }).career;
    expect(accepted.nationality).toBe("URU");
    expect(accepted.history.at(-1)?.national.games).toBeGreaterThan(0);
    const refused = choose({ ...career, decision }, { decision: 100, option: "keep" }).career;
    expect(refused.nationality).toBe("BRA");
  });
});

describe("título e força dos clubes (D47)", () => {
  it("título acrescenta exatamente um OVR à evolução natural, também na queda", () => {
    for (const position of POSITIONS) for (const age of [18, 35]) {
      const player = { ...createPlayer({ seed: `d47-${position}`, position, difficulty: "normal" }), capacity: 75 };
      const input = { age, games: 30, clubStrength: 75, fans: 50, difficulty: "normal" as const, focus: null };
      const ordinary = evolveSeason(player, { ...input, titleImportance: 0 }, createRng("same"));
      const champion = evolveSeason(player, { ...input, titleImportance: 3.5 }, createRng("same"));
      const multiple = evolveSeason(player, { ...input, titleImportance: 10 }, createRng("same"));
      expect(ovrAt(champion.player, age)).toBe(ovrAt(ordinary.player, age) + 1);
      expect(ovrAt(multiple.player, age)).toBe(ovrAt(champion.player, age));
    }
  });

  it("o bônus de título continua +1 depois da garantia do atributo treinado", () => {
    for (const position of POSITIONS) for (const age of [24, 31, 35]) {
      const born = createPlayer({ seed: `d47-foco-${position}`, position, difficulty: "normal" });
      const player = { ...born, capacity: born.potential + 1 };
      const focus = focusesFor(position)[0]!;
      const start = attributesAt(player, age);
      const input = { age, games: 30, clubStrength: 75, fans: 50, difficulty: "normal" as const, focus, guarantee: { focus, start } };
      const ordinary = evolveSeason(player, { ...input, titleImportance: 0 }, createRng("same")).player;
      const champion = evolveSeason(player, { ...input, titleImportance: 1 }, createRng("same")).player;
      expect(ovrAt(champion, age), `${position}/${age}`).toBe(Math.min(99, ovrAt(ordinary, age) + 1));
    }
  });

  it("estrelas mudam até um degrau, com mais resistência entre quatro e cinco", () => {
    expect(clubStars(3, 70, 73)).toBe(4);
    expect(clubStars(3, 70, 67)).toBe(2);
    expect(clubStars(3, 70, 90)).toBe(4);
    expect(clubStars(4, 80, 83)).toBe(4);
    expect(clubStars(4, 80, 84.5)).toBe(5);
    expect(clubStars(5, 90, 87)).toBe(5);
    expect(clubStars(5, 90, 85.5)).toBe(4);
  });
});

describe("escolhas com consequências (D49)", () => {
  it("estudar protege de lesões e custa evolução; só futebol inverte o compromisso", () => {
    const career = played();
    const event = EVENT_CATALOG.find((entry) => entry.id === "diploma")!;
    const study = applyEffects(career, event.options[0]!.success, null, []).career;
    const football = applyEffects(career, event.options[1]!.success, null, []).career;
    expect(study.pending.modifiers).toMatchObject({ growthScale: 0.9, injuryScale: 0.7 });
    expect(football.pending.modifiers).toMatchObject({ growthScale: 1.1, injuryScale: 1.3 });
  });

  it("romper limita ofertas só na próxima decisão e não persiste no mercado", () => {
    const source = played();
    const club = CLUBS.find((entry) => entry.strength >= 80)!;
    const career = { ...source, age: 25, agenda: [], focusAge: 25,
      contract: { ...source.contract!, club: club.id }, player: { ...source.player, capacity: 78 } };
    const event = EVENT_CATALOG.find((entry) => entry.id === "agentUltimatum")!;
    const stayed = applyEffects(career, event.options.find((entry) => entry.id === "stay")!.success, null, []).career;
    expect(stayed.agentRestriction).toBe(true);
    const next = nextDecision(stayed);
    expect(next.decision?.kind).toBe("window");
    const offers = next.decision!.options.filter((entry) => entry.kind === "club");
    expect(offers.length).toBeGreaterThan(0);
    const strength = career.world.strength[clubIndex(club.id)]!;
    for (const offer of offers) if (offer.kind === "club") expect(offer.offer.strength).toBeLessThanOrEqual(strength - 2);
    expect(next.agentRestriction).toBe(false);
    expect(marketContext(next).maxStrength).toBeUndefined();
  });

  it("decisão de treino consome o rompimento sem adiar a penalidade", () => {
    const source = played();
    const age = Array.from({ length: 10 }, (_, index) => 17 + index).find((value) => focusDueAt(source.setup.seed, value, null))!;
    expect(age).toBeDefined();
    const next = nextDecision({ ...source, age, agenda: [], focusAge: null, agentRestriction: true });
    expect(next.decision?.kind).toBe("focus");
    expect(next.agentRestriction).toBe(false);
    expect(marketContext(next).maxStrength).toBeUndefined();
  });
});
