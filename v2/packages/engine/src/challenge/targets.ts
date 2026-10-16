import type { TalentBand } from "../player/talent";

/**
 * Alvos das missões do Desafio do dia por faixa de talento (GDD 27.3).
 * Gerado por `pnpm desafio:calibrar` (tools/balance): não edite à mão. Zero
 * tira a missão das mãos daquela faixa.
 *
 * Percentil 65 de 3000 carreiras (600 por faixa), semente "calibra-desafio", motor 2.0.0-m9.
 */
export const MISSION_TARGETS: Readonly<Record<string, Readonly<Record<TalentBand, number>>>> = {
  careerGoals: { journeyman: 80, prospect: 95, class: 125, star: 185, phenom: 260 },
  seasonGoals: { journeyman: 14, prospect: 15, class: 18, star: 24, phenom: 29 },
  contributions: { journeyman: 145, prospect: 165, class: 210, star: 290, phenom: 420 },
  cleanSheets: { journeyman: 145, prospect: 185, class: 230, star: 330, phenom: 390 },
  totalTitles: { journeyman: 4, prospect: 4, class: 7, star: 20, phenom: 36 },
  leagueTitles: { journeyman: 1, prospect: 2, class: 2, star: 6, phenom: 9 },
  continentalTitles: { journeyman: 0, prospect: 0, class: 1, star: 2, phenom: 3 },
  cupTitles: { journeyman: 1, prospect: 1, class: 2, star: 5, phenom: 8 },
  longestStay: { journeyman: 10, prospect: 10, class: 10, star: 10, phenom: 12 },
  firstClubGames: { journeyman: 34, prospect: 46, class: 46, star: 85, phenom: 130 },
  clubLegend: { journeyman: 0, prospect: 1, class: 1, star: 1, phenom: 0 },
  twoClubIdol: { journeyman: 0, prospect: 0, class: 2, star: 2, phenom: 0 },
  peakFans: { journeyman: 80, prospect: 80, class: 85, star: 100, phenom: 100 },
  clubs: { journeyman: 4, prospect: 5, class: 5, star: 5, phenom: 5 },
  countries: { journeyman: 3, prospect: 4, class: 4, star: 4, phenom: 4 },
  seasonsAbroad: { journeyman: 14, prospect: 14, class: 14, star: 16, phenom: 16 },
  titleCountries: { journeyman: 1, prospect: 1, class: 2, star: 2, phenom: 2 },
  peakOvr: { journeyman: 70, prospect: 80, class: 85, star: 95, phenom: 0 },
  bestJump: { journeyman: 4, prospect: 5, class: 5, star: 6, phenom: 6 },
  ovrAt21: { journeyman: 60, prospect: 65, class: 65, star: 70, phenom: 75 },
  eliteSeasons: { journeyman: 0, prospect: 0, class: 1, star: 11, phenom: 14 },
  underdogTitles: { journeyman: 3, prospect: 3, class: 3, star: 2, phenom: 2 },
  promotions: { journeyman: 2, prospect: 2, class: 2, star: 2, phenom: 2 },
  underdogStar: { journeyman: 8, prospect: 8, class: 8, star: 6, phenom: 6 },
  underdogPodiums: { journeyman: 3, prospect: 3, class: 3, star: 2, phenom: 2 },
  caps: { journeyman: 1, prospect: 12, class: 95, star: 140, phenom: 170 },
  nationalGoals: { journeyman: 0, prospect: 1, class: 6, star: 14, phenom: 25 },
  tournaments: { journeyman: 0, prospect: 1, class: 4, star: 6, phenom: 7 },
  worldCupRun: { journeyman: 0, prospect: 2, class: 3, star: 4, phenom: 5 },
  seasons: { journeyman: 22, prospect: 22, class: 22, star: 22, phenom: 22 },
  totalGames: { journeyman: 480, prospect: 570, class: 680, star: 850, phenom: 1010 },
  lateGames: { journeyman: 85, prospect: 105, class: 125, star: 160, phenom: 185 },
  lastAge: { journeyman: 37, prospect: 37, class: 37, star: 37, phenom: 37 },
  ballonPodiums: { journeyman: 0, prospect: 0, class: 0, star: 1, phenom: 4 },
  awardsTotal: { journeyman: 2, prospect: 3, class: 5, star: 18, phenom: 37 },
  scoringAwards: { journeyman: 0, prospect: 0, class: 1, star: 1, phenom: 2 },
  goldenGloves: { journeyman: 0, prospect: 0, class: 4, star: 10, phenom: 12 },
};
