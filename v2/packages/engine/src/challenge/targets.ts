import type { TalentBand } from "../player/talent";

/**
 * Alvos das missões do Desafio do dia por faixa de talento (GDD 27.3).
 * Gerado por `pnpm desafio:calibrar` (tools/balance): não edite à mão. Zero
 * tira a missão das mãos daquela faixa.
 *
 * Percentil 65 de 3000 carreiras (600 por faixa), semente "calibra-desafio", motor 2.0.0-m41.
 */
export const MISSION_TARGETS: Readonly<Record<string, Readonly<Record<TalentBand, number>>>> = {
  careerGoals: { journeyman: 110, prospect: 150, class: 195, star: 240, phenom: 330 },
  seasonGoals: { journeyman: 18, prospect: 21, class: 25, star: 30, phenom: 38 },
  contributions: { journeyman: 170, prospect: 220, class: 280, star: 350, phenom: 480 },
  cleanSheets: { journeyman: 165, prospect: 200, class: 250, star: 320, phenom: 410 },
  totalTitles: { journeyman: 4, prospect: 5, class: 7, star: 16, phenom: 32 },
  leagueTitles: { journeyman: 1, prospect: 2, class: 3, star: 5, phenom: 9 },
  continentalTitles: { journeyman: 0, prospect: 0, class: 1, star: 1, phenom: 3 },
  cupTitles: { journeyman: 1, prospect: 1, class: 2, star: 5, phenom: 8 },
  longestStay: { journeyman: 13, prospect: 13, class: 13, star: 14, phenom: 17 },
  firstClubGames: { journeyman: 24, prospect: 25, class: 22, star: 38, phenom: 90 },
  clubLegend: { journeyman: 1, prospect: 1, class: 1, star: 0, phenom: 0 },
  twoClubIdol: { journeyman: 0, prospect: 0, class: 0, star: 2, phenom: 2 },
  peakFans: { journeyman: 85, prospect: 90, class: 100, star: 100, phenom: 0 },
  clubs: { journeyman: 5, prospect: 5, class: 6, star: 6, phenom: 5 },
  countries: { journeyman: 3, prospect: 4, class: 4, star: 4, phenom: 4 },
  seasonsAbroad: { journeyman: 16, prospect: 17, class: 18, star: 18, phenom: 18 },
  titleCountries: { journeyman: 1, prospect: 1, class: 2, star: 2, phenom: 2 },
  peakOvr: { journeyman: 70, prospect: 80, class: 85, star: 90, phenom: 95 },
  bestJump: { journeyman: 4, prospect: 5, class: 5, star: 5, phenom: 6 },
  ovrAt21: { journeyman: 60, prospect: 65, class: 70, star: 75, phenom: 80 },
  eliteSeasons: { journeyman: 0, prospect: 0, class: 1, star: 11, phenom: 15 },
  underdogTitles: { journeyman: 3, prospect: 4, class: 3, star: 3, phenom: 4 },
  promotions: { journeyman: 2, prospect: 2, class: 2, star: 2, phenom: 2 },
  underdogStar: { journeyman: 11, prospect: 11, class: 10, star: 8, phenom: 6 },
  underdogPodiums: { journeyman: 2, prospect: 3, class: 3, star: 3, phenom: 3 },
  caps: { journeyman: 1, prospect: 17, class: 110, star: 155, phenom: 185 },
  nationalGoals: { journeyman: 0, prospect: 1, class: 8, star: 21, phenom: 40 },
  tournaments: { journeyman: 0, prospect: 1, class: 4, star: 6, phenom: 8 },
  worldCupRun: { journeyman: 0, prospect: 2, class: 3, star: 5, phenom: 6 },
  seasons: { journeyman: 22, prospect: 22, class: 0, star: 0, phenom: 0 },
  totalGames: { journeyman: 520, prospect: 620, class: 740, star: 870, phenom: 1020 },
  lateGames: { journeyman: 95, prospect: 140, class: 160, star: 170, phenom: 195 },
  lastAge: { journeyman: 37, prospect: 37, class: 0, star: 0, phenom: 0 },
  ballonPodiums: { journeyman: 0, prospect: 0, class: 0, star: 0, phenom: 1 },
  awardsTotal: { journeyman: 3, prospect: 5, class: 9, star: 17, phenom: 32 },
  scoringAwards: { journeyman: 1, prospect: 1, class: 2, star: 3, phenom: 5 },
  goldenGloves: { journeyman: 0, prospect: 1, class: 6, star: 11, phenom: 14 },
};
