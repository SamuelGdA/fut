import type { Confederation } from "./competitions/trophies";

export interface Team {
  id: string;
  name: string;
  short_name: string;
  abbreviation: string;
  logo_url: string;
  primary_color: string;
  domestic_reputation: number;
  continental_reputation: number;
  international_reputation: number;
}

export interface League {
  id: string;
  name: string;
  country_fifa_code: string;
  logo_url: string;
  league_trophy_url: string;
  confederation: Confederation;
  tier: number;
  domestic_cup_id?: string;
  teams: Team[];
}

export interface Country {
  name_en: string;
  name_es: string;
  name_pt: string;
  iso_alpha2: string;
  fifa_code: string;
  slug: string;
  flag_url: string;
  confederation: Confederation;
  continental_reputation: number;
  fifa_reputation: number;
  international_reputation: number;
  primary_color: string;
  kit_primary_color: string;
  kit_secondary_color: string;
  kit_tertiary_color: string;
  kit_type?: "vertical_stripes" | "checkerboard" | "diagonal_sash";
}

export type { Confederation };
