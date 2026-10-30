import { getCompetition } from "@craque/world";
import type { Career } from "../career/types";
import type { Position } from "../player/positions";
import { REAL_MARKS } from "../records/pressure";
import { type Rng } from "../rng";

/**
 * O recorde-alvo do Desafio do dia (D94). Em parte dos dias, além das três
 * missões, a mão traz um recorde real para perseguir, e todo mundo joga com um
 * Fenômeno. Os ids são os mesmos dos recordes do conteúdo, para a tela usar o
 * nome e o detentor de lá.
 */
export const CHALLENGE_RECORD_CHANCE = 0.25;

export type ChallengeRecordId =
  | "seasonGoals"
  | "careerGoals"
  | "internationalGoals"
  | "seasonAssists"
  | "seasonCleanSheets"
  | "careerTitles"
  | "championsLeague"
  | "caps"
  | "careerGames"
  | "ballonDor"
  | "worldCups";

interface ChallengeRecord {
  readonly id: ChallengeRecordId;
  readonly mark: number;
  readonly positions: readonly Position[] | "any";
  readonly measure: (career: Career) => number;
}

const ATTACK: readonly Position[] = ["st", "lw", "rw", "cam"];
const CREATORS: readonly Position[] = ["st", "lw", "rw", "cam", "cm", "lm", "rm"];
const sum = (career: Career, pick: (season: Career["history"][number]) => number) => career.history.reduce((total, season) => total + pick(season), 0);
const best = (career: Career, pick: (season: Career["history"][number]) => number) => career.history.reduce((top, season) => Math.max(top, pick(season)), 0);
const kindOf = (id: string) => getCompetition(id)?.kind;

export const CHALLENGE_RECORDS: readonly ChallengeRecord[] = [
  { id: "seasonGoals", mark: REAL_MARKS.seasonGoals, positions: ATTACK, measure: (career) => best(career, (season) => season.production.goals) },
  { id: "careerGoals", mark: REAL_MARKS.careerGoals, positions: ATTACK, measure: (career) => sum(career, (season) => season.production.goals + season.national.goals) },
  { id: "internationalGoals", mark: REAL_MARKS.nationalGoals, positions: ATTACK, measure: (career) => sum(career, (season) => season.national.goals) },
  { id: "ballonDor", mark: REAL_MARKS.ballonDor, positions: ATTACK, measure: (career) => sum(career, (season) => (season.awards.won.includes("ballonDor") ? 1 : 0)) },
  { id: "seasonAssists", mark: 32, positions: CREATORS, measure: (career) => best(career, (season) => season.production.assists) },
  {
    id: "seasonCleanSheets",
    mark: 26,
    positions: ["gk"],
    measure: (career) => best(career, (season) => season.production.lines.filter((line) => line.kind === "league").reduce((total, line) => total + line.cleanSheets, 0)),
  },
  { id: "careerTitles", mark: REAL_MARKS.titles, positions: "any", measure: (career) => sum(career, (season) => season.titles.length) },
  { id: "championsLeague", mark: REAL_MARKS.continental, positions: "any", measure: (career) => sum(career, (season) => season.titles.filter((id) => id === "cont1:UEFA").length) },
  { id: "worldCups", mark: REAL_MARKS.worldCups, positions: "any", measure: (career) => sum(career, (season) => season.titles.filter((id) => kindOf(id) === "worldCup").length) },
  { id: "caps", mark: REAL_MARKS.caps, positions: "any", measure: (career) => sum(career, (season) => season.national.games) },
  { id: "careerGames", mark: REAL_MARKS.careerGames, positions: "any", measure: (career) => sum(career, (season) => season.games + season.national.games) },
];

export function getChallengeRecord(id: string): ChallengeRecord | null {
  return CHALLENGE_RECORDS.find((item) => item.id === id) ?? null;
}

/** O recorde do dia para a posição, sorteado entre os que ela persegue. */
export function pickChallengeRecord(position: Position, rng: Rng): ChallengeRecord {
  const fits = CHALLENGE_RECORDS.filter((item) => item.positions === "any" || item.positions.includes(position));
  return rng.pick(fits);
}

/**
 * Pontos do recorde (máximo 250, um quarto da nota do dia): perto rende
 * (150 × r^1,5, com r = marca da carreira / marca real), igualar soma 60 e
 * superar soma mais 40.
 */
export const RECORD_POINTS = { near: 150, match: 60, beat: 40 } as const;
export const RECORD_SHARE = 0.75;

export function recordPoints(value: number, mark: number): number {
  const ratio = Math.min(1, Math.max(0, value / mark));
  return RECORD_POINTS.near * Math.pow(ratio, 1.5) + (value >= mark ? RECORD_POINTS.match : 0) + (value > mark ? RECORD_POINTS.beat : 0);
}
