import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

/**
 * pnpm --filter @craque/game icones
 *
 * Desenha os ícones do PWA (GDD 37) a partir da marca do jogo, o campo visto
 * de cima com o círculo central em ouro, e grava os PNGs em `public/icons/`.
 * Usa o Chrome instalado no sistema para rasterizar; os PNGs ficam no
 * repositório, então o build não precisa disto. Rodar de novo só se a marca
 * mudar.
 *
 * - `icon-192.png` e `icon-512.png`: propósito "any", cantos arredondados.
 * - `maskable-512.png`: fundo até a borda e a marca dentro da zona segura
 *   (80% do centro), para os recortes de cada sistema.
 * - `apple-touch-icon.png` (180 px): quadrado cheio, o iOS arredonda.
 */

const CANVAS = "#0d1110";
const STRIPE = "#111815";
const LINE = "#eef1ea";
const GLORY = "#e3b341";

/** A marca num quadro de 24 × 32, posicionada e escalada dentro do ícone. */
function mark(size, scale) {
  const width = 24 * scale;
  const height = 32 * scale;
  const x = (size - width) / 2;
  const y = (size - height) / 2;
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none">
    <rect x="2" y="1.5" width="20" height="29" rx="1.5" stroke="${LINE}" stroke-width="2.2"/>
    <line x1="2" y1="16" x2="22" y2="16" stroke="${LINE}" stroke-width="2.2"/>
    <circle cx="12" cy="16" r="4.2" stroke="${GLORY}" stroke-width="2.2"/>
    <rect x="8" y="1.5" width="8" height="4" stroke="${LINE}" stroke-width="1.6"/>
    <rect x="8" y="26.5" width="8" height="4" stroke="${LINE}" stroke-width="1.6"/>
  </g>`;
}

/** O gramado listrado do fundo, como o `pitch-stripes` do jogo. */
function stripes(size) {
  const band = size / 8;
  return Array.from({ length: 4 }, (_, index) => `<rect x="${band * (index * 2 + 1)}" y="0" width="${band}" height="${size}" fill="${STRIPE}"/>`).join("");
}

function icon(size, { rounded, markShare }) {
  const radius = rounded ? size * 0.2 : 0;
  // A marca ocupa `markShare` da altura do ícone.
  const scale = (size * markShare) / 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><clipPath id="c"><rect width="${size}" height="${size}" rx="${radius}"/></clipPath></defs>
    <g clip-path="url(#c)"><rect width="${size}" height="${size}" fill="${CANVAS}"/>${stripes(size)}</g>
    ${mark(size, scale)}
  </svg>`;
}

const ICONS = [
  { file: "icon-192.png", size: 192, rounded: true, markShare: 0.66 },
  { file: "icon-512.png", size: 512, rounded: true, markShare: 0.66 },
  { file: "maskable-512.png", size: 512, rounded: false, markShare: 0.5 },
  { file: "apple-touch-icon.png", size: 180, rounded: false, markShare: 0.6 },
];

const out = new URL("../public/icons/", import.meta.url);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const spec of ICONS) {
  const svg = icon(spec.size, spec);
  await page.setViewportSize({ width: spec.size, height: spec.size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
  const png = await page.locator("svg").screenshot({ omitBackground: true });
  writeFileSync(new URL(spec.file, out), png);
  console.log(`public/icons/${spec.file} (${spec.size} px)`);
}
await browser.close();
