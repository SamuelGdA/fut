// Monta os elencos do Técnico a partir das fontes versionadas (D52).
//
//   pnpm elencos:montar            grava data/squads/*.ts e o relatório
//   pnpm elencos:montar --checar   remonta em memória e falha se os arquivos
//                                  versionados estiverem diferentes
//
// Ordem das camadas, por clube do jogo:
// 1. EA FC 27 (data/fontes/fc27.csv): o OVR do FC. O FC 27 também decide em
//    que clube cada jogador está: quem aparece no FC em outro clube (mesmo
//    numa liga fora do jogo) não entra por outra fonte.
// 2. eFootball (data/fontes/efootball.json): só em clube com menos de
//    EF_THRESHOLD jogadores do FC 27, só jogadores reais, com o OVR da carta
//    base + EF_BONUS (pedido do usuário).
// 3. Conhecimento (data/fontes/conhecimento/*.json): jogadores reais escritos
//    à mão, com OVR estimado pela âncora do clube e pelo papel indicado.
// 4. Gerados: o que ainda faltar para TARGET jogadores e a composição
//    mínima. Não têm nome nos dados: o jogo dá um nome da cultura do país
//    pelo id (`g:<clube>:<n>`), sempre o mesmo.
//
// A âncora de OVR de cada clube é a força dele no Craque somada ao
// deslocamento medido na liga (média dos 14 melhores dos clubes cobertos
// menos a força deles), para os elencos completados ficarem na mesma escala
// dos reais da mesma liga.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  FONTES,
  POSITION_GROUP,
  POSITIONS,
  SQUADS,
  fail,
  fold,
  parseCsv,
  readJson,
  surnameKey,
  worldClubs,
  worldCountries,
  worldLeagues,
  writeText,
} from "./comum.mjs";

/** Ano de referência das idades: a primeira temporada do Técnico. */
const SEASON_YEAR = 2026;
/** Ajuste da carta base do eFootball (pedido do usuário). */
const EF_BONUS = 4;
/** Abaixo disso, o clube recebe o elenco real do eFootball. */
const EF_THRESHOLD = 20;
/** Tamanho mínimo do elenco depois de todas as camadas. */
const TARGET = 22;
/** Teto de jogadores acima de YOUTH_AGE no elenco inicial; os cortados ficam livres. */
const SENIOR_CAP = 30;
const YOUTH_AGE = 21;
/** Composição mínima por grupo (posição principal; alternativas contam para o ataque). */
const MIN_COMPOSITION = { gk: 2, def: 6, mid: 6, att: 3 };
/** Distribuição ideal usada para escolher a posição dos gerados. */
const IDEAL_SHARE = { gk: 3 / 22, def: 7 / 22, mid: 7 / 22, att: 5 / 22 };
/** OVR da camada conhecimento pelo papel, em relação à âncora do clube. */
const LEVEL_OFFSET = { destaque: 3, titular: 0, rotacao: -3, reserva: -6, jovem: -8 };
/** Limites de OVR aceitos na saída. */
const OVR_RANGE = { min: 40, max: 95 };

const FC_POSITION = { CF: "st", LWB: "lb", RWB: "rb" };
const EF_POSITION = {
  GK: "gk",
  CB: "cb",
  LB: "lb",
  RB: "rb",
  DMF: "cdm",
  CMF: "cm",
  AMF: "cam",
  LMF: "lm",
  RMF: "rm",
  LWF: "lw",
  RWF: "rw",
  SS: "st",
  CF: "st",
};

// ------------------------------------------------------------- utilidades

function hash(text) {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193) >>> 0;
  }
  return value >>> 0;
}

/** Número em [0, 1) fixo para um texto. */
function unit(text) {
  return hash(text) / 2 ** 32;
}

function clampOvr(value) {
  return Math.max(OVR_RANGE.min, Math.min(OVR_RANGE.max, Math.round(value)));
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function best14(players) {
  return mean(
    players
      .map((player) => player.ovr)
      .sort((a, b) => b - a)
      .slice(0, 14),
  );
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

// ----------------------------------------------------------------- leitura

const clubs = worldClubs();
const clubById = new Map(clubs.map((club) => [club.id, club]));
const leagues = worldLeagues();
const countries = worldCountries();
const countryByEnglish = new Map(countries.map((country) => [country.names.en, country.code]));
const countryCodes = new Set(countries.map((country) => country.code));
const aliases = readJson(new URL("aliases.json", FONTES));
const nationalityMaps = readJson(new URL("nacionalidades.json", FONTES));
const identityOverrides = existsSync(new URL("identidades.json", FONTES))
  ? readJson(new URL("identidades.json", FONTES)).casos ?? {}
  : {};

function nationality(name, source) {
  const mapped = nationalityMaps[source]?.[name] ?? countryByEnglish.get(name);
  if (!mapped || !countryCodes.has(mapped)) fail(`nacionalidade desconhecida (${source}): ${name}`);
  return mapped;
}

function leagueOf(club) {
  return leagues.find((league) => league.country === club.country && league.division === club.division);
}

// --------------------------------------------------------------- FC 27

const fcRows = parseCsv(readFileSync(new URL("fc27.csv", FONTES), "utf8"));
const fcPlayers = [];
const undecided = [];
for (const row of fcRows) {
  const key = `${row.league}|${row.club}`;
  let club = null;
  if (key in aliases.fc27) club = aliases.fc27[key];
  else if (fcRows.length && isRelevantLeague(row.league)) undecided.push(key);
  const position = FC_POSITION[row.position] ?? row.position.toLowerCase();
  if (!POSITIONS.includes(position)) fail(`posição desconhecida no FC 27: ${row.position}`);
  const alternates = row.alternate_positions
    .split(/\s+/)
    .filter(Boolean)
    .map((value) => FC_POSITION[value] ?? value.toLowerCase())
    .filter((value) => POSITIONS.includes(value) && value !== position);
  const name = row.common_name || `${row.first_name} ${row.last_name}`.trim();
  const birthYear = Number(row.birthdate.slice(0, 4));
  if (!Number.isFinite(birthYear) || birthYear < 1970) fail(`nascimento inválido no FC 27: ${name}`);
  fcPlayers.push({
    id: `fc:${row.player_id}`,
    name,
    first: row.first_name,
    position,
    alternates: [...new Set(alternates)],
    ovr: Number(row.overall_rating),
    birthYear,
    nationality: nationality(row.nationality, "fc27"),
    club,
    origin: "f",
    approximateBirth: false,
    traitHints: {
      pace: Number(row.pace) || 0,
      setPiece: Number(row.skill_fk_accuracy) || 0,
      heading: Number(row.attacking_heading_accuracy) || 0,
      jumping: Number(row.power_jumping) || 0,
      stamina: Number(row.power_stamina) || 0,
      composure: Number(row.mentality_composure) || 0,
      playstyles: row.playstyles
        .split(",")
        .map((value) => value.trim().replace(/\+$/, ""))
        .filter(Boolean),
      captain: false,
    },
  });
}

function isRelevantLeague(league) {
  return Object.keys(aliases.fc27).some((key) => key.startsWith(`${league}|`));
}

if (undecided.length) fail(`clubes do FC 27 sem decisão em aliases.json:\n${[...new Set(undecided)].join("\n")}`);

// Índice de identidade: todos os homens do FC 27, inclusive fora do mundo do jogo.
const fcBySurname = new Map();
for (const player of fcPlayers) {
  const key = surnameKey(player.name);
  if (!fcBySurname.has(key)) fcBySurname.set(key, []);
  fcBySurname.get(key).push(player);
}

function groupOf(position) {
  return POSITION_GROUP[position];
}

/**
 * Procura no FC 27 a mesma pessoa de outra fonte. Pontua nacionalidade, ano
 * de nascimento (±1, porque o eFootball só dá a idade), nome e grupo de
 * posição; o nome precisa contribuir, para "Pedro" não virar "João Pedro".
 */
function matchFc(candidate) {
  const forced = identityOverrides[candidate.id];
  if (forced === "distinto") return null;
  if (forced) return fcPlayers.find((player) => player.id === forced) ?? fail(`identidade forçada inválida: ${forced}`);
  const folded = fold(candidate.name);
  const initial = folded[0];
  let best = null;
  let bestScore = 0;
  for (const player of fcBySurname.get(surnameKey(candidate.name)) ?? []) {
    const fcFolded = fold(player.name);
    const fullFolded = fold(`${player.first} ${player.name}`);
    let nameScore = 0;
    if (fcFolded === folded || fullFolded === folded || fold(`${player.first} ${surnameKey(player.name)}`) === folded) nameScore = 2;
    else if (fcFolded[0] === initial || fold(player.first)[0] === initial) nameScore = 1;
    if (nameScore === 0) continue;
    const score =
      nameScore +
      (player.nationality === candidate.nationality ? 2 : 0) +
      (Math.abs(player.birthYear - candidate.birthYear) <= 1 ? 2 : 0) +
      (groupOf(player.position) === groupOf(candidate.position) ? 1 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = player;
    }
  }
  return bestScore >= 6 ? best : null;
}

// ------------------------------------------------------------- eFootball

const efootball = readJson(new URL("efootball.json", FONTES));
const efByClub = new Map();
const efDiscarded = [];
const efSeen = new Set();
for (const team of efootball.times) {
  if (team.descartado) {
    efDiscarded.push({ club: team.clube, name: team.nome, reason: team.descartado });
    continue;
  }
  if (!clubById.has(team.clube)) fail(`clube desconhecido no eFootball: ${team.clube}`);
  const players = [];
  for (const raw of team.jogadores) {
    if (efSeen.has(raw.pesId)) continue;
    efSeen.add(raw.pesId);
    const position = EF_POSITION[raw.posicao];
    if (!position) fail(`posição desconhecida no eFootball: ${raw.posicao}`);
    players.push({
      id: `ef:${raw.pesId}`,
      name: raw.nome,
      first: raw.nome.split(" ")[0] ?? "",
      position,
      alternates: [...new Set(raw.alternativas.map((value) => EF_POSITION[value]).filter((value) => value && value !== position))],
      ovrBase: raw.ovrBase,
      ovr: raw.ovrBase + EF_BONUS,
      birthYear: SEASON_YEAR - raw.idade,
      nationality: nationality(raw.nacionalidade, "efootball"),
      club: team.clube,
      origin: "e",
      approximateBirth: true,
      traitHints: {
        pace: raw.velocidade ?? 0,
        setPiece: raw.bolaParada ?? 0,
        heading: raw.cabeceio ?? 0,
        jumping: raw.impulsao ?? 0,
        stamina: raw.folego ?? 0,
        composure: 0,
        playstyles: [],
        captain: raw.capitao,
      },
    });
  }
  efByClub.set(team.clube, players);
}

// ---------------------------------------------------------- conhecimento

const knowledgeDir = new URL("conhecimento/", FONTES);
const knowledgeByClub = new Map();
const knowledgeLevels = Object.keys(LEVEL_OFFSET);
if (existsSync(knowledgeDir)) {
  for (const file of readdirSync(knowledgeDir).filter((name) => name.endsWith(".json")).sort()) {
    const doc = readJson(new URL(file, knowledgeDir));
    for (const [clubId, entries] of Object.entries(doc.clubes ?? {})) {
      if (!clubById.has(clubId)) fail(`clube desconhecido em conhecimento/${file}: ${clubId}`);
      const list = knowledgeByClub.get(clubId) ?? [];
      for (const entry of entries) {
        if (!POSITIONS.includes(entry.posicao)) fail(`posição inválida em ${file}: ${entry.nome} (${entry.posicao})`);
        if (!knowledgeLevels.includes(entry.nivel)) fail(`nível inválido em ${file}: ${entry.nome} (${entry.nivel})`);
        if (!countryCodes.has(entry.nacionalidade)) fail(`nacionalidade inválida em ${file}: ${entry.nome}`);
        if (!Number.isInteger(entry.nascimento) || entry.nascimento < 1980 || entry.nascimento > 2010) {
          fail(`nascimento inválido em ${file}: ${entry.nome}`);
        }
        list.push({ ...entry, file });
      }
      knowledgeByClub.set(clubId, list);
    }
  }
}

// --------------------------------------------------------------- montagem

const squads = new Map(clubs.map((club) => [club.id, []]));
for (const player of fcPlayers) {
  if (player.club) squads.get(player.club).push(player);
}
const fcCount = new Map(clubs.map((club) => [club.id, squads.get(club.id).length]));

const identityLog = [];
for (const [clubId, players] of efByClub) {
  if (fcCount.get(clubId) >= EF_THRESHOLD) continue;
  for (const player of players) {
    const same = matchFc(player);
    if (same) {
      identityLog.push({ source: player, fc: same });
      continue;
    }
    squads.get(clubId).push(player);
  }
}

// Calibração: diferença entre o FC 27 e a carta base + 4 em quem está nas duas fontes.
const calibration = [];
for (const players of efByClub.values()) {
  for (const player of players) {
    const same = matchFc(player);
    if (same) calibration.push(same.ovr - player.ovr);
  }
}

// Âncora por liga, medida nos clubes com elenco real suficiente.
const leagueOffset = new Map();
for (const league of leagues) {
  const deltas = clubs
    .filter((club) => club.country === league.country && club.division === league.division)
    .filter((club) => squads.get(club.id).length >= 16)
    .map((club) => best14(squads.get(club.id)) - club.strength);
  leagueOffset.set(league.id, { value: median(deltas), clubs: deltas.length });
}

/**
 * Liga com poucos clubes medidos não serve de régua: na 2ª divisão da
 * Colômbia, os três medidos são clubes que estão na elite de verdade e
 * puxariam todos os gerados para cima. Abaixo de MIN_MEASURED, vale a 1ª.
 */
const MIN_MEASURED = 5;

function anchorOf(club) {
  const own = leagueOffset.get(leagueOf(club).id);
  if (own.value !== null && (own.clubs >= MIN_MEASURED || club.division === 1 && own.clubs >= 3)) return club.strength + own.value;
  const first = leagues.find((league) => league.country === club.country && league.division === 1);
  const top = leagueOffset.get(first.id);
  return club.strength + (top.value ?? 0);
}

for (const club of clubs) {
  const squad = squads.get(club.id);
  if (squad.length >= TARGET) continue;
  const anchor = anchorOf(club);
  for (const entry of knowledgeByClub.get(club.id) ?? []) {
    const candidate = {
      id: `k:${club.id}:${fold(entry.nome).replaceAll(" ", "-")}`,
      name: entry.nome,
      first: entry.nome.split(" ")[0] ?? "",
      position: entry.posicao,
      alternates: (entry.alternativas ?? []).filter((value) => POSITIONS.includes(value) && value !== entry.posicao),
      ovr: clampOvr(anchor + LEVEL_OFFSET[entry.nivel] + (unit(`k:${club.id}:${entry.nome}`) * 3 - 1.5)),
      birthYear: entry.nascimento,
      nationality: entry.nacionalidade,
      club: club.id,
      origin: "k",
      approximateBirth: true,
      traitHints: { pace: 0, setPiece: 0, heading: 0, jumping: 0, stamina: 0, composure: 0, playstyles: [], captain: false },
    };
    if (squad.some((player) => fold(player.name) === fold(candidate.name))) continue;
    const same = matchFc(candidate);
    if (same) {
      identityLog.push({ source: candidate, fc: same });
      continue;
    }
    squad.push(candidate);
  }
}

// Teto de veteranos: os de menor OVR acima de YOUTH_AGE saem para os livres.
const freeAgents = [];
for (const club of clubs) {
  const squad = squads.get(club.id);
  const seniors = squad.filter((player) => SEASON_YEAR - player.birthYear > YOUTH_AGE).sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id));
  for (const cut of seniors.slice(SENIOR_CAP)) {
    squad.splice(squad.indexOf(cut), 1);
    freeAgents.push({ ...cut, club: "" });
  }
}

function composition(squad) {
  const count = { gk: 0, def: 0, mid: 0, att: 0 };
  for (const player of squad) {
    const group = groupOf(player.position);
    count[group] += 1;
    if (group === "mid" && player.alternates.some((value) => groupOf(value) === "att")) count.att += 0.5;
  }
  return count;
}

const GROUP_POSITIONS = {
  gk: ["gk"],
  def: ["cb", "cb", "lb", "rb"],
  mid: ["cm", "cdm", "cam", "lm", "rm"],
  att: ["st", "lw", "rw", "st"],
};

/** Jogadores gerados para completar o elenco, sempre os mesmos para o mesmo clube. */
for (const club of clubs) {
  const squad = squads.get(club.id);
  const anchor = anchorOf(club);
  let index = 1;
  const add = (group) => {
    const id = `g:${club.id}:${index}`;
    index += 1;
    const options = GROUP_POSITIONS[group];
    const position = options[Math.floor(unit(`${id}:pos`) * options.length)];
    const depth = squad.length;
    const curve = depth < 11 ? 1 - depth * 0.25 : -3 - (depth - 11) * 0.45;
    const age = 18 + Math.floor(unit(`${id}:age`) * 15);
    const youth = age <= 20 ? -3 : 0;
    squad.push({
      id,
      name: "",
      first: "",
      position,
      alternates: [],
      ovr: clampOvr(anchor + curve + youth + (unit(`${id}:ovr`) * 4 - 2)),
      birthYear: SEASON_YEAR - age,
      nationality: club.country,
      club: club.id,
      origin: "g",
      approximateBirth: false,
      traitHints: { pace: 0, setPiece: 0, heading: 0, jumping: 0, stamina: 0, composure: 0, playstyles: [], captain: false },
    });
  };
  for (const [group, minimum] of Object.entries(MIN_COMPOSITION)) {
    while (composition(squad)[group] < minimum) add(group);
  }
  while (squad.length < TARGET) {
    const count = composition(squad);
    const total = squad.length + 1;
    const group = Object.keys(IDEAL_SHARE).sort(
      (a, b) => count[a] / total - IDEAL_SHARE[a] - (count[b] / total - IDEAL_SHARE[b]) || a.localeCompare(b),
    )[0];
    add(group);
  }
}

// ------------------------------------------------------- características

/**
 * Poucas e duradouras (spec 7). Cada uma usa números que as fontes reais têm;
 * os limites deixam cada característica entre ~2% e ~8% dos jogadores.
 * Gerados e conhecimento começam sem características: ganham jogando.
 */
function traitsOf(player, squad) {
  const hints = player.traitHints;
  const out = [];
  const field = player.position !== "gk";
  if (field && (hints.pace >= 89 || hints.playstyles.includes("Rapid") && hints.pace >= 85)) out.push("fast");
  if (field && (hints.setPiece >= 84 || hints.playstyles.includes("Dead Ball"))) out.push("setPiece");
  if (hints.playstyles.includes("Gamechanger") && player.ovr >= 70) out.push("clutch");
  if (["cb", "st", "cdm"].includes(player.position) && hints.heading >= 80 && hints.jumping >= 82) out.push("aerial");
  if (field && hints.stamina >= 91) out.push("tireless");
  const groups = new Set([groupOf(player.position), ...player.alternates.map(groupOf)]);
  if (field && groups.size >= 3) out.push("versatile");
  if (isLeader(player, squad)) out.push("leader");
  return out.slice(0, 2);
}

function isLeader(player, squad) {
  if (player.origin === "g" || player.origin === "k") return false;
  if (player.traitHints.captain) return true;
  const age = SEASON_YEAR - player.birthYear;
  if (age < 28) return false;
  // O mais experiente entre os cinco melhores do elenco, com calma para comandar.
  const top = [...squad].sort((a, b) => b.ovr - a.ovr).slice(0, 5);
  if (!top.includes(player)) return false;
  const veteran = top.filter((other) => SEASON_YEAR - other.birthYear >= 28).sort((a, b) => a.birthYear - b.birthYear || b.ovr - a.ovr)[0];
  return veteran === player && (player.traitHints.composure >= 75 || player.origin === "e");
}

// ------------------------------------------------------------------ saída

function rowOf(player, traits) {
  return [
    player.id,
    player.club,
    player.name,
    player.position,
    player.alternates.join(","),
    player.ovr,
    player.birthYear,
    player.nationality,
    player.origin,
    traits.join(","),
  ];
}

const byCountry = new Map();
for (const club of clubs) {
  const squad = squads.get(club.id).sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id));
  const rows = byCountry.get(club.country) ?? [];
  for (const player of squad) {
    if (player.ovr < OVR_RANGE.min || player.ovr > OVR_RANGE.max) fail(`OVR fora da faixa: ${player.id}`);
    rows.push(rowOf(player, traitsOf(player, squad)));
  }
  byCountry.set(club.country, rows);
}
const freeRows = freeAgents.sort((a, b) => a.id.localeCompare(b.id)).map((player) => rowOf(player, traitsOf(player, [player])));

// Unicidade: nenhum id repetido, nenhum jogador em dois clubes.
const seenIds = new Set();
for (const rows of [...byCountry.values(), freeRows]) {
  for (const row of rows) {
    if (seenIds.has(row[0])) fail(`jogador repetido: ${row[0]}`);
    seenIds.add(row[0]);
  }
}

function moduleText(rows, label) {
  const json = JSON.stringify(rows).replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("${", "\\${");
  return [
    "// Gerado por packages/world/scripts/elencos/montar.mjs (pnpm elencos:montar). Não edite à mão.",
    `// ${label}. Linhas: [id, clube, nome, posição, alternativas, OVR, nascimento, nacionalidade, origem, características].`,
    "// Texto JSON em vez de literal: o TypeScript não precisa inferir milhares de tuplas.",
    `export default \`${json}\`;`,
    "",
  ].join("\n");
}

const outputs = new Map();
for (const [country, rows] of [...byCountry.entries()].sort()) {
  outputs.set(`${country.toLowerCase()}.ts`, moduleText(rows, `Elencos de ${country}`));
}
outputs.set("livres.ts", moduleText(freeRows, "Jogadores sem clube no início (cortados pelo teto de veteranos)"));
outputs.set("relatorio.md", report());

function pct(part, total) {
  return total ? `${Math.round((part / total) * 100)}%` : "0%";
}

function report() {
  const lines = [
    "# Elencos do Técnico: relatório da montagem",
    "",
    "Gerado por `pnpm elencos:montar`. Fontes, ordem das camadas e regras na D52 (docs/DECISOES.md).",
    "",
    `- FC 27: ${fcPlayers.length} jogadores masculinos lidos; ${fcPlayers.filter((player) => player.club).length} em clubes do jogo.`,
    `- eFootball: coleta de ${efootball.coletadoEm} (build ${efootball.buildId}); OVR = carta base + ${EF_BONUS}; usado em clubes com menos de ${EF_THRESHOLD} jogadores do FC 27.`,
    `- Times do eFootball descartados por terem jogadores fictícios: ${efDiscarded.map((team) => `${team.name} (${team.club})`).join(", ") || "nenhum"}.`,
    `- Calibração: em ${calibration.length} jogadores presentes nas duas fontes, FC 27 menos (base + ${EF_BONUS}) tem mediana ${round1(median(calibration) ?? 0)} e média ${round1(mean(calibration))}.`,
    `- Livres no início (teto de ${SENIOR_CAP} acima de ${YOUTH_AGE} anos): ${freeRows.length}.`,
    "",
    "## Por país e divisão",
    "",
    "| País | Div. | Clubes | Jogadores | FC 27 | eFootball | Conhecimento | Gerados | Reais | Deslocamento da liga |",
    "|---|---|---|---|---|---|---|---|---|---|",
  ];
  for (const league of [...leagues].sort((a, b) => a.country.localeCompare(b.country) || a.division - b.division)) {
    const leagueClubs = clubs.filter((club) => club.country === league.country && club.division === league.division);
    const all = leagueClubs.flatMap((club) => squads.get(club.id));
    const count = (origin) => all.filter((player) => player.origin === origin).length;
    const offset = leagueOffset.get(league.id);
    lines.push(
      `| ${league.country} | ${league.division} | ${leagueClubs.length} | ${all.length} | ${count("f")} | ${count("e")} | ${count("k")} | ${count("g")} | ${pct(all.length - count("g"), all.length)} | ${offset.value === null ? "sem medida" : `${round1(offset.value)} (${offset.clubs} clubes)`} |`,
    );
  }
  lines.push("", "## Por clube", "", "| Clube | País | Div. | Força | Âncora | Melhores 14 | FC 27 | eFootball | Conhecimento | Gerados |", "|---|---|---|---|---|---|---|---|---|---|");
  for (const club of [...clubs].sort((a, b) => a.country.localeCompare(b.country) || a.division - b.division || b.strength - a.strength)) {
    const squad = squads.get(club.id);
    const count = (origin) => squad.filter((player) => player.origin === origin).length;
    lines.push(
      `| ${club.name} | ${club.country} | ${club.division} | ${club.strength} | ${round1(anchorOf(club))} | ${round1(best14(squad))} | ${count("f")} | ${count("e")} | ${count("k")} | ${count("g")} |`,
    );
  }
  const traitCount = new Map();
  let total = 0;
  for (const rows of byCountry.values()) {
    for (const row of rows) {
      total += 1;
      for (const trait of row[9].split(",").filter(Boolean)) traitCount.set(trait, (traitCount.get(trait) ?? 0) + 1);
    }
  }
  lines.push("", "## Características iniciais", "", "| Característica | Jogadores | Fatia |", "|---|---|---|");
  for (const [trait, count] of [...traitCount.entries()].sort()) lines.push(`| ${trait} | ${count} | ${pct(count, total)} |`);
  lines.push("", "## Identidades casadas com o FC 27 (fora do clube da outra fonte)", "");
  for (const { source, fc } of identityLog.sort((a, b) => a.source.id.localeCompare(b.source.id))) {
    lines.push(`- ${source.name} (${source.id}, ${source.club}) = ${fc.name} (${fc.id}, ${fc.club ?? "fora do jogo"})`);
  }
  lines.push("");
  return lines.join("\n");
}

const check = process.argv.includes("--checar");
let stale = [];
for (const [file, text] of outputs) {
  const url = new URL(file, SQUADS);
  if (check) {
    const current = existsSync(url) ? readFileSync(url, "utf8") : null;
    if (current !== text) stale.push(file);
  } else {
    writeText(url, text);
  }
}
if (check && stale.length) fail(`elencos desatualizados (rode pnpm elencos:montar): ${stale.join(", ")}`);

const totals = { f: 0, e: 0, k: 0, g: 0 };
for (const rows of byCountry.values()) for (const row of rows) totals[row[8]] += 1;
console.log(
  `elencos: ${Object.values(totals).reduce((a, b) => a + b, 0)} jogadores em ${clubs.length} clubes ` +
    `(FC 27 ${totals.f}, eFootball ${totals.e}, conhecimento ${totals.k}, gerados ${totals.g}); livres ${freeRows.length}` +
    (check ? " (conferido)" : ""),
);
