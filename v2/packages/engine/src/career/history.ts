import { type AwardKey, clubsOf, getCompetition, getLeague, leaguesOf } from "@craque/world";
import type { CompetitionEntry } from "../season/schedule";
import type { SeasonRecord } from "./types";

/**
 * Leituras do histórico para as telas: a linha da liga, acesso e queda, e os
 * totais da carreira. Tudo derivado dos registros; nada aqui muda carreira.
 */

/** A liga que o clube disputou na temporada. */
export function leagueEntry(record: SeasonRecord): CompetitionEntry | null {
  return record.competitions.find((entry) => entry.kind === "league" || entry.kind === "second") ?? null;
}

export type Movement = "promoted" | "relegated";

/**
 * Acesso ou queda do clube no fim da temporada (GDD 8.4): as últimas vagas da
 * primeira divisão trocam com as primeiras da segunda, nos países que têm as
 * duas. O tamanho de cada divisão não muda ao longo do mundo.
 */
export function movementOf(record: SeasonRecord): Movement | null {
  const entry = leagueEntry(record);
  const league = getLeague(record.league);
  if (!entry || entry.position === null || !league) return null;
  if (leaguesOf(league.country).length < 2) return null;
  const top = leaguesOf(league.country).find((candidate) => candidate.division === 1);
  const slots = top?.promotionSlots ?? 0;
  if (slots === 0) return null;
  if (league.division === 1) {
    const size = clubsOf(league.country, 1).length;
    return entry.position > size - slots ? "relegated" : null;
  }
  return entry.position <= slots ? "promoted" : null;
}

/** Os títulos da temporada com o tipo de cada um, na ordem em que vieram. */
export function titleKinds(record: SeasonRecord): ReadonlyArray<{ readonly id: string; readonly kind: string }> {
  return record.titles.map((id) => ({ id, kind: getCompetition(id)?.kind ?? "other" }));
}

export interface CareerTotals {
  readonly seasons: number;
  readonly games: number;
  readonly goals: number;
  readonly assists: number;
  readonly cleanSheets: number;
  readonly titles: number;
  readonly awards: number;
  readonly nationalGames: number;
  readonly nationalGoals: number;
  readonly clubs: number;
  readonly peakOvr: number;
}

export function careerTotals(history: readonly SeasonRecord[]): CareerTotals {
  let games = 0;
  let goals = 0;
  let assists = 0;
  let cleanSheets = 0;
  let titles = 0;
  let awards = 0;
  let nationalGames = 0;
  let nationalGoals = 0;
  let peakOvr = 0;
  for (const record of history) {
    games += record.games;
    goals += record.production.goals;
    assists += record.production.assists;
    cleanSheets += record.production.cleanSheets;
    titles += record.titles.length;
    awards += record.awards.won.length;
    nationalGames += record.national.games;
    nationalGoals += record.national.goals;
    peakOvr = Math.max(peakOvr, record.ovrEnd);
  }
  return {
    seasons: history.length,
    games,
    goals,
    assists,
    cleanSheets,
    titles,
    awards,
    nationalGames,
    nationalGoals,
    clubs: new Set(history.map((record) => record.club)).size,
    peakOvr,
  };
}

/** A temporada de maior OVR (empate: a mais antiga), para a carta do auge (GDD 24.2). */
export function peakSeason(history: readonly SeasonRecord[]): SeasonRecord | null {
  let best: SeasonRecord | null = null;
  for (const record of history) if (best === null || record.ovrEnd > best.ovrEnd) best = record;
  return best;
}

export interface Honour {
  readonly id: string;
  readonly count: number;
  /** Primeiro ano em que veio. */
  readonly first: number;
}

/** Títulos agrupados por competição e prêmios por chave, os mais repetidos primeiro (GDD 24.5). */
export function honours(history: readonly SeasonRecord[]): { titles: Honour[]; awards: Array<Honour & { id: AwardKey }> } {
  const titles = new Map<string, Honour>();
  const awards = new Map<AwardKey, Honour & { id: AwardKey }>();
  for (const record of history) {
    for (const id of record.titles) {
      const current = titles.get(id);
      titles.set(id, { id, count: (current?.count ?? 0) + 1, first: current?.first ?? record.year });
    }
    for (const id of record.awards.won) {
      const current = awards.get(id);
      awards.set(id, { id, count: (current?.count ?? 0) + 1, first: current?.first ?? record.year });
    }
  }
  const order = (a: Honour, b: Honour) => b.count - a.count || a.first - b.first;
  return { titles: [...titles.values()].sort(order), awards: [...awards.values()].sort(order) };
}
