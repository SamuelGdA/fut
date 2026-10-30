import { getCompetition, type AwardKey } from "./competitions";

/** Ordem editorial da vitrine; não altera o peso esportivo usado pelo motor. */
export function competitionPrestige(id: string): number {
  const competition = getCompetition(id);
  if (!competition) return 100;
  const kind = competition.kind;
  if (kind === "worldCup") return 1000;
  if (kind === "clubWorldCup") return 940;
  if (kind === "continental1") return competition.confederation === "UEFA" ? 920 : competition.confederation === "CONMEBOL" ? 900 : 820;
  if (kind === "nationsCup") return competition.confederation === "UEFA" || competition.confederation === "CONMEBOL" ? 880 : 800;
  if (kind === "intercontinental") return 850;
  const leagues: Readonly<Record<string, number>> = { ENG: 60, ESP: 55, ITA: 50, GER: 45, FRA: 40, BRA: 35, ARG: 30 };
  if (kind === "league") return 720 + (leagues[competition.country ?? ""] ?? 0);
  if (kind === "continental2") return 700;
  // D108: a Liga das Nações fica abaixo da Europa League e acima das copas nacionais.
  if (kind === "nationsLeague") return 650;
  if (kind === "cup") return 600;
  if (kind === "continental3") return 580;
  if (kind === "continentalSuper") return 450;
  if (kind === "leagueCup") return 350;
  if (kind === "second") return 300;
  return 200;
}

export interface OrderedHonour { readonly kind: "title" | "award"; readonly id: string; readonly competition?: string }
/**
 * D101: troféus primeiro, prêmios depois. Só a Bola de Ouro e a Chuteira de
 * Ouro passam à frente de todas as taças; os outros prêmios ficam abaixo da
 * menor taça (200), na ordem deles.
 */
const GLOBAL_AWARDS: Partial<Record<AwardKey, number>> = { ballonDor: 2000, goldenShoe: 1990, kingOfAmerica: 190, goldenGlove: 185, youngPlayer: 170 };
export function honourPrestige(item: OrderedHonour): number {
  if (item.kind === "title") return competitionPrestige(item.id);
  // Nenhum prêmio de competição específica passa à frente da menor taça.
  if (item.competition) return competitionPrestige(item.competition) / 10 + (item.id === "bestPlayer" ? 1 : 0);
  return GLOBAL_AWARDS[item.id as AwardKey] ?? 50;
}
export function compareHonours(a: OrderedHonour, b: OrderedHonour): number {
  return honourPrestige(b) - honourPrestige(a) || a.id.localeCompare(b.id) || (a.competition ?? "").localeCompare(b.competition ?? "");
}
