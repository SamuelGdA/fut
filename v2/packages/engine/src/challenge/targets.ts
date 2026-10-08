import type { TalentBand } from "../player/talent";

/**
 * Alvos das missões do Desafio do dia por faixa de talento (GDD 27.3).
 * Gerado por `pnpm desafio:calibrar` (tools/balance): não edite à mão. Zero
 * tira a missão das mãos daquela faixa.
 *
 * Percentil 65 de 3000 carreiras (600 por faixa), semente "calibra-desafio", motor 2.0.0-m8.1.
 */
export const MISSION_TARGETS: Readonly<Record<string, Readonly<Record<TalentBand, number>>>> = {
  careerGoals: { journeyman: 85, prospect: 100, class: 110, star: 155, phenom: 230 },
  seasonGoals: { journeyman: 14, prospect: 16, class: 17, star: 23, phenom: 27 },
  contributions: { journeyman: 135, prospect: 170, class: 180, star: 240, phenom: 340 },
  cleanSheets: { journeyman: 145, prospect: 170, class: 200, star: 270, phenom: 370 },
  totalTitles: { journeyman: 3, prospect: 4, class: 5, star: 10, phenom: 21 },
  leagueTitles: { journeyman: 1, prospect: 2, class: 2, star: 3, phenom: 7 },
  continentalTitles: { journeyman: 0, prospect: 0, class: 1, star: 1, phenom: 2 },
  cupTitles: { journeyman: 1, prospect: 1, class: 2, star: 3, phenom: 6 },
  longestStay: { journeyman: 10, prospect: 10, class: 10, star: 10, phenom: 12 },
  firstClubGames: { journeyman: 35, prospect: 39, class: 43, star: 80, phenom: 115 },
  idolSeasons: { journeyman: 5, prospect: 5, class: 5, star: 7, phenom: 10 },
  peakFans: { journeyman: 80, prospect: 80, class: 85, star: 90, phenom: 100 },
  clubs: { journeyman: 4, prospect: 5, class: 5, star: 5, phenom: 5 },
  countries: { journeyman: 3, prospect: 3, class: 4, star: 4, phenom: 4 },
  seasonsAbroad: { journeyman: 14, prospect: 14, class: 14, star: 16, phenom: 16 },
  titleCountries: { journeyman: 1, prospect: 1, class: 1, star: 2, phenom: 2 },
  peakOvr: { journeyman: 70, prospect: 75, class: 80, star: 85, phenom: 90 },
  bestJump: { journeyman: 0, prospect: 4, class: 0, star: 5, phenom: 5 },
  ovrAt21: { journeyman: 60, prospect: 0, class: 65, star: 70, phenom: 75 },
  eliteSeasons: { journeyman: 0, prospect: 0, class: 0, star: 3, phenom: 12 },
  underdogTitles: { journeyman: 3, prospect: 3, class: 3, star: 2, phenom: 2 },
  promotions: { journeyman: 2, prospect: 2, class: 2, star: 2, phenom: 2 },
  underdogStar: { journeyman: 7, prospect: 9, class: 8, star: 7, phenom: 6 },
  underdogPodiums: { journeyman: 3, prospect: 3, class: 3, star: 2, phenom: 2 },
  caps: { journeyman: 0, prospect: 1, class: 37, star: 120, phenom: 155 },
  nationalGoals: { journeyman: 0, prospect: 1, class: 1, star: 8, phenom: 20 },
  tournaments: { journeyman: 0, prospect: 1, class: 2, star: 5, phenom: 6 },
  worldCupRun: { journeyman: 0, prospect: 0, class: 2, star: 4, phenom: 5 },
  seasons: { journeyman: 0, prospect: 22, class: 22, star: 22, phenom: 22 },
  totalGames: { journeyman: 450, prospect: 530, class: 590, star: 740, phenom: 910 },
  lateGames: { journeyman: 75, prospect: 90, class: 100, star: 115, phenom: 140 },
  lastAge: { journeyman: 0, prospect: 37, class: 37, star: 37, phenom: 37 },
  ballonPodiums: { journeyman: 0, prospect: 0, class: 0, star: 0, phenom: 1 },
  awardsTotal: { journeyman: 1, prospect: 2, class: 3, star: 8, phenom: 21 },
  scoringAwards: { journeyman: 1, prospect: 1, class: 1, star: 1, phenom: 2 },
  goldenGloves: { journeyman: 0, prospect: 0, class: 0, star: 5, phenom: 10 },
};
