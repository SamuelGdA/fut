import type { Career } from "../career/types";
import { GROUP_OF, type Position, type PositionGroup } from "../player/positions";
import type { TalentBand } from "../player/talent";
import {
  best,
  bestWorldCupStage,
  clubCountry,
  lastPlayedAge,
  leaguePosition,
  nationalTournaments,
  promotions,
  seasonsByClub,
  sum,
  titlesOfKind,
} from "./measures";
import { MISSION_TARGETS } from "./targets";

/**
 * As 36 missões do Desafio do dia (GDD 27.3): nove eixos, quatro missões cada.
 * Cada missão diz que posições podem persegui-la e como medir o progresso (a
 * qualquer momento da carreira). O alvo depende da faixa de talento do
 * jogador do dia e mora em `targets.ts`, gerado pela calibragem do harness
 * (`pnpm desafio:calibrar`): um jogador bom chega perto de um alvo cheio e um
 * parcial numa tentativa típica, em qualquer faixa.
 */

export const CHALLENGE_AXES = ["goals", "titles", "loyalty", "road", "evolution", "underdog", "national", "longevity", "awards"] as const;
export type ChallengeAxis = (typeof CHALLENGE_AXES)[number];

export interface Mission {
  readonly id: string;
  readonly axis: ChallengeAxis;
  /** Grupos de posição que podem perseguir a missão; vazio é todo mundo. */
  readonly groups: readonly PositionGroup[];
  /** O progresso agora, na unidade da missão. */
  measure(career: Career): number;
}

const OUTFIELD: readonly PositionGroup[] = ["attacker", "attackingMid", "midfield", "fullback", "centreBack"];
const SCORERS: readonly PositionGroup[] = ["attacker", "attackingMid", "midfield"];
const FORWARDS: readonly PositionGroup[] = ["attacker", "attackingMid"];
const DEFENSIVE: readonly PositionGroup[] = ["goalkeeper", "centreBack", "fullback"];

/** Clube fraco para o Azarão: força no começo da temporada até este número. */
export const UNDERDOG_STRENGTH = 72;

const mission = (id: string, axis: ChallengeAxis, groups: readonly PositionGroup[], measure: (career: Career) => number): Mission => ({
  id,
  axis,
  groups,
  measure,
});

export const MISSIONS: readonly Mission[] = [
  // Gols.
  mission("careerGoals", "goals", SCORERS, (c) => sum(c.history, (r) => r.production.goals + r.national.goals)),
  mission("seasonGoals", "goals", FORWARDS, (c) => best(c.history, (r) => r.production.goals)),
  mission("contributions", "goals", ["attacker", "attackingMid", "midfield", "fullback"], (c) =>
    sum(c.history, (r) => r.production.goals + r.production.assists + r.national.goals),
  ),
  mission("cleanSheets", "goals", DEFENSIVE, (c) => sum(c.history, (r) => r.production.cleanSheets)),

  // Troféus.
  mission("totalTitles", "titles", [], (c) => sum(c.history, (r) => r.titles.length)),
  mission("leagueTitles", "titles", [], (c) => sum(c.history, (r) => titlesOfKind(r, "league"))),
  mission("continentalTitles", "titles", [], (c) => sum(c.history, (r) => titlesOfKind(r, "continental1"))),
  mission("cupTitles", "titles", [], (c) => sum(c.history, (r) => titlesOfKind(r, "cup", "leagueCup"))),

  // Lealdade.
  mission("longestStay", "loyalty", [], (c) => Math.max(0, ...seasonsByClub(c.history).values())),
  mission("firstClubGames", "loyalty", [], (c) => {
    const first = c.history[0]?.club;
    return first ? sum(c.history, (r) => (r.club === first ? r.games : 0)) : 0;
  }),
  mission("idolSeasons", "loyalty", [], (c) => c.history.filter((r) => r.legacy === "idol" || r.legacy === "legend").length),
  mission("peakFans", "loyalty", [], (c) => Math.round(Math.max(0, ...Object.values(c.bonds).map((bond) => bond.peakFans)))),

  // Estrada.
  mission("clubs", "road", [], (c) => seasonsByClub(c.history).size),
  mission("countries", "road", [], (c) => new Set(c.history.map((r) => clubCountry(r.club) ?? r.club)).size),
  mission("seasonsAbroad", "road", [], (c) => c.history.filter((r) => clubCountry(r.club) !== c.nationality).length),
  mission("titleCountries", "road", [], (c) =>
    new Set(c.history.filter((r) => titlesOfKind(r, "league") > 0).map((r) => clubCountry(r.club) ?? r.club)).size,
  ),

  // Evolução.
  mission("peakOvr", "evolution", [], (c) => best(c.history, (r) => r.ovrEnd)),
  mission("bestJump", "evolution", [], (c) => best(c.history, (r) => r.ovrEnd - r.ovrStart)),
  mission("ovrAt21", "evolution", [], (c) => best(c.history.filter((r) => r.age <= 21), (r) => r.ovrEnd)),
  mission("eliteSeasons", "evolution", [], (c) => c.history.filter((r) => r.ovrEnd >= 85).length),

  // Azarão.
  mission("underdogTitles", "underdog", [], (c) => sum(c.history, (r) => (r.clubStrength <= UNDERDOG_STRENGTH ? r.titles.length : 0))),
  mission("promotions", "underdog", [], (c) => promotions(c.history)),
  mission("underdogStar", "underdog", [], (c) => c.history.filter((r) => r.role === "star" && r.clubStrength <= UNDERDOG_STRENGTH).length),
  mission("underdogPodiums", "underdog", [], (c) =>
    c.history.filter((r) => r.division === 1 && r.clubStrength <= UNDERDOG_STRENGTH + 2 && (leaguePosition(r) ?? 99) <= 3).length,
  ),

  // Seleção.
  mission("caps", "national", [], (c) => sum(c.history, (r) => r.national.games)),
  mission("nationalGoals", "national", SCORERS, (c) => sum(c.history, (r) => r.national.goals)),
  mission("tournaments", "national", [], (c) => nationalTournaments(c.history)),
  mission("worldCupRun", "national", [], (c) => bestWorldCupStage(c.history)),

  // Longevidade.
  mission("seasons", "longevity", [], (c) => c.history.length),
  mission("totalGames", "longevity", [], (c) => sum(c.history, (r) => r.games + r.national.games)),
  mission("lateGames", "longevity", [], (c) => sum(c.history, (r) => (r.age >= 33 ? r.games : 0))),
  mission("lastAge", "longevity", [], (c) => lastPlayedAge(c)),

  // Prêmios.
  mission("ballonPodiums", "awards", OUTFIELD, (c) =>
    c.history.filter((r) => {
      const rank = r.awards.ballonDor.playerRank;
      return rank !== null && rank <= 3;
    }).length,
  ),
  // Cada artilharia e cada craque de competição contam (D42), além dos prêmios do ano.
  mission("awardsTotal", "awards", [], (c) =>
    sum(c.history, (r) => r.awards.won.filter((key) => key !== "topScorer" && key !== "bestPlayer").length + r.awards.crowns.length),
  ),
  mission("scoringAwards", "awards", FORWARDS, (c) =>
    sum(c.history, (r) => (r.awards.won.includes("goldenShoe") ? 1 : 0) + r.awards.crowns.filter((crown) => crown.award === "topScorer").length),
  ),
  mission("goldenGloves", "awards", ["goalkeeper"], (c) => sum(c.history, (r) => (r.awards.won.includes("goldenGlove") ? 1 : 0))),
];

const BY_ID = new Map(MISSIONS.map((item) => [item.id, item]));

export function getMission(id: string): Mission | null {
  return BY_ID.get(id) ?? null;
}

export function missionFitsPosition(item: Mission, position: Position): boolean {
  return item.groups.length === 0 || item.groups.includes(GROUP_OF[position]);
}

/** O alvo da missão para a faixa de talento; 0 quer dizer fora das mãos daquela faixa. */
export function missionTarget(id: string, talent: TalentBand): number {
  return MISSION_TARGETS[id]?.[talent] ?? 0;
}

/**
 * Pares contraditórios (GDD 27.2), lidos nos dois sentidos: perseguir um
 * empurra para longe do outro. Ficar a carreira num clube contra rodar o mundo.
 */
const CONTRADICTIONS: ReadonlyArray<readonly [string, string]> = [
  ["longestStay", "clubs"],
  ["longestStay", "countries"],
  ["longestStay", "titleCountries"],
  ["firstClubGames", "clubs"],
  ["firstClubGames", "countries"],
  ["firstClubGames", "titleCountries"],
  ["peakFans", "clubs"],
];

export function contradicts(a: string, b: string): boolean {
  return CONTRADICTIONS.some(([first, second]) => (first === a && second === b) || (first === b && second === a));
}
