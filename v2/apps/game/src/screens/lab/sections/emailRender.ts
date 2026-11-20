import type { Locale } from "../../../i18n/types";

/** Dados de exemplo no lugar das variáveis do Supabase. */
const SAMPLE: Readonly<Record<string, string>> = {
  ConfirmationURL: "https://futeiro.com/login#exemplo",
  Email: "craque@exemplo.com",
  NewEmail: "novo.craque@exemplo.com",
  Token: "482913",
};

/**
 * Cada modelo tem um bloco por idioma (D122), escolhido pelo Supabase com
 * `{{ if eq (printf "%v" .Data.locale) "es" }} ... {{ else if ... "en" }} ...
 * {{ else }} português {{ end }}`. Aqui o laboratório pega o bloco do idioma da
 * interface e troca as variáveis pelos dados de exemplo.
 */
export function renderEmail(source: string, locale: Locale): string {
  const body = source.replace(/\{\{\/\*[\s\S]*?\*\/\}\}\s*/g, "");
  const blocks = body.split(/\{\{\s*(?:if|else if)\s+eq \(printf "%v" \.Data\.locale\) "(?:es|en)"\s*\}\}|\{\{\s*else\s*\}\}|\{\{\s*end\s*\}\}/);
  // [antes, es, en, pt, depois]; um modelo sem blocos fica inteiro.
  const chosen = blocks.length === 5 ? blocks[locale === "es" ? 1 : locale === "en" ? 2 : 3] ?? "" : body;
  return chosen.trim().replace(/\{\{\s*\.(\w+)\s*\}\}/g, (match, name: string) => SAMPLE[name] ?? match);
}
