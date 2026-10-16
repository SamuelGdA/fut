import { describe, expect, it } from "vitest";
import { CLUBS } from "@craque/world";
import { clubTrophyProgress, CLUB_TROPHY_PROGRESS, createWorld, simulateWorldSeason } from "../src";
import { cloneCareer } from "../src/coach";
import { offseason } from "../src/coach/rollover";
import { started } from "./coach/helpers";

describe("crescimento por títulos e jejum, igual para todos os clubes", () => {
  it.each([
    ["league:brasileirao", 0.4], ["league:brasileirao-serie-b", 0.2],
    ["cup:BRA", 0.15], ["leaguecup:ENG", 0.1], ["super:BRA", 0.1],
    ["cont1:CONMEBOL", 0.6], ["cont2:CONMEBOL", 0.25], ["cont3:UEFA", 0.15],
    ["contsuper:CONMEBOL", 0.1], ["intercontinental", 0.25], ["clubworldcup", 0.6],
  ])("%s cresce aos poucos e encerra o jejum", (title, growth) => {
    expect(clubTrophyProgress([title], 15)).toEqual({ drought: 0, growth, penalty: 0 });
  });
  it("dá três temporadas de tolerância; a perda é menor que qualquer título de clube", () => {
    for (let previous = 0; previous < 3; previous++) expect(clubTrophyProgress([], previous).penalty).toBe(0);
    expect(clubTrophyProgress([], 3).penalty).toBe(-0.02);
    expect(clubTrophyProgress([], 4).penalty).toBe(-0.04);
    expect(clubTrophyProgress([], 25).penalty).toBe(-0.06);
    const smallest = Math.min(...Object.values(CLUB_TROPHY_PROGRESS.rewards).filter(value => value > 0));
    expect(CLUB_TROPHY_PROGRESS.droughtCap).toBeLessThan(smallest);
  });
  it("não conta taça duas vezes e limita supertemporadas", () => {
    expect(clubTrophyProgress(["cup:BRA", "cup:BRA"]).growth).toBe(0.15);
    expect(clubTrophyProgress(["league:brasileirao", "cont1:CONMEBOL", "cup:BRA", "clubworldcup"]).growth).toBe(1.2);
    expect(clubTrophyProgress(["worldcup", "desconhecida"], 5).drought).toBe(6);
  });
  it("o mundo aplica o mesmo jejum a cada clube, sem mudar o sorteio da temporada", () => {
    const world = createWorld("jejum-global", 2026);
    const fresh = simulateWorldSeason(world, "jejum-global");
    const old = simulateWorldSeason({ ...world, titleDrought: CLUBS.map(() => 10) }, "jejum-global");
    expect(old.results).toEqual(fresh.results);
    CLUBS.forEach((_, index) => {
      if (fresh.next.titleDrought?.[index] === 0) {
        expect(old.next.titleDrought?.[index]).toBe(0);
        expect(old.next.strength[index]).toBe(fresh.next.strength[index]);
      } else {
        expect(old.next.titleDrought?.[index]).toBe(11);
        expect(old.next.strength[index]).toBeCloseTo(fresh.next.strength[index]! - 0.06, 10);
      }
    });
    expect(simulateWorldSeason(world, "jejum-global", null, { settle: false }).next.titleDrought?.every(value => value === 0)).toBe(true);
  });
  it("no Técnico afeta todas as âncoras, sem bônus artificial de força em campo", () => {
    const baseline = cloneCareer(started("jejum-tecnico")), dry = cloneCareer(baseline);
    Object.values(dry.clubs).forEach(club => { club.titleDrought = 10; });
    const movement = { promoted: new Set<string>(), relegated: new Set<string>() };
    offseason(baseline, movement);
    offseason(dry, movement);
    Object.values(dry.clubs).forEach(club => {
      expect(club.titleDrought).toBe(11);
      expect(club.anchor).toBeCloseTo(baseline.clubs[club.id]!.anchor - 0.06, 10);
    });
  });
});
