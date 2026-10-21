import type { Locale } from "@craque/content";
import type { VeteranPath } from "@craque/engine";

type Paths = Record<VeteranPath, readonly [string, string]>;
const paths: Record<Locale, Paths> = {
  pt: { maestro: ["+ Passe coletivo", "-5% jogos"], captain: ["+ Força em copas", "Sem bônus técnico"], poacher: ["+ Finalização", "-14% jogos"], guardian: ["+ Defesa", "-8% ataque"], athlete: ["+6% jogos", "+ Risco físico"], mentor: ["+2 legado/ano", "-20% evolução · -4% ataque"] },
  en: { maestro: ["+ Team passing", "-5% games"], captain: ["+ Cup strength", "No technical boost"], poacher: ["+ Finishing", "-14% games"], guardian: ["+ Defence", "-8% attack"], athlete: ["+6% games", "+ Injury risk"], mentor: ["+2 legacy/year", "-20% growth · -4% attack"] },
  es: { maestro: ["+ Pase colectivo", "-5% partidos"], captain: ["+ Fuerza en copas", "Sin bono técnico"], poacher: ["+ Definición", "-14% partidos"], guardian: ["+ Defensa", "-8% ataque"], athlete: ["+6% partidos", "+ Riesgo físico"], mentor: ["+2 legado/año", "-20% evolución · -4% ataque"] },
};
export function veteranChips(locale: Locale, path: VeteranPath, keeper: boolean): readonly [string, string] {
  return path === "poacher" && keeper ? [{ pt: "+ Defesa de pênaltis", en: "+ Penalty saves", es: "+ Paradas de penalti" }[locale], paths[locale][path][1]] : paths[locale][path];
}
export function promiseSpan(locale: Locale, start: number, end: number): string {
  return { pt: `${start} a ${end} · Total das duas temporadas`, en: `${start} to ${end} · Both seasons combined`, es: `${start} a ${end} · Total de las dos temporadas` }[locale];
}

export function promiseChips(locale: Locale, level: "humble" | "protagonist" | "legend"): readonly { text: string; tone: "good" | "bad" | "neutral" }[] {
  const labels = { pt: ["torcida", "legado", "evolução", "Sem punição"], en: ["support", "legacy", "growth", "No penalty"], es: ["afición", "legado", "evolución", "Sin castigo"] }[locale];
  const [fans, legacy, growth, loss] = level === "humble" ? [2, 0, "0,1", 0] : level === "protagonist" ? [5, 3, "0,3", 3] : [9, 8, "0,5", 7];
  return [
    { text: `+${fans} ${labels[0]}`, tone: "good" },
    ...(legacy ? [{ text: `+${legacy} ${labels[1]}`, tone: "good" as const }] : []),
    { text: `+${locale === "en" ? String(growth).replace(",", ".") : growth} ${labels[2]}`, tone: "good" },
    { text: loss ? `${{ pt: "Falha", en: "Missed", es: "Fallo" }[locale]}: -${loss} ${labels[0]}` : labels[3]!, tone: loss ? "bad" : "neutral" },
  ];
}
