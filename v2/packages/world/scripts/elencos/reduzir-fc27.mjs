// Reduz o players.csv do EA FC 27 à cópia versionada em data/fontes/fc27.csv.
//
//   node packages/world/scripts/elencos/reduzir-fc27.mjs <caminho do players.csv>
//
// Fica só o futebol masculino e só as colunas que a montagem usa; o resto
// (dezenas de atributos) não entra no jogo, que usa um OVR geral (D52).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { FONTES, fail, parseCsv, toCsv, writeJson, writeText } from "./comum.mjs";

const COLUMNS = [
  "player_id",
  "common_name",
  "first_name",
  "last_name",
  "overall_rating",
  "position",
  "alternate_positions",
  "club",
  "league",
  "nationality",
  "birthdate",
  "playstyles",
  "pace",
  "physicality",
  "skill_fk_accuracy",
  "attacking_heading_accuracy",
  "power_jumping",
  "power_stamina",
  "mentality_composure",
];

const source = process.argv[2];
if (!source) fail("informe o caminho do players.csv");

const rows = parseCsv(readFileSync(resolve(source), "utf8"));
if (rows.length === 0) fail("CSV vazio");
for (const column of [...COLUMNS, "gender", "snapshot_date", "edition"]) {
  if (!(column in rows[0])) fail(`coluna ausente: ${column}`);
}

const men = rows.filter((row) => row.gender !== "Women's Football");
const snapshots = [...new Set(men.map((row) => row.snapshot_date))];
const editions = [...new Set(men.map((row) => row.edition))];
men.sort((a, b) => Number(a.player_id) - Number(b.player_id));

const out = new URL("fc27.csv", FONTES);
writeText(out, toCsv(COLUMNS, men));
writeJson(new URL("fc27.meta.json", FONTES), {
  origem: "EA SPORTS FC 27 (players.csv enviado pelo usuário)",
  edicao: editions,
  snapshot: snapshots,
  jogadores: men.length,
  descartadas: rows.length - men.length,
  observacao: "Só futebol masculino e as colunas usadas pela montagem dos elencos do Técnico.",
});
console.log(`fc27.csv: ${men.length} jogadores (de ${rows.length}) em ${pathToFileURL(resolve(source)).pathname}`);
