import type { Locale } from "@/lib/i18n/context";

/**
 * Real, documented football records a career is measured against.
 *
 * Three scopes now. **Global** records are the sport's outright marks, some
 * of them (Messi's eight Ballons d'Or, Shilton's 1,390 games) sit far beyond
 * what a normal career here will ever reach, and that is the point: they are
 * the ceiling, and the one save in a thousand that touches one has earned the
 * moment. **Continental** and **domestic league** records are scoped to a
 * specific real competition, a Champions League record is only checked
 * against Champions League titles, never against a Copa Libertadores tally
 * that happens to share the same in-game trophy key, because the sim tracks
 * exactly which competition each trophy came from, so there is no excuse for
 * comparing across two different cups the way the old single "continental
 * titles" record did.
 *
 * Every count below is sourced and dated; see the individual `detail` fields
 * for what was checked and when.
 */
export type RecordKey =
  | "season_goals"
  | "career_goals"
  | "season_assists"
  | "career_assists"
  | "career_appearances"
  | "golden_boots"
  | "ballon_dor"
  | "clean_sheets"
  | "total_trophies"
  | "world_cups"
  | "international_caps"
  | "international_goals"
  | "continental_primary"
  | "continental_secondary"
  | "league_titles"
  | "consecutive_league_titles"
  | "consecutive_continental_primary"
  | "consecutive_ballon_dor";

export interface RealRecord {
  key: RecordKey;
  /** Stable id, continental and league records share a key across confederations/countries. */
  id: string;
  /** The number to beat. */
  value: number;
  /** Who set it, shown verbatim, reported fact, not a game character. */
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
  /**
   * Continental-scoped: only checked against titles won in a league of this
   * confederation. A Champions League record has nothing to say about a
   * Copa Libertadores career, even though the sim files both under
   * `continental_primary`.
   */
  confederation?: string;
  /** League-scoped: only checked against top-flight titles won in this country. */
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
      pt: "o maior artilheiro da história do futebol",
      es: "el máximo goleador de la historia del fútbol",
      en: "the leading scorer in the history of the game",
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
    asOf: "2025-08",
    moving: true,
    value: 1391,
    holder: "Fábio",
    detail: {
      pt: "recorde mundial de partidas oficiais: o goleiro do Fluminense superou as 1.390 de Peter Shilton em agosto de 2025, mais de trinta anos de carreira",
      es: "récord mundial de partidos oficiales: el arquero del Fluminense superó los 1.390 de Peter Shilton en agosto de 2025, más de treinta años de carrera",
      en: "the world record for competitive appearances: the Fluminense keeper passed Peter Shilton's 1,390 in August 2025, across more than thirty years",
    },
    label: {
      pt: "partidas oficiais na carreira",
      es: "partidos oficiales en la carrera",
      en: "official career appearances",
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
    asOf: "2025-06",
    moving: true,
    value: 508,
    holder: "Fábio",
    detail: {
      pt: "recorde mundial de jogos sem sofrer gol na carreira, todas as competições: o goleiro do Fluminense passou os 506 de Buffon em junho de 2025",
      es: "récord mundial de partidos sin recibir goles en la carrera, todas las competiciones: el arquero del Fluminense superó los 506 de Buffon en junio de 2025",
      en: "the world record for career clean sheets in all competitions: the Fluminense keeper passed Buffon's 506 in June 2025",
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
      pt: "1958, 1962 e 1970: nenhum outro jogador venceu três",
      es: "1958, 1962 y 1970: ningún otro jugador ganó tres",
      en: "1958, 1962 and 1970: no other player has won three",
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

/**
 * Continental titles, split by confederation so a Libertadores run is never
 * measured against a Champions League benchmark.
 *
 * This replaces a single generic "continental titles" record (Gento's six
 * European Cups) that the sim used to check against `continental_primary` and
 * `continental_secondary` trophies regardless of which confederation actually
 * issued them, a career built entirely in South America could "equal Gento"
 * on a competition he never played in.
 */
const CONTINENTAL_RECORDS: RealRecord[] = [
  {
    key: "continental_primary",
    id: "continental_primary_uefa",
    confederation: "UEFA",
    asOf: "2024-06",
    value: 6,
    holder: "Francisco Gento",
    detail: {
      pt: "seis Copas da Europa/Champions League pelo Real Madrid, marca igualada em 2024 por Carvajal, Nacho, Kroos e Modrić",
      es: "seis Copas de Europa/Champions League con el Real Madrid, marca igualada en 2024 por Carvajal, Nacho, Kroos y Modrić",
      en: "six European Cups/Champions Leagues with Real Madrid, equalled in 2024 by Carvajal, Nacho, Kroos and Modrić",
    },
    label: {
      pt: "títulos de Champions League",
      es: "títulos de Champions League",
      en: "Champions League titles",
    },
  },
  {
    key: "continental_primary",
    id: "continental_primary_conmebol",
    confederation: "CONMEBOL",
    asOf: "2024-01",
    value: 6,
    holder: "Francisco Sá",
    detail: {
      pt: "seis Libertadores: quatro seguidas pelo Independiente (1972-75) e duas pelo Boca Juniors (1977-78)",
      es: "seis Libertadores: cuatro seguidas con Independiente (1972-75) y dos con Boca Juniors (1977-78)",
      en: "six Libertadores: four straight with Independiente (1972-75) and two with Boca Juniors (1977-78)",
    },
    label: {
      pt: "títulos da Libertadores",
      es: "títulos de la Libertadores",
      en: "Copa Libertadores titles",
    },
  },
  {
    key: "continental_secondary",
    id: "continental_secondary_uefa",
    confederation: "UEFA",
    asOf: "2016-05",
    value: 5,
    holder: "José Antonio Reyes",
    detail: {
      pt: "cinco Europa League: duas pelo Atlético de Madrid (2010, 2012) e três pelo Sevilla (2014-16)",
      es: "cinco Europa League: dos con el Atlético de Madrid (2010, 2012) y tres con el Sevilla (2014-16)",
      en: "five Europa Leagues: two with Atlético Madrid (2010, 2012) and three with Sevilla (2014-16)",
    },
    label: {
      pt: "títulos da Europa League",
      es: "títulos de la Europa League",
      en: "Europa League titles",
    },
  },
  {
    key: "continental_secondary",
    id: "continental_secondary_conmebol",
    confederation: "CONMEBOL",
    asOf: "2010-12",
    value: 3,
    holder: "Claudio Morel Rodríguez",
    detail: {
      pt: "o único jogador com três títulos da Sudamericana: San Lorenzo (2002) e Boca Juniors (2004, 2005)",
      es: "el único jugador con tres títulos de la Sudamericana: San Lorenzo (2002) y Boca Juniors (2004, 2005)",
      en: "the only player with three Copa Sudamericana titles: San Lorenzo (2002) and Boca Juniors (2004, 2005)",
    },
    label: {
      pt: "títulos da Sudamericana",
      es: "títulos de la Sudamericana",
      en: "Copa Sudamericana titles",
    },
  },
];

/**
 * Top-flight league titles, one real record per country, genuinely
 * trackable, unlike goals: the sim already knows exactly which country and
 * which division every "league" trophy was won in.
 */
const LEAGUE_TITLE_RECORDS: RealRecord[] = [
  {
    key: "league_titles",
    id: "league_titles_eng",
    countryFifa: "ENG",
    asOf: "2014-05",
    value: 13,
    holder: "Ryan Giggs",
    detail: {
      pt: "os 13 títulos de Giggs pelo Manchester United seguem sem igual na Premier League",
      es: "los 13 títulos de Giggs con el Manchester United siguen sin igual en la Premier League",
      en: "Giggs's 13 titles with Manchester United remain unmatched in the Premier League",
    },
    label: {
      pt: "títulos da Premier League",
      es: "títulos de la Premier League",
      en: "Premier League titles",
    },
  },
  {
    key: "league_titles",
    id: "league_titles_esp",
    countryFifa: "ESP",
    asOf: "1971-05",
    value: 12,
    holder: "Francisco Gento",
    detail: {
      pt: "12 títulos de LaLiga pelo Real Madrid: mais que qualquer outro jogador na história do clube e da liga",
      es: "12 títulos de LaLiga con el Real Madrid: más que cualquier otro jugador en la historia del club y de la liga",
      en: "12 LaLiga titles with Real Madrid: more than any other player in the club's or the league's history",
    },
    label: {
      pt: "títulos de LaLiga",
      es: "títulos de LaLiga",
      en: "LaLiga titles",
    },
  },
  {
    key: "league_titles",
    id: "league_titles_ita",
    countryFifa: "ITA",
    asOf: "2021-05",
    value: 10,
    holder: "Gianluigi Buffon",
    detail: {
      pt: "10 Scudetti pela Juventus (contagem oficial após a revisão do Calciopoli)",
      es: "10 Scudetti con la Juventus (recuento oficial tras la revisión del Calciopoli)",
      en: "10 Scudetti with Juventus (the official count after the Calciopoli revision)",
    },
    label: {
      pt: "títulos da Serie A",
      es: "títulos de la Serie A",
      en: "Serie A titles",
    },
  },
  {
    key: "league_titles",
    id: "league_titles_ger",
    countryFifa: "GER",
    asOf: "2023-05",
    value: 13,
    holder: "Thomas Müller",
    detail: {
      pt: "13 títulos da Bundesliga pelo Bayern de Munique, marca igualada por Manuel Neuer",
      es: "13 títulos de la Bundesliga con el Bayern de Múnich, marca igualada por Manuel Neuer",
      en: "13 Bundesliga titles with Bayern Munich, equalled by Manuel Neuer",
    },
    label: {
      pt: "títulos da Bundesliga",
      es: "títulos de la Bundesliga",
      en: "Bundesliga titles",
    },
  },
  {
    key: "league_titles",
    id: "league_titles_fra",
    countryFifa: "FRA",
    asOf: "2026-05",
    moving: true,
    value: 11,
    holder: "Marquinhos",
    detail: {
      pt: "11 títulos da Ligue 1 pelo Paris Saint-Germain",
      es: "11 títulos de la Ligue 1 con el Paris Saint-Germain",
      en: "11 Ligue 1 titles with Paris Saint-Germain",
    },
    label: {
      pt: "títulos da Ligue 1",
      es: "títulos de la Ligue 1",
      en: "Ligue 1 titles",
    },
  },
  {
    key: "league_titles",
    id: "league_titles_bra",
    countryFifa: "BRA",
    asOf: "2023-12",
    moving: true,
    value: 5,
    holder: "Mayke",
    detail: {
      pt: "recorde da era dos pontos corridos (desde 2003): 2 pelo Cruzeiro (2013, 2014) e 3 pelo Palmeiras (2018, 2022, 2023). O recorde histórico total, sob formatos de disputa diferentes do atual, é de Pelé, Pepe e Zito, com 6 pelo Santos nos anos 1960",
      es: "récord de la era de puntos corridos (desde 2003): 2 con el Cruzeiro (2013, 2014) y 3 con el Palmeiras (2018, 2022, 2023). El récord histórico total, bajo formatos distintos al actual, es de Pelé, Pepe y Zito, con 6 por el Santos en los años 60",
      en: "the record for the round-robin era (since 2003): 2 with Cruzeiro (2013, 2014) and 3 with Palmeiras (2018, 2022, 2023). The all-time historical record, under formats different from today's, belongs to Pelé, Pepe and Zito, with 6 for Santos in the 1960s",
    },
    label: {
      pt: "títulos do Brasileirão",
      es: "títulos del Brasileirão",
      en: "Brasileirão titles",
    },
  },
];

/**
 * Streaks, not how many were won, but how many in an unbroken row. A
 * separate axis from the totals above: a career that wins four league titles
 * spread across fifteen years and one that wins the same four back to back
 * are not the same achievement, and only the second is chasing these.
 */
const STREAK_RECORDS: RealRecord[] = [
  {
    key: "consecutive_ballon_dor",
    id: "consecutive_ballon_dor",
    asOf: "2012-01",
    value: 4,
    holder: "Lionel Messi",
    detail: {
      pt: "quatro Bolas de Ouro seguidas, 2009 a 2012",
      es: "cuatro Balones de Oro seguidos, 2009 a 2012",
      en: "four straight Ballons d'Or, 2009 to 2012",
    },
    label: {
      pt: "Bolas de Ouro seguidas",
      es: "Balones de Oro seguidos",
      en: "consecutive Ballons d'Or",
    },
  },
  {
    key: "consecutive_league_titles",
    id: "consecutive_league_titles",
    asOf: "2023-05",
    value: 11,
    holder: "Thomas Müller",
    detail: {
      pt: "11 Bundesligas seguidas pelo Bayern de Munique (2012-13 a 2022-23), a sequência mais longa das cinco grandes ligas europeias até ser encerrada pelo Bayer Leverkusen",
      es: "11 Bundesligas seguidas con el Bayern de Múnich (2012-13 a 2022-23), la racha más larga de las cinco grandes ligas europeas hasta que la cortó el Bayer Leverkusen",
      en: "11 straight Bundesliga titles with Bayern Munich (2012-13 to 2022-23), the longest run in any of Europe's top five leagues until Bayer Leverkusen ended it",
    },
    label: {
      pt: "títulos de liga seguidos",
      es: "títulos de liga seguidos",
      en: "consecutive league titles",
    },
  },
  {
    key: "consecutive_continental_primary",
    id: "consecutive_continental_primary",
    asOf: "2018-05",
    value: 3,
    holder: "Sergio Ramos, Luka Modrić e Toni Kroos",
    detail: {
      pt: "o histórico tricampeonato do Real Madrid, de 2016 a 2018: ninguém mais venceu três Champions League seguidas na era moderna",
      es: "el histórico tricampeonato del Real Madrid, de 2016 a 2018: nadie más ha ganado tres Champions League seguidas en la era moderna",
      en: "Real Madrid's historic three-peat, 2016 to 2018: no one else has won three straight Champions Leagues in the modern era",
    },
    label: {
      pt: "títulos continentais seguidos",
      es: "títulos continentales seguidos",
      en: "consecutive continental titles",
    },
  },
];

export const REAL_RECORDS: RealRecord[] = [
  ...GLOBAL_RECORDS,
  ...CONTINENTAL_RECORDS,
  ...LEAGUE_TITLE_RECORDS,
  ...STREAK_RECORDS,
];

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
