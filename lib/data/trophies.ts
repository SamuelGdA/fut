/**
 * Trophy catalogue mirrored from the live Copero career simulator.
 * Confederation trophies, FIFA competitions and domestic cups all carry
 * the same media URLs the original game uses.
 */

export type ClubTrophyKey =
  | "league"
  | "cup"
  | "continental_primary"
  | "continental_secondary"
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
  cup: 0.6,
  league: 1,
  continental_secondary: 1.6,
  continental_primary: 2.6,
  club_world_cup: 3,
};

/** Same idea for national-team trophies — a World Cup outweighs a continental title. */
export const NATIONAL_TROPHY_IMPORTANCE: Record<NationalTrophyKey, number> = {
  national_continental: 1,
  world_cup: 2.6,
};

export type Confederation = "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC";

interface TrophyDef {
  name: string;
  trophy_url: string;
}

interface ConfederationTrophies {
  continental_trophies: {
    continental_primary?: TrophyDef;
    continental_secondary?: TrophyDef;
  };
  national_trophies: {
    national_continental?: TrophyDef;
  };
}

const M = "/craque-assets/trophies/football";

export const CONFEDERATION_TROPHIES: Record<Confederation, ConfederationTrophies> = {
  UEFA: {
    continental_trophies: {
      continental_primary: { name: "Champions League", trophy_url: `${M}/international/UEFA/champions-league.png` },
      continental_secondary: { name: "Europa League", trophy_url: `${M}/international/UEFA/europa-league.png` },
    },
    national_trophies: {
      national_continental: { name: "Euro", trophy_url: `${M}/international/UEFA/euro.svg` },
    },
  },
  CONMEBOL: {
    continental_trophies: {
      continental_primary: { name: "Copa Libertadores", trophy_url: `${M}/international/CONMEBOL/libertadores.png` },
      continental_secondary: { name: "Copa Sudamericana", trophy_url: `${M}/international/CONMEBOL/copa-sudamericana.png` },
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
  "mex-copa-mx": { name: "Copa MX", country_fifa_code: "MEX", trophy_url: `${M}/national/MEX/copa-mx.png` },
  "par-copa-paraguay": { name: "Copa Paraguay", country_fifa_code: "PAR", trophy_url: `${M}/national/PAR/copa-paraguay.png` },
  "uru-copa-uruguay": { name: "Copa Uruguay", country_fifa_code: "URU", trophy_url: `${M}/national/URU/copa-uruguay.png` },
  "usa-us-open": { name: "US Open", country_fifa_code: "USA", trophy_url: `${M}/national/USA/us-open-cup.png` },
  "ven-copa-venezuela": { name: "Copa Venezuela", country_fifa_code: "VEN", trophy_url: `${M}/national/VEN/copa-venezuela.png` },
};

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
