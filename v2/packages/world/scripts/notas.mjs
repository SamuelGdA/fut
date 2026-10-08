// Notas dos clubes em CSV, para revisar e editar numa planilha.
//
//   pnpm notas:exportar   gera packages/world/data/clubes.csv
//   pnpm notas:importar   lê o CSV e grava força e prestígio de volta nos JSON
//
// O CSV sai no formato do Excel em português: separador ";", vírgula decimal
// e marca BOM para os acentos abrirem certos. A importação aceita também ","
// como separador e ponto decimal, e recusa o arquivo inteiro ao primeiro valor
// fora da faixa: nota pela metade é pior que nota nenhuma.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const DATA = new URL("../data/", import.meta.url);
const CLUBS_DIR = new URL("clubs/", DATA);
const CSV = new URL("clubes.csv", DATA);

const STRENGTH = { min: 40, max: 92 };
const PRESTIGE = { min: 1, max: 5 };
const HEADER = ["id", "pais", "divisao", "nome", "forca", "prestigio"];

function readJson(url) {
  return JSON.parse(readFileSync(url, "utf8"));
}

function writeJson(url, data) {
  writeFileSync(url, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function clubFiles() {
  return readdirSync(CLUBS_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => ({ name, url: new URL(name, CLUBS_DIR), country: name.slice(0, 3).toUpperCase() }));
}

function quote(value) {
  const text = String(value);
  return /[;"\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function exportCsv() {
  const rows = [];
  for (const file of clubFiles()) {
    for (const club of readJson(file.url)) {
      rows.push({ ...club, country: file.country });
    }
  }
  rows.sort(
    (a, b) =>
      a.country.localeCompare(b.country) || a.division - b.division || b.strength - a.strength || a.id.localeCompare(b.id),
  );
  const lines = [HEADER.join(";")];
  for (const club of rows) {
    lines.push(
      [club.id, club.country, club.division, club.name, club.strength, String(club.prestige).replace(".", ",")]
        .map(quote)
        .join(";"),
    );
  }
  writeFileSync(CSV, `\uFEFF${lines.join("\r\n")}\r\n`, "utf8");
  console.log(`clubes.csv gravado com ${rows.length} clubes.`);
}

function splitLine(line, separator) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"' && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === separator) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function parseNumber(text) {
  return Number(text.replace(",", "."));
}

function importCsv() {
  const raw = readFileSync(CSV, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const separator = lines[0]?.includes(";") ? ";" : ",";
  const header = splitLine(lines[0] ?? "", separator).map((cell) => cell.toLowerCase());
  const column = (name) => {
    const index = header.indexOf(name);
    if (index < 0) throw new Error(`coluna "${name}" não encontrada no CSV`);
    return index;
  };
  const idCol = column("id");
  const strengthCol = column("forca");
  const prestigeCol = column("prestigio");

  const updates = new Map();
  const errors = [];
  lines.slice(1).forEach((line, offset) => {
    const cells = splitLine(line, separator);
    const id = cells[idCol];
    const strength = parseNumber(cells[strengthCol] ?? "");
    const prestige = Math.round(parseNumber(cells[prestigeCol] ?? "") * 10) / 10;
    const where = `linha ${offset + 2} (${id})`;
    if (!id) errors.push(`${where}: id vazio`);
    if (!Number.isInteger(strength) || strength < STRENGTH.min || strength > STRENGTH.max) {
      errors.push(`${where}: força deve ser um inteiro de ${STRENGTH.min} a ${STRENGTH.max}`);
    }
    if (!Number.isFinite(prestige) || prestige < PRESTIGE.min || prestige > PRESTIGE.max) {
      errors.push(`${where}: prestígio deve ir de ${PRESTIGE.min} a ${PRESTIGE.max}`);
    }
    if (updates.has(id)) errors.push(`${where}: clube repetido`);
    updates.set(id, { strength, prestige });
  });

  const known = new Set();
  const files = clubFiles().map((file) => ({ ...file, clubs: readJson(file.url) }));
  for (const file of files) for (const club of file.clubs) known.add(club.id);
  for (const id of updates.keys()) if (!known.has(id)) errors.push(`clube desconhecido no CSV: ${id}`);
  for (const id of known) if (!updates.has(id)) errors.push(`clube ausente no CSV: ${id}`);

  if (errors.length > 0) {
    console.error(`Nada foi gravado. ${errors.length} problema(s):\n  ${errors.slice(0, 40).join("\n  ")}`);
    process.exitCode = 1;
    return;
  }

  let changed = 0;
  for (const file of files) {
    let touched = false;
    for (const club of file.clubs) {
      const next = updates.get(club.id);
      if (next.strength !== club.strength || next.prestige !== club.prestige) {
        club.strength = next.strength;
        club.prestige = next.prestige;
        touched = true;
        changed += 1;
      }
    }
    if (touched) writeJson(file.url, file.clubs);
  }
  console.log(changed === 0 ? "Nenhuma nota mudou." : `${changed} clube(s) atualizado(s).`);
}

const command = process.argv[2];
if (command === "exportar") exportCsv();
else if (command === "importar") importCsv();
else {
  console.error("Uso: node notas.mjs exportar | importar");
  process.exitCode = 1;
}
