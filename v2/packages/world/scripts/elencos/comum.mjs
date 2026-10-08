// Peças comuns dos scripts de elencos do Técnico (D52): caminhos, CSV,
// normalização de nomes e leitura dos dados do mundo.
//
// Os scripts são Node puro, sem dependência: rodam igual no Windows dos .bat.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const DATA = new URL("../../data/", import.meta.url);
export const FONTES = new URL("fontes/", DATA);
export const SQUADS = new URL("squads/", DATA);
export const CACHE = new URL("./.cache/", import.meta.url);

export function readJson(url) {
  return JSON.parse(readFileSync(url, "utf8"));
}

export function writeJson(url, data) {
  ensureDir(url);
  writeFileSync(url, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function writeText(url, text) {
  ensureDir(url);
  writeFileSync(url, text, "utf8");
}

export function ensureDir(url) {
  const dir = dirname(fileURLToPath(url));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function fail(message) {
  console.error(`elencos: ${message}`);
  process.exit(1);
}

// ------------------------------------------------------------------- CSV

/** CSV no formato RFC 4180 (vírgula, aspas dobradas), com cabeçalho. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += char;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows;
  if (!header) return [];
  return body.map((cells) => Object.fromEntries(header.map((name, index) => [name, cells[index] ?? ""])));
}

function quote(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(header, rows) {
  const lines = [header.join(",")];
  for (const row of rows) lines.push(header.map((name) => quote(row[name])).join(","));
  return `${lines.join("\n")}\n`;
}

// ---------------------------------------------------------------- nomes

/** Sem acento, minúsculo, só letras, números e espaço. */
export function fold(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Último token do nome: o sobrenome que aparece na camisa na maior parte dos casos. */
export function surnameKey(name) {
  const parts = fold(name).split(" ").filter(Boolean);
  return parts.at(-1) ?? "";
}

// --------------------------------------------------------------- mundo

export function worldClubs() {
  const dir = new URL("clubs/", DATA);
  const clubs = [];
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".json")).sort()) {
    const country = file.slice(0, 3).toUpperCase();
    for (const club of readJson(new URL(file, dir))) clubs.push({ ...club, country });
  }
  return clubs;
}

export function worldLeagues() {
  return readJson(new URL("leagues.json", DATA));
}

export function worldCountries() {
  return readJson(new URL("countries.json", DATA));
}

/** Posições do motor (`player/positions.ts`), em minúsculas. */
export const POSITIONS = ["gk", "cb", "lb", "rb", "cdm", "cm", "cam", "lm", "rm", "lw", "rw", "st"];

/** Grupo de cada posição, para composição mínima e casamento de identidade. */
export const POSITION_GROUP = {
  gk: "gk",
  cb: "def",
  lb: "def",
  rb: "def",
  cdm: "mid",
  cm: "mid",
  cam: "mid",
  lm: "mid",
  rm: "mid",
  lw: "att",
  rw: "att",
  st: "att",
};
