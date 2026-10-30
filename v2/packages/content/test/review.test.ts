import { autoplay, type Career, type CareerSetup, createCareer, POSITIONS, REAL_MARKS } from "@craque/engine";
import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENTS,
  CAREER_TEXTS,
  careerHeadlines,
  describeEffect,
  getAchievement,
  optionLabel,
  REAL_RECORDS,
  seasonCovers,
} from "../src";

/**
 * Os textos da revisão do M8 (D42 e D43; a biografia saiu na D99): lesão sem
 * jogos fora, artilharia e craque com o nome da competição, rótulos da volta
 * de empréstimo e números redondos.
 */

function setupOf(seed: string, position = POSITIONS[seed.length % POSITIONS.length] ?? "st"): CareerSetup {
  return {
    seed,
    startYear: 2026,
    pace: "intense",
    difficulty: "normal",
    identity: { surname: "Revisao", foot: "right", nationality: "BRA", position, dreamNumber: null },
  };
}

const careers: Career[] = Array.from({ length: 50 }, (_, index) =>
  autoplay(createCareer(setupOf(`revisao-texto-${index}`)), index % 2 === 0 ? "balanced" : "ambitious"),
);

describe("manchetes e capas (D42)", () => {
  it("lesão sem jogos fora; artilharia e craque com o nome da competição", () => {
    let crowns = 0;
    for (const career of careers) {
      for (const headline of careerHeadlines("pt", career)) {
        if (headline.key === "injury") expect(headline.text).not.toMatch(/fora|\d/);
        if (headline.key === "topScorer" || headline.key === "bestPlayer") {
          crowns += 1;
          expect(headline.text).toMatch(/: /);
        }
      }
      for (const cover of seasonCovers("pt", career)) expect(`${cover.headline} ${cover.support}`).not.toMatch(/\{|\}/);
    }
    expect(crowns).toBeGreaterThan(0);
  });
});

describe("decisões e efeitos (D42)", () => {
  it("a volta de empréstimo tem rótulos de clube: voltar e ficar no clube do empréstimo", () => {
    expect(CAREER_TEXTS.pt.option.back).toBeTruthy();
    expect(CAREER_TEXTS.pt.option.buyout).toMatch(/empréstimo/);
    for (const career of careers) {
      const decision = career.decision;
      if (!decision) continue;
      for (const option of decision.options) expect(optionLabel("pt", career, decision, option).length).toBeGreaterThan(0);
    }
  });

  it("pressão aparece em palavras, sem casas decimais", () => {
    expect(describeEffect("pt", { kind: "pressure", amount: 0.15 })).toBe("Mais pressão");
    expect(describeEffect("pt", { kind: "pressure", amount: -0.2 })).toBe("Menos pressão");
  });

  it("as conquistas novas existem, e a Lenda é do clube, não da carta", () => {
    for (const id of ["seventyThree", "tenClubs", "promotedToContinent", "scoringTitle", "bestOfCompetition"]) expect(getAchievement(id)).not.toBeNull();
    expect(ACHIEVEMENTS.filter((item) => !item.id.includes(":"))).toHaveLength(49);
  });
});

describe("as marcas da pressão do recorde (D44)", () => {
  it("o motor protege exatamente as marcas que o resumo mostra", () => {
    const value = (id: string) => REAL_RECORDS.find((record) => record.id === id)?.value;
    expect(value("seasonGoals")).toBe(REAL_MARKS.seasonGoals);
    expect(value("careerGoals")).toBe(REAL_MARKS.careerGoals);
    expect(value("internationalGoals")).toBe(REAL_MARKS.nationalGoals);
    expect(value("caps")).toBe(REAL_MARKS.caps);
    expect(value("careerGames")).toBe(REAL_MARKS.careerGames);
    expect(value("ballonDor")).toBe(REAL_MARKS.ballonDor);
    expect(value("ballonStreak")).toBe(REAL_MARKS.ballonStreak);
    expect(value("goldenShoes")).toBe(REAL_MARKS.goldenShoes);
    expect(value("careerTitles")).toBe(REAL_MARKS.titles);
    expect(value("worldCups")).toBe(REAL_MARKS.worldCups);
    expect(value("championsLeague")).toBe(REAL_MARKS.continental);
    expect(value("libertadores")).toBe(REAL_MARKS.continental);
    expect(value("primaryStreak")).toBe(REAL_MARKS.continentalStreak);
    expect(value("leagueStreak")).toBe(REAL_MARKS.leagueStreak);
    expect(value("leagueEngland")).toBe(REAL_MARKS.leagues.ENG);
    expect(value("leagueSpain")).toBe(REAL_MARKS.leagues.ESP);
    expect(value("leagueItaly")).toBe(REAL_MARKS.leagues.ITA);
    expect(value("leagueGermany")).toBe(REAL_MARKS.leagues.GER);
  });
});
