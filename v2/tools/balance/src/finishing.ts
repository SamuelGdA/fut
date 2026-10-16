import { writeFileSync } from "node:fs";
import { ENGINE_VERSION, baseMarketValue, productionRates, type Position } from "@craque/engine";

/** D68: comparação transparente no mesmo contexto, sem escolher temporadas de sorte. */
const positions: Position[] = ["st", "lw", "rw", "cam", "lm", "rm", "cm", "cdm", "cb", "gk"];
const finishing = [70, 80, 90, 94, 99];
const lines = [`# Finalização e valor, Craque ${ENGINE_VERSION}`, "", "Gols esperados em 50 jogos, OVR 94, time 88 e oposição 80, fase neutra. São médias do motor antes da pressão de recordes; a produção real varia e o número de jogos depende do papel no elenco.", "", "| Posição | FIN 70 | FIN 80 | FIN 90 | FIN 94 | FIN 99 |", "|---|---:|---:|---:|---:|---:|"];
for (const position of positions) {
  const goals = finishing.map(fin => productionRates({ position, ovr: 94, attributes: [94, fin, 94, 94, 60, 80], trait: "professional", teamStrength: 88, clubStrength: 87, opposition: 80, games: 50 }).goalsPerGame * 50);
  lines.push(`| ${position} | ${goals.map(n => n.toFixed(1)).join(" | ")} |`);
}
lines.push("", "## Valor em milhões de euros", "", "| OVR | 20 anos | 25 anos | 30 anos | 34 anos |", "|---|---:|---:|---:|---:|");
for (const ovr of [70, 80, 85, 90, 95, 97, 99]) lines.push(`| ${ovr} | ${[20, 25, 30, 34].map(age => (baseMarketValue(ovr, age) / 1e6).toFixed(1)).join(" | ")} |`);
lines.push("", "Teto de €300 milhões também aplicado depois do humor de mercado e do arredondamento. O modelo financeiro do Técnico não foi alterado.", "");
writeFileSync(new URL("../relatorios/finalizacao.md", import.meta.url), lines.join("\n"));
console.log(lines.join("\n"));
