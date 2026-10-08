export const CONFEDERATIONS = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"] as const;

export type Confederation = (typeof CONFEDERATIONS)[number];

/** Código FIFA de três letras (BRA, ENG). Também identifica a seleção. */
export type CountryCode = string;

export type Division = 1 | 2;

export type Language = "pt" | "es" | "en";

export type LocalizedText = Readonly<Record<Language, string>>;

export type KitPattern = "solid" | "vertical_stripes" | "horizontal_stripes" | "diagonal_sash" | "checkerboard";

export interface Kit {
  readonly base: string;
  readonly accent: string;
  readonly pattern: KitPattern;
}

export interface Country {
  readonly code: CountryCode;
  /** ISO 3166 alfa-2, ou subdivisão (GB-ENG). Nome do arquivo da bandeira. */
  readonly iso2: string;
  readonly names: LocalizedText;
  readonly confederation: Confederation;
  /** Força da seleção na escala do OVR (GDD 7.4). */
  readonly strength: number;
  readonly color: string;
  readonly kit: Kit & { readonly third?: string };
  readonly flag: boolean;
}

export interface League {
  readonly id: string;
  readonly name: string;
  readonly country: CountryCode;
  readonly division: Division;
  /** Jogos de liga por temporada, perto do calendário real. */
  readonly games: number;
  /** Clubes trocados com a divisão vizinha ao fim da temporada. */
  readonly promotionSlots: number;
  /** Extensão do arquivo do escudo real, ou null quando só existe o gerado. */
  readonly crest: string | null;
  /** Extensão do arquivo do troféu real, ou null quando só existe o gerado. */
  readonly trophy: string | null;
}

export interface Club {
  readonly id: string;
  readonly name: string;
  readonly short: string;
  readonly abbr: string;
  readonly country: CountryCode;
  /** Divisão em que o clube começa o mundo. A divisão atual é estado do motor. */
  readonly division: Division;
  /** Força base do elenco na escala do OVR (GDD 7.2). */
  readonly strength: number;
  /** Tamanho histórico, de 1 a 5. */
  readonly prestige: number;
  readonly color: string;
  /** Extensão do arquivo do escudo real, ou null quando só existe o gerado. */
  readonly crest: string | null;
}
