import { type CountryCode, getClub, getCompetition, getCountry } from "@craque/world";
import { movementOf } from "../career/history";
import type { CompetitionEntry } from "../season/schedule";
import { inTournamentSquad } from "../season/national";
import { STAGES } from "../world/types";
import type { Career, SeasonRecord } from "../career/types";

/**
 * Medidas da carreira que o Desafio do dia e as conquistas leem (GDD 27 e 28).
 * Todas puras e todas válidas no meio da carreira: o painel do desafio mostra
 * o progresso temporada a temporada.
 */

export const BIG_FIVE: ReadonlySet<CountryCode> = new Set(["ENG", "ESP", "ITA", "GER", "FRA"]);

export function clubCountry(club: string): CountryCode | null {
  return getClub(club)?.country ?? null;
}

export function clubConfederation(club: string): string | null {
  return getCountry(clubCountry(club))?.confederation ?? null;
}

const kindOf = (id: string) => getCompetition(id)?.kind ?? null;

export function sum(history: readonly SeasonRecord[], pick: (record: SeasonRecord) => number): number {
  return history.reduce((total, record) => total + pick(record), 0);
}

export function best(history: readonly SeasonRecord[], pick: (record: SeasonRecord) => number): number {
  return history.reduce((top, record) => Math.max(top, pick(record)), 0);
}

export function titlesOfKind(record: SeasonRecord, ...kinds: string[]): number {
  return record.titles.filter((id) => {
    const kind = kindOf(id);
    return kind !== null && kinds.includes(kind);
  }).length;
}

/** Temporadas somadas por clube (todas as passagens). */
export function seasonsByClub(history: readonly SeasonRecord[]): Map<string, number> {
  const seasons = new Map<string, number>();
  for (const record of history) seasons.set(record.club, (seasons.get(record.club) ?? 0) + 1);
  return seasons;
}

/** Passagens seguidas pelo mesmo clube, com o tamanho e se foram empréstimo. */
export function stintSizes(history: readonly SeasonRecord[]): Array<{ club: string; seasons: number; loan: boolean }> {
  const stints: Array<{ club: string; seasons: number; loan: boolean }> = [];
  for (const record of history) {
    const last = stints[stints.length - 1];
    if (last && last.club === record.club) last.seasons += 1;
    else stints.push({ club: record.club, seasons: 1, loan: record.loan });
  }
  return stints;
}

/** O legado final de cada clube (o da última temporada lá). */
export function finalLegacy(history: readonly SeasonRecord[]): Map<string, SeasonRecord["legacy"]> {
  const legacy = new Map<string, SeasonRecord["legacy"]>();
  for (const record of history) legacy.set(record.club, record.legacy);
  return legacy;
}

/**
 * Os torneios de seleção que o jogador disputou de verdade: a temporada traz a
 * campanha da seleção mesmo sem ele, e só conta com ele no grupo do torneio e
 * com jogos pela seleção (a mesma regra dos títulos, GDD 12.2).
 */
export function playedTournaments(record: SeasonRecord): readonly CompetitionEntry[] {
  if (record.national.games === 0 || !inTournamentSquad(record.national.status)) return [];
  return record.national.competitions.filter((entry) => (entry.kind === "worldCup" || entry.kind === "nationsCup") && entry.games > 0);
}

/** A melhor fase numa Copa do Mundo: 0 sem jogar, 1 a 8 de "fase inicial" a campeão. */
export function bestWorldCupStage(history: readonly SeasonRecord[]): number {
  let bestStage = 0;
  for (const record of history) {
    for (const entry of playedTournaments(record)) {
      if (entry.kind !== "worldCup") continue;
      const stage = entry.champion ? "champion" : (entry.stage ?? "groups");
      bestStage = Math.max(bestStage, STAGES.length - STAGES.indexOf(stage));
    }
  }
  return bestStage;
}

/** Torneios de seleção disputados (Copa do Mundo e continental). */
export function nationalTournaments(history: readonly SeasonRecord[]): number {
  return sum(history, (record) => playedTournaments(record).length);
}

export function promotions(history: readonly SeasonRecord[]): number {
  return history.filter((record) => movementOf(record) === "promoted").length;
}

export function relegations(history: readonly SeasonRecord[]): number {
  return history.filter((record) => movementOf(record) === "relegated").length;
}

/** A posição final na liga, quando a temporada foi de liga. */
export function leaguePosition(record: SeasonRecord): number | null {
  return record.competitions.find((entry) => entry.kind === "league" || entry.kind === "second")?.position ?? null;
}

/**
 * Temporadas apagadas (GDD 27.5): depois da idade do pico, OVR no fim da
 * temporada 5 pontos ou mais abaixo do pico.
 */
export function erasedSeasons(history: readonly SeasonRecord[]): number {
  let peak = 0;
  let peakAge = 0;
  for (const record of history) {
    if (record.ovrEnd > peak) {
      peak = record.ovrEnd;
      peakAge = record.age;
    }
  }
  return history.filter((record) => record.age > peakAge && record.ovrEnd <= peak - 5).length;
}

/** A última idade jogada (a da última temporada), ou a idade de começo. */
export function lastPlayedAge(career: Career): number {
  return career.history[career.history.length - 1]?.age ?? career.age;
}

/** Transferências de clube a clube marcadas como traição (GDD 17.4). */
export function traitorMoves(career: Career): number {
  return career.log.filter((entry) => entry.kind === "transfer" && entry.traitor).length;
}
