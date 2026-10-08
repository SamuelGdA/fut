import { futureGeneration, PLAYER } from "@craque/engine";
import { type CountryCode, ELITE, getCountry, getElite } from "@craque/world";
import { CONFEDERATION_CULTURES, COUNTRY_CULTURES, FAMOUS_NAMES, NAME_POOLS, type NameCulture } from "./pools";

/**
 * Nome de quem aparece nas listas de prêmios (D13). A elite real tem o nome
 * de verdade; a geração futura ganha um nome fictício da cultura do país,
 * fixo para a mesma carreira: a mesma semente e o mesmo candidato dão sempre
 * o mesmo nome.
 */

/** FNV-1a de 32 bits: um número estável a partir de um texto. */
function hash(text: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193) >>> 0;
  }
  return value >>> 0;
}

const REAL_NAMES: ReadonlySet<string> = new Set(ELITE.map((profile) => profile.name));

export function culturesOf(nationality: CountryCode): readonly NameCulture[] {
  const own = COUNTRY_CULTURES[nationality];
  if (own) return own;
  const confederation = getCountry(nationality)?.confederation;
  return confederation ? CONFEDERATION_CULTURES[confederation] : ["english"];
}

function isTaken(name: string): boolean {
  return FAMOUS_NAMES.has(name) || REAL_NAMES.has(name);
}

export interface NameParts {
  readonly first: string;
  readonly last: string;
}

/**
 * Prenome e sobrenome fictícios para um país. `key` identifica a pessoa
 * (semente da carreira mais o id do candidato). Se a combinação sorteada for o
 * nome de um jogador real conhecido, anda para a próxima. Prenomes podem ser
 * compostos ("Juan Pablo"), então quem precisa só do sobrenome usa `last`.
 */
export function generatedParts(key: string, nationality: CountryCode): NameParts {
  const cultures = culturesOf(nationality);
  const seed = hash(key);
  const culture = cultures[seed % cultures.length] ?? "english";
  const pool = NAME_POOLS[culture];
  const firstStart = hash(`${key}:first`);
  const lastStart = hash(`${key}:last`);
  const total = pool.first.length * pool.last.length;
  for (let step = 0; step < total; step += 1) {
    const first = pool.first[(firstStart + step) % pool.first.length] ?? "";
    const last = pool.last[(lastStart + Math.floor(step / pool.first.length)) % pool.last.length] ?? "";
    if (!isTaken(`${first} ${last}`)) return { first, last };
  }
  return { first: "", last: pool.last[lastStart % pool.last.length] ?? "" };
}

/** O nome completo, "Prenome Sobrenome". */
export function generatedName(key: string, nationality: CountryCode): string {
  const parts = generatedParts(key, nationality);
  return parts.first ? `${parts.first} ${parts.last}` : parts.last;
}

/** Quem é o candidato: o jogador, alguém da elite real, alguém da geração futura ou o artilheiro de um clube. */
export interface ContenderNameInput {
  readonly seed: string;
  readonly id: string;
  /** Nome do jogador da carreira, para o id `player`. */
  readonly playerName: string;
}

const futureByCareer = new Map<string, ReadonlyMap<string, CountryCode>>();

function futureNationality(seed: string, id: string): CountryCode | null {
  let map = futureByCareer.get(seed);
  if (!map) {
    map = new Map(futureGeneration(seed).map((contender) => [contender.id, contender.nationality]));
    if (futureByCareer.size > 16) futureByCareer.clear();
    futureByCareer.set(seed, map);
  }
  return map.get(id) ?? null;
}

/** O nome a mostrar, ou `null` para um id de clube (`club:<id>`), que a tela escreve do jeito dela. */
export function contenderName(input: ContenderNameInput): string | null {
  if (input.id === PLAYER) return input.playerName;
  if (input.id.startsWith("club:")) return null;
  const real = getElite(input.id);
  if (real) return real.name;
  const nationality = futureNationality(input.seed, input.id);
  return nationality ? generatedName(`${input.seed}|${input.id}`, nationality) : input.id;
}
