import type { Plugin } from "vite";
import { type ErrorArtKind, errorArt } from "../src/app/errorArt.ts";
import { en } from "../src/i18n/en.ts";
import { es } from "../src/i18n/es.ts";
import { pt } from "../src/i18n/pt.ts";

/**
 * As páginas estáticas de erro (GDD 37): 404, 403, 500 e 503, como conjunto,
 * com o desenho de futebol de cada uma e o vocabulário visual do jogo. São
 * geradas no build a partir dos mesmos dicionários e do mesmo desenho da tela
 * de erro do jogo, então nunca divergem. Cada página é um HTML só, sem
 * JavaScript do jogo, sem fonte externa e sem imagem: abre mesmo com o
 * servidor mal das pernas. O idioma e o tema vêm das preferências salvas,
 * como no `index.html`.
 */

type PageCode = "403" | "404" | "500" | "503";

const PAGES: ReadonlyArray<{ code: PageCode; art: ErrorArtKind; retry: boolean }> = [
  { code: "403", art: "offside", retry: false },
  { code: "404", art: "out", retry: false },
  { code: "500", art: "post", retry: true },
  { code: "503", art: "postponed", retry: true },
];

const LOCALES = { pt, es, en } as const;
type PageLocale = keyof typeof LOCALES;

function textsFor(code: PageCode) {
  const key = `e${code}` as const;
  return Object.fromEntries(
    (Object.keys(LOCALES) as PageLocale[]).map((locale) => {
      const pages = LOCALES[locale].errorPages;
      return [locale, { ...pages[key], home: pages.home, retry: pages.retry, tagline: LOCALES[locale].app.tagline }];
    }),
  ) as Record<PageLocale, { eyebrow: string; title: string; body: string; home: string; retry: string; tagline: string }>;
}

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const STYLE = `
:root{--canvas:#0d1110;--panel:#161d1a;--line:#2b3631;--fg:#eef1ea;--muted:#9ca79f;--glory:#e3b341;--bad:#ec5b60;--accent:#eef1ea;--on-accent:#0d1110;color-scheme:dark}
:root[data-theme="light"]{--canvas:#f3f0e8;--panel:#fbf9f4;--line:#dad4c7;--fg:#161b18;--muted:#545d57;--glory:#86600b;--bad:#bd2c34;--accent:#161b18;--on-accent:#f3f0e8;color-scheme:light}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--canvas);color:var(--fg);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.5}
body{display:grid;min-height:100dvh;place-items:center;padding:40px 16px;background-image:repeating-linear-gradient(90deg,transparent 0 56px,color-mix(in srgb,var(--fg) 3%,transparent) 56px 112px)}
main{width:100%;max-width:28rem}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:32px;color:var(--fg);text-decoration:none;font-weight:900;font-size:1.6rem;letter-spacing:.06em;font-stretch:condensed}
.brand small{color:var(--muted);font-size:.7rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
.art{display:block;width:15rem;max-width:100%;margin-bottom:24px}
.art svg{display:block;width:100%;height:auto}
.eyebrow{margin:0;color:var(--glory);font-size:.72rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
h1{margin:12px 0 0;font-size:clamp(2.6rem,12vw,3.6rem);font-weight:900;line-height:.95;text-transform:uppercase;font-stretch:condensed;letter-spacing:.01em}
p.body{margin:16px 0 0;color:var(--muted)}
.actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:32px}
.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border:1px solid var(--accent);border-radius:4px;background:var(--accent);color:var(--on-accent);font:inherit;font-weight:800;letter-spacing:.04em;text-transform:uppercase;text-decoration:none;cursor:pointer}
.button.secondary{background:transparent;color:var(--fg);border-color:var(--line)}
.button:focus-visible,.brand:focus-visible{outline:2px solid var(--glory);outline-offset:3px}
`;

/** A marca do jogo, o campo visto de cima (o mesmo traço do `PitchMark`). */
const MARK = `<svg viewBox="0 0 24 32" width="20" height="27" aria-hidden="true" focusable="false" fill="none"><rect x="2" y="1.5" width="20" height="29" rx="1.5" stroke="currentColor" stroke-width="2.2"/><line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="16" r="4.2" stroke="var(--glory)" stroke-width="2.2"/></svg>`;

export function errorPageHtml(code: PageCode, base: string): string {
  const page = PAGES.find((item) => item.code === code);
  if (!page) throw new Error(`página de erro desconhecida: ${code}`);
  const texts = textsFor(code);
  const pt = texts.pt;
  // O script troca idioma e tema antes de pintar; sem JavaScript, fica o português escuro.
  const script = `(function(){var t=${JSON.stringify(texts)};try{var raw=localStorage.getItem("craque.v2.prefs");var s=raw?(JSON.parse(raw)||{}).state||{}:{};var r=document.documentElement;if(s.theme==="light"){r.setAttribute("data-theme","light");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#f3f0e8");}var l=t[s.locale]?s.locale:null;if(!l){var n=(navigator.language||"").slice(0,2);l=t[n]?n:"pt";}if(l!=="pt"){var x=t[l];r.setAttribute("lang",l==="es"?"es":"en");document.title=x.title+": CRAQUE";[].forEach.call(document.querySelectorAll("[data-t]"),function(e){e.textContent=x[e.getAttribute("data-t")];});}}catch(e){}})();`;
  const retry = page.retry ? `<button class="button" type="button" data-t="retry" onclick="location.reload()">${escape(pt.retry)}</button>` : "";
  return `<!doctype html>
<html lang="pt-BR" data-theme="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#0d1110" />
<meta name="robots" content="noindex" />
<link rel="icon" type="image/svg+xml" href="${base}favicon.svg" />
<title>${escape(pt.title)}: CRAQUE</title>
<style>${STYLE}</style>
</head>
<body>
<main>
<a class="brand" href="${base}">${MARK}<span>CRAQUE</span><small data-t="tagline">${escape(pt.tagline)}</small></a>
<span class="art">${errorArt(page.art)}</span>
<p class="eyebrow" data-t="eyebrow">${escape(pt.eyebrow)}</p>
<h1 data-t="title">${escape(pt.title)}</h1>
<p class="body" data-t="body">${escape(pt.body)}</p>
<div class="actions">${retry}<a class="button${page.retry ? " secondary" : ""}" href="${base}" data-t="home">${escape(pt.home)}</a></div>
</main>
<script>${script}</script>
</body>
</html>
`;
}

/** Emite `403.html`, `404.html`, `500.html` e `503.html` no build, e serve as quatro no desenvolvimento. */
export function errorPages(): Plugin {
  let base = "/";
  return {
    name: "craque-error-pages",
    configResolved(config) {
      base = config.base;
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const match = /^\/(403|404|500|503)\.html$/.exec(request.url ?? "");
        if (!match) {
          next();
          return;
        }
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(errorPageHtml(match[1] as PageCode, base));
      });
    },
    generateBundle() {
      for (const page of PAGES) {
        this.emitFile({ type: "asset", fileName: `${page.code}.html`, source: errorPageHtml(page.code, base) });
      }
    },
  };
}
