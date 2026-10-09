// Coleta no efootballdb.com os elencos dos clubes que o FC 27 não cobre (D52).
//
//   pnpm elencos:coletar
//
// Para cada time listado em data/fontes/aliases.json (chave "efootball"):
// 1. a API pública do site traz o elenco atual (nome, idade, nacionalidade,
//    posições, alguns atributos);
// 2. o OVR da carta base (nível 1) não vem na API: o site o calcula no
//    navegador. Por isso a página /teams/profile?id= é aberta num Chromium
//    sem janela e o número é lido do jeito que aparece na aba de times.
//
// Times sem nomes licenciados no eFootball trazem jogadores inventados pela
// Konami (fake_version = 1). Esses jogadores nunca entram: o time fica no
// arquivo marcado como descartado, para o relatório mostrar o motivo.
//
// O +4 do pedido do usuário NÃO é somado aqui: a fonte guarda o número da
// carta, e a montagem aplica o ajuste, para ficar rastreável.
//
// Variáveis: EFOOTBALL_CHROMIUM (executável do Chromium) e PLAYWRIGHT_MODULE
// (caminho do pacote playwright) quando não estiverem no lugar padrão. Atrás
// de um proxy (HTTPS_PROXY), rode com NODE_USE_ENV_PROXY=1 para o fetch do Node
// usar o mesmo proxy.

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { CACHE, FONTES, fail, readJson, writeJson } from "./comum.mjs";

const SITE = "https://efootballdb.com";
const API = "https://api.efootballdb.com/api/2022/teams/";
const PAUSE_MS = 600;
const HEADERS = {
  Accept: "application/json",
  Origin: SITE,
  Referer: `${SITE}/`,
  "User-Agent": "Mozilla/5.0 (futeiros: coleta de elencos para um jogo sem fins lucrativos)",
};

const POSITION_FIELDS = ["gk", "cb", "lb", "rb", "dmf", "cmf", "lmf", "rmf", "amf", "lwf", "rwf", "ss", "cf"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: HEADERS });
      if (response.ok) return await response.json();
      if (response.status === 404) return null;
    } catch {
      // rede instável: tenta de novo com espera crescente
    }
    await sleep(1000 * 2 ** attempt);
  }
  return fail(`não consegui baixar ${url}`);
}

async function cachedTeam(pesId) {
  const file = new URL(`api/${pesId}.json`, CACHE);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  const data = await fetchJson(`${API}${pesId}`);
  writeJson(file, data);
  await sleep(PAUSE_MS);
  return data;
}

async function buildId() {
  const response = await fetch(`${SITE}/teams`, { headers: { "User-Agent": HEADERS["User-Agent"] } });
  const html = await response.text();
  const match = /"buildId":"([^"]+)"/.exec(html);
  return match?.[1] ?? null;
}

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [process.env.PLAYWRIGHT_MODULE, "playwright", "/opt/node22/lib/node_modules/playwright"].filter(Boolean);
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      // tenta o próximo
    }
  }
  return fail("playwright não encontrado; defina PLAYWRIGHT_MODULE");
}

function chromiumPath() {
  const candidates = [process.env.EFOOTBALL_CHROMIUM, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].filter(Boolean);
  return candidates.find((path) => existsSync(path));
}

/** Lê o OVR da carta base como a aba de times mostra, por pes_id do jogador. */
async function baseRatings(browser, pesId) {
  const file = new URL(`aba/${pesId}.json`, CACHE);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  const page = await browser.newPage({ userAgent: HEADERS["User-Agent"] });
  try {
    await page.goto(`${SITE}/teams/profile?id=${pesId}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForSelector(".squad-item-overall", { timeout: 90_000 });
    const rows = await page.$$eval(".squad-item", (items) =>
      items.map((item) => ({
        href: item.querySelector("a")?.getAttribute("href") ?? "",
        ovr: item.querySelector(".squad-item-overall")?.textContent ?? "",
      })),
    );
    const ratings = {};
    for (const row of rows) {
      const id = /id=(\d+)/.exec(row.href)?.[1];
      const ovr = Number.parseInt(row.ovr, 10);
      if (id && Number.isFinite(ovr)) ratings[id] = ovr;
    }
    writeJson(file, ratings);
    await sleep(PAUSE_MS);
    return ratings;
  } finally {
    await page.close();
  }
}

function alternatives(player) {
  const main = String(player.main_position_text ?? "").toLowerCase();
  return POSITION_FIELDS.filter((field) => field !== main && Number(player[field]) >= 1).map((field) => field.toUpperCase());
}

async function main() {
  const aliases = readJson(new URL("aliases.json", FONTES));
  const targets = Object.entries(aliases.efootball ?? {});
  if (targets.length === 0) fail("nenhum time do eFootball em aliases.json");

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ executablePath: chromiumPath(), args: ["--no-sandbox"] });
  const teams = [];
  try {
    for (const [pesId, clubId] of targets) {
      const payload = await cachedTeam(pesId);
      const team = payload?.data;
      if (!team) {
        teams.push({ pesId: Number(pesId), clube: clubId, nome: null, descartado: "time não encontrado", jogadores: [] });
        continue;
      }
      const assignments = team.player_assignments ?? [];
      const real = assignments.filter((assignment) => assignment.player?.fake_version === 0);
      if (real.length === 0) {
        teams.push({
          pesId: Number(pesId),
          clube: clubId,
          nome: team.english_name,
          descartado: "jogadores fictícios (time sem nomes licenciados no eFootball)",
          jogadores: [],
        });
        console.log(`${team.english_name}: descartado (fictícios)`);
        continue;
      }
      const ratings = await baseRatings(browser, pesId);
      const players = [];
      for (const { player, captain } of real) {
        // O elenco do site às vezes guarda quem já saiu: vale o clube atual.
        if (player.current_club_id?.pes_id !== Number(pesId)) continue;
        const ovr = ratings[String(player.pes_id)];
        if (!Number.isFinite(ovr)) continue;
        players.push({
          pesId: player.pes_id,
          nome: player.player_name,
          idade: player.age,
          nacionalidade: player.nationality_a?.english_name ?? null,
          posicao: player.main_position_text,
          alternativas: alternatives(player),
          ovrBase: ovr,
          capitao: captain === 1,
          velocidade: player.speed,
          bolaParada: player.place_kicking,
          cabeceio: player.header,
          impulsao: player.jump,
          folego: player.stamina,
        });
      }
      teams.push({ pesId: Number(pesId), clube: clubId, nome: team.english_name, descartado: null, jogadores: players });
      console.log(`${team.english_name}: ${players.length} jogadores reais`);
    }
  } finally {
    await browser.close();
  }

  writeJson(new URL("efootball.json", FONTES), {
    origem: "efootballdb.com, aba de times (carta base nível 1) e API pública do site",
    coletadoEm: new Date().toISOString().slice(0, 10),
    buildId: await buildId(),
    observacao: "OVR da carta base, sem o +4: a montagem aplica o ajuste pedido pelo usuário.",
    times: teams,
  });
}

await main();
