import type { Locale } from "@/lib/i18n/context";

/**
 * Copy that belongs to CRAQUE rather than the ported dictionary — the brand
 * voice, the intro pitch, and anything describing features we built ourselves.
 */
export const BRAND_COPY: Record<
  Locale,
  {
    eyebrow: string;
    headlineTop: string;
    headlineAccent: string;
    subtitle: string;
    startHint: string;
    stats: [string, string][];
    attributesLabel: string;
    peakLabel: string;
  }
> = {
  pt: {
    eyebrow: "Simulador de carreira",
    headlineTop: "Do sub-17 ao",
    headlineAccent: "último jogo",
    subtitle:
      "Monte seu jogador, escolha onde começar e veja seus seis atributos evoluírem a cada temporada — até a carta final.",
    startHint: "Leva uns 2 minutos até a aposentadoria.",
    stats: [
      ["384", "clubes"],
      ["23", "ligas"],
      ["211", "seleções"],
    ],
    attributesLabel: "Atributos no auge",
    peakLabel: "Melhor carta da carreira",
  },
  es: {
    eyebrow: "Simulador de carrera",
    headlineTop: "Del sub-17 al",
    headlineAccent: "último partido",
    subtitle:
      "Armá tu jugador, elegí dónde empezar y mirá cómo tus seis atributos evolucionan temporada a temporada — hasta la carta final.",
    startHint: "Son unos 2 minutos hasta el retiro.",
    stats: [
      ["384", "clubes"],
      ["23", "ligas"],
      ["211", "selecciones"],
    ],
    attributesLabel: "Atributos en su pico",
    peakLabel: "Mejor carta de la carrera",
  },
  en: {
    eyebrow: "Career simulator",
    headlineTop: "From the academy",
    headlineAccent: "to the last whistle",
    subtitle:
      "Build your player, pick where to start, and watch six attributes evolve season by season — all the way to the final card.",
    startHint: "About 2 minutes from debut to retirement.",
    stats: [
      ["384", "clubs"],
      ["23", "leagues"],
      ["211", "nations"],
    ],
    attributesLabel: "Peak attributes",
    peakLabel: "Career-best card",
  },
};
