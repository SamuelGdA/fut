import { describe, expect, it } from "vitest";
import {
  autoplay,
  type Career,
  CareerError,
  type CareerNotice,
  choose,
  clubIndex,
  clubNumber,
  createCareer,
  type Effect,
  type EventContext,
  getEvent,
  holds,
  parseSave,
  POSITIONS,
  PRESTIGE_NUMBERS,
  replay,
  retireNow,
  saveOf,
  SHIRT_RANGES,
} from "../src";
import { newClubNumber, promotedNumber } from "../src/career/shirt";
import { marketContext } from "../src/career/context";
import { addTraining, applyEffects, mergeModifiers } from "../src/career/effects";
import { buildOffer, interestedClubs } from "../src/career/market";
import { simulatePeriod } from "../src/career/period";
import { stream } from "../src/rng";
import { atLeastRole, shiftRole, squadRole } from "../src/season/role";

/**
 * O intérprete dos efeitos (GDD 18.2): cada efeito no seu momento, na ordem
 * da lista, sem mexer na carreira de antes.
 */

/** Uma carreira já com clube, para os efeitos terem onde agir. */
function signed(seed: string, pace: "intense" | "normal" = "intense"): Career {
  const start = createCareer({
    seed,
    startYear: 2026,
    pace,
    difficulty: "normal",
    identity: { surname: "TESTE", foot: "right", nationality: "BRA", position: "st", dreamNumber: 9 },
  });
  const decision = start.decision;
  const option = decision?.options[0];
  if (!decision || !option) throw new Error("sem base");
  return choose(start, { decision: decision.id, option: option.id }).career;
}

function anotherClub(career: Career) {
  const context = marketContext(career);
  const index = interestedClubs(context, 20, 20)[0];
  if (index === undefined) throw new Error("ninguém interessado");
  return buildOffer(context, index, stream(career.setup.seed, "market", "teste"));
}

describe("modificadores do período", () => {
  it("multiplicadores se multiplicam e forças se somam", () => {
    const effects: Effect[] = [
      { kind: "games", scale: 0.8 },
      { kind: "games", scale: 0.5 },
      { kind: "boost", target: "league", amount: 2.5 },
      { kind: "boost", target: "league", amount: -1 },
      { kind: "award", amount: 1.5 },
    ];
    const modifiers = effects.reduce(mergeModifiers, {});
    expect(modifiers.gamesScale).toBeCloseTo(0.4);
    expect(modifiers.boosts?.league).toBeCloseTo(1.5);
    expect(modifiers.awardBonus).toBeCloseTo(1.5);
  });

  it("titular garantido é piso: convive com o degrau, e o piso vale por último", () => {
    const modifiers = [{ kind: "role", change: "down" } as const, { kind: "role", change: "fixStarter" } as const].reduce(mergeModifiers, {});
    expect(modifiers.minimumRole).toBe("starter");
    expect(modifiers.roleShift).toBe(-1);
  });

  it("capacidade de agora e de depois não viram modificador; a do período, sim", () => {
    const now = mergeModifiers({}, { kind: "capacity", amount: 1, when: "now" });
    const later = mergeModifiers({}, { kind: "capacity", amount: 1, when: "later" });
    const period = mergeModifiers({}, { kind: "capacity", amount: -1.5, when: "period" });
    expect(now).toEqual({});
    expect(later).toEqual({});
    expect(period.capacityShift).toBe(-1.5);
  });
});

describe("efeitos na carreira", () => {
  it("a ordem conta: antes da transferência, o clube antigo; depois, o novo", () => {
    const career = signed("ordem");
    const old = career.contract?.club ?? "";
    const offer = anotherClub(career);
    const oldFans = career.bonds[old]?.fans ?? 0;

    const ultimatum = applyEffects(career, [{ kind: "fans", amount: -12 }, { kind: "transfer", to: "bigger" }], { club: offer }, []);
    expect(ultimatum.career.contract?.club).toBe(offer.club);
    expect(ultimatum.career.bonds[old]?.fans).toBeCloseTo(Math.max(0, oldFans - 12));

    const comeback = applyEffects(career, [{ kind: "transfer", to: "legacy" }, { kind: "fans", amount: 10 }], { club: offer }, []);
    const arrival = applyEffects(career, [{ kind: "transfer", to: "legacy" }], { club: offer }, []);
    expect(comeback.career.bonds[offer.club]?.fans).toBeCloseTo(Math.min(100, (arrival.career.bonds[offer.club]?.fans ?? 0) + 10));
    expect(comeback.career.bonds[old]?.fans).toBeCloseTo(oldFans);
  });

  it("bloqueio e depois transferência: o clube que fechou as portas nunca mais oferece", () => {
    const career = signed("bloqueio");
    const old = career.contract?.club ?? "";
    const offer = anotherClub(career);
    const notices: CareerNotice[] = [];
    const result = applyEffects(career, [{ kind: "block" }, { kind: "transfer", to: "offer" }], { club: offer }, notices);
    expect(result.career.blocked).toContain(old);
    expect(result.career.contract?.club).toBe(offer.club);
    expect(notices.some((notice) => notice.kind === "transfer" && notice.to === offer.club)).toBe(true);
  });

  it("sem destino resolvido, a transferência não acontece", () => {
    const career = signed("sem-destino");
    const result = applyEffects(career, [{ kind: "transfer", to: "home" }], null, []);
    expect(result.career.contract?.club).toBe(career.contract?.club);
  });

  it("potencial nunca cai abaixo do piso", () => {
    const career = signed("piso");
    const result = applyEffects(career, [{ kind: "potential", amount: -200, floor: 60 }], null, []);
    expect(result.career.player.potential).toBe(60);
  });

  it("bônus de treino respeita o limite de +8 por atributo", () => {
    const career = signed("treino");
    let player = career.player;
    for (let index = 0; index < 20; index += 1) player = addTraining(player, "finishing", 1);
    expect(Math.max(...player.training)).toBeLessThanOrEqual(8);
  });

  it("força do clube mexe na hora, dentro de 35 a 95", () => {
    const career = signed("forca");
    const index = clubIndex(career.contract?.club ?? "");
    const result = applyEffects(career, [{ kind: "clubStrength", amount: -200 }], null, []);
    expect(result.career.world.strength[index]).toBe(35);
  });

  it("não muda a carreira de antes", () => {
    const career = signed("imutavel");
    const snapshot = JSON.stringify(career);
    applyEffects(career, [{ kind: "fans", amount: 10 }, { kind: "capacity", amount: 2, when: "now" }, { kind: "block" }], null, []);
    expect(JSON.stringify(career)).toBe(snapshot);
  });
});

describe("efeitos ao longo do período", () => {
  it("suspensão de uma temporada: a primeira do período sem jogos; a segunda normal", () => {
    const career = signed("suspensao", "normal");
    const applied = applyEffects(career, [{ kind: "suspension", seasons: 1 }], null, []).career;
    const after = simulatePeriod(applied, [], null, false);
    const [first, second] = after.history.slice(-2);
    expect(first?.suspended).toBe(true);
    expect(first?.games).toBe(0);
    expect(second?.suspended).toBe(false);
    expect(after.pending.suspension).toBe(0);
  });

  it("suspensão que passa do período continua na próxima decisão", () => {
    const career = signed("suspensao-longa");
    const applied = applyEffects(career, [{ kind: "suspension", seasons: 2 }], null, []).career;
    const after = simulatePeriod(applied, [], null, false);
    expect(after.history.at(-1)?.suspended).toBe(true);
    expect(after.pending.suspension).toBe(1);
  });

  it("capacidade adiada só entra depois do período; a do período sai no fim", () => {
    const career = signed("adiada");
    const later = applyEffects(career, [{ kind: "capacity", amount: 2, when: "later" }], null, []).career;
    expect(later.player.capacity).toBe(career.player.capacity);
    const base = simulatePeriod(career, [], null, false);
    const after = simulatePeriod(later, [], null, false);
    expect(after.player.capacity - base.player.capacity).toBeCloseTo(2, 5);

    const borrowed = applyEffects(career, [{ kind: "capacity", amount: -1.5, when: "period" }], null, []).career;
    const done = simulatePeriod(borrowed, [], null, false);
    expect(done.pending.modifiers).toEqual({});
  });
});

describe("papel por evento", () => {
  it("o piso de titular sobe o reserva e não rebaixa o craque do time", () => {
    const reserve = squadRole("cm", 74, 80);
    const star = squadRole("cm", 90, 80);
    expect(reserve.role).toBe("reserve");
    expect(atLeastRole("cm", reserve, "starter").role).toBe("starter");
    expect(star.role).toBe("star");
    expect(atLeastRole("cm", star, "starter").role).toBe("star");
    expect(atLeastRole("gk", squadRole("gk", 60, 80), "starter").role).toBe("starter");
  });

  it("um degrau abaixo de quem já é o último continua no último", () => {
    const surplus = squadRole("st", 50, 80);
    expect(shiftRole("st", surplus, -1).role).toBe("surplus");
    expect(shiftRole("st", surplus, 1).role).toBe("reserve");
  });
});

describe("condições", () => {
  const context: EventContext = {
    age: 25,
    ovr: 80,
    position: "st",
    trait: "hothead",
    lastRole: "starter",
    lastGames: 30,
    seasonsAtClub: 3,
    clubDecline: 0,
    continental: true,
    knockout: true,
    rivalClub: "x",
    rivalClubInterested: false,
    derby: true,
    tenFree: false,
    abroadSeasons: 0,
    value: 30_000_000,
    nationWeakOrUncapped: false,
    legacyClub: null,
    tournamentSquad: false,
    fans: 40,
    neighbourPosition: "cam",
    prestigeNumbers: [],
    homageNumbers: [],
  };

  it("cada evento do catálogo é avaliado sem erro, e 'qualquer uma' é um ou", () => {
    expect(getEvent("redCard")?.when.every((condition) => holds(condition, context))).toBe(true);
    expect(holds({ kind: "any", of: [{ kind: "trait", in: ["fragile"] }, { kind: "lastGames", min: 50 }] }, context)).toBe(false);
    expect(holds({ kind: "age", min: 26 }, context)).toBe(false);
    expect(holds({ kind: "fans", max: 35 }, context)).toBe(false);
    expect(holds({ kind: "prestigeNumberFree" }, context)).toBe(false);
  });
});

describe("camisa (GDD 19, ajuste do M5)", () => {
  const rng = (label: string) => stream("camisas", "events", label);

  it("titular e craque do time sem número dos sonhos vestem um clássico da posição", () => {
    for (const position of POSITIONS) {
      for (let index = 0; index < 40; index += 1) {
        for (const role of ["star", "starter"] as const) {
          expect(PRESTIGE_NUMBERS[position]).toContain(clubNumber(rng(`${position}-${role}-${index}`), role, position));
        }
      }
    }
  });

  it("o número mais típico da posição sai na maioria das vezes", () => {
    const nines = Array.from({ length: 400 }, (_, index) => clubNumber(rng(`nove-${index}`), "starter", "st")).filter((number) => number === 9);
    expect(nines.length / 400).toBeGreaterThan(0.5);
  });

  it("rotação usa 12 a 23; reserva, sem espaço e terceiro goleiro usam 12 a 99", () => {
    for (let index = 0; index < 200; index += 1) {
      const rotation = clubNumber(rng(`rot-${index}`), "rotation", "cm");
      expect(rotation).toBeGreaterThanOrEqual(SHIRT_RANGES.rotation.min);
      expect(rotation).toBeLessThanOrEqual(SHIRT_RANGES.rotation.max);
      for (const role of ["reserve", "surplus", "third"] as const) {
        const number = clubNumber(rng(`banco-${role}-${index}`), role, "cb");
        expect(number).toBeGreaterThanOrEqual(12);
        expect(number).toBeLessThanOrEqual(99);
      }
    }
  });

  it("o número dos sonhos continua passando na frente para o titular que chega", () => {
    const dreams = Array.from({ length: 300 }, (_, index) => newClubNumber(rng(`sonho-${index}`), 17, "starter", "st")).filter(
      (number) => number === 17,
    );
    expect(dreams.length / 300).toBeGreaterThan(0.5);
  });

  it("promoção: só quem foi titular com número alto, nunca o dos sonhos", () => {
    const base = { position: "st" as const, dream: null };
    expect(promotedNumber(rng("p1"), { ...base, current: 9, lastRole: "star" })).toBeNull();
    expect(promotedNumber(rng("p2"), { ...base, current: 31, lastRole: "reserve" })).toBeNull();
    expect(promotedNumber(rng("p3"), { ...base, current: 31, dream: 31, lastRole: "star" })).toBeNull();
    const promoted = Array.from({ length: 200 }, (_, index) =>
      promotedNumber(rng(`p-${index}`), { ...base, current: 31, lastRole: "starter" }),
    ).filter((number) => number !== null);
    expect(promoted.length).toBeGreaterThan(60);
    expect(promoted.every((number) => PRESTIGE_NUMBERS.st.includes(number))).toBe(true);
  });

  it("numa carreira inteira, todo titular termina a temporada com número clássico, o dos sonhos ou um herdado de quando era reserva", () => {
    const career = autoplay(
      createCareer({
        seed: "camisa-carreira",
        startYear: 2026,
        pace: "intense",
        difficulty: "normal",
        identity: { surname: "TESTE", foot: "right", nationality: "BRA", position: "st", dreamNumber: null },
      }),
      "balanced",
    );
    const starters = career.history.filter((season) => season.role === "star" || season.role === "starter");
    const classic = starters.filter((season) => PRESTIGE_NUMBERS[season.position].includes(season.shirt));
    expect(classic.length / Math.max(1, starters.length)).toBeGreaterThan(0.6);
  });
});

describe("encerrar carreira (GDD 5)", () => {
  it("aposenta na hora, e o save refaz a carreira encerrada", () => {
    const start = signed("encerrar");
    const ended = retireNow(start);
    expect(ended.end).toEqual({ reason: "voluntary", age: start.age });
    expect(ended.decision).toBeNull();
    const save = saveOf(ended);
    expect(save.quit).toBe(true);
    expect(replay(parseSave(JSON.parse(JSON.stringify(save))))).toEqual(ended);
    expect(() => retireNow(ended)).toThrow(CareerError);
  });

  it("save sem quit continua sem o campo", () => {
    expect("quit" in saveOf(signed("sem-quit"))).toBe(false);
  });
});
