import { describe, expect, it } from "vitest";
import { allHold, attributesAt, choose, createCareer, EVENT_CATALOG, MAX_DECISIONS, policyChoice, type Career, type EventContext, type KeyMatchResult, type SeasonRecord } from "../src";
import { ballonSpotlight, ballonTitleValue, decideAwards, SPOTLIGHT, starredCompetitions } from "../src/awards/awards";
import { currentOvr } from "../src/career/context";
import { nextDecision } from "../src/career/decisions";
import { clubIndex } from "../src/world/model";
import { optionChance } from "../src/career/events";
import { nationalLegacy, nationalTradition } from "../src/season/nationalLegacy";

const setup = (seed: string, pace: "normal" | "intense" = "intense") => ({ seed, startYear: 2026, pace, difficulty: "normal" as const, identity: { surname: "TESTE", foot: "right" as const, nationality: "BRA", position: "st" as const, dreamNumber: null } });

/** Joga até ter clube e uma decisão principal livre, aos 24 anos ou depois. */
function midCareer(seed: string): Career {
  let career = createCareer(setup(seed));
  for (let guard = 0; guard < MAX_DECISIONS && career.decision; guard++) {
    if (career.age >= 24 && career.contract && !career.contract.loan && !career.drama && career.decision.kind !== "match") return career;
    career = choose(career, policyChoice(career, "balanced")!).career;
  }
  throw new Error("carreira sem ponto livre");
}

const keyMatch = (stage: KeyMatchResult["match"]["stage"], action: string, success: boolean, national = false, competition = "cont1:UEFA"): KeyMatchResult => ({
  match: { competition, team: "real-madrid", opponent: "bayern-munchen", national, stage, minute: 80, score: [1, 1], scene: "breakaway" },
  action, success, won: success, score: success ? [2, 1] : [1, 2], penalties: null, goals: Number(success), assists: 0, fans: 0, legacy: 0, recognition: 0,
});

describe("D106: empresário, concorrência e ano sem decisão principal", () => {
  it("trocar de empresário garante a janela na decisão seguinte, melhor ou pior, e ficar continua possível", () => {
    for (const seed of ["d106-a", "d106-b", "d106-c"]) {
      const base = { ...midCareer(seed), decision: null };
      for (const [bonus, reason] of [[2, "agentUp"], [-2, "agentDown"]] as const) {
        const next = nextDecision({ ...base, marketBonus: bonus });
        expect(next.decision?.kind).toBe("window");
        expect(next.decision?.reason).toBe(reason);
        expect(next.decision?.options.some((option) => option.kind === "stay")).toBe(true);
        expect(next.decision?.options.some((option) => option.kind === "club" && option.offer.club !== base.contract?.club)).toBe(true);
      }
    }
  });

  it("o novo empresário só aparece até os 29 anos", () => {
    const event = EVENT_CATALOG.find((item) => item.id === "newAgent")!;
    expect(event.when).toEqual([{ kind: "age", min: 20, max: 29 }]);
  });

  it("a concorrência na posição some quando ele está muito acima do elenco e fica mais fácil perto disso", () => {
    const event = EVENT_CATALOG.find((item) => item.id === "rivalSigned")!;
    const context = (clubGap: number) => ({ age: 26, ovr: 85, lastRole: "starter", clubGap } as unknown as EventContext);
    expect(allHold(event.when, context(6))).toBe(true);
    expect(allHold(event.when, context(7))).toBe(false);
    expect(allHold(event.when, context(16))).toBe(false);
    const career = midCareer("d106-gap");
    const fight = event.options.find((option) => option.id === "fight")!;
    const index = clubIndex(career.contract!.club);
    const atStrength = (value: number): Career => ({ ...career, world: { ...career.world, strength: career.world.strength.map((old, i) => (i === index ? value : old)) } });
    const ovr = currentOvr(career);
    // +4% por ponto de OVR acima da força do clube, de -2 a +6 (antes do traço).
    expect(optionChance(atStrength(ovr - 4), fight)!).toBeGreaterThan(optionChance(atStrength(ovr), fight)!);
    expect(optionChance(atStrength(ovr), fight)!).toBeGreaterThan(optionChance(atStrength(ovr + 2), fight)!);
    expect(optionChance(atStrength(ovr - 6), fight)).toBe(optionChance(atStrength(ovr - 12), fight));
  });

  it("no ritmo Normal toda temporada abre com uma decisão principal, mesmo com atributos no teto", () => {
    for (let seed = 0; seed < 10; seed++) {
      let career = createCareer(setup(`d106-normal-${seed}`));
      let lastYear = -1;
      for (let guard = 0; career.decision && guard < MAX_DECISIONS; guard++) {
        const decision = career.decision;
        if (decision.year !== lastYear) {
          if (lastYear !== -1) expect(decision.kind).not.toBe("match");
          lastYear = decision.year;
        }
        career = choose(career, policyChoice(career, seed % 2 ? "ambitious" : "random")!).career;
      }
    }
    // Sem treino e sem proposta, a janela vazia vira a promessa, nunca uma partida direto.
    const base = midCareer("d106-teto");
    const maxed = { ...base, decision: null, player: { ...base.player, capacity: 160, potential: 160 }, lastOfferYear: base.world.year, blocked: [] };
    expect(attributesAt(maxed.player, maxed.age).every((value) => value > 97)).toBe(true);
    const next = nextDecision(maxed);
    expect(next.decision).not.toBeNull();
    expect(next.decision!.kind).not.toBe("match");
  });
});

describe("D106: Bola de Ouro com protagonismo e títulos em escada", () => {
  const title = (kind: Parameters<typeof ballonTitleValue>[0][number]["kind"], competition: string = kind) => ({ kind, competition });

  it("a Copa vale mais que a Champions, as duas valem mais que cada uma, e copas menores não somam uma Champions", () => {
    const worldCup = ballonTitleValue([title("worldCup")], true);
    const champions = ballonTitleValue([title("continental1")], false);
    const both = ballonTitleValue([title("worldCup"), title("continental1")], true);
    expect(worldCup).toBeGreaterThan(champions);
    expect(both).toBeGreaterThan(worldCup);
    expect(both).toBeLessThan(worldCup + champions);
    expect(ballonTitleValue([title("cup"), title("leagueCup"), title("superCup")], false)).toBeLessThan(champions);
    expect(ballonTitleValue([title("second")], false)).toBe(0);
  });

  it("em ano de Copa, a Champions de quem não ganhou a Copa pesa menos", () => {
    expect(ballonTitleValue([title("continental1")], true)).toBeLessThan(ballonTitleValue([title("continental1")], false));
  });

  it("o título decidido num lance de protagonista pesa mais", () => {
    const starred = starredCompetitions([keyMatch("final", "bold", true)]);
    expect(starred).toEqual(["cont1:UEFA"]);
    expect(ballonTitleValue([title("continental1", "cont1:UEFA")], false, starred)).toBeGreaterThan(ballonTitleValue([title("continental1", "cont1:UEFA")], false));
    expect(starredCompetitions([keyMatch("final", "team", true), keyMatch("final", "bold", false)])).toEqual([]);
  });

  it("o protagonismo soma por lance ousado, mais quando dá certo e numa final, até o teto", () => {
    // D107: a segunda opção que dá certo soma pouco; a terceira não soma.
    expect(ballonSpotlight([keyMatch("league", "safe", true), keyMatch("league", "team", true)])).toBeCloseTo(SPOTLIGHT.stage.league * SPOTLIGHT.teamSuccess);
    expect(ballonSpotlight([keyMatch("final", "bold", true)])).toBeGreaterThan(ballonSpotlight([keyMatch("final", "bold", false)]));
    expect(ballonSpotlight([keyMatch("final", "bold", true)])).toBeGreaterThan(ballonSpotlight([keyMatch("league", "bold", true)]));
    expect(ballonSpotlight([keyMatch("final", "take", true)])).toBeGreaterThan(0);
    expect(ballonSpotlight(Array.from({ length: 20 }, () => keyMatch("final", "bold", true, true)))).toBe(SPOTLIGHT.max);
  });
});

describe("D106: o legado na seleção depende da tradição do país", () => {
  const season = (nationality: string, worldCup: boolean, continental: boolean): SeasonRecord => ({
    nationality, position: "st", ovrEnd: 95,
    national: { games: 14, goals: 9, assists: 3, cleanSheets: 0, competitions: [
      { competition: "worldcup", kind: "worldCup", stage: null, position: null, games: 7, champion: worldCup },
      { competition: "copa-america", kind: "nationsCup", stage: null, position: null, games: 6, champion: continental },
    ] },
  } as unknown as SeasonRecord);
  const career = (nationality: string, worldCup: boolean, continental: boolean) => Array.from({ length: 16 }, (_, i) => season(nationality, worldCup && i === 5, continental && i === 7));

  it("campeã do mundo cobra a Copa, forte sem Copa cobra a Copa ou o continental, a menor faz lenda com números", () => {
    expect(nationalTradition("BRA", 86)).toBe("worldCup");
    expect(nationalTradition("POR", 86)).toBe("continental");
    expect(nationalTradition("USA", 78)).toBe("numbers");
    expect(nationalLegacy(career("BRA", false, true), "BRA", 86)).toMatchObject({ level: "idol", capped: true });
    expect(nationalLegacy(career("BRA", true, true), "BRA", 86)).toMatchObject({ level: "legend", capped: false });
    expect(nationalLegacy(career("POR", false, false), "POR", 86)).toMatchObject({ level: "idol", capped: true });
    expect(nationalLegacy(career("POR", false, true), "POR", 86).level).toBe("legend");
    expect(nationalLegacy(career("USA", false, false), "USA", 78).level).toBe("legend");
  });
});

describe("D106: o Rei da América também pesa protagonismo e títulos em escada", () => {
  it("o mesmo jogador, no mesmo ano, tem nota maior quando decide os jogos-chave", () => {
    const player = { eligible: true, position: "st" as const, ovr: 86, age: 26, games: 45, goals: 30, assists: 8, leagueGoals: 20, cleanSheets: 0, playsInUefa: false, playsInAmericas: true, eliteDivision: true, success: { league: true, cup: false, primary: true, worldCup: false, nationsCup: false }, crownEntries: [], titles: [{ kind: "league" as const, competition: "league:brasileirao" }, { kind: "continental1" as const, competition: "cont1:CONMEBOL" }] };
    const calm = decideAwards("d106-rei", 2030, {}, { ...player, keyMatches: [keyMatch("final", "team", true, false, "cont1:CONMEBOL")] }, false);
    const bold = decideAwards("d106-rei", 2030, {}, { ...player, keyMatches: [keyMatch("final", "bold", true, false, "cont1:CONMEBOL")] }, false);
    expect(bold.kingOfAmerica!.playerScore).toBeGreaterThan(calm.kingOfAmerica!.playerScore);
  });
});
