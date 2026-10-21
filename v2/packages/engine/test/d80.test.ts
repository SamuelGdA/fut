import { beforeAll, describe, expect, it } from "vitest";
import { baseMarketValue, choose, createCareer, EVENT_CATALOG, leagueMarketFactor, marketLeagueStrength, matchActionKind, matchScenes, playerClubImpact, POSITIONS, resolveKeyMatch, stream, type Career, type KeyMatch, type Position } from "../src";
import { debugDecision, debugPlayer } from "../src/debug";
import { pickMatchScene } from "../src/career/matchMoments";
import { matchChance } from "../src/career/drama";
import { keyLeague } from "../src/world/keyMatches";

let career: Career;
beforeAll(() => { career = createCareer({ seed: "d80-rules", startYear: 2026, pace: "intense", difficulty: "normal", identity: { surname: "TESTE", nationality: "BRA", foot: "right", position: "st", dreamNumber: 9 } }); });
const match: KeyMatch = { competition: "brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 87, score: [0, 1], scene: "rebound" };
const option = (action: string, chance: number) => ({ id: `drama:${action}`, kind: "drama" as const, action, chance });

describe("D80: placares e pontos reais", () => {
  it("a reação de 0x1 vale empate, sem vitória nem pênaltis", () => {
    const result = resolveKeyMatch(career, match, option("bold", 1));
    expect(result.score).toEqual([1, 1]); expect(result.won).toBe(false); expect(result.penalties).toBeNull(); expect(result.goals).toBe(1);
    const table = { league: "brasileirao", country: "BRA", division: 1 as const, competition: match.competition, games: 38, rows: ["flamengo", "palmeiras"].map((club, i) => ({ club, position: i + 1, points: 50 })) };
    const rows = keyLeague(table, [result]).rows;
    expect(rows.find(row => row.club === "flamengo")?.points).toBe(51);
    expect(rows.find(row => row.club === "palmeiras")?.points).toBe(48);
  });
  it("errar pode conservar a derrota ou sofrer mais um, sem reduzir o placar", () => {
    const endings = new Set<string>();
    for (let i = 0; i < 50; i++) for (const action of ["bold", "team", "safe"]) {
      const current = { ...career, setup: { ...career.setup, seed: `d80-miss-${i}` } };
      const result = resolveKeyMatch(current, match, option(action, 0));
      endings.add(result.score.join(":")); expect(result.goals).toBe(0);
      const hit = resolveKeyMatch(current, match, option(action, 1));
      expect(hit.score).toEqual([1, 1]); expect(hit.won).toBe(false);
      if (action === "safe") { expect(hit.goals).toBe(0); expect(hit.assists).toBe(0); expect(hit.legacy).toBe(0); }
    }
    expect(endings).toEqual(new Set(["0:1", "0:2"]));
    for (const tied of [0, 1, 2, 3]) expect(resolveKeyMatch(career, { ...match, score: [tied, tied] }, option("bold", 1)).score).toEqual([tied + 1, tied]);
  });
  it("subida do goleiro usa atributos de goleiro, concede gol e resolve empate no mata-mata", () => {
    const keeper = { ...career, player: { ...career.player, position: "gk" as const, capacity: 100 } };
    const game = { ...match, scene: "keeperCorner" as const, stage: "quarter" as const, minute: 94 };
    expect(matchChance(keeper, game, "bold")).toBeLessThanOrEqual(0.18);
    const result = resolveKeyMatch(keeper, game, option("bold", 1));
    expect(result.goals).toBe(1); expect(result.score).toEqual([1, 1]); expect(result.penalties).not.toBeNull();
    expect(matchActionKind("gk", game, "team")).toBe("pass"); expect(matchActionKind("gk", game, "safe")).toBe("hold");
  });
});

describe("D80: raridade por posição", () => {
  it("outras funções aparecem raramente e sem transformar repetição em promoção de raridade", () => {
    const count = (position: Position, wanted: readonly string[], knockout = true) => {
      let hits = 0;
      const used = new Set(matchScenes(position, knockout));
      for (let i = 0; i < 4000; i++) if (wanted.includes(pickMatchScene(position, knockout, used, stream(`d80-pool-${i}`, "drama", position)))) hits++;
      return hits;
    };
    const creation = ["throughBall", "pressEscape", "switchPlay", "halfTurn", "thirdMan", "oneTwo", "diagonal", "edgePass", "buildUp", "cross", "underlap", "earlyCross", "cutback"];
    const st = count("st", creation);
    const lb = count("lb", ["bicycle", "breakaway", "header", "rebound", "edgeShot", "throughBall"]);
    const cb = count("cb", ["bicycle", "breakaway", "header", "rebound", "edgeShot", "throughBall"]);
    expect(st).toBeGreaterThan(230); expect(st).toBeLessThan(420);
    expect(lb).toBeGreaterThan(cb); expect(cb).toBeGreaterThan(0);
    const gk = count("gk", ["keeperCorner"]); expect(gk).toBeGreaterThan(10); expect(gk).toBeLessThan(60);
    expect(count("gk", ["keeperCorner"], false)).toBe(0);
    for (const p of ["cdm", "cm", "cam", "lm", "rm"] as const) expect(count(p, ["bicycle", "volley", "header"])).toBeGreaterThan(0);
  });
});

describe("D80: mercado e força do elenco", () => {
  it("liga melhor valoriza o mesmo jogador, sem ultrapassar o teto etário", () => {
    expect(baseMarketValue(85, 24, 80)).toBeGreaterThan(baseMarketValue(85, 24, 60));
    expect(leagueMarketFactor(45)).toBe(0.55); expect(leagueMarketFactor(99)).toBe(1.1);
    const signed = debugDecision(career, "focus");
    expect(marketLeagueStrength(signed.world, signed.contract!.club)).toBeGreaterThan(40);
    expect(marketLeagueStrength(signed.world, null)).toBeUndefined();
    expect(baseMarketValue(99, 20, 99)).toBeLessThanOrEqual(400_000_000);
    expect(playerClubImpact(60, 85, 1)).toBeGreaterThan(5.1);
    expect(playerClubImpact(80, 85, 1)).toBe(1.5);
    expect(playerClubImpact(60, 85, 0)).toBe(0);
  });
});

describe("D80: forçar decisões isolado", () => {
  it("forçar empréstimo ignora a idade, mas conserva contratos de empréstimo reais", () => {
    const veteran = debugPlayer(career, { talent: "phenom", age: 39, ovr: 99, position: "st", trait: "professional", loanOwner: null });
    const loan = debugDecision(veteran, "loan");
    const clubs = loan.decision!.options.filter(option => option.kind === "club");
    expect(clubs.length).toBeGreaterThan(0);
    for (const option of clubs) expect(option.offer.loan).toBe(true);
  });
  it("monta todo o catálogo sem alterar a carreira original e mantém o fluxo resolvível", () => {
    const original = JSON.stringify(career);
    const keys = [...EVENT_CATALOG.map(event => `event:${event.id}`), ...new Set(POSITIONS.flatMap(p => matchScenes(p, true)).map(scene => `match:${scene}`)), "base", "window", "loan", "return", "release", "forced", "focus", "promise", "veteran"];
    for (const key of keys) {
      const forced = debugDecision(career, key);
      expect(forced.decision?.options.length, key).toBeGreaterThan(0);
      expect(forced.decision?.id, key).toBeGreaterThan(career.decisionCount);
      const first = forced.decision!.options[0]!;
      expect(() => choose(forced, { decision: forced.decision!.id, option: first.id }), key).not.toThrow();
    }
    expect(JSON.stringify(career)).toBe(original);
  });
});
