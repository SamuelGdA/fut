export const LOCALES = ["pt", "es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

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
 * precisar repetir o texto: chave a mais ou a menos é erro de compilação.
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
