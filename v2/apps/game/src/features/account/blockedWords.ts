/**
 * Palavras que nunca entram num @ (D126): palavrões, termos sexuais, insultos
 * e ódio, em português, espanhol e inglês (os idiomas do jogo), mais os mais
 * comuns de francês, italiano e alemão.
 *
 * A mesma lista e as mesmas regras moram no banco (`privado.username_ofensivo`,
 * migração `..._palavras_bloqueadas.sql`): o navegador avisa na hora, e o
 * servidor recusa mesmo que alguém pule o navegador. Um teste confere que as
 * duas listas são iguais. Mudou aqui, muda lá numa migração nova.
 *
 * Como o jogador tenta disfarçar, o @ é lido de vários jeitos antes de
 * comparar: números viram letras (`put4`, `p0rra`, o `1` como `i` e como
 * `l`), os números somem (`puta123`), letras repetidas viram uma
 * (`puuuta`), e o `_` some (`p_u_t_a`) ou separa pedaços.
 *
 * Duas listas, para não barrar palavra inocente:
 * - `BLOCKED_PARTS`: proibidas em qualquer lugar do @ (longas o bastante para
 *   não aparecerem dentro de palavra comum).
 * - `BLOCKED_WORDS`: curtas ou com sentido inocente dentro de outra palavra
 *   ("cu" em "cuca", "puta" em "computador"): barram o @ inteiro ou um pedaço
 *   entre `_`; as de cinco letras ou mais também no começo ("viado123x"),
 *   nunca no fim ("desviado" passa).
 */

export const BLOCKED_PARTS: readonly string[] = [
  // português
  "caralh", "buceta", "boceta", "xoxota", "xereca", "siririca", "punheta", "piroca", "porra", "foder", "fodase", "fodido",
  "fudido", "arrombad", "cuzao", "cuzinho", "viadinho", "viadao", "vagabunda", "merda", "bosta", "cacete",
  "puteiro", "putaria", "prostitut", "estupr", "pedofil", "retardad", "mongoloid", "sapatao", "traveco", "boquete",
  "chupapica", "filhodaputa", "filhadaputa", "corninho",
  // español
  "chingad", "chingar", "chingon", "joder", "jodido", "mierda", "culero", "culiao", "culiado", "maricon", "gilipolla",
  "malparid", "hijueputa", "hijodeputa", "mamahuevo", "huevon", "pelotud", "pajero", "panocha", "pendej", "cabron",
  "putita", "zorra", "violador",
  // english
  "fuck", "shit", "bitch", "cunt", "asshole", "bastard", "whore", "pussy", "cocksuck", "motherf", "nigg", "fagg",
  "faggot", "retard", "hitler", "porn", "wank", "twat", "dildo", "blowjob", "handjob", "jerkoff", "bollock",
  "pedophil", "molest",
  // français, italiano, deutsch
  "putain", "salope", "connard", "encule", "niquetamere", "vaffancul", "fancul", "minchia", "puttana", "stronz", "scheiss",
  "fotze", "wichser", "arschloch", "ficken",
];

export const BLOCKED_WORDS: readonly string[] = [
  // português
  "puta", "putas", "puto", "putos", "putinha", "putao", "cu", "cus", "pau", "paus", "rola", "rolas", "viado", "viada",
  "vadia", "vadias", "bicha", "corno", "fdp", "vsf", "pqp", "tnc", "vtnc", "krl", "crl", "prr",
  // español
  "verga", "polla", "marica", "pinche", "hdp", "ctm", "ptm", "culo",
  // english
  "fag", "fags", "dick", "dicks", "cock", "cocks", "cum", "tits", "titties", "boobs", "anal", "slut", "sluts", "slutty",
  "nazi", "nazis", "rape", "penis", "kkk", "hoe", "hoes", "jizz",
  // français, italiano, deutsch
  "pute", "nique", "niquer", "cazzo", "hure",
];

/** Números como letras: 0 o, 1 i, 2 z, 3 e, 4 a, 5 s, 6 g, 7 t, 8 b, 9 g. */
const LEET_I: Readonly<Record<string, string>> = { "0": "o", "1": "i", "2": "z", "3": "e", "4": "a", "5": "s", "6": "g", "7": "t", "8": "b", "9": "g" };

function leet(text: string, one: "i" | "l"): string {
  return text.replace(/[0-9]/g, (digit) => (digit === "1" ? one : LEET_I[digit] ?? digit));
}

/** Letras repetidas viram uma: `puuuta` lê como `puta`. */
function squash(text: string): string {
  return text.replace(/(.)\1+/g, "$1");
}

/** Os jeitos de ler um pedaço do @: com os números como letras, sem os números, e com as repetições juntas. */
function readings(piece: string): string[] {
  const raw = [leet(piece, "i"), leet(piece, "l"), piece.replace(/[0-9]/g, "")];
  return [...new Set([...raw, ...raw.map(squash)])].filter((form) => form.length > 0);
}

/** O @ tem palavra bloqueada? Recebe o @ já em minúsculas (só `a-z`, `0-9` e `_`). */
export function isOffensiveUsername(username: string): boolean {
  const name = username.toLowerCase();
  const pieces = [...name.split("_"), name.replaceAll("_", "")].filter((piece) => piece.length > 0);
  const forms = pieces.flatMap(readings);
  if (forms.some((form) => BLOCKED_PARTS.some((part) => form.includes(part)))) return true;
  return forms.some((form) =>
    BLOCKED_WORDS.some((word) => form === word || (word.length >= 5 && form.startsWith(word))),
  );
}
