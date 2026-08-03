import type { Locale } from "@/lib/i18n/context";

/**
 * Real, documented football records a career is measured against.
 *
 * Two scopes. **Global** records are the sport's outright marks — some of them
 * (Messi's eight Ballons d'Or, Shilton's 1,390 games) sit far beyond what a
 * normal career here will ever reach, and that is the point: they are the
 * ceiling, and the one save in a thousand that touches one has earned the
 * moment. **Country** records only come into play once the player has actually
 * played in that country, so a career spent in Brazil is judged against
 * Brazilian marks rather than English ones.
 */
export type RecordKey =
  | "season_goals"
  | "career_goals"
  | "season_assists"
  | "career_assists"
  | "career_appearances"
  | "continental_titles"
  | "golden_boots"
  | "ballon_dor"
  | "clean_sheets"
  | "total_trophies"
  | "world_cups"
  | "international_caps"
  | "international_goals"
  | "country_goals";

export interface RealRecord {
  /** Unique per entry; country records share the `country_goals` key. */
  key: RecordKey;
  /** Stable id, since several country records share a key. */
  id: string;
  /** The number to beat. */
  value: number;
  /** Who set it, shown verbatim — reported fact, not a game character. */
  holder: string;
  /**
   * When this figure was last checked, so it's obvious at a glance which
   * entries have drifted. Historical marks (Gento, Piola, Shearer) never move;
   * anything still being added to by an active player does, and should be
   * re-checked every season or two.
   */
  asOf: string;
  /** True while the holder is still playing and the number keeps climbing. */
  moving?: boolean;
  detail: Record<Locale, string>;
  label: Record<Locale, string>;
  goalkeeperOnly?: boolean;
  outfieldOnly?: boolean;
  /** Country-scoped: only considered once the player featured there. */
  countryFifa?: string;
}

const GLOBAL_RECORDS: RealRecord[] = [
  {
    key: "season_goals",
    id: "season_goals",
    asOf: "2012-05",
    value: 73,
    holder: "Lionel Messi",
    detail: {
      pt: "Barcelona, temporada 2011-12, todas as competições",
      es: "Barcelona, temporada 2011-12, todas las competiciones",
      en: "Barcelona, 2011-12 season, all competitions",
    },
    label: {
      pt: "gols em uma única temporada",
      es: "goles en una sola temporada",
      en: "goals in a single season",
    },
    outfieldOnly: true,
  },
  {
    key: "career_goals",
    id: "career_goals",
    asOf: "2026-05",
    moving: true,
    value: 950,
    holder: "Cristiano Ronaldo",
    detail: {
      pt: "o maior artilheiro da história do futebol, e ainda somando",
      es: "el máximo goleador de la historia del fútbol, y sigue sumando",
      en: "the leading scorer in the history of the game, and still counting",
    },
    label: {
      pt: "gols oficiais na carreira",
      es: "goles oficiales en la carrera",
      en: "official career goals",
    },
    outfieldOnly: true,
  },
  {
    key: "season_assists",
    id: "season_assists",
    asOf: "2020-07",
    value: 21,
    holder: "Lionel Messi",
    detail: {
      pt: "La Liga, temporada 2019-20",
      es: "La Liga, temporada 2019-20",
      en: "La Liga, 2019-20 season",
    },
    label: {
      pt: "assistências em uma única temporada",
      es: "asistencias en una sola temporada",
      en: "assists in a single season",
    },
    outfieldOnly: true,
  },
  {
    key: "career_assists",
    id: "career_assists",
    asOf: "2026-05",
    moving: true,
    value: 400,
    holder: "Lionel Messi",
    detail: {
      pt: "maior número de assistências já contabilizado numa carreira",
      es: "mayor número de asistencias jamás contabilizado en una carrera",
      en: "the highest assist tally ever recorded in a career",
    },
    label: {
      pt: "assistências na carreira",
      es: "asistencias en la carrera",
      en: "career assists",
    },
    outfieldOnly: true,
  },
  {
    key: "career_appearances",
    id: "career_appearances",
    asOf: "1997-01",
    value: 1390,
    holder: "Peter Shilton",
    detail: {
      pt: "recorde de longevidade que atravessa mais de trinta anos de carreira",
      es: "récord de longevidad que atraviesa más de treinta años de carrera",
      en: "a longevity record spanning more than thirty years",
    },
    label: {
      pt: "partidas oficiais na carreira",
      es: "partidos oficiales en la carrera",
      en: "official career appearances",
    },
  },
  {
    key: "continental_titles",
    id: "continental_titles",
    asOf: "2024-06",
    value: 6,
    holder: "Francisco Gento",
    detail: {
      pt: "seis Copas da Europa pelo Real Madrid, marca igualada em 2024 por Carvajal, Nacho, Kroos e Modrić",
      es: "seis Copas de Europa con el Real Madrid, marca igualada en 2024 por Carvajal, Nacho, Kroos y Modrić",
      en: "six European Cups with Real Madrid, equalled in 2024 by Carvajal, Nacho, Kroos and Modrić",
    },
    label: {
      pt: "títulos continentais como jogador",
      es: "títulos continentales como jugador",
      en: "continental titles as a player",
    },
  },
  {
    key: "golden_boots",
    id: "golden_boots",
    asOf: "2019-06",
    value: 6,
    holder: "Lionel Messi",
    detail: {
      pt: "seis Chuteiras de Ouro europeias",
      es: "seis Botas de Oro europeas",
      en: "six European Golden Shoes",
    },
    label: {
      pt: "prêmios de artilheiro",
      es: "premios de goleador",
      en: "top-scorer awards",
    },
    outfieldOnly: true,
  },
  {
    key: "ballon_dor",
    id: "ballon_dor",
    asOf: "2025-09",
    value: 8,
    holder: "Lionel Messi",
    detail: {
      pt: "oito Bolas de Ouro, o maior número já conquistado por um jogador",
      es: "ocho Balones de Oro, la mayor cantidad jamás conseguida por un jugador",
      en: "eight Ballons d'Or, the most ever won by a player",
    },
    label: {
      pt: "prêmios de melhor do mundo",
      es: "premios al mejor del mundo",
      en: "world player of the year awards",
    },
  },
  {
    key: "clean_sheets",
    id: "clean_sheets",
    asOf: "2019-06",
    value: 202,
    holder: "Petr Čech",
    detail: {
      pt: "recorde da Premier League",
      es: "récord de la Premier League",
      en: "the Premier League record",
    },
    label: {
      pt: "jogos sem sofrer gol",
      es: "partidos sin recibir goles",
      en: "clean sheets",
    },
    goalkeeperOnly: true,
  },
  {
    key: "total_trophies",
    id: "total_trophies",
    asOf: "2026-05",
    moving: true,
    value: 46,
    holder: "Lionel Messi",
    detail: {
      pt: "o jogador mais condecorado da história, marca que tirou de Dani Alves",
      es: "el jugador más condecorado de la historia, marca que le quitó a Dani Alves",
      en: "the most decorated player in the history of the game, a mark taken from Dani Alves",
    },
    label: {
      pt: "títulos conquistados",
      es: "títulos conseguidos",
      en: "trophies won",
    },
  },
  {
    key: "world_cups",
    id: "world_cups",
    asOf: "1970-06",
    value: 3,
    holder: "Pelé",
    detail: {
      pt: "1958, 1962 e 1970 — nenhum outro jogador venceu três",
      es: "1958, 1962 y 1970 — ningún otro jugador ganó tres",
      en: "1958, 1962 and 1970 — no other player has won three",
    },
    label: {
      pt: "Copas do Mundo",
      es: "Copas del Mundo",
      en: "World Cups",
    },
  },
  {
    key: "international_caps",
    id: "international_caps",
    asOf: "2026-05",
    moving: true,
    value: 226,
    holder: "Cristiano Ronaldo",
    detail: {
      pt: "recorde absoluto de jogos por uma seleção nacional",
      es: "récord absoluto de partidos con una selección nacional",
      en: "the outright record for international appearances",
    },
    label: {
      pt: "jogos por uma seleção",
      es: "partidos con una selección",
      en: "international caps",
    },
  },
  {
    key: "international_goals",
    id: "international_goals",
    asOf: "2026-05",
    moving: true,
    value: 145,
    holder: "Cristiano Ronaldo",
    detail: {
      pt: "recorde absoluto de gols por uma seleção nacional",
      es: "récord absoluto de goles con una selección nacional",
      en: "the outright record for international goals",
    },
    label: {
      pt: "gols por uma seleção",
      es: "goles con una selección",
      en: "international goals",
    },
    outfieldOnly: true,
  },
];

/** Top-scorer marks for each league the game actually simulates. */
function countryGoalRecord(
  countryFifa: string,
  value: number,
  holder: string,
  competition: string,
  asOf: string,
): RealRecord {
  return {
    key: "country_goals",
    id: `country_goals_${countryFifa}`,
    value,
    holder,
    asOf,
    countryFifa,
    outfieldOnly: true,
    detail: {
      pt: `maior artilheiro da história ${competition}`,
      es: `máximo goleador histórico ${competition}`,
      en: `the all-time leading scorer ${competition}`,
    },
    label: {
      pt: `gols ${competition}`,
      es: `goles ${competition}`,
      en: `goals ${competition}`,
    },
  };
}

const COUNTRY_RECORDS: RealRecord[] = [
  countryGoalRecord("ENG", 260, "Alan Shearer", "na Premier League", "2006-04"),
  countryGoalRecord("ESP", 474, "Lionel Messi", "na LaLiga", "2021-05"),
  countryGoalRecord("ITA", 274, "Silvio Piola", "na Serie A", "1954-06"),
  countryGoalRecord("GER", 365, "Gerd Müller", "na Bundesliga", "1979-06"),
  countryGoalRecord("FRA", 299, "Delio Onnis", "na Ligue 1", "1986-06"),
  countryGoalRecord("BRA", 190, "Roberto Dinamite", "no Brasileirão", "1993-12"),
  countryGoalRecord("ARG", 295, "Arsenio Erico", "no Campeonato Argentino", "1946-06"),
  countryGoalRecord("MEX", 312, "Cabinho", "na Liga MX", "1985-06"),
  countryGoalRecord("USA", 171, "Chris Wondolowski", "na MLS", "2021-11"),
];

// The competition phrase is written once in Portuguese above and reused, so the
// Spanish and English variants are patched in here rather than repeated by hand.
const COMPETITION_BY_COUNTRY: Record<string, { es: string; en: string }> = {
  ENG: { es: "en la Premier League", en: "in the Premier League" },
  ESP: { es: "en LaLiga", en: "in LaLiga" },
  ITA: { es: "en la Serie A", en: "in Serie A" },
  GER: { es: "en la Bundesliga", en: "in the Bundesliga" },
  FRA: { es: "en la Ligue 1", en: "in Ligue 1" },
  BRA: { es: "en el Brasileirão", en: "in the Brasileirão" },
  ARG: { es: "en el fútbol argentino", en: "in Argentine football" },
  MEX: { es: "en la Liga MX", en: "in Liga MX" },
  USA: { es: "en la MLS", en: "in MLS" },
};

for (const record of COUNTRY_RECORDS) {
  const phrase = COMPETITION_BY_COUNTRY[record.countryFifa!];
  if (!phrase) continue;
  record.label.es = `goles ${phrase.es}`;
  record.label.en = `goals ${phrase.en}`;
  record.detail.es = `máximo goleador histórico ${phrase.es}`;
  record.detail.en = `the all-time leading scorer ${phrase.en}`;
}

export const REAL_RECORDS: RealRecord[] = [...GLOBAL_RECORDS, ...COUNTRY_RECORDS];

export interface BrokenRecord {
  /** Matches RealRecord.id. */
  id: string;
  key: RecordKey;
  achieved: number;
  previous: number;
  holder: string;
  equalled: boolean;
}

export function recordById(id: string): RealRecord {
  return REAL_RECORDS.find((r) => r.id === id)!;
}
