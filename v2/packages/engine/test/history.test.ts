import { getClub } from "@craque/world";
import { describe, expect, it } from "vitest";
import {
  autoplay,
  careerTotals,
  createCareer,
  createPlayer,
  createWorld,
  honours,
  movementOf,
  peakSeason,
  type SeasonRecord,
  simulatePlayerSeason,
} from "../src";

/** As leituras do histórico que as telas usam (M5). */

describe("acesso e queda pela linha da liga", () => {
  it("bate com o que o mundo simulou, nas duas divisões e em vários países", () => {
    const clubs = ["flamengo", "chapecoense", "nautico", "fulham", "sunderland", "cadiz", "gimnasia-y-esgrima-la-plata", "ipswich-town"];
    let checked = 0;
    for (const club of clubs) {
      if (!getClub(club)) continue;
      let world = createWorld(`movimento-${club}`, 2026);
      const player = createPlayer({ seed: `movimento-${club}`, position: "st", difficulty: "normal" });
      for (let season = 0; season < 6; season += 1) {
        const result = simulatePlayerSeason({
          seed: `movimento-${club}`,
          world,
          player,
          age: 20,
          nationality: "BRA",
          club,
          difficulty: "normal",
          fans: 50,
          focus: null,
        });
        const country = getClub(club)?.country ?? "";
        const expected = (result.results.relegated[country] ?? []).includes(club)
          ? "relegated"
          : (result.results.promoted[country] ?? []).includes(club)
            ? "promoted"
            : null;
        expect(movementOf(result.stats as unknown as SeasonRecord)).toBe(expected);
        world = result.world;
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(20);
  });
});

describe("totais, auge e honras", () => {
  const career = autoplay(
    createCareer({
      seed: "totais",
      startYear: 2026,
      pace: "intense",
      difficulty: "normal",
      identity: { surname: "TESTE", foot: "right", nationality: "BRA", position: "st", dreamNumber: 9 },
    }),
    "ambitious",
  );

  it("os totais somam o histórico", () => {
    const totals = careerTotals(career.history);
    expect(totals.seasons).toBe(career.history.length);
    expect(totals.games).toBe(career.history.reduce((sum, record) => sum + record.games, 0));
    expect(totals.titles).toBe(career.history.reduce((sum, record) => sum + record.titles.length, 0));
  });

  it("o auge é a temporada de maior OVR, a mais antiga no empate", () => {
    const peak = peakSeason(career.history);
    const best = Math.max(...career.history.map((record) => record.ovrEnd));
    expect(peak?.ovrEnd).toBe(best);
    expect(peak?.year).toBe(career.history.find((record) => record.ovrEnd === best)?.year);
  });

  it("as honras agrupam por competição e somam o total", () => {
    const grouped = honours(career.history);
    expect(grouped.titles.reduce((sum, honour) => sum + honour.count, 0)).toBe(careerTotals(career.history).titles);
    for (let index = 1; index < grouped.titles.length; index += 1) {
      expect((grouped.titles[index - 1]?.count ?? 0) >= (grouped.titles[index]?.count ?? 0)).toBe(true);
    }
  });
});
