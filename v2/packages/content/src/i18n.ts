/**
 * O núcleo dos dicionários, sem React: o jogo, o terminal e os testes usam o
 * mesmo jeito de achar e preencher um texto.
 */

export const LOCALES = ["pt", "es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Uma entrada com forma singular e plural, escolhida por Intl.PluralRules. */
export interface Plural {
  readonly zero?: string;
  readonly one: string;
  readonly other: string;
}

export interface MessageTree {
  readonly [key: string]: string | Plural | MessageTree;
}

/**
 * O dicionário português é escrito com `as const`. Isto troca cada literal por
 * `string`, para que espanhol e inglês sejam tipados contra a mesma forma sem
 * repetir o texto: chave a mais ou a menos é erro de compilação.
 */
export type Widen<T> = T extends string
  ? string
  : T extends Plural
    ? Plural
    : { readonly [K in keyof T]: Widen<T[K]> };

type Join<P extends string, K extends string> = P extends "" ? K : `${P}.${K}`;

/** Todos os caminhos pontuados que terminam num texto simples. */
export type TextKey<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? Join<P, K>
    : T[K] extends Plural
      ? never
      : TextKey<T[K], Join<P, K>>;
}[keyof T & string];

/** Todos os caminhos pontuados que terminam numa entrada de plural. */
export type PluralKey<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : T[K] extends Plural
      ? Join<P, K>
      : PluralKey<T[K], Join<P, K>>;
}[keyof T & string];

export type Vars = Readonly<Record<string, string | number>>;

/** Anda pelo caminho pontuado. Devolve undefined se algum trecho faltar. */
export function lookup(tree: unknown, key: string): unknown {
  let node: unknown = tree;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return node;
}

/**
 * Troca `{nome}` pelo valor. Um marcador sem valor fica visível de propósito:
 * texto quebrado na tela é um bug que alguém vê, branco silencioso não.
 */
export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (Object.hasOwn(vars, name) ? String(vars[name]) : match));
}

export function isPlural(value: unknown): value is Plural {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Plural).one === "string" &&
    typeof (value as Plural).other === "string"
  );
}

/** A forma certa de um plural para o número, no idioma. */
export function pluralForm(locale: Locale, entry: Plural, count: number): string {
  if (count === 0 && entry.zero !== undefined) return entry.zero;
  return new Intl.PluralRules(locale).select(count) === "one" ? entry.one : entry.other;
}

/** Percorre todas as folhas de texto, com o caminho de cada uma. Plurais viram `chave.one`, `chave.other`. */
export function* walkMessages(tree: unknown, prefix = ""): Generator<{ key: string; value: string }> {
  if (typeof tree === "string") {
    yield { key: prefix, value: tree };
    return;
  }
  if (typeof tree !== "object" || tree === null) return;
  for (const [name, child] of Object.entries(tree)) {
    yield* walkMessages(child, prefix ? `${prefix}.${name}` : name);
  }
}

const NUMBER_FORMATS = new Map<string, Intl.NumberFormat>();

/** Número no jeito do idioma, com no máximo `digits` casas. */
export function formatDecimal(value: number, locale: Locale, digits = 1): string {
  const key = `${locale}:${digits}`;
  let format = NUMBER_FORMATS.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
    NUMBER_FORMATS.set(key, format);
  }
  return format.format(value);
}

/** Com sinal sempre visível: "+1,2", "-3". */
export function formatSigned(value: number, locale: Locale, digits = 1): string {
  const text = formatDecimal(Math.abs(value), locale, digits);
  return value < 0 ? `-${text}` : `+${text}`;
}
