// O recorte roda dentro do Chrome (page.evaluate), onde existem estes globais.
/* global document, Image */
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import {
  assetFolder,
  checkSvg,
  defaultSourceDir,
  listSourceFiles,
  loadCatalog,
  outputExtension,
  resolveTarget,
  setFileEntry,
  setObjectField,
  TARGET_HEIGHT,
} from "./imagens.mjs";

/**
 * pnpm imagens:importar [--origem <pasta>] [--simular]
 *
 * Traz para o jogo as imagens geradas fora dele (D115): escudos, selos de
 * liga, troféus e prêmios. A origem padrão é `Downloads/geradas` do usuário
 * (no Windows, `C:\Users\<usuário>\Downloads\geradas`); `--origem` ou a
 * variável `FUTEIROS_GERADAS` trocam a pasta. A origem nunca é alterada.
 *
 * Organização da origem (os nomes seguem a lista do jogo, com ou sem acento):
 *
 *   clubes/<Liga>/<Clube>.svg|png|jpg|webp   ou   clubes/<Clube>.png
 *   ligas/<Liga>.svg|png
 *   trofeus/<arquivo atual ou nome da liga>.png
 *   premios/<arquivo atual>.png              (ballon-dor, golden-shoe...)
 *
 * SVG é conferido (sem script, imagem embutida ou endereço externo) e copiado.
 * PNG, JPG e WebP passam pelo Chrome do sistema: o fundo branco que encosta na
 * borda vira transparente, a imagem é recortada no desenho e redimensionada
 * (512 px de altura para escudos e selos, 480 para troféus e prêmios). Escudo
 * e selo saem em PNG; troféu e prêmio, em WebP. Os dados do mundo passam a
 * apontar para a extensão nova. Depois, rode `pnpm verify` e `pnpm e2e`
 * (a suíte decodifica todas as imagens cadastradas).
 */

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const source = option("--origem") ?? defaultSourceDir();
const dryRun = flag("--simular");
const GAME = fileURLToPath(new URL("..", import.meta.url));
const WORLD_DATA = fileURLToPath(new URL("../../../packages/world/data/", import.meta.url));
const ASSETS = join(GAME, "public", "assets");

if (!existsSync(source)) {
  console.error(`A pasta de origem não existe: ${source}`);
  console.error("Crie a pasta e ponha as imagens em clubes/, ligas/, trofeus/ ou premios/, ou passe --origem <pasta>.");
  process.exit(1);
}

const catalog = loadCatalog(WORLD_DATA);
const files = listSourceFiles(source);
console.log(`Origem: ${source}`);
if (files.length === 0) {
  console.log("Nenhuma imagem encontrada (svg, png, jpg, jpeg ou webp).");
  process.exit(0);
}

const plan = [];
const skipped = [];
const seen = new Map();
for (const file of files) {
  const label = file.parts.join("/");
  const target = resolveTarget(catalog, file.parts);
  if ("error" in target) {
    skipped.push(`${label}: ${target.error}`);
    continue;
  }
  const key = `${target.kind}:${target.id}`;
  if (seen.has(key)) {
    skipped.push(`${label}: repete ${seen.get(key)}`);
    continue;
  }
  if (target.vector) {
    const text = readFileSync(file.path, "utf8");
    const problems = checkSvg(text);
    if (problems.length > 0) {
      skipped.push(`${label}: ${problems.join("; ")}`);
      continue;
    }
  }
  seen.set(key, label);
  plan.push({ ...file, label, target, extension: outputExtension(target) });
}

/** Raster no Chrome: fundo branco da borda some, recorte no desenho e altura final. */
async function rasterize(page, path, height, mime) {
  const input = readFileSync(path).toString("base64");
  const output = await page.evaluate(
    async ({ input, height, mime }) => {
      const image = new Image();
      image.src = `data:application/octet-stream;base64,${input}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      const { width, height: tall } = canvas;
      const pixels = context.getImageData(0, 0, width, tall);
      const data = pixels.data;
      const near = (index) => data[index + 3] > 0 && data[index] > 236 && data[index + 1] > 236 && data[index + 2] > 236;
      // Só tira o fundo quando a borda é branca: imagem já transparente fica como veio.
      const queue = [];
      const visit = (x, y) => {
        const index = (y * width + x) * 4;
        if (data[index + 3] === 0 || !near(index)) return;
        data[index + 3] = 0;
        queue.push(x, y);
      };
      for (let x = 0; x < width; x += 1) { visit(x, 0); visit(x, tall - 1); }
      for (let y = 0; y < tall; y += 1) { visit(0, y); visit(width - 1, y); }
      while (queue.length > 0) {
        const y = queue.pop();
        const x = queue.pop();
        if (x > 0) visit(x - 1, y);
        if (x < width - 1) visit(x + 1, y);
        if (y > 0) visit(x, y - 1);
        if (y < tall - 1) visit(x, y + 1);
      }
      context.putImageData(pixels, 0, 0);
      // O recorte: o menor retângulo com algo visível.
      let left = width, top = tall, right = -1, bottom = -1;
      for (let y = 0; y < tall; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (data[(y * width + x) * 4 + 3] > 10) {
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
          }
        }
      }
      if (right < 0) throw new Error("imagem vazia depois de tirar o fundo");
      const cropWidth = right - left + 1;
      const cropHeight = bottom - top + 1;
      // Reduz em passos de metade para não serrilhar; nunca amplia além do dobro.
      const finalHeight = Math.min(height, cropHeight * 2);
      const finalWidth = Math.max(1, Math.round((cropWidth * finalHeight) / cropHeight));
      let current = document.createElement("canvas");
      current.width = cropWidth;
      current.height = cropHeight;
      current.getContext("2d").drawImage(canvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      while (current.height / 2 > finalHeight) {
        const half = document.createElement("canvas");
        half.width = Math.max(1, Math.round(current.width / 2));
        half.height = Math.max(1, Math.round(current.height / 2));
        const halfContext = half.getContext("2d");
        halfContext.imageSmoothingQuality = "high";
        halfContext.drawImage(current, 0, 0, half.width, half.height);
        current = half;
      }
      const result = document.createElement("canvas");
      result.width = finalWidth;
      result.height = finalHeight;
      const resultContext = result.getContext("2d");
      resultContext.imageSmoothingQuality = "high";
      resultContext.drawImage(current, 0, 0, finalWidth, finalHeight);
      return result.toDataURL(mime, 0.9).split(",")[1];
    },
    { input, height, mime },
  );
  return Buffer.from(output, "base64");
}

/** Grava a imagem nova, apaga a de outra extensão do mesmo id e atualiza os dados. */
function store(item, bytes) {
  const { target, extension } = item;
  const folder = join(ASSETS, assetFolder(target.kind));
  for (const old of ["svg", "png", "webp", "jpg"]) {
    const path = join(folder, `${target.id}.${old}`);
    if (old !== extension && existsSync(path)) unlinkSync(path);
  }
  writeFileSync(join(folder, `${target.id}.${extension}`), bytes);

  const update = (file, change) => {
    const path = join(WORLD_DATA, file);
    writeFileSync(path, change(readFileSync(path, "utf8")));
  };
  if (target.kind === "clube") update(target.dataFile, (text) => setObjectField(text, target.id, "crest", extension));
  else if (target.kind === "liga") update("leagues.json", (text) => setObjectField(text, target.id, "crest", extension));
  else if (target.kind === "trofeu" && target.league) update("leagues.json", (text) => setObjectField(text, target.league, "trophy", extension));
  else if (target.kind === "trofeu") update("trophy-files.json", (text) => setFileEntry(text, "trophies", target.id, extension));
  else update("trophy-files.json", (text) => setFileEntry(text, "awards", target.id, extension));
}

const KIND_LABEL = { clube: "escudo", liga: "selo", trofeu: "troféu", premio: "prêmio" };

if (dryRun) {
  for (const item of plan) console.log(`  ${item.label} -> ${assetFolder(item.target.kind)}/${item.target.id}.${item.extension} (${KIND_LABEL[item.target.kind]} de ${item.target.name})`);
}

let imported = 0;
if (!dryRun && plan.length > 0) {
  const needsBrowser = plan.some((item) => !item.target.vector);
  const browser = needsBrowser ? await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : { channel: "chrome" }) : null;
  const page = browser ? await browser.newPage() : null;
  for (const item of plan) {
    try {
      const bytes = item.target.vector
        ? readFileSync(item.path)
        : await rasterize(page, item.path, TARGET_HEIGHT[item.target.kind], item.extension === "png" ? "image/png" : "image/webp");
      store(item, bytes);
      imported += 1;
      console.log(`  ${item.label} -> ${assetFolder(item.target.kind)}/${item.target.id}.${item.extension} (${Math.round(bytes.length / 1024)} KB)`);
    } catch (error) {
      skipped.push(`${item.label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  await browser?.close();
}

console.log(dryRun ? `Seriam importadas: ${plan.length} (nada foi gravado)` : `Importadas: ${imported}`);
if (skipped.length > 0) {
  console.log(`Ignoradas: ${skipped.length}`);
  for (const line of skipped) console.log(`  ${line}`);
}
