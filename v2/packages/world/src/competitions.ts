import trophyFilesJson from "../data/trophy-files.json";
import { getCountry, LEAGUES, PLAYABLE_COUNTRIES } from "./world";
import type { Confederation, CountryCode, LocalizedText } from "./types";

/** Os tipos de título do GDD 7.5. */
export type CompetitionKind =
  | "league"
  | "second"
  | "cup"
  | "leagueCup"
  | "superCup"
  | "continental1"
  | "continental2"
  | "continental3"
  | "continentalSuper"
  | "intercontinental"
  | "clubWorldCup"
  | "nationsCup"
  | "worldCup";

/** Silhueta usada quando a competição não tem arte própria. */
export type TrophyArtCategory = "league" | "cup" | "super_cup" | "continental";

export interface Competition {
  /** Estável e único: "league:brasileirao", "cup:BRA", "cont1:UEFA", "worldcup". */
  readonly id: string;
  readonly kind: CompetitionKind;
  readonly names: LocalizedText;
  readonly country?: CountryCode;
  readonly confederation?: Confederation;
  readonly league?: string;
  /** Caminho do troféu real em `assets/`, ou null. */
  readonly trophy: string | null;
  /** Chave da tabela de troféus gerados e silhueta de reserva. */
  readonly art: { readonly key: string | null; readonly category: TrophyArtCategory };
}

const trophyFiles: Readonly<Record<string, string>> = trophyFilesJson.trophies;

function realTrophy(name: string): string | null {
  const ext = trophyFiles[name];
  return ext ? `trophies/${name}.${ext}` : null;
}

const same = (name: string): LocalizedText => ({ pt: name, es: name, en: name });

// -------------------------------------------------------------- nacionais

/** Copas nacionais, por país. O México não tem uma desde 2020. */
const CUPS: Readonly<Record<CountryCode, { name: string; artKey?: string }>> = {
  ARG: { name: "Copa Argentina" },
  BOL: { name: "Copa Bolivia", artKey: "cup:bol-copa-bolivia" },
  BRA: { name: "Copa do Brasil" },
  CHI: { name: "Copa Chile" },
  COL: { name: "Copa Colombia" },
  ECU: { name: "Copa Ecuador" },
  ENG: { name: "FA Cup" },
  ESP: { name: "Copa del Rey" },
  FRA: { name: "Coupe de France" },
  GER: { name: "DFB-Pokal" },
  ITA: { name: "Coppa Italia" },
  PAR: { name: "Copa Paraguay" },
  PER: { name: "Copa Bicentenario", artKey: "cup:per-copa-bicentenario" },
  URU: { name: "Copa AUF Uruguay" },
  USA: { name: "U.S. Open Cup" },
  VEN: { name: "Copa Venezuela" },
};

/** Supercopas nacionais que existem de fato. */
const SUPER_CUPS: Readonly<Record<CountryCode, string>> = {
  ENG: "Community Shield",
  ESP: "Supercopa de España",
  ITA: "Supercoppa Italiana",
  GER: "DFL-Supercup",
  FRA: "Trophée des Champions",
  BRA: "Supercopa do Brasil",
  ARG: "Supercopa Argentina",
  MEX: "Campeón de Campeones",
  CHI: "Supercopa de Chile",
  COL: "Superliga de Colombia",
  ECU: "Supercopa de Ecuador",
  URU: "Supercopa Uruguaya",
  PAR: "Supercopa Paraguay",
};

// ------------------------------------------------------------ continentais

interface ContinentalSet {
  continental1?: LocalizedText;
  continental2?: LocalizedText;
  continental3?: LocalizedText;
  continentalSuper?: LocalizedText;
  nationsCup: LocalizedText;
}

const CONTINENTAL: Readonly<Record<Confederation, ContinentalSet>> = {
  UEFA: {
    continental1: same("UEFA Champions League"),
    continental2: same("UEFA Europa League"),
    continental3: same("UEFA Conference League"),
    continentalSuper: { pt: "Supercopa da UEFA", es: "Supercopa de la UEFA", en: "UEFA Super Cup" },
    nationsCup: { pt: "Eurocopa", es: "Eurocopa", en: "European Championship" },
  },
  CONMEBOL: {
    continental1: same("Copa Libertadores"),
    continental2: { pt: "Copa Sul-Americana", es: "Copa Sudamericana", en: "Copa Sudamericana" },
    continentalSuper: { pt: "Recopa Sul-Americana", es: "Recopa Sudamericana", en: "Recopa Sudamericana" },
    nationsCup: same("Copa América"),
  },
  CONCACAF: {
    continental1: {
      pt: "Copa dos Campeões da Concacaf",
      es: "Copa de Campeones de la Concacaf",
      en: "Concacaf Champions Cup",
    },
    nationsCup: { pt: "Copa Ouro", es: "Copa Oro", en: "Gold Cup" },
  },
  CAF: {
    nationsCup: { pt: "Copa Africana de Nações", es: "Copa Africana de Naciones", en: "Africa Cup of Nations" },
  },
  AFC: {
    nationsCup: { pt: "Copa da Ásia", es: "Copa Asiática", en: "AFC Asian Cup" },
  },
  OFC: {
    nationsCup: { pt: "Copa das Nações da OFC", es: "Copa de Naciones de la OFC", en: "OFC Nations Cup" },
  },
};

const CONTINENTAL_TROPHY: Readonly<Partial<Record<string, string>>> = {
  "cont1:UEFA": "uefa-champions-league",
  "cont2:UEFA": "uefa-europa-league",
  "cont1:CONMEBOL": "conmebol-libertadores",
  "cont2:CONMEBOL": "conmebol-sudamericana",
  "cont1:CONCACAF": "concacaf-champions-cup",
};

// ----------------------------------------------------------- montagem

function build(): Competition[] {
  const list: Competition[] = [];

  for (const league of LEAGUES) {
    list.push({
      id: `league:${league.id}`,
      kind: league.division === 1 ? "league" : "second",
      names: same(league.name),
      country: league.country,
      confederation: getCountry(league.country)?.confederation,
      league: league.id,
      trophy: league.trophy ? `trophies/league-${league.id}.${league.trophy}` : null,
      art: { key: `league:${league.id}`, category: "league" },
    });
  }

  for (const country of PLAYABLE_COUNTRIES) {
    const confederation = getCountry(country)?.confederation;
    const cup = CUPS[country];
    if (cup) {
      list.push({
        id: `cup:${country}`,
        kind: "cup",
        names: same(cup.name),
        country,
        confederation,
        trophy: realTrophy(`cup-${country}`),
        art: { key: cup.artKey ?? `cup:${country}`, category: "cup" },
      });
    }
    const superCup = SUPER_CUPS[country];
    if (superCup) {
      list.push({
        id: `super:${country}`,
        kind: "superCup",
        names: same(superCup),
        country,
        confederation,
        trophy: null,
        art: { key: `super:${country}`, category: "super_cup" },
      });
    }
  }

  list.push({
    id: "leaguecup:ENG",
    kind: "leagueCup",
    names: same("EFL Cup"),
    country: "ENG",
    confederation: "UEFA",
    trophy: null,
    art: { key: "leaguecup:ENG", category: "cup" },
  });

  for (const [confederation, set] of Object.entries(CONTINENTAL) as [Confederation, ContinentalSet][]) {
    const continental: Array<[CompetitionKind, string, LocalizedText | undefined, string]> = [
      ["continental1", `cont1:${confederation}`, set.continental1, `cont:${confederation}:continental_primary`],
      ["continental2", `cont2:${confederation}`, set.continental2, `cont:${confederation}:continental_secondary`],
      ["continental3", `cont3:${confederation}`, set.continental3, `cont:${confederation}:continental_tertiary`],
      [
        "continentalSuper",
        `contsuper:${confederation}`,
        set.continentalSuper,
        `cont:${confederation}:continental_super_cup`,
      ],
    ];
    for (const [kind, id, names, artKey] of continental) {
      if (!names) continue;
      const file = CONTINENTAL_TROPHY[id];
      list.push({
        id,
        kind,
        names,
        confederation,
        trophy: file ? realTrophy(file) : null,
        art: { key: artKey, category: kind === "continentalSuper" ? "super_cup" : "continental" },
      });
    }
    list.push({
      id: `nations:${confederation}`,
      kind: "nationsCup",
      names: set.nationsCup,
      confederation,
      trophy: realTrophy(`nations-${confederation}`),
      art: { key: `nations:${confederation}`, category: "continental" },
    });
  }

  list.push(
    {
      id: "intercontinental",
      kind: "intercontinental",
      names: { pt: "Copa Intercontinental", es: "Copa Intercontinental", en: "Intercontinental Cup" },
      trophy: null,
      art: { key: "cup:intercontinental", category: "cup" },
    },
    {
      id: "clubworldcup",
      kind: "clubWorldCup",
      names: { pt: "Mundial de Clubes", es: "Mundial de Clubes", en: "Club World Cup" },
      trophy: realTrophy("club-world-cup"),
      art: { key: "clubworldcup", category: "continental" },
    },
    {
      id: "worldcup",
      kind: "worldCup",
      names: { pt: "Copa do Mundo", es: "Copa del Mundo", en: "World Cup" },
      trophy: realTrophy("world-cup"),
      art: { key: "worldcup", category: "continental" },
    },
  );

  return list;
}

export const COMPETITIONS: readonly Competition[] = build();

const competitionById = new Map(COMPETITIONS.map((competition) => [competition.id, competition]));

export function getCompetition(id: string | null | undefined): Competition | null {
  if (!id) return null;
  return competitionById.get(id) ?? null;
}

// ------------------------------------------------------------- importância

/** Peso de cada título (GDD 7.5). Os dois intercontinentais dependem do lado do mundo. */
const BASE_IMPORTANCE: Readonly<Record<CompetitionKind, number>> = {
  league: 1,
  second: 0.5,
  cup: 0.5,
  leagueCup: 0.35,
  superCup: 0.25,
  continental1: 2.5,
  continental2: 1.3,
  continental3: 0.8,
  continentalSuper: 0.6,
  intercontinental: 1,
  clubWorldCup: 2.5,
  nationsCup: 2,
  worldCup: 3.5,
};

const OUTSIDE_EUROPE: Readonly<Partial<Record<CompetitionKind, number>>> = {
  intercontinental: 2,
  clubWorldCup: 3.5,
};

/**
 * Quanto um título vale. Usa a confederação do **clube** que ganhou, nunca o
 * passaporte do jogador (GDD 39, invariante 11).
 */
export function titleImportance(kind: CompetitionKind, clubConfederation?: Confederation): number {
  if (clubConfederation && clubConfederation !== "UEFA") {
    const outside = OUTSIDE_EUROPE[kind];
    if (outside !== undefined) return outside;
  }
  return BASE_IMPORTANCE[kind];
}

// ----------------------------------------------------------------- prêmios

export const AWARD_KEYS = ["ballonDor", "goldenGlove", "goldenShoe", "youngPlayer", "topScorer", "bestPlayer"] as const;

export type AwardKey = (typeof AWARD_KEYS)[number];

export interface Award {
  readonly key: AwardKey;
  readonly names: LocalizedText;
  /** Caminho da arte real em `assets/`, ou null quando a arte é gerada. */
  readonly image: string | null;
  /** Chave da arte gerada (troféus extras do v2). */
  readonly art: string;
}

const awardFiles: Readonly<Record<string, string>> = trophyFilesJson.awards;

function awardImage(name: string): string | null {
  const ext = awardFiles[name];
  return ext ? `awards/${name}.${ext}` : null;
}

export const AWARDS: Readonly<Record<AwardKey, Award>> = {
  ballonDor: {
    key: "ballonDor",
    names: { pt: "Bola de Ouro", es: "Balón de Oro", en: "Ballon d'Or" },
    image: awardImage("ballon-dor"),
    art: "award:ballon-dor",
  },
  goldenGlove: {
    key: "goldenGlove",
    names: { pt: "Luva de Ouro", es: "Guante de Oro", en: "Golden Glove" },
    image: awardImage("golden-glove"),
    art: "award:golden-glove",
  },
  goldenShoe: {
    key: "goldenShoe",
    names: { pt: "Chuteira de Ouro", es: "Bota de Oro", en: "Golden Shoe" },
    image: awardImage("golden-shoe"),
    art: "award:golden-shoe",
  },
  youngPlayer: {
    key: "youngPlayer",
    names: { pt: "Prêmio Revelação", es: "Premio Revelación", en: "Young Player Award" },
    image: null,
    art: "award:young-player",
  },
  topScorer: {
    key: "topScorer",
    names: { pt: "Artilheiro", es: "Máximo goleador", en: "Top scorer" },
    image: null,
    art: "award:top-scorer",
  },
  bestPlayer: {
    key: "bestPlayer",
    names: { pt: "Craque da competição", es: "Mejor jugador del torneo", en: "Player of the tournament" },
    image: null,
    art: "award:best-player",
  },
};
