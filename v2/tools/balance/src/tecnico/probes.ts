import {
  affordability,
  clubDuel,
  type ClubDuel,
  type CoachCareer,
  createCoachCareer,
  developCandidates,
  developTrial,
  type DevelopTrial,
  initialDivisionShare,
  paceTrial,
  type PaceTrial,
  philosophyGrid,
  type PhilosophyRow,
  purchaseChance,
  purchaseCurve,
  type PurchasePoint,
} from "@craque/engine/coach";
import { WORLD } from "./run";

/**
 * Medidas exatas do modelo (sem jogar carreiras): filosofias, duelos entre
 * continentes, curva de contratação, sorteio inicial, Desenvolver, ritmo e
 * verba. As mesmas sondas aparecem no laboratório.
 */

export interface NamedChance {
  readonly player: string;
  readonly ovr: number;
  readonly from: string;
  readonly to: string;
  readonly chance: number;
}

export interface ProbeMetrics {
  readonly philosophies: readonly PhilosophyRow[];
  readonly duels: readonly ClubDuel[];
  readonly symmetryError: number;
  readonly curves: readonly { readonly club: string; readonly strength: number; readonly points: readonly PurchasePoint[] }[];
  readonly named: readonly NamedChance[];
  readonly initial: { readonly second: number; readonly draws: number; readonly anyFirst: number };
  readonly develop: readonly { readonly label: string; readonly trial: DevelopTrial }[];
  readonly pace: PaceTrial;
  readonly budget: readonly { readonly division: number; readonly clubs: number; readonly withThree: number; readonly tight: readonly string[] }[];
  readonly createMs: number;
}

const CURVE_GAPS = [-2, 0, 2, 4, 6, 8, 10, 12, 15];
const CURVE_CLUBS = ["real-madrid", "flamengo", "mirassol", "goias", "bolton", "all-boys"];
const DUEL_COUNTRIES = { europe: ["ESP", "ENG"], south: ["BRA", "ARG"] } as const;

function topClubs(career: CoachCareer, country: string, count: number): string[] {
  return Object.values(career.clubs)
    .filter((club) => club.country === country && club.division === 1)
    .sort((a, b) => b.strength - a.strength || a.id.localeCompare(b.id))
    .slice(0, count)
    .map((club) => club.id);
}

function namedChances(career: CoachCareer): NamedChance[] {
  const pairs: Array<[string, string[]]> = [
    ["Kylian Mbappé", ["flamengo", "palmeiras", "goias", "bayer-leverkusen", "manchester-city"]],
    ["Erling Haaland", ["flamengo", "river-plate", "arsenal"]],
  ];
  const out: NamedChance[] = [];
  for (const [name, buyers] of pairs) {
    const player = Object.values(career.players).find((candidate) => candidate.name === name);
    if (!player) continue;
    for (const buyer of buyers) {
      if (!career.clubs[buyer] || buyer === player.club) continue;
      out.push({ player: name, ovr: player.ovr, from: player.club ?? "", to: buyer, chance: purchaseChance(career, player, buyer).total });
    }
  }
  return out;
}

export function runProbes(seed: string): ProbeMetrics {
  const started = performance.now();
  const career = createCoachCareer({ seed, startYear: 2026, mode: "fast", identity: { name: "Sonda", nationality: "BRA" } }, WORLD);
  const createMs = performance.now() - started;
  const philosophies = philosophyGrid([-12, -8, -5, -3, 0, 3, 5, 8, 12]);
  const europe = DUEL_COUNTRIES.europe.flatMap((country) => topClubs(career, country, 2));
  const south = DUEL_COUNTRIES.south.flatMap((country) => topClubs(career, country, 2));
  const duels = europe.flatMap((a) => south.map((b) => clubDuel(career, a, b)));
  const symmetryError = Math.max(...duels.map((duel) => Math.abs(duel.odds.advance + duel.swapped.advance - 1)));
  const curves = CURVE_CLUBS.filter((club) => career.clubs[club]).map((club) => ({
    club,
    strength: career.clubs[club]?.strength ?? 0,
    points: purchaseCurve(career, club, CURVE_GAPS),
  }));
  const youngLimit = (min: number, max: number) =>
    developCandidates(career, max, 3).filter((player) => career.year - player.birthYear >= min);
  const develop = [
    { label: "até 21 anos, rápido", trial: developTrial(career, youngLimit(0, 21), 1) },
    { label: "22 a 25 anos, rápido", trial: developTrial(career, youngLimit(22, 25), 1) },
    { label: "26 a 29 anos, rápido", trial: developTrial(career, youngLimit(26, 29), 1) },
    { label: "até 25 anos, uma metade do lento", trial: developTrial(career, youngLimit(0, 25), 0.5) },
  ];
  const pace = paceTrial(career, Object.values(career.players).filter((player) => player.club));
  const budget = [2, 1].map((division) => {
    const rows = Object.values(career.clubs)
      .filter((club) => club.division === division)
      .map((club) => affordability(career, club.id));
    return {
      division,
      clubs: rows.length,
      withThree: rows.filter((row) => row.affordable >= 3).length,
      tight: rows.filter((row) => row.affordable < 3).map((row) => row.club),
    };
  });
  return {
    philosophies,
    duels,
    symmetryError,
    curves,
    named: namedChances(career),
    initial: initialDivisionShare(`${seed}:inicial`, 20000),
    develop,
    pace,
    budget,
    createMs,
  };
}
