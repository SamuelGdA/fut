import type { TalentBand } from "../player/talent";

/**
 * Alvos das missões do Desafio do dia por faixa de talento (GDD 27.3).
 * Gerado por `pnpm desafio:calibrar` (tools/balance): não edite à mão. Zero
 * tira a missão das mãos daquela faixa.
 *
 * Percentil 65 de 3000 carreiras (600 por faixa), semente "calibra-desafio", motor 2.0.0-m19.
 */
export const MISSION_TARGETS: Readonly<Record<string, Readonly<Record<TalentBand, number>>>> = {
  careerGoals: { journeyman: 85, prospect: 110, class: 135, star: 165, phenom: 250 },
  seasonGoals: { journeyman: 14, prospect: 16, class: 18, star: 21, phenom: 29 },
  contributions: { journeyman: 155, prospect: 195, class: 240, star: 290, phenom: 380 },
  cleanSheets: { journeyman: 155, prospect: 185, class: 230, star: 280, phenom: 380 },
  totalTitles: { journeyman: 3, prospect: 4, class: 5, star: 11, phenom: 27 },
  leagueTitles: { journeyman: 1, prospect: 1, class: 2, star: 4, phenom: 8 },
  continentalTitles: { journeyman: 0, prospect: 0, class: 1, star: 1, phenom: 2 },
  cupTitles: { journeyman: 1, prospect: 1, class: 2, star: 4, phenom: 7 },
  longestStay: { journeyman: 13, prospect: 13, class: 12, star: 14, phenom: 17 },
  firstClubGames: { journeyman: 24, prospect: 24, class: 26, star: 34, phenom: 85 },
  clubLegend: { journeyman: 1, prospect: 1, class: 1, star: 0, phenom: 0 },
  twoClubIdol: { journeyman: 0, prospect: 0, class: 2, star: 2, phenom: 2 },
  peakFans: { journeyman: 85, prospect: 90, class: 95, star: 100, phenom: 0 },
  clubs: { journeyman: 5, prospect: 5, class: 5, star: 6, phenom: 6 },
  countries: { journeyman: 4, prospect: 4, class: 4, star: 4, phenom: 4 },
  seasonsAbroad: { journeyman: 16, prospect: 16, class: 16, star: 17, phenom: 17 },
  titleCountries: { journeyman: 1, prospect: 1, class: 1, star: 2, phenom: 2 },
  peakOvr: { journeyman: 70, prospect: 0, class: 85, star: 90, phenom: 95 },
  bestJump: { journeyman: 4, prospect: 5, class: 5, star: 5, phenom: 6 },
  ovrAt21: { journeyman: 60, prospect: 65, class: 0, star: 70, phenom: 75 },
  eliteSeasons: { journeyman: 0, prospect: 0, class: 1, star: 9, phenom: 13 },
  underdogTitles: { journeyman: 3, prospect: 4, class: 3, star: 3, phenom: 3 },
  promotions: { journeyman: 2, prospect: 2, class: 2, star: 2, phenom: 2 },
  underdogStar: { journeyman: 10, prospect: 11, class: 9, star: 8, phenom: 6 },
  underdogPodiums: { journeyman: 2, prospect: 3, class: 3, star: 3, phenom: 3 },
  caps: { journeyman: 0, prospect: 10, class: 90, star: 140, phenom: 165 },
  nationalGoals: { journeyman: 0, prospect: 1, class: 5, star: 13, phenom: 25 },
  tournaments: { journeyman: 0, prospect: 1, class: 4, star: 6, phenom: 7 },
  worldCupRun: { journeyman: 0, prospect: 2, class: 3, star: 4, phenom: 5 },
  seasons: { journeyman: 21, prospect: 21, class: 21, star: 22, phenom: 22 },
  totalGames: { journeyman: 500, prospect: 590, class: 680, star: 810, phenom: 950 },
  lateGames: { journeyman: 85, prospect: 110, class: 120, star: 135, phenom: 160 },
  lastAge: { journeyman: 36, prospect: 36, class: 36, star: 37, phenom: 37 },
  ballonPodiums: { journeyman: 0, prospect: 0, class: 0, star: 0, phenom: 1 },
  awardsTotal: { journeyman: 2, prospect: 4, class: 7, star: 14, phenom: 27 },
  scoringAwards: { journeyman: 1, prospect: 1, class: 1, star: 1, phenom: 2 },
  goldenGloves: { journeyman: 0, prospect: 0, class: 1, star: 6, phenom: 11 },
};
