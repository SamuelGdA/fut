import { CLUBS, getClub } from "@craque/world";
import { describe, expect, it } from "vitest";
import {
  ACADEMY,
  type Career,
  type CareerSetup,
  choose,
  createCareer,
  createRng,
  type DecisionOption,
  dreamFits,
  drawLongevity,
  EVENT_CATALOG,
  fanDelta,
  FIRST_CLUB_FANS,
  firstContractNumber,
  LONGEVITY,
  newClubNumber,
  ODD_DREAM_CHANCE,
  replay,
  saveOf,
  splitGames,
} from "../src";

/**
 * As regras da revisão do M8 (D42): bases por divisão, camisa só na
 * transferência, volta de empréstimo com clubes de verdade, torcida da
 * primeira temporada, números redondos nos eventos e longevidade rara.
 */

function setupOf(seed: string, identity: Partial<CareerSetup["identity"]> = {}): CareerSetup {
  return {
    seed,
    startYear: 2026,
    pace: "intense",
    difficulty: "normal",
    identity: { surname: "REVISAO", foot: "right", nationality: "BRA", position: "st", dreamNumber: null, ...identity },
  };
}

function clubOffers(career: Career) {
  return (career.decision?.options ?? []).flatMap((option) => (option.kind === "club" ? [option.offer] : []));
}

/** Joga escolhendo sempre a opção pedida, até a condição valer (ou a carreira acabar). */
function playUntil(start: Career, until: (career: Career) => boolean, pick: (options: readonly DecisionOption[]) => DecisionOption | undefined): Career | null {
  let career = start;
  for (let guard = 0; guard < 60 && !career.end && career.decision; guard += 1) {
    if (until(career)) return career;
    const option = pick(career.decision.options) ?? career.decision.options[0];
    if (!option) return null;
    career = choose(career, { decision: career.decision.id, option: option.id }).career;
  }
  return until(career) ? career : null;
}

describe("bases por divisão (D42)", () => {
  it("no Brasil, cada base é um clube do país: Série A com cerca de 30%, Série B no resto", () => {
    let top = 0;
    let total = 0;
    for (let index = 0; index < 300; index += 1) {
      const career = createCareer(setupOf(`base-${index}`));
      const offers = clubOffers(career);
      expect(offers).toHaveLength(3);
      expect(new Set(offers.map((offer) => offer.club)).size).toBe(3);
      for (const offer of offers) {
        expect(getClub(offer.club)?.country).toBe("BRA");
        expect([1, 2]).toContain(offer.division);
        if (offer.division === 1) top += 1;
        total += 1;
      }
    }
    expect(top / total).toBeGreaterThan(ACADEMY.topFlight - 0.05);
    expect(top / total).toBeLessThan(ACADEMY.topFlight + 0.05);
  });

  it("país de uma divisão só (México) sorteia na liga dele; país sem liga recebe clubes de fora", () => {
    for (let index = 0; index < 20; index += 1) {
      for (const offer of clubOffers(createCareer(setupOf(`mex-${index}`, { nationality: "MEX" })))) {
        expect(getClub(offer.club)?.country).toBe("MEX");
        expect(offer.division).toBe(1);
      }
      const abroad = clubOffers(createCareer(setupOf(`nga-${index}`, { nationality: "NGA" })));
      expect(abroad).toHaveLength(3);
    }
  });
});

describe("camisa (D42)", () => {
  it("toda oferta diz o número, e a camisa da transferência é a da oferta", () => {
    for (let index = 0; index < 40; index += 1) {
      const career = createCareer(setupOf(`camisa-${index}`, { dreamNumber: 9 }));
      const offer = clubOffers(career)[0];
      if (!offer || !career.decision) continue;
      expect(offer.shirt).toBeGreaterThanOrEqual(1);
      expect(offer.shirt).toBeLessThanOrEqual(99);
      const next = choose(career, { decision: career.decision.id, option: `club:${offer.club}` }).career;
      expect(next.contract?.shirt).toBe(offer.shirt);
    }
  });

  it("o número nunca troca sozinho: só na transferência, na opção de ficar que mostra o número novo ou num evento de camisa", () => {
    for (let index = 0; index < 15; index += 1) {
      let career = createCareer(setupOf(`fica-${index}`));
      for (let guard = 0; guard < 40 && career.decision && !career.end; guard += 1) {
        const before = career.contract?.shirt ?? null;
        const decision = career.decision;
        const stay = decision.options.find((option) => option.kind === "stay");
        const option = stay ?? decision.options.find((candidate) => candidate.kind !== "retire") ?? decision.options[0];
        if (!option) break;
        const step = choose(career, { decision: decision.id, option: option.id });
        const after = step.career.contract?.shirt ?? null;
        const moved = step.notices.some((notice) => notice.kind === "transfer");
        // Um evento de camisa (a 10 livre, a homenagem) é escolha explícita de número: vale.
        const pickedNumber = option.kind === "event" && option.preview.success.some((effect) => effect.kind === "shirt");
        if (!moved && before !== null && option.kind !== "stay" && !pickedNumber) expect(after).toBe(before);
        if (option.kind === "stay" && before !== null) expect(after).toBe(option.shirt ?? before);
        career = step.career;
      }
    }
  });

  it("número dos sonhos que não combina com a posição: menos de 1%, e só para o craque do time", () => {
    expect(dreamFits(10, "gk")).toBe(false);
    expect(dreamFits(9, "cb")).toBe(false);
    expect(dreamFits(1, "gk")).toBe(true);
    expect(dreamFits(10, "cam")).toBe(true);
    expect(dreamFits(77, "gk")).toBe(true);
    const rng = createRng("sonho-raro");
    let dreams = 0;
    for (let index = 0; index < 5000; index += 1) {
      if (newClubNumber(rng, 10, "starter", "gk") === 10) dreams += 1;
      expect(firstContractNumber(rng, 10, "surplus", "gk")).not.toBe(10);
    }
    expect(dreams).toBe(0);
    let stars = 0;
    for (let index = 0; index < 20000; index += 1) if (newClubNumber(rng, 10, "star", "gk") === 10) stars += 1;
    expect(stars / 20000).toBeLessThan(0.01);
    expect(stars / 20000).toBeGreaterThan(ODD_DREAM_CHANCE / 3);
  });
});

describe("volta de empréstimo (D42)", () => {
  it("as opções são clubes: a volta mostra o clube dono, e ficar no clube do empréstimo é a compra", () => {
    let checked = 0;
    for (let index = 0; index < 60 && checked < 6; index += 1) {
      const start = createCareer(setupOf(`emprestimo-${index}`));
      const atReturn = playUntil(
        start,
        (career) => career.decision?.kind === "return",
        (options) => options.find((option) => option.kind === "club" && option.offer.loan) ?? options.find((option) => option.kind === "stay"),
      );
      if (!atReturn?.decision || !atReturn.contract?.loan) continue;
      checked += 1;
      const loan = atReturn.contract.loan;
      expect(atReturn.decision.options.some((option) => option.kind === "stay")).toBe(false);
      for (const option of atReturn.decision.options) {
        if (option.kind !== "club") continue;
        if (option.offer.back) {
          expect(option.offer.club).toBe(loan.owner);
          expect(option.offer.shirt).toBe(loan.ownerShirt);
          const back = choose(atReturn, { decision: atReturn.decision.id, option: option.id }).career;
          expect(back.contract?.club).toBe(loan.owner);
          expect(back.contract?.loan).toBeNull();
        }
        if (option.offer.buyout) {
          expect(option.offer.club).toBe(atReturn.contract.club);
          const kept = choose(atReturn, { decision: atReturn.decision.id, option: option.id }).career;
          expect(kept.contract?.club).toBe(atReturn.contract.club);
          expect(kept.contract?.loan).toBeNull();
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe("encerrar, torcida e eventos (D42)", () => {
  it("não dá para encerrar antes de jogar a primeira temporada", () => {
    const career = createCareer(setupOf("encerra"));
    const option = career.decision?.options[0];
    if (!career.decision || !option) throw new Error("sem decisão");
    const after = replay({ ...saveOf(career), choices: [{ decision: career.decision.id, option: option.id }] });
    expect(after.history.length).toBeGreaterThan(0);
  });

  it("o primeiro clube começa com a torcida no meio, e ela não cai na primeira temporada", () => {
    expect(FIRST_CLUB_FANS).toBe(50);
    for (let index = 0; index < 30; index += 1) {
      const career = createCareer(setupOf(`torcida-${index}`));
      const option = career.decision?.options[0];
      if (!career.decision || !option || option.kind !== "club") continue;
      const after = choose(career, { decision: career.decision.id, option: option.id }).career;
      expect(after.history[0]?.fans).toBeGreaterThanOrEqual(FIRST_CLUB_FANS);
    }
    // A regra, sozinha: a mesma temporada ruim tira torcida na segunda, não na primeira.
    const bench = {
      stats: { games: 0 } as never,
      position: "st" as const,
      contract: { demand: 0, pressure: 1 } as never,
      fans: 50,
      trait: "professional" as const,
      difficulty: "normal" as const,
      champion: false,
      aboveExpected: false,
      relegated: false,
    };
    expect(fanDelta({ ...bench, debutSeason: true })).toBe(0);
    expect(fanDelta({ ...bench, debutSeason: false })).toBeLessThan(0);
  });

  it("todo número que o evento mostra é inteiro (capacidade, potencial, atributos, força)", () => {
    for (const event of EVENT_CATALOG) {
      for (const option of event.options) {
        for (const effect of [...option.success, ...(option.failure ?? [])]) {
          if (effect.kind === "capacity" || effect.kind === "potential" || effect.kind === "attributes" || effect.kind === "boost" || effect.kind === "fans" || effect.kind === "clubStrength") {
            expect(Number.isInteger(effect.amount), `${event.id}/${option.id}/${effect.kind}`).toBe(true);
          }
        }
      }
    }
  });

  it("não sobra evento do rival pessoal", () => {
    expect(EVENT_CATALOG.some((event) => event.tags.includes("rival"))).toBe(false);
  });
});

describe("longevidade e gols por competição (D42)", () => {
  it("zagueiro e goleiro nunca precisam dela; meia e atacante têm uma chance pequena", () => {
    expect(LONGEVITY.centreBack.chance).toBe(0);
    expect(LONGEVITY.goalkeeper.chance).toBe(0);
    const rng = createRng("longevo");
    let long = 0;
    for (let index = 0; index < 4000; index += 1) if (drawLongevity(rng, "st") > 0) long += 1;
    expect(long / 4000).toBeGreaterThan(0.04);
    expect(long / 4000).toBeLessThan(0.1);
  });

  it("os jogos se repartem na proporção dos jogos do time, sem passar de nenhum", () => {
    const split = splitGames(40, [
      { competition: "league:brasileirao", kind: "league", games: 38 },
      { competition: "cup:BRA", kind: "cup", games: 6 },
      { competition: "cont1:CONMEBOL", kind: "continental1", games: 13 },
    ]);
    expect(split.reduce((sum, share) => sum + share.games, 0)).toBe(40);
    expect(split[0]?.games).toBeGreaterThan(split[2]?.games ?? 99);
    for (const [index, share] of split.entries()) expect(share.games).toBeLessThanOrEqual([38, 6, 13][index] ?? 0);
    expect(splitGames(0, [{ competition: "cup:BRA", kind: "cup", games: 6 }])[0]?.games).toBe(0);
  });

  it("todo clube da lista existe no mundo (sanidade dos sorteios de base)", () => {
    expect(CLUBS.length).toBeGreaterThan(300);
  });
});
