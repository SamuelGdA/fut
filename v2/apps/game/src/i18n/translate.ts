import { en } from "./en";
import { es } from "./es";
import { formatNumber } from "./format";
import { type Messages, pt } from "./pt";
import type { Locale, Plural, PluralKey, TextKey, Vars } from "./types";

export const DICTIONARIES: Readonly<Record<Locale, Messages>> = { pt, es, en };

export type MessageKey = TextKey<Messages>;
export type MessagePluralKey = PluralKey<Messages>;

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
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : match,
  );
}

function isPlural(value: unknown): value is Plural {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Plural).one === "string" &&
    typeof (value as Plural).other === "string"
  );
}

/**
 * Texto no idioma pedido. Falta no idioma: cai para o português, que é a
 * fonte. Falta também no português: devolve a própria chave.
 */
export function translate(locale: Locale, key: MessageKey, vars?: Vars): string {
  const own = lookup(DICTIONARIES[locale], key);
  if (typeof own === "string") return interpolate(own, vars);
  const fallback = lookup(DICTIONARIES.pt, key);
  if (typeof fallback === "string") return interpolate(fallback, vars);
  return key;
}

/** Texto com plural. `{count}` recebe o número já formatado no idioma. */
export function translatePlural(
  locale: Locale,
  key: MessagePluralKey,
  count: number,
  vars?: Vars,
): string {
  const own = lookup(DICTIONARIES[locale], key);
  const entry = isPlural(own) ? own : lookup(DICTIONARIES.pt, key);
  if (!isPlural(entry)) return key;

  const rule = new Intl.PluralRules(locale).select(count);
  const template =
    count === 0 && entry.zero !== undefined
      ? entry.zero
      : rule === "one"
        ? entry.one
        : entry.other;

  return interpolate(template, { count: formatNumber(count, locale), ...vars });
}

/** Percorre todas as folhas de texto, com o caminho de cada uma. */
export function* walkMessages(
  tree: unknown,
  prefix = "",
): Generator<{ key: string; value: string }> {
  if (typeof tree === "string") {
    yield { key: prefix, value: tree };
    return;
  }
  if (typeof tree !== "object" || tree === null) return;
  for (const [name, child] of Object.entries(tree)) {
    yield* walkMessages(child, prefix ? `${prefix}.${name}` : name);
  }
}
