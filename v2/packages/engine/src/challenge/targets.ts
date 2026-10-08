import type { TalentBand } from "../player/talent";

/**
 * Alvos das missões do Desafio do dia por faixa de talento (GDD 27.3).
 * Gerado por `pnpm desafio:calibrar` (tools/balance): não edite à mão. Zero
 * tira a missão das mãos daquela faixa.
 *
 * Percentil 65 de 3000 carreiras (600 por faixa), semente "calibra-desafio", motor 2.0.0-m8.3.
 */
export const MISSION_TARGETS: Readonly<Record<string, Readonly<Record<TalentBand, number>>>> = {
  careerGoals: { journeyman: 80, prospect: 100, class: 115, star: 160, phenom: 240 },
  seasonGoals: { journeyman: 14, prospect: 16, class: 18, star: 22, phenom: 28 },
  contributions: { journeyman: 135, prospect: 165, class: 195, star: 270, phenom: 370 },
  cleanSheets: { journeyman: 150, prospect: 170, class: 210, star: 290, phenom: 370 },
  totalTitles: { journeyman: 3, prospect: 4, class: 6, star: 11, phenom: 25 },
  leagueTitles: { journeyman: 1, prospect: 2, class: 2, star: 4, phenom: 7 },
  continentalTitles: { journeyman: 0, prospect: 0, class: 1, star: 1, phenom: 3 },
  cupTitles: { journeyman: 1, prospect: 1, class: 2, star: 3, phenom: 6 },
  longestStay: { journeyman: 10, prospect: 10, class: 10, star: 10, phenom: 12 },
  firstClubGames: { journeyman: 34, prospect: 38, class: 40, star: 80, phenom: 110 },
  clubLegend: { journeyman: 0, prospect: 1, class: 1, star: 1, phenom: 0 },
  twoClubIdol: { journeyman: 0, prospect: 0, class: 0, star: 2, phenom: 2 },
  peakFans: { journeyman: 80, prospect: 80, class: 85, star: 90, phenom: 100 },
  clubs: { journeyman: 4, prospect: 5, class: 5, star: 5, phenom: 5 },
  countries: { journeyman: 3, prospect: 3, class: 4, star: 4, phenom: 4 },
  seasonsAbroad: { journeyman: 14, prospect: 14, class: 14, star: 16, phenom: 16 },
  titleCountries: { journeyman: 1, prospect: 1, class: 1, star: 2, phenom: 2 },
  peakOvr: { journeyman: 70, prospect: 75, class: 80, star: 85, phenom: 95 },
  bestJump: { journeyman: 4, prospect: 4, class: 5, star: 5, phenom: 5 },
  ovrAt21: { journeyman: 60, prospect: 65, class: 65, star: 70, phenom: 75 },
  eliteSeasons: { journeyman: 0, prospect: 0, class: 0, star: 5, phenom: 12 },
  underdogTitles: { journeyman: 3, prospect: 3, class: 3, star: 2, phenom: 2 },
  promotions: { journeyman: 2, prospect: 2, class: 2, star: 2, phenom: 2 },
  underdogStar: { journeyman: 7, prospect: 9, class: 8, star: 7, phenom: 6 },
  underdogPodiums: { journeyman: 3, prospect: 3, class: 4, star: 3, phenom: 2 },
  caps: { journeyman: 0, prospect: 1, class: 47, star: 130, phenom: 160 },
  nationalGoals: { journeyman: 0, prospect: 1, class: 1, star: 9, phenom: 21 },
  tournaments: { journeyman: 0, prospect: 1, class: 2, star: 5, phenom: 6 },
  worldCupRun: { journeyman: 0, prospect: 0, class: 2, star: 4, phenom: 5 },
  seasons: { journeyman: 22, prospect: 22, class: 22, star: 22, phenom: 22 },
  totalGames: { journeyman: 460, prospect: 540, class: 610, star: 770, phenom: 930 },
  lateGames: { journeyman: 80, prospect: 90, class: 105, star: 125, phenom: 155 },
  lastAge: { journeyman: 37, prospect: 37, class: 37, star: 37, phenom: 37 },
  ballonPodiums: { journeyman: 0, prospect: 0, class: 0, star: 0, phenom: 1 },
  awardsTotal: { journeyman: 1, prospect: 2, class: 4, star: 9, phenom: 24 },
  scoringAwards: { journeyman: 0, prospect: 1, class: 1, star: 1, phenom: 2 },
  goldenGloves: { journeyman: 0, prospect: 0, class: 1, star: 6, phenom: 11 },
};
