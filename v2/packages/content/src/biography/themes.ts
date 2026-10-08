import type { InjuryType } from "@craque/engine";
import type { Vars } from "../i18n";
import type { RecordId } from "../records";
import type { BioFacts } from "./facts";

/**
 * Os temas da biografia (GDD 25). Cada tema tem capítulo, grupo (temas que
 * dizem a mesma coisa; só um por artigo), saliência (quanto vale contar),
 * condição (saliência zero não entra), idade opcional e as variáveis do
 * texto. As quatro redações de cada tema ficam nos dicionários `bio.*`.
 */

export const CHAPTERS = ["origin", "rise", "peak", "late", "legacy"] as const;
export type ChapterId = (typeof CHAPTERS)[number];

/** Limite de frases por capítulo: força duas carreiras parecidas a contar detalhes diferentes. */
export const CHAPTER_CAPS: Readonly<Record<ChapterId, number>> = { origin: 3, rise: 4, peak: 5, late: 3, legacy: 4 };

/** O que um tema precisa do idioma: nomes e plurais. */
export interface Words {
  club(id: string): string;
  competition(id: string): string;
  injury(type: InjuryType): string;
  record(id: RecordId): string;
  /** Plural da biografia: "uma vez", "3 títulos". */
  count(key: CountKey, count: number): string;
}

export type CountKey = "times" | "titles" | "leagueTitles" | "clubs" | "countries" | "games" | "goals" | "cleanSheets" | "caps";

export interface ThemeHit {
  readonly salience: number;
  readonly age: number | null;
  readonly vars: Vars;
}

export interface Theme {
  readonly chapter: ChapterId;
  readonly group: string;
  read(facts: BioFacts, words: Words): ThemeHit | null;
}

const hit = (salience: number, age: number | null, vars: Vars = {}): ThemeHit => ({ salience, age, vars });

/** Os gols (ou jogos sem sofrer, no gol) de uma carreira, já no plural certo. */
function production(facts: BioFacts, words: Words): string {
  return facts.keeper ? words.count("cleanSheets", facts.totals.cleanSheets) : words.count("goals", facts.totals.goals);
}

export const THEMES = {
  // ------------------------------------------------------------- origem
  firstClub: {
    chapter: "origin",
    group: "origin.start",
    read: (f, w) => {
      const first = f.stints[0];
      return first ? hit(100, first.fromAge, { club: w.club(first.club), age: first.fromAge }) : null;
    },
  },
  prodigy: {
    chapter: "origin",
    group: "origin.talent",
    read: (f) => (f.prodigy || f.talent === "phenom" ? hit(f.prodigy ? 75 : 60, f.firstAge, { age: f.firstAge }) : null),
  },
  earlyStarter: {
    chapter: "origin",
    group: "origin.talent",
    read: (f, w) => (f.earlyStarter ? hit(70, f.earlyStarter.age, { age: f.earlyStarter.age, club: w.club(f.earlyStarter.club) }) : null),
  },
  slowStart: {
    chapter: "origin",
    group: "origin.talent",
    read: (f) => (f.quietYouth >= 2 ? hit(35 + f.quietYouth * 5, f.firstAge + 1, { count: f.quietYouth }) : null),
  },
  startOnLoan: {
    chapter: "origin",
    group: "origin.move",
    read: (f, w) => (f.earlyLoan && !f.earlyLoan.starter ? hit(50, f.earlyLoan.age, { club: w.club(f.earlyLoan.club), age: f.earlyLoan.age }) : null),
  },
  /** Emprestado e titular no clube do empréstimo: uma frase só, sem contradição. */
  loanStarter: {
    chapter: "origin",
    group: "origin.move",
    read: (f, w) => (f.earlyLoan?.starter ? hit(60, f.earlyLoan.age, { club: w.club(f.earlyLoan.club), age: f.earlyLoan.age }) : null),
  },

  // ----------------------------------------------------------- ascensão
  breakthrough: {
    chapter: "rise",
    group: "rise.break",
    read: (f, w) => (f.breakthrough && !f.earlyStarter ? hit(80, f.breakthrough.age, { age: f.breakthrough.age, club: w.club(f.breakthrough.club) }) : null),
  },
  firstTitle: {
    chapter: "rise",
    group: "rise.title",
    read: (f, w) => (f.firstTitle ? hit(75, f.firstTitle.age, { age: f.firstTitle.age, competition: w.competition(f.firstTitle.competition) }) : null),
  },
  bigMove: {
    chapter: "rise",
    group: "rise.move",
    read: (f, w) => (f.bigMove ? hit(60 + f.bigMove.gap, f.bigMove.age, { age: f.bigMove.age, club: w.club(f.bigMove.club) }) : null),
  },
  explosion: {
    chapter: "rise",
    group: "rise.explosion",
    read: (f) => (f.explosion ? hit(50 + f.explosion.delta * 3, f.explosion.age, { age: f.explosion.age, delta: f.explosion.delta }) : null),
  },
  firstCap: {
    chapter: "rise",
    group: "rise.cap",
    read: (f) => (f.firstCapAge !== null ? hit(70, f.firstCapAge, { age: f.firstCapAge }) : null),
  },
  promotion: {
    chapter: "rise",
    group: "rise.promotion",
    read: (f, w) => (f.promotion ? hit(55, f.promotion.age, { age: f.promotion.age, club: w.club(f.promotion.club) }) : null),
  },
  classicShirt: {
    chapter: "rise",
    group: "rise.shirt",
    read: (f) => (f.classicShirt ? hit(40, f.classicShirt.age, { age: f.classicShirt.age, number: f.classicShirt.number }) : null),
  },
  roadNotTaken: {
    chapter: "rise",
    group: "rise.road",
    read: (f, w) => (f.roadNotTaken ? hit(45, f.roadNotTaken.age, { age: f.roadNotTaken.age, club: w.club(f.roadNotTaken.club) }) : null),
  },

  // --------------------------------------------------------------- auge
  peak: {
    chapter: "peak",
    group: "peak.peak",
    read: (f) => (f.peak && f.totals.seasons >= 3 ? hit(90, f.peak.age, { age: f.peak.age, ovr: f.peak.ovr }) : null),
  },
  ballonOne: {
    chapter: "peak",
    group: "peak.ballon",
    read: (f) => (f.ballonDors === 1 && f.firstBallonAge !== null ? hit(130, f.firstBallonAge, { age: f.firstBallonAge }) : null),
  },
  ballonMany: {
    chapter: "peak",
    group: "peak.ballon",
    read: (f) => (f.ballonDors >= 2 ? hit(130 + f.ballonDors * 10, null, { count: f.ballonDors }) : null),
  },
  podium: {
    chapter: "peak",
    group: "peak.ballon",
    read: (f, w) => (f.ballonDors === 0 && f.podiums > 0 ? hit(70 + f.podiums * 5, null, { timesText: w.count("times", f.podiums) }) : null),
  },
  worldCup: {
    chapter: "peak",
    group: "peak.world",
    read: (f) => (f.worldCupAge !== null ? hit(140, f.worldCupAge, { age: f.worldCupAge }) : null),
  },
  continental: {
    chapter: "peak",
    group: "peak.continental",
    read: (f, w) => {
      const count = f.titlesByKind.continental1 ?? 0;
      if (count === 0 || !f.firstContinental) return null;
      return hit(95 + count * 5, null, { timesText: w.count("times", count), competition: w.competition(f.firstContinental.competition) });
    },
  },
  nationsCup: {
    chapter: "peak",
    group: "peak.nations",
    read: (f, w) => {
      const count = f.titlesByKind.nationsCup ?? 0;
      return count > 0 ? hit(85 + count * 5, null, { timesText: w.count("times", count) }) : null;
    },
  },
  leagues: {
    chapter: "peak",
    group: "peak.league",
    read: (f, w) => {
      const count = f.titlesByKind.league ?? 0;
      return count > 0 ? hit(55 + count * 4, null, { leaguesText: w.count("leagueTitles", count) }) : null;
    },
  },
  perfectSeason: {
    chapter: "peak",
    group: "peak.season",
    read: (f) => (f.perfectSeason !== null ? hit(105, f.perfectSeason, { age: f.perfectSeason }) : null),
  },
  goalsSeason: {
    chapter: "peak",
    group: "peak.goals",
    read: (f) => (!f.keeper && f.bestGoals && f.bestGoals.goals >= 25 ? hit(40 + f.bestGoals.goals, f.bestGoals.age, { age: f.bestGoals.age, goals: f.bestGoals.goals }) : null),
  },
  scorerOne: {
    chapter: "peak",
    group: "peak.scorer",
    read: (f, w) => {
      const first = f.topScorer[0];
      return f.topScorer.length === 1 && first ? hit(70, first.age, { age: first.age, competition: w.competition(first.competition) }) : null;
    },
  },
  scorerMany: {
    chapter: "peak",
    group: "peak.scorer",
    read: (f, w) => {
      const first = f.topScorer[0];
      return f.topScorer.length >= 2 && first
        ? hit(70 + f.topScorer.length * 6, null, { timesText: w.count("times", f.topScorer.length), competition: w.competition(first.competition), age: first.age })
        : null;
    },
  },
  bestOne: {
    chapter: "peak",
    group: "peak.best",
    read: (f, w) => {
      const first = f.bestPlayer[0];
      return f.bestPlayer.length === 1 && first ? hit(72, first.age, { age: first.age, competition: w.competition(first.competition) }) : null;
    },
  },
  bestMany: {
    chapter: "peak",
    group: "peak.best",
    read: (f, w) => {
      const first = f.bestPlayer[0];
      return f.bestPlayer.length >= 2 && first
        ? hit(72 + f.bestPlayer.length * 6, null, { timesText: w.count("times", f.bestPlayer.length), competition: w.competition(first.competition), age: first.age })
        : null;
    },
  },
  goldenShoe: {
    chapter: "peak",
    group: "peak.shoe",
    read: (f, w) => (f.goldenShoes > 0 ? hit(80 + f.goldenShoes * 5, null, { timesText: w.count("times", f.goldenShoes) }) : null),
  },
  goldenGlove: {
    chapter: "peak",
    group: "peak.shoe",
    read: (f, w) => (f.goldenGloves > 0 ? hit(80 + f.goldenGloves * 5, null, { timesText: w.count("times", f.goldenGloves) }) : null),
  },

  // --------------------------------------------------------- reta final
  decline: {
    chapter: "late",
    group: "late.decline",
    read: (f) => (f.decline ? hit(55, f.decline.age, { age: f.decline.age, ovr: f.decline.ovr }) : null),
  },
  veteranTitle: {
    chapter: "late",
    group: "late.title",
    read: (f, w) => (f.veteranTitle ? hit(75, f.veteranTitle.age, { age: f.veteranTitle.age, competition: w.competition(f.veteranTitle.competition) }) : null),
  },
  homecoming: {
    chapter: "late",
    group: "late.home",
    read: (f, w) => (f.homecoming ? hit(80, f.homecoming.age, { age: f.homecoming.age, club: w.club(f.homecoming.club) }) : null),
  },
  lastClub: {
    chapter: "late",
    group: "late.last",
    // Só a passagem que fecha a carreira depois do auge, e que não é a casa da
    // carreira: "os últimos capítulos" aos 18 anos, num clube de 17 temporadas, mente.
    read: (f, w) => {
      const last = f.stints[f.stints.length - 1];
      if (!last || f.stints.length < 2 || !f.peak) return null;
      if (last.fromAge <= f.peak.age || last.seasons * 2 >= f.totals.seasons) return null;
      return hit(40, last.fromAge, { age: last.fromAge, club: w.club(last.club) });
    },
  },
  seriousInjury: {
    chapter: "late",
    group: "adversity.injury",
    read: (f, w) =>
      f.worstInjury
        ? hit(40 + f.worstInjury.lostGames, f.worstInjury.age, {
            age: f.worstInjury.age,
            injury: w.injury(f.worstInjury.type),
          })
        : null,
  },
  relegation: {
    chapter: "late",
    group: "adversity.relegation",
    read: (f, w) => (f.relegation ? hit(50, f.relegation.age, { age: f.relegation.age, club: w.club(f.relegation.club) }) : null),
  },
  suspension: {
    chapter: "late",
    group: "adversity.suspension",
    read: (f) => (f.suspension !== null ? hit(45, f.suspension, { age: f.suspension }) : null),
  },
  released: {
    chapter: "late",
    group: "adversity.release",
    // A dispensa que encerra a carreira já é contada pelo fim (endRelease).
    read: (f, w) =>
      f.released && !(f.end?.reason === "release" && f.end.age === f.released.age)
        ? hit(50, f.released.age, { age: f.released.age, club: w.club(f.released.club) })
        : null,
  },
  endAge: {
    chapter: "late",
    group: "late.end",
    read: (f) => (f.end?.reason === "age" ? hit(85, f.end.age, { age: f.end.age }) : null),
  },
  endNoRoom: {
    chapter: "late",
    group: "late.end",
    read: (f) => (f.end?.reason === "noRoom" ? hit(85, f.end.age, { age: f.end.age }) : null),
  },
  endNoOffers: {
    chapter: "late",
    group: "late.end",
    read: (f) => (f.end?.reason === "noOffers" ? hit(85, f.end.age, { age: f.end.age }) : null),
  },
  endRelease: {
    chapter: "late",
    group: "late.end",
    read: (f) => (f.end?.reason === "release" ? hit(85, f.end.age, { age: f.end.age }) : null),
  },
  endVoluntary: {
    chapter: "late",
    group: "late.end",
    read: (f) => (f.end?.reason === "voluntary" ? hit(85, f.end.age, { age: f.end.age }) : null),
  },

  // ------------------------------------------------------------- legado
  totals: {
    chapter: "legacy",
    group: "legacy.totals",
    read: (f, w) => (f.totals.games > 0 ? hit(70, null, { gamesText: w.count("games", f.totals.games), productionText: production(f, w) }) : null),
  },
  titlesTotal: {
    chapter: "legacy",
    group: "legacy.titles",
    read: (f, w) => (f.totals.titles > 0 ? hit(50 + f.totals.titles * 3, null, { titlesText: w.count("titles", f.totals.titles) }) : null),
  },
  legendOne: {
    chapter: "legacy",
    group: "legacy.legend",
    read: (f, w) => (f.legends.length === 1 ? hit(90, null, { club: w.club(f.legends[0] ?? "") }) : null),
  },
  legendMany: {
    chapter: "legacy",
    group: "legacy.legend",
    read: (f, w) => (f.legends.length >= 2 ? hit(90 + f.legends.length * 10, null, { clubsText: w.count("clubs", f.legends.length) }) : null),
  },
  idol: {
    chapter: "legacy",
    group: "legacy.legend",
    read: (f, w) => (f.legends.length === 0 && f.idols.length > 0 ? hit(60, null, { club: w.club(f.idols[0] ?? "") }) : null),
  },
  traitor: {
    chapter: "legacy",
    group: "legacy.traitor",
    read: (f, w) => (f.traitorClubs.length > 0 ? hit(55, null, { club: w.club(f.traitorClubs[0] ?? "") }) : null),
  },
  recordBeaten: {
    chapter: "legacy",
    group: "legacy.record",
    read: (f, w) => (f.recordsBeaten.length > 0 ? hit(150, null, { record: w.record(f.recordsBeaten[0] ?? "careerGoals") }) : null),
  },
  recordMatched: {
    chapter: "legacy",
    group: "legacy.record",
    read: (f, w) => (f.recordsBeaten.length === 0 && f.recordsMatched.length > 0 ? hit(100, null, { record: w.record(f.recordsMatched[0] ?? "careerGoals") }) : null),
  },
  oneClub: {
    chapter: "legacy",
    group: "legacy.arc",
    read: (f, w) => {
      const clubs = new Set(f.stints.filter((stint) => !stint.loan).map((stint) => stint.club));
      const only = f.stints.find((stint) => !stint.loan);
      return clubs.size === 1 && only && f.totals.seasons >= 8 ? hit(95, null, { club: w.club(only.club) }) : null;
    },
  },
  wanderer: {
    chapter: "legacy",
    group: "legacy.arc",
    read: (f, w) =>
      f.totals.clubs >= 6 ? hit(50 + f.totals.clubs * 3, null, { clubsText: w.count("clubs", f.totals.clubs), countriesText: w.count("countries", f.countries) }) : null,
  },
  meteoric: {
    chapter: "legacy",
    group: "legacy.arc",
    read: (f) => (f.peak && f.peak.age <= 23 && f.peak.ovr >= 80 ? hit(70, null, { age: f.peak.age }) : null),
  },
  lateBloomer: {
    chapter: "legacy",
    group: "legacy.arc",
    read: (f) => (f.peak && f.peak.age >= 30 && f.totals.seasons >= 10 ? hit(70, null, { age: f.peak.age }) : null),
  },
  longevity: {
    chapter: "legacy",
    group: "legacy.longevity",
    read: (f) => (f.totals.seasons >= 15 ? hit(30 + f.totals.seasons, null, { seasons: f.totals.seasons }) : null),
  },
  nationalLegacy: {
    chapter: "legacy",
    group: "legacy.national",
    read: (f, w) =>
      !f.keeper && f.totals.nationalGames >= 20
        ? hit(45 + Math.min(40, f.totals.nationalGames / 3), null, {
            capsText: w.count("caps", f.totals.nationalGames),
            nationalGoalsText: w.count("goals", f.totals.nationalGoals),
          })
        : null,
  },
  nationalLegacyKeeper: {
    chapter: "legacy",
    group: "legacy.national",
    read: (f, w) =>
      f.keeper && f.totals.nationalGames >= 20
        ? hit(45 + Math.min(40, f.totals.nationalGames / 3), null, { capsText: w.count("caps", f.totals.nationalGames) })
        : null,
  },
} satisfies Record<string, Theme>;

export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
