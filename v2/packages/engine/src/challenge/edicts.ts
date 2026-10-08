import { type CountryCode, getCountry, PLAYABLE_COUNTRIES } from "@craque/world";
import type { Career } from "../career/types";
import { BIG_FIVE, clubConfederation, clubCountry, relegations, seasonsByClub, stintSizes, sum } from "./measures";
import type { Mission } from "./missions";

/**
 * Os dez éditos do Desafio do dia (GDD 27.4). Nove são **teto**: começam
 * cumpridos e quebram de vez quando a medida passa do limite (faixa de
 * perigo). Um é **piso**: começa não cumprido e exige um mínimo até o fim
 * (barra de progresso). O édito só é julgado na carreira terminada; no meio
 * dela, o painel mostra onde ele está.
 */

export type EdictKind = "ceiling" | "floor";

export interface Edict {
  readonly id: string;
  readonly kind: EdictKind;
  /** Teto: a medida pode chegar até aqui. Piso: a medida precisa chegar aqui. */
  readonly limit: number;
  measure(career: Career): number;
  /** O édito tornaria esta missão (com este alvo) impossível para quem nasceu em `nationality`? */
  blocks?(mission: Mission, target: number, nationality: CountryCode): boolean;
}

/** "Nunca no banco" vale a partir desta idade: o garoto da base pode esperar a vez. */
export const BENCH_FROM_AGE = 20;
/** "Nunca na segunda divisão" vale a partir desta idade. */
export const SECOND_DIVISION_FROM_AGE = 23;
/** Força de clube gigante, para o édito "nunca num gigante". */
export const GIANT_STRENGTH = 82;

/** Quantos países com liga jogável a confederação tem. */
function playableIn(confederation: string | undefined): number {
  return PLAYABLE_COUNTRIES.filter((country) => getCountry(country)?.confederation === confederation).length;
}

export const EDICTS: readonly Edict[] = [
  {
    id: "fourClubs",
    kind: "ceiling",
    limit: 4,
    measure: (c) => seasonsByClub(c.history).size,
    blocks: (m, target) => (m.id === "clubs" || m.id === "countries") && target > 4,
  },
  { id: "noLoans", kind: "ceiling", limit: 0, measure: (c) => stintSizes(c.history).filter((stint) => stint.loan).length },
  { id: "noBigFive", kind: "ceiling", limit: 0, measure: (c) => c.history.filter((r) => BIG_FIVE.has(clubCountry(r.club) ?? "")).length },
  { id: "noRelegation", kind: "ceiling", limit: 0, measure: (c) => relegations(c.history) },
  {
    id: "noBench",
    kind: "ceiling",
    limit: 1,
    // Dos 20 anos em diante, no máximo uma temporada terminada como reserva, sem espaço ou terceiro goleiro.
    measure: (c) => c.history.filter((r) => r.age >= BENCH_FROM_AGE && (r.role === "reserve" || r.role === "surplus" || r.role === "third")).length,
  },
  {
    id: "noSecondDivision",
    kind: "ceiling",
    limit: 0,
    // Dos 23 anos em diante, nunca na segunda divisão: dá para se formar lá, não para ficar.
    measure: (c) => c.history.filter((r) => r.age >= SECOND_DIVISION_FROM_AGE && r.division === 2).length,
  },
  {
    id: "stayThree",
    kind: "ceiling",
    limit: 0,
    // Saídas de um clube antes de três temporadas, contando só passagens de verdade (empréstimo não conta).
    measure: (c) => {
      const stints = stintSizes(c.history);
      return stints.slice(0, -1).filter((stint, index) => !stint.loan && stint.seasons < 3 && !stints[index + 1]?.loan).length;
    },
    // Três temporadas por clube numa carreira de 22: no máximo sete clubes.
    blocks: (m, target) => (m.id === "clubs" || m.id === "countries") && target * 3 > 21,
  },
  {
    id: "homeContinent",
    kind: "ceiling",
    limit: 0,
    measure: (c) => {
      const home = getCountry(c.nationality)?.confederation;
      return c.history.filter((r) => clubConfederation(r.club) !== home).length;
    },
    blocks: (m, target, nationality) => {
      const available = playableIn(getCountry(nationality)?.confederation);
      if (m.id === "countries" || m.id === "titleCountries") return available < target;
      // Jogar fora do país sem sair do continente pede outro país com liga ali.
      if (m.id === "seasonsAbroad") return available < 2;
      return false;
    },
  },
  {
    id: "noGiants",
    kind: "ceiling",
    limit: 0,
    // Nunca vestir a camisa de um gigante: clube com força de elite no começo da temporada.
    measure: (c) => c.history.filter((r) => r.clubStrength >= GIANT_STRENGTH).length,
  },
  { id: "minGames", kind: "floor", limit: 450, measure: (c) => sum(c.history, (r) => r.games) },
];

const BY_ID = new Map(EDICTS.map((item) => [item.id, item]));

export function getEdict(id: string): Edict | null {
  return BY_ID.get(id) ?? null;
}

export type EdictState = "intact" | "broken" | "pending" | "met";

/**
 * Onde o édito está. Teto: intacto até passar do limite, e quebrado para
 * sempre depois. Piso: pendente até chegar no mínimo; com a carreira
 * terminada, cumprido ou quebrado.
 */
export function edictState(edict: Edict, career: Career): EdictState {
  const value = edict.measure(career);
  if (edict.kind === "ceiling") return value > edict.limit ? "broken" : "intact";
  if (value >= edict.limit) return "met";
  return career.end ? "broken" : "pending";
}
