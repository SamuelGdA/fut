import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

// Arte editorial, construída com as mesmas fontes, marca e cores do jogo.
// Os PNGs são versionados; gerar não faz parte do build nem exige serviço externo.
const font = (packageName, file) => readFileSync(new URL(`../node_modules/@fontsource-variable/${packageName}/files/${file}`, import.meta.url)).toString("base64");
const display = font("big-shoulders", "big-shoulders-latin-wght-normal.woff2");
const sans = font("schibsted-grotesk", "schibsted-grotesk-latin-wght-normal.woff2");
// A faixa usa a vitrine de conquistas real, incluindo suas regras de estilo.
const gameCss = readFileSync(new URL("../src/styles/game.css", import.meta.url), "utf8");
const showcaseRules = [".showcase", ".showcase-item", '.showcase-item[data-kind="award"]', ".showcase-art"].map((selector) => {
  const start = gameCss.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`Estilo da vitrine ausente: ${selector}`);
  return gameCss.slice(start, gameCss.indexOf("}", start) + 1);
}).join("\n");
const showcasePieces = [
  ["awards/ballon-dor.webp", "award"],
  ["trophies/uefa-champions-league.png", "title"],
  ["trophies/conmebol-libertadores.png", "title"],
  ["trophies/world-cup.png", "title"],
].map(([file, kind]) => {
  const mime = file.endsWith(".webp") ? "image/webp" : "image/png";
  const data = readFileSync(new URL(`../public/assets/${file}`, import.meta.url)).toString("base64");
  return `<li class="showcase-item" data-kind="${kind}"><span class="showcase-art"><img src="data:${mime};base64,${data}" alt="" /></span></li>`;
}).join("");
const copy = {
  pt: { eyebrow: "FUTEBOL DE ESCOLHAS", lines: ["SEU JOGO.", "SUA HISTÓRIA."], foot: "Escolha sua própria carreira." },
  en: { eyebrow: "FOOTBALL. YOUR CALL.", lines: ["YOUR GAME.", "YOUR STORY."], foot: "Choose your own career." },
  es: { eyebrow: "FÚTBOL DE DECISIONES", lines: ["TU JUEGO.", "TU HISTORIA."], foot: "Elige tu propia carrera." },
};

function artwork(language) {
  const t = copy[language];
  return `<!doctype html><html lang="${language}"><meta charset="utf-8"><style>
    @font-face{font-family:Display;src:url(data:font/woff2;base64,${display});font-weight:100 900}
    @font-face{font-family:Sans;src:url(data:font/woff2;base64,${sans});font-weight:100 900}
    *{box-sizing:border-box}body{margin:0;background:#0d1110;color:#f3f0e8;font-family:Sans}
    main{width:1200px;height:630px;position:relative;overflow:hidden;border-top:8px solid #e3b341}
    .paper{position:absolute;inset:0 394px 0 0;background:#f3f0e8;color:#161b18;clip-path:polygon(0 0,100% 0,92% 100%,0 100%)}
    .content{position:relative;padding:43px 0 0 56px;width:730px}
    .brand{display:flex;align-items:center;gap:13px;font:800 37px Display;letter-spacing:.4px}
    .brand svg{width:29px;height:39px}
    .eyebrow{margin:39px 0 21px;font-size:15px;font-weight:700;letter-spacing:3px;color:#545d57}
    h1{margin:0;font:850 108px/.98 Display;letter-spacing:-1.3px}h1 span{display:block}
    h1 span:last-child{color:#86600b;margin-top:14px}
    .foot{margin-top:29px;font-size:21px;color:#545d57}
    .pitch{position:absolute;right:0;top:0;width:445px;height:622px}
    ${showcaseRules}
    .career-showcase{position:absolute;left:56px;bottom:30px;width:422px;--cell-w:98px;--cell-h:108px;--line:#dad4c7;--panel:#fbf9f4;--radius-sm:4px;--glory:#86600b}
    .career-showcase ul{margin:0;padding:0;list-style:none}
    .career-showcase img{display:block;width:78px;height:88px;object-fit:contain}
    .career-showcase .showcase-item{content-visibility:visible}
  </style><main>
  <svg class="pitch" viewBox="0 0 445 622" fill="none">
    <defs><pattern id="stripes" width="112" height="622" patternUnits="userSpaceOnUse"><rect width="56" height="622" fill="#111815"/></pattern></defs>
    <path fill="#0d1110" d="M0 0h445v622H0z"/><path fill="url(#stripes)" d="M0 0h445v622H0z"/>
    <g stroke="#3c4943" stroke-width="2"><path d="M20 66h370v490H20zM20 311h370"/><circle cx="205" cy="311" r="67"/>
    <path d="M108 66v83h194V66M157 66v29h96V66M108 556v-83h194v83M157 556v-29h96v29"/>
    <path d="M162 149a51 51 0 0 0 86 0M162 473a51 51 0 0 1 86 0"/></g>
    <g fill="#9ca79f"><circle cx="84" cy="411" r="7"/><circle cx="301" cy="355" r="7"/><circle cx="124" cy="224" r="7"/></g>
    <g stroke="#e3b341" stroke-width="3"><circle cx="205" cy="433" r="13"/><circle cx="292" cy="258" r="13"/>
    <path d="M211 413l70-133" stroke-dasharray="7 8"/><path d="M285 237Q204 175 207 110M195 126l12-18 13 17"/></g>
    <circle cx="207" cy="108" r="4" fill="#e3b341"/>
    <g stroke="#68756b" stroke-width="2.5"><path d="m247 183 14 14m0-14-14 14M153 351l14 14m0-14-14 14M327 416l14 14m0-14-14 14"/></g>
  </svg>
  <div class="paper"><div class="content">
    <div class="brand"><svg viewBox="0 0 24 32" fill="none"><rect x="2" y="1.5" width="20" height="29" rx="1.5" stroke="currentColor" stroke-width="2.2"/><path d="M2 16h20" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="16" r="4.2" stroke="#86600b" stroke-width="2.2"/></svg>FUTEIRO</div>
    <p class="eyebrow">${t.eyebrow}</p><h1><span>${t.lines[0]}</span><span>${t.lines[1]}</span></h1>
    <p class="foot">${t.foot}</p></div>
    <div class="career-showcase" aria-hidden="true"><ul class="showcase">${showcasePieces}</ul></div></div>
  </main></html>`;
}

const out = new URL("../public/social/", import.meta.url);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const language of Object.keys(copy)) {
    await page.setContent(artwork(language));
    await page.locator("main").evaluate((el) => el.ownerDocument.fonts.ready);
    // Não publica arte com texto cortado se uma fonte ou tradução mudar.
    const fits = await page.locator("h1").evaluate((el) => el.scrollWidth <= el.clientWidth);
    if (!fits) throw new Error(`Texto cortado na prévia ${language}`);
    writeFileSync(new URL(`futeiros-${language}.png`, out), await page.locator("main").screenshot());
    console.log(`Prévia ${language}: 1200 × 630`);
  }
} finally { await browser.close(); }
