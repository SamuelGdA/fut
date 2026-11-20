import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { ROUTE_PATHS } from "./routes.ts";

export const SOCIAL_COPY = {
  pt: { locale: "pt_BR", title: "Futeiro: o futebol passa por você", description: "Dentro de campo ou à beira dele. Viva sua carreira de jogador ou treinador em dois jogos de futebol feitos de escolhas.", alt: "Futeiro. Seu jogo. Sua história. Campo de futebol com uma jogada desenhada em dourado." },
  en: { locale: "en_US", title: "Futeiro: football is in your hands", description: "On the pitch or on the touchline. Live your career as a player or manager in two football games shaped by your choices.", alt: "Futeiro. Your game. Your story. Football pitch with a move drawn in gold." },
  es: { locale: "es_ES", title: "Futeiro: el fútbol pasa por ti", description: "En el campo o desde el banquillo. Vive tu carrera de jugador o entrenador en dos juegos de fútbol que dependen de tus decisiones.", alt: "Futeiro. Tu juego. Tu historia. Campo de fútbol con una jugada dibujada en dorado." },
} as const;
export type SocialLocale = keyof typeof SOCIAL_COPY;
const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/** Sem domínio configurado, conserva URLs relativas em vez de inventar um endereço público. */
export function socialOrigin(value: string | undefined): string {
  if (!value?.trim()) return "";
  const url = new URL(value.includes("://") ? value.trim() : `https://${value.trim()}`);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("VITE_SITE_URL precisa ser um endereço público HTTP(S).");
  return url.origin;
}

export function socialHtml(html: string, language: SocialLocale, origin: string, path = ""): string {
  const copy = SOCIAL_COPY[language];
  const image = `${origin}/social/futeiros-${language}.png`;
  const url = `${origin}/${path}${language === "pt" ? "" : `?lang=${language}`}`;
  const meta = (name: string, value: string, kind = "property") => `<meta ${kind}="${name}" content="${escape(value)}" />`;
  const tags = [
    meta("og:type", "website"), meta("og:site_name", "Futeiro"), meta("og:title", copy.title),
    meta("og:description", copy.description), meta("og:locale", copy.locale),
    ...Object.entries(SOCIAL_COPY).filter(([key]) => key !== language).map(([, value]) => meta("og:locale:alternate", value.locale)),
    ...(origin ? [meta("og:url", url)] : []),
    meta("og:image", image), meta("og:image:type", "image/png"), meta("og:image:width", "1200"),
    meta("og:image:height", "630"), meta("og:image:alt", copy.alt),
    meta("twitter:card", "summary_large_image", "name"), meta("twitter:title", copy.title, "name"),
    meta("twitter:description", copy.description, "name"), meta("twitter:image", image, "name"), meta("twitter:image:alt", copy.alt, "name"),
  ].join("\n    ");
  return html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, meta("description", copy.description, "name"))
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(copy.title)}</title>\n    <!-- social-preview:start -->\n    ${tags}\n    <!-- social-preview:end -->`);
}

/** Metadados no HTML recebido pelo robô, sem depender da execução do React. */
export function socialPreview(): Plugin {
  let origin = "";
  return {
    name: "futeiros-social-preview",
    enforce: "post",
    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir, "VITE_SITE_URL");
      origin = socialOrigin(env["VITE_SITE_URL"] || process.env["VERCEL_PROJECT_PRODUCTION_URL"]);
    },
    // As cópias das rotas são criadas antes deste plugin: cada endereço recebe sua própria URL.
    generateBundle(_options, bundle) {
      for (const path of ["", ...ROUTE_PATHS]) {
        const name = path ? `${path}/index.html` : "index.html";
        const entry = bundle[name];
        if (!entry || entry.type !== "asset") throw new Error(`Prévia social: ${name} ausente.`);
        const source = String(entry.source);
        entry.source = socialHtml(source, "pt", origin, path);
        for (const language of ["en", "es"] as const) {
          this.emitFile({ type: "asset", fileName: `social/${language}/${name}`, source: socialHtml(source, language, origin, path) });
        }
      }
    },
  };
}
