import { readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { extname, join, relative, sep } from "node:path";

/**
 * As peças puras do importador de imagens (`pnpm imagens:importar`, D115):
 * onde ficam as imagens geradas, como cada arquivo vira um clube, uma liga,
 * um troféu ou um prêmio, a conferência do SVG e a troca da extensão nos
 * dados sem mexer no resto do arquivo. Nada aqui escreve no disco nem abre
 * navegador; o `importar-imagens.mjs` faz isso.
 */

/** Extensões aceitas na pasta de origem. */
export const SOURCE_EXTENSIONS = [".svg", ".png", ".jpg", ".jpeg", ".webp"];

/** Escudos e selos saem com 512 px de altura; troféus e prêmios com 480 (D108 e D111). */
export const TARGET_HEIGHT = { clube: 512, liga: 512, trofeu: 480, premio: 480 };

/** Um SVG acima disto é pesado demais para um escudo. */
export const SVG_MAX_BYTES = 80 * 1024;

/**
 * A pasta das imagens geradas. Sem `--origem` nem `FUTEIROS_GERADAS`, é a
 * pasta `Downloads/geradas` do usuário que roda o comando: no Windows,
 * `C:\Users\<usuário>\Downloads\geradas`. Nenhum caminho pessoal fica no código.
 */
export function defaultSourceDir(env = process.env, home = homedir()) {
  const configured = env.FUTEIROS_GERADAS?.trim();
  return configured ? configured : join(home, "Downloads", "geradas");
}

/** O mesmo apelido que os ids do mundo usam: minúsculas, sem acento, hífen entre as palavras. */
export function slug(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** As pastas aceitas na origem, com e sem acento, no singular ou no plural. */
const FOLDER_KIND = new Map([
  ["clubes", "clube"],
  ["clube", "clube"],
  ["escudos", "clube"],
  ["ligas", "liga"],
  ["liga", "liga"],
  ["selos", "liga"],
  ["trofeus", "trofeu"],
  ["trofeu", "trofeu"],
  ["premios", "premio"],
  ["premio", "premio"],
]);

export function folderKind(name) {
  return FOLDER_KIND.get(slug(name)) ?? null;
}

/**
 * Lê os dados do mundo direto dos JSON (o pacote `@craque/world` é
 * TypeScript): clubes por país e divisão, ligas e os arquivos de troféus e
 * prêmios já cadastrados.
 */
export function loadCatalog(worldData) {
  const leagues = JSON.parse(readFileSync(join(worldData, "leagues.json"), "utf8"));
  const files = JSON.parse(readFileSync(join(worldData, "trophy-files.json"), "utf8"));
  const clubs = [];
  for (const name of readdirSync(join(worldData, "clubs")).filter((file) => file.endsWith(".json")).sort()) {
    const country = name.replace(/\.json$/, "").toUpperCase();
    for (const club of JSON.parse(readFileSync(join(worldData, "clubs", name), "utf8"))) {
      clubs.push({ id: club.id, name: club.name, short: club.short, division: club.division, country, file: `clubs/${name}`, crest: club.crest });
    }
  }
  return {
    clubs,
    leagues: leagues.map((league) => ({ id: league.id, name: league.name, country: league.country, division: league.division, crest: league.crest, trophy: league.trophy })),
    trophies: Object.keys(files.trophies),
    awards: Object.keys(files.awards),
  };
}

const clubKeys = (club) => new Set([club.id, slug(club.name), slug(club.short)]);
const leagueKeys = (league) => new Set([league.id, slug(league.name)]);

/** A liga pelo nome da pasta (`clubes/Brasileirão/`) ou pelo id. */
export function findLeague(catalog, name) {
  const key = slug(name);
  return catalog.leagues.find((league) => leagueKeys(league).has(key)) ?? null;
}

/** Os clubes que o nome alcança, só na liga dada quando houver uma. */
export function findClubs(catalog, name, league = null) {
  const key = slug(name);
  const pool = league ? catalog.clubs.filter((club) => club.country === league.country && club.division === league.division) : catalog.clubs;
  return pool.filter((club) => clubKeys(club).has(key));
}

/**
 * O destino de um arquivo da origem: o que ele é, o id e onde gravar. Devolve
 * `{ error }` quando o nome não bate com nada ou bate com mais de um clube.
 *
 * `parts` é o caminho relativo dividido em pastas, com o arquivo no fim:
 * `["clubes", "Brasileirão", "Flamengo.svg"]`.
 */
export function resolveTarget(catalog, parts) {
  const file = parts[parts.length - 1];
  const extension = extname(file).toLowerCase();
  if (!SOURCE_EXTENSIONS.includes(extension)) return { error: "extensão não aceita" };
  const base = file.slice(0, -extension.length);
  const kind = parts.length > 1 ? folderKind(parts[0]) : null;
  const vector = extension === ".svg";

  if (kind === "liga") {
    const league = findLeague(catalog, base);
    return league ? { kind, id: league.id, name: league.name, vector } : { error: "liga não encontrada" };
  }
  if (kind === "trofeu") {
    const key = slug(base);
    if (catalog.trophies.includes(key)) return { kind, id: key, name: base, vector };
    const league = findLeague(catalog, base.replace(/^league-/i, ""));
    if (league) return { kind, id: `league-${league.id}`, league: league.id, name: league.name, vector };
    return { error: "troféu não encontrado (use o nome do arquivo atual ou o nome da liga)" };
  }
  if (kind === "premio") {
    const key = slug(base);
    return catalog.awards.includes(key) ? { kind, id: key, name: base, vector } : { error: "prêmio não encontrado" };
  }

  // Clube: dentro de `clubes/<Liga>/` procura só naquela liga; solto, no mundo todo.
  let league = null;
  if (kind === "clube" && parts.length > 2) {
    league = findLeague(catalog, parts[parts.length - 2]);
    if (!league) return { error: `liga "${parts[parts.length - 2]}" não encontrada` };
  }
  const clubs = findClubs(catalog, base, league);
  if (clubs.length === 1) return { kind: "clube", id: clubs[0].id, name: clubs[0].name, dataFile: clubs[0].file, vector };
  if (clubs.length > 1) return { error: `mais de um clube com esse nome (${clubs.map((club) => club.id).join(", ")}); ponha o arquivo em clubes/<Liga>/` };
  // Solto na raiz, pode ser o selo de uma liga.
  if (kind === null) {
    const loose = findLeague(catalog, base);
    if (loose) return { kind: "liga", id: loose.id, name: loose.name, vector };
  }
  return { error: "clube não encontrado" };
}

/** Todos os arquivos de imagem da origem, com o caminho relativo em partes. */
export function listSourceFiles(root) {
  const found = [];
  const walk = (folder) => {
    for (const name of readdirSync(folder).sort((a, b) => a.localeCompare(b))) {
      if (name.startsWith(".")) continue;
      const path = join(folder, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (SOURCE_EXTENSIONS.includes(extname(name).toLowerCase())) found.push({ path, parts: relative(root, path).split(sep) });
    }
  };
  walk(root);
  return found;
}

/**
 * Confere um SVG antes de entrar no jogo: sem script, sem imagem embutida,
 * sem objeto estrangeiro, sem evento, sem endereço externo, com `viewBox` e
 * leve. Devolve a lista de problemas (vazia quando está tudo certo).
 */
export function checkSvg(text, bytes = Buffer.byteLength(text)) {
  const problems = [];
  if (!/<svg[\s>]/i.test(text)) problems.push("não é um SVG");
  if (!/viewBox\s*=/.test(text)) problems.push("sem viewBox");
  if (/<script[\s>]/i.test(text)) problems.push("tem <script>");
  if (/<foreignObject[\s>]/i.test(text)) problems.push("tem <foreignObject>");
  if (/<image[\s>]/i.test(text)) problems.push("tem <image> embutida");
  if (/\son[a-z]+\s*=/i.test(text)) problems.push("tem atributo de evento (on...)");
  if (/(?:xlink:)?href\s*=\s*["']\s*(?:https?:|javascript:|data:)/i.test(text)) problems.push("aponta para fora do arquivo");
  if (/@import|url\(\s*["']?https?:/i.test(text)) problems.push("carrega estilo de fora");
  if (bytes > SVG_MAX_BYTES) problems.push(`pesado demais (${Math.round(bytes / 1024)} KB; limite ${SVG_MAX_BYTES / 1024} KB)`);
  return problems;
}

/** A extensão gravada: SVG fica SVG; escudo e selo viram PNG; troféu e prêmio viram WebP (D108 e D111). */
export function outputExtension(target) {
  if (target.vector) return "svg";
  return target.kind === "clube" || target.kind === "liga" ? "png" : "webp";
}

/** A pasta de `public/assets` de cada tipo. */
export function assetFolder(kind) {
  return { clube: "clubs", liga: "leagues", trofeu: "trophies", premio: "awards" }[kind];
}

/**
 * Troca `"campo": valor` no objeto de id dado, mexendo só nesse trecho do
 * arquivo: indentação, fins de linha e números como `1.0` continuam iguais.
 */
export function setObjectField(text, id, field, value) {
  const marker = new RegExp(`"id"\\s*:\\s*${JSON.stringify(id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  const start = text.search(marker);
  if (start < 0) throw new Error(`id ${id} não encontrado`);
  const rest = text.slice(start);
  const next = rest.slice(1).search(/"id"\s*:/);
  const end = next < 0 ? text.length : start + 1 + next;
  const block = text.slice(start, end);
  const pattern = new RegExp(`("${field}"\\s*:\\s*)(null|"[^"]*")`);
  if (!pattern.test(block)) throw new Error(`campo ${field} não encontrado em ${id}`);
  return text.slice(0, start) + block.replace(pattern, `$1${JSON.stringify(value)}`) + text.slice(end);
}

/** Troca a extensão de uma chave em `trophy-files.json` (troféus ou prêmios). */
export function setFileEntry(text, section, key, value) {
  const sectionStart = text.indexOf(`"${section}"`);
  if (sectionStart < 0) throw new Error(`seção ${section} não encontrada`);
  const pattern = new RegExp(`("${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*:\\s*)"[^"]*"`);
  const tail = text.slice(sectionStart);
  if (!pattern.test(tail)) throw new Error(`${key} não encontrado em ${section}`);
  return text.slice(0, sectionStart) + tail.replace(pattern, `$1${JSON.stringify(value)}`);
}
