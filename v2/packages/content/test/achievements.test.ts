import {
  autoplay,
  type CareerSetup,
  CAREER_POLICIES,
  challengeSetup,
  challengeStatus,
  choose,
  createCareer,
  dailyHand,
  EDICTS,
  MISSION_TARGETS,
  MISSIONS,
  policyChoice,
  shiftChallengeDay,
  TALENT_BANDS,
  UNDERDOG_STRENGTH,
} from "@craque/engine";
import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENT_GROUPS,
  ACHIEVEMENT_IDS,
  ACHIEVEMENT_TEXTS,
  achievementMet,
  achievementProgress,
  ACHIEVEMENTS,
  achievementText,
  axisName,
  CHALLENGE_TEXTS,
  edictRule,
  LOCALES,
  missionGoal,
  missionHint,
  missionName,
  missionValue,
  newAchievements,
} from "../src";

/** Conquistas (GDD 28.2) e o texto do Desafio do dia (GDD 27). */

function setup(index: number): CareerSetup {
  const positions = ["st", "cm", "cb", "gk", "lw", "cam", "rb", "cdm", "lb", "rw"] as const;
  const nations = ["BRA", "ARG", "ENG", "JPN", "NGA", "ESP", "USA", "CRO", "FRA", "MEX", "KOR", "GER"] as const;
  return {
    seed: `conquista-${index}`,
    startYear: 2026,
    pace: "normal",
    difficulty: index % 4 === 0 ? "hard" : "normal",
    identity: {
      surname: "Teste",
      foot: "right",
      nationality: nations[index % nations.length] ?? "BRA",
      position: positions[index % positions.length] ?? "st",
      dreamNumber: 10,
    },
  };
}

const context = (career: ReturnType<typeof createCareer>) => ({ career, challenge: null, finishedBefore: 0, rankedDays: 0 });

describe("o catálogo de conquistas", () => {
  it("ids únicos, oito grupos com pelo menos quatro cada, regra de sim ou não ou de contagem", () => {
    expect(new Set(ACHIEVEMENT_IDS).size).toBe(ACHIEVEMENTS.length);
    for (const group of ACHIEVEMENT_GROUPS) expect(ACHIEVEMENTS.filter((item) => item.group === group).length, group).toBeGreaterThanOrEqual(4);
    for (const item of ACHIEVEMENTS) {
      expect(Boolean(item.check) !== Boolean(item.count), item.id).toBe(true);
      expect(item.count === undefined || (item.target ?? 0) > 0, item.id).toBe(true);
    }
    // Os contadores entre carreiras são só estes dois; o resto se mede numa carreira.
    expect(ACHIEVEMENTS.filter((item) => item.across).map((item) => item.id).sort()).toEqual(["challengeWeek", "tenCareers"]);
  });

  it("cada conquista tem nome e descrição nos três idiomas, e não sobra texto de conquista que não existe", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(ACHIEVEMENT_TEXTS[locale].items).sort()).toEqual(ACHIEVEMENT_IDS.filter((id) => !id.includes(":")).sort());
      for (const id of ACHIEVEMENT_IDS) {
        const text = achievementText(locale, id);
        expect(text.name.length, `${locale} ${id}`).toBeGreaterThan(0);
        expect(text.description, `${locale} ${id}`).toMatch(/\.$/);
      }
    }
  });
});

describe("conquistas numa carreira", () => {
  const careers = Array.from({ length: 120 }, (_, index) => autoplay(createCareer(setup(index)), CAREER_POLICIES[index % CAREER_POLICIES.length] ?? "balanced"));

  it("no meio da carreira só caem as que podem cair a qualquer hora; terminada, todas", () => {
    let career = createCareer(setup(7));
    const unlocked = new Set<string>();
    for (let step = 0; step < 80 && career.decision; step += 1) {
      for (const id of newAchievements(context(career), unlocked)) {
        expect(ACHIEVEMENTS.find((item) => item.id === id)?.when, id).toBe("anytime");
        unlocked.add(id);
      }
      const choice = policyChoice(career, "ambitious");
      if (!choice) break;
      career = choose(career, choice).career;
    }
    expect(career.end).not.toBeNull();
    const atEnd = newAchievements(context(career), unlocked);
    expect(atEnd).toContain("firstCareer");
    // As que já tinha não voltam.
    for (const id of unlocked) expect(atEnd).not.toContain(id);
  });

  it("progresso nunca passa do alvo, e a conquista de contagem cai exatamente no alvo", () => {
    for (const career of careers.slice(0, 40)) {
      for (const item of ACHIEVEMENTS) {
        const progress = achievementProgress(item, context(career));
        if (!progress) continue;
        expect(progress.value).toBeLessThanOrEqual(progress.target);
        expect(achievementMet(item, context(career))).toBe(progress.value >= progress.target);
      }
    }
  });

  it("um lote de carreiras comuns: nenhuma conquista (fora a primeira) é de graça, e as de entrada aparecem", () => {
    const rate = (id: string) => {
      const item = ACHIEVEMENTS.find((entry) => entry.id === id);
      return item ? careers.filter((career) => achievementMet(item, context(career))).length / careers.length : 0;
    };
    expect(rate("firstCareer")).toBe(1);
    // A primeira taça é a porta de entrada: comum, mas não garantida (D42: título é de quem jogou).
    const ceiling = (id: string) => (id === "firstTitle" ? 0.85 : 0.75);
    for (const item of ACHIEVEMENTS) if (item.id !== "firstCareer") expect(rate(item.id), item.id).toBeLessThan(ceiling(item.id));
    for (const id of ["firstTitle", "legend", "firstCap", "clubThreeHundred", "oneClubMan", "continentalKing"]) expect(rate(id), id).toBeGreaterThan(0.05);
  });

  it("contadores entre carreiras: a décima carreira e a sétima tentativa ranqueada", () => {
    const career = careers[0];
    if (!career) throw new Error("sem carreira");
    const tenth = ACHIEVEMENTS.find((item) => item.id === "tenCareers");
    const week = ACHIEVEMENTS.find((item) => item.id === "challengeWeek");
    if (!tenth || !week) throw new Error("catálogo mudou");
    expect(achievementMet(tenth, { career, challenge: null, finishedBefore: 8, rankedDays: 0 })).toBe(false);
    expect(achievementMet(tenth, { career, challenge: null, finishedBefore: 9, rankedDays: 0 })).toBe(true);
    expect(achievementMet(week, { career, challenge: null, finishedBefore: 0, rankedDays: 7 })).toBe(true);
  });

  it("conquistas do desafio leem o resultado da tentativa", () => {
    for (const day of ["2026-10-02", "2026-10-03", "2026-10-04"]) {
      const hand = dailyHand(day);
      const career = autoplay(createCareer(challengeSetup(hand, { surname: "Teste", foot: "right", dreamNumber: 9 })), "balanced");
      const challenge = challengeStatus(hand, career);
      const unlocked = new Set(newAchievements({ career, challenge, finishedBefore: 0, rankedDays: 1 }, new Set()));
      expect(unlocked.has("challengeFirst")).toBe(true);
      expect(unlocked.has("challenge700")).toBe(challenge.total >= 700);
      expect(unlocked.has("challengeAllThree")).toBe(challenge.missions.every((item) => item.ratio >= 1));
      // Fora do desafio, nenhuma do grupo cai (a sétima ranqueada depende só do contador).
      const plain = newAchievements(context(career), new Set());
      expect(plain.filter((id) => id.startsWith("challenge"))).toEqual([]);
    }
  });
});

describe("texto do Desafio do dia", () => {
  it("toda missão e todo édito do motor têm texto, e não sobra texto sem regra", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(CHALLENGE_TEXTS[locale].missions).sort()).toEqual(MISSIONS.map((item) => item.id).sort());
      expect(Object.keys(CHALLENGE_TEXTS[locale].edicts).sort()).toEqual(EDICTS.map((item) => item.id).sort());
    }
  });

  it("nome de missão nunca repete o nome do eixo (a ficha mostra os dois lado a lado)", () => {
    for (const locale of LOCALES) {
      for (const item of MISSIONS) expect(missionName(locale, item.id), `${locale} ${item.id}`).not.toBe(axisName(locale, item.axis));
    }
  });

  it("a meta de cada missão, com o alvo de cada faixa, sai inteira nos três idiomas", () => {
    for (const locale of LOCALES) {
      for (const item of MISSIONS) {
        expect(missionName(locale, item.id)).not.toBe(item.id);
        for (const band of TALENT_BANDS) {
          const target = MISSION_TARGETS[item.id]?.[band] ?? 0;
          if (target <= 0) continue;
          const goal = missionGoal(locale, item.id, target);
          expect(goal.length, `${locale} ${item.id} ${target}`).toBeGreaterThan(0);
          expect(goal, `${locale} ${item.id}`).not.toMatch(/[{}–—]/);
          if (!["worldCupRun", "clubLegend", "twoClubIdol"].includes(item.id)) expect(goal).toContain(String(target));
        }
      }
    }
  });

  it("singular e plural pelo alvo, a Campanha de Copa pela fase, e as dicas com os números do motor", () => {
    expect(missionGoal("pt", "leagueTitles", 1)).toBe("1 título de liga");
    expect(missionGoal("pt", "leagueTitles", 3)).toBe("3 títulos de liga");
    expect(missionGoal("en", "clubs", 1)).toBe("1 club in your career");
    expect(missionGoal("pt", "worldCupRun", 4)).toBe("Chegar às oitavas de uma Copa do Mundo");
    expect(missionGoal("es", "worldCupRun", 8)).toBe("Ganar una Copa del Mundo");
    expect(missionValue("pt", "worldCupRun", 0)).toBe("Nenhuma");
    expect(missionValue("en", "worldCupRun", 7)).toBe("Final");
    expect(missionValue("pt", "totalGames", 1234)).toBe("1.234");
    expect(missionHint("pt", "underdogTitles")).toContain(String(UNDERDOG_STRENGTH));
    expect(missionHint("pt", "careerGoals")).toBeNull();
  });

  it("a regra de cada édito sai com os limites do motor, sem marcador sobrando", () => {
    for (const locale of LOCALES) {
      for (const edict of EDICTS) {
        const rule = edictRule(locale, edict.id);
        expect(rule, `${locale} ${edict.id}`).not.toMatch(/[{}–—]/);
        expect(rule).toMatch(/\.$/);
        if (edict.limit > 0) expect(rule, `${locale} ${edict.id}`).toContain(String(edict.limit));
      }
    }
    expect(edictRule("pt", "noBench")).toBe("A partir dos 20 anos, no máximo 1 temporada terminada no banco.");
  });

  it("cada mão de um ano inteiro tem meta escrita para as três missões", () => {
    for (let index = 0; index < 365; index += 1) {
      const hand = dailyHand(shiftChallengeDay("2026-01-01", index));
      hand.missions.forEach((id, slot) => {
        expect(missionGoal("pt", id, hand.targets[slot] ?? 0)).not.toMatch(/[{}]/);
      });
    }
  });
});
