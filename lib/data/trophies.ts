/**
 * Trophy catalogue mirrored from the live Copero career simulator.
 * Confederation trophies, FIFA competitions and domestic cups all carry
 * the same media URLs the original game uses.
 */

export type ClubTrophyKey =
  | "league"
  | "cup"
  /** Second domestic knockout — only England actually runs one worth modelling. */
  | "league_cup"
  /** Champion vs cup winner, played the season *after* they qualified for it. */
  | "domestic_super_cup"
  | "continental_primary"
  | "continental_secondary"
  /** UEFA's third tier — where a mid-table European side can realistically win. */
  | "continental_tertiary"
  /** Winner of the primary vs winner of the secondary, again a season later. */
  | "continental_super_cup"
  /**
   * Played the season after winning the continent, against the other
   * continental champions. An annual title, and a small one in Europe;
   * outside it, the biggest night the club will ever have.
   */
  | "intercontinental_cup"
  /** The month-long one, every four years, for the best of the last cycle. */
  | "club_world_cup";

export type NationalTrophyKey = "national_continental" | "world_cup";

export type TrophyKey = ClubTrophyKey | NationalTrophyKey;

export type AwardKey = "ballon_dor" | "golden_boot" | "golden_glove";

/**
 * How much each club trophy counts toward "won something that matters" —
 * a domestic cup and a Champions League shouldn't weigh the same when judging
 * whether someone became a club legend. Used by `clubStanding`.
 */
export const CLUB_TROPHY_IMPORTANCE: Record<ClubTrophyKey, number> = {
  // Super cups are one match, played before the season starts. They belong in
  // the cabinet and they count as titles everywhere a title is counted, but
  // nobody becomes a club legend off the back of a Community Shield — and a
  // season whose only prize was one is not the season a league was won.
  domestic_super_cup: 0.3,
  league_cup: 0.45,
  cup: 0.6,
  league: 1,
  continental_tertiary: 1.1,
  continental_super_cup: 0.8,
  continental_secondary: 1.6,
  continental_primary: 2.6,
  intercontinental_cup: 1.6,
  club_world_cup: 3.4,
};

/** Same idea for national-team trophies — a World Cup outweighs a continental title. */
export const NATIONAL_TROPHY_IMPORTANCE: Record<NationalTrophyKey, number> = {
  national_continental: 1,
  world_cup: 2.6,
};

/**
 * What beating the rest of the world is worth, by where the club is from.
 *
 * The trophies whose meaning genuinely depends on the continent. A
 * European treble winner adds it as a footnote to the season the Champions
 * League defined; a South American or Asian champion is remembered for it for
 * the rest of their life. A single number could only ever be wrong for one
 * side of that.
 */
export const CLUB_WORLD_CUP_IMPORTANCE: Record<Confederation, number> = {
  UEFA: 3.0,
  CONMEBOL: 3.8,
  CONCACAF: 4.0,
  CAF: 4.0,
  AFC: 4.0,
  OFC: 4.0,
};

/**
 * And the same for the annual intercontinental title, where the gap between
 * continents is much wider. A European champion treats it as an obligation
 * met on the way to the airport; a South American or Asian champion has beaten
 * the best of Europe, and the city remembers where it was that night.
 */
export const INTERCONTINENTAL_IMPORTANCE: Record<Confederation, number> = {
  UEFA: 0.7,
  CONMEBOL: 2.4,
  CONCACAF: 2.6,
  CAF: 2.6,
  AFC: 2.6,
  OFC: 2.6,
};

/**
 * What a season's silverware is worth, as one number.
 *
 * Anywhere the game asks "how good was this season" rather than "how many
 * did you win", this is the number to use — a league and a super cup are both
 * one trophy and are not the same achievement.
 */
/** What one trophy is worth, given where the club that won it plays. */
export function singleTrophyImportance(
  key: TrophyKey,
  confederation?: Confederation,
): number {
  if (key === "club_world_cup" && confederation) return CLUB_WORLD_CUP_IMPORTANCE[confederation];
  if (key === "intercontinental_cup" && confederation) {
    return INTERCONTINENTAL_IMPORTANCE[confederation];
  }
  return (
    CLUB_TROPHY_IMPORTANCE[key as ClubTrophyKey] ??
    NATIONAL_TROPHY_IMPORTANCE[key as NationalTrophyKey] ??
    0
  );
}

export function trophyImportance(
  keys: readonly TrophyKey[],
  confederation?: Confederation,
): number {
  return keys.reduce((total, key) => total + singleTrophyImportance(key, confederation), 0);
}

export type Confederation = "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC";

interface TrophyDef {
  name: string;
  trophy_url: string;
}

interface ConfederationTrophies {
  continental_trophies: {
    continental_primary?: TrophyDef;
    continental_secondary?: TrophyDef;
    continental_tertiary?: TrophyDef;
    continental_super_cup?: TrophyDef;
  };
  national_trophies: {
    national_continental?: TrophyDef;
  };
}

const M = "/craque-assets/trophies/football";

/** Stand-in artwork for the competitions the asset set never shipped. */
const GENERIC_SUPER_CUP = `${M}/generic-super-cup.svg`;
const GENERIC_CUP = `${M}/generic-cup.svg`;

export const CONFEDERATION_TROPHIES: Record<Confederation, ConfederationTrophies> = {
  UEFA: {
    continental_trophies: {
      continental_primary: { name: "Champions League", trophy_url: `${M}/international/UEFA/champions-league.png` },
      continental_secondary: { name: "Europa League", trophy_url: `${M}/international/UEFA/europa-league.png` },
      continental_tertiary: { name: "Conference League", trophy_url: GENERIC_CUP },
      continental_super_cup: { name: "Supercopa da UEFA", trophy_url: GENERIC_SUPER_CUP },
    },
    national_trophies: {
      national_continental: { name: "Euro", trophy_url: `${M}/international/UEFA/euro.svg` },
    },
  },
  CONMEBOL: {
    continental_trophies: {
      continental_primary: { name: "Copa Libertadores", trophy_url: `${M}/international/CONMEBOL/libertadores.png` },
      continental_secondary: { name: "Copa Sudamericana", trophy_url: `${M}/international/CONMEBOL/copa-sudamericana.png` },
      // CONMEBOL's answer to the UEFA Super Cup: Libertadores winner against
      // Sudamericana winner, the following season.
      continental_super_cup: { name: "Recopa Sudamericana", trophy_url: GENERIC_SUPER_CUP },
    },
    national_trophies: {
      national_continental: { name: "Copa América", trophy_url: `${M}/international/CONMEBOL/copa-america.png` },
    },
  },
  CONCACAF: {
    continental_trophies: {
      continental_primary: { name: "Concachampions", trophy_url: `${M}/international/CONCACAF/concachampions.svg` },
    },
    national_trophies: {
      national_continental: { name: "Gold Cup", trophy_url: `${M}/international/CONCACAF/gold-cup.svg` },
    },
  },
  CAF: {
    continental_trophies: {},
    national_trophies: {
      national_continental: { name: "AFCON", trophy_url: `${M}/international/CAF/afcon.svg` },
    },
  },
  AFC: {
    continental_trophies: {},
    national_trophies: {
      national_continental: { name: "AFC Asian Cup", trophy_url: `${M}/international/AFC/asian-cup.svg` },
    },
  },
  OFC: {
    continental_trophies: {},
    national_trophies: {
      national_continental: { name: "OFC Nations Cup", trophy_url: `${M}/international/OFC/nations-cup.png` },
    },
  },
};

export const WORLD_CUP: TrophyDef = {
  name: "Copa Mundial de la FIFA",
  trophy_url: `${M}/international/FIFA/world-cup.png`,
};

export const CLUB_WORLD_CUP: TrophyDef = {
  name: "Mundial de Clubes",
  trophy_url: `${M}/international/FIFA/club-world-cup.png`,
};

export const DOMESTIC_CUPS: Record<string, TrophyDef & { country_fifa_code: string }> = {
  "arg-copa-argentina": { name: "Copa Argentina", country_fifa_code: "ARG", trophy_url: `${M}/national/ARG/copa-argentina.png` },
  "bol-copa-bolivia": { name: "Copa Bolivia", country_fifa_code: "BOL", trophy_url: "" },
  "bra-copa-do-brasil": { name: "Copa do Brasil", country_fifa_code: "BRA", trophy_url: `${M}/national/BRA/copa-do-brasil.png` },
  "chi-copa-chile": { name: "Copa Chile", country_fifa_code: "CHI", trophy_url: `${M}/national/CHI/copa-chile.png` },
  "col-copa-colombia": { name: "Copa Colombia", country_fifa_code: "COL", trophy_url: `${M}/national/COL/copa-colombia.png` },
  "ecu-copa-ecuador": { name: "Copa Ecuador", country_fifa_code: "ECU", trophy_url: `${M}/national/ECU/copa-ecuador.png` },
  "eng-fa-cup": { name: "FA Cup", country_fifa_code: "ENG", trophy_url: `${M}/national/ENG/fa-cup.png` },
  "esp-copa-del-rey": { name: "Copa del Rey", country_fifa_code: "ESP", trophy_url: `${M}/national/ESP/copa-del-rey.png` },
  "fra-coupe-de-france": { name: "Coupe de France", country_fifa_code: "FRA", trophy_url: `${M}/national/FRA/coupe-de-france.png` },
  "ger-dfb-pokal": { name: "DFB-Pokal", country_fifa_code: "GER", trophy_url: `${M}/national/GER/dfb-pokal.png` },
  "ita-coppa-italia": { name: "Coppa Italia", country_fifa_code: "ITA", trophy_url: `${M}/national/ITA/coppa-italia.png` },
  // Mexico has had no national cup since the Copa MX was scrapped in 2020; the
  // Campeón de Campeones below is what Liga MX actually plays for instead.
  "par-copa-paraguay": { name: "Copa Paraguay", country_fifa_code: "PAR", trophy_url: `${M}/national/PAR/copa-paraguay.png` },
  "per-copa-bicentenario": { name: "Copa Bicentenario", country_fifa_code: "PER", trophy_url: "" },
  "uru-copa-uruguay": { name: "Copa Uruguay", country_fifa_code: "URU", trophy_url: `${M}/national/URU/copa-uruguay.png` },
  "usa-us-open": { name: "US Open", country_fifa_code: "USA", trophy_url: `${M}/national/USA/us-open-cup.png` },
  "ven-copa-venezuela": { name: "Copa Venezuela", country_fifa_code: "VEN", trophy_url: `${M}/national/VEN/copa-venezuela.png` },
};

/**
 * Domestic super cups, keyed by country. Every one of these is a real fixture
 * played at the start of a season between the previous season's league champion
 * and its cup winner — which is exactly why they are modelled off last
 * season's results rather than rolled fresh.
 *
 * Countries missing from this table genuinely have no super cup: Bolivia and
 * Venezuela never established one, Peru's ran for two years and was dropped,
 * and MLS plays the Campeones Cup against Liga MX rather than a domestic final.
 */
export const DOMESTIC_SUPER_CUPS: Record<string, TrophyDef> = {
  ENG: { name: "Community Shield", trophy_url: GENERIC_SUPER_CUP },
  ESP: { name: "Supercopa de España", trophy_url: GENERIC_SUPER_CUP },
  ITA: { name: "Supercoppa Italiana", trophy_url: GENERIC_SUPER_CUP },
  GER: { name: "DFL-Supercup", trophy_url: GENERIC_SUPER_CUP },
  FRA: { name: "Trophée des Champions", trophy_url: GENERIC_SUPER_CUP },
  BRA: { name: "Supercopa do Brasil", trophy_url: GENERIC_SUPER_CUP },
  ARG: { name: "Supercopa Argentina", trophy_url: GENERIC_SUPER_CUP },
  // Apertura champion against Clausura champion — the closest thing Liga MX has
  // to a second domestic title.
  MEX: { name: "Campeón de Campeones", trophy_url: GENERIC_SUPER_CUP },
  CHI: { name: "Supercopa de Chile", trophy_url: GENERIC_SUPER_CUP },
  COL: { name: "Superliga de Colombia", trophy_url: GENERIC_SUPER_CUP },
  ECU: { name: "Supercopa Ecuador", trophy_url: GENERIC_SUPER_CUP },
  URU: { name: "Supercopa Uruguaya", trophy_url: GENERIC_SUPER_CUP },
  PAR: { name: "Supercopa Paraguay", trophy_url: GENERIC_SUPER_CUP },
};

/**
 * Second domestic knockout cups. England is the only country in the dataset
 * that runs one at a scale worth simulating, and crucially it is open to the
 * second tier as well — a Championship side reaching a Wembley final is a real
 * and repeated thing.
 */
export const LEAGUE_CUPS: Record<string, TrophyDef> = {
  ENG: { name: "EFL Cup", trophy_url: GENERIC_CUP },
};

export function getDomesticSuperCup(fifaCode: string | undefined): TrophyDef | null {
  if (!fifaCode) return null;
  return DOMESTIC_SUPER_CUPS[fifaCode.trim().toUpperCase()] ?? null;
}

export function getLeagueCup(fifaCode: string | undefined): TrophyDef | null {
  if (!fifaCode) return null;
  return LEAGUE_CUPS[fifaCode.trim().toUpperCase()] ?? null;
}

/** Real award artwork from the original game (used as the primary image; emoji is only the error fallback). */
export const AWARD_IMAGES: Record<AwardKey, string> = {
  ballon_dor: "/craque-assets/trophies/football/international/FIFA/ballon-dor.png",
  golden_boot: "/craque-assets/trophies/football/international/UEFA/golden-boot.png",
  golden_glove: "/craque-assets/trophies/football/international/FIFA/golden-glove.png",
};

export const AWARD_ICONS: Record<AwardKey, string> = {
  ballon_dor: "🏅",
  golden_boot: "👟",
  golden_glove: "🧤",
};

/** Generic silhouettes used when a specific competition has no trophy artwork. */
export const GENERIC_TROPHY_IMAGES = {
  league: "/craque-assets/trophies/football/generic-league.svg",
  cup: "/craque-assets/trophies/football/generic-cup.svg",
};
