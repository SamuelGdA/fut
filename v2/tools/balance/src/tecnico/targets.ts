import type { Philosophy } from "@craque/engine/coach";
import type { TargetResult } from "../targets";
import type { CareerMetrics } from "./metrics";
import type { ProbeMetrics } from "./probes";

/**
 * Metas do Técnico (GDD 56.12). Cada meta diz o que o jogador sente: o
 * sorteio inicial é justo, nenhuma filosofia é sempre a melhor, só o elenco
 * decide entre continentes, contratar muito acima do próprio nível é quase
 * impossível, as ações valem a pena e o mundo não desanda em 24 temporadas.
 */

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const fixed = (value: number, digits = 2) => (Number.isFinite(value) ? value.toFixed(digits) : "n/d");

const PHILOSOPHY_NAME: Readonly<Record<Philosophy, string>> = {
  attacking: "ofensiva",
  defensive: "defensiva",
  possession: "posse",
  counter: "contra-ataque",
};

export function probeTargets(probes: ProbeMetrics): TargetResult[] {
  const bests = new Set(probes.philosophies.map((row) => row.best));
  const even = probes.philosophies.find((row) => row.gap === 0);
  const evenSpread = even ? Math.max(...Object.values(even.points)) - Math.min(...Object.values(even.points)) : Number.NaN;
  const favorites = probes.duels.map((duel) => Math.max(duel.odds.advance, 1 - duel.odds.advance));
  const favoriteMean = favorites.reduce((total, value) => total + value, 0) / Math.max(1, favorites.length);
  const favoriteMax = Math.max(...favorites);
  const curveIssues: string[] = [];
  for (const curve of probes.curves) {
    const points = curve.points.filter((point) => point.gap >= 0 && point.players >= 5);
    for (let index = 1; index < points.length; index += 1) {
      const before = points[index - 1];
      const point = points[index];
      // Abaixo de 0,01% tudo é "praticamente impossível": oscilação menor que isso não conta.
      if (before && point && point.median > before.median + 1e-4) curveIssues.push(`${curve.club} +${point.gap}`);
    }
    for (const point of curve.points) {
      if (point.players < 5) continue;
      if (point.gap === 8 && point.median >= 0.05) curveIssues.push(`${curve.club} +8 = ${pct(point.median)}`);
      if (point.gap >= 12 && point.median >= 0.005) curveIssues.push(`${curve.club} +${point.gap} = ${pct(point.median, 2)}`);
    }
  }
  const mbappe = probes.named.find((entry) => entry.player === "Kylian Mbappé" && entry.to === "flamengo");
  const develop = (label: string) => probes.develop.find((row) => row.label === label)?.trial;
  const young = develop("até 21 anos, rápido");
  const mid = develop("22 a 25 anos, rápido");
  const prime = develop("26 a 29 anos, rápido");
  const second = probes.budget.find((row) => row.division === 2);
  const outside = 1 - (probes.clubWorldCup.share["UEFA"] ?? 0);
  const best = probes.clubWorldCup.bestSouth;
  return [
    {
      id: "tecnico-initial",
      label: "Propostas iniciais: cada sorteio independente, 95% segunda divisão",
      target: "95% ± 0,5 ponto em 60 mil sorteios",
      measured: `${pct(probes.initial.second, 2)} (pelo menos uma de 1ª em ${pct(probes.initial.anyFirst)} das carreiras; esperado 14,3%)`,
      pass: Math.abs(probes.initial.second - 0.95) <= 0.005,
    },
    {
      id: "tecnico-philosophies-best",
      label: "Filosofias: cada uma é a melhor em alguma faixa de força, nenhuma em todas",
      target: "as quatro aparecem como melhor",
      measured: [...bests].map((best) => PHILOSOPHY_NAME[best]).join(", "),
      pass: bests.size === 4,
    },
    {
      id: "tecnico-philosophies-even",
      label: "Filosofias em forças iguais: diferença entre a melhor e a pior",
      target: "no máximo 0,2 ponto por jogo",
      measured: fixed(evenSpread, 3),
      pass: evenSpread <= 0.2,
    },
    {
      id: "tecnico-symmetry",
      label: "Só o elenco decide: trocar os elencos de dois clubes troca as chances (nenhum bônus de continente)",
      target: "erro abaixo de 1e-9",
      measured: probes.symmetryError.toExponential(1),
      pass: probes.symmetryError < 1e-9,
    },
    {
      id: "tecnico-duels",
      label: "Elite europeia × melhores do Brasil e da Argentina, mata-mata de jogo único",
      target: "favorito passa em média entre 60% e 85%, nunca acima de 90% (difícil, mas possível)",
      measured: `média ${pct(favoriteMean)}, máximo ${pct(favoriteMax)}`,
      pass: favoriteMean >= 0.6 && favoriteMean <= 0.85 && favoriteMax <= 0.9,
    },
    {
      id: "tecnico-cwc-possible",
      label: "Mundial de Clubes: difícil, mas possível para quem não é europeu (chaveamento jogado 20 mil vezes com as chances exatas)",
      target: "fora da Europa entre 1% e 15% dos títulos; o melhor sul-americano com pelo menos 0,5%",
      measured: `${pct(outside, 1)} fora da Europa; melhor sul-americano ${best ? `${best.club} ${pct(best.chance, 2)}` : "n/d"} (${probes.clubWorldCup.europeans} europeus em ${probes.clubWorldCup.entrants})`,
      pass: outside >= 0.01 && outside <= 0.15 && Boolean(best && best.chance >= 0.005),
    },
    {
      id: "tecnico-purchase-curve",
      label: "Contratar acima do próprio nível: quanto maior a diferença, mais difícil",
      target: "mediana cai a cada degrau (resolução de 0,01 ponto); +8 abaixo de 5%; +12 ou mais abaixo de 0,5%",
      measured: curveIssues.length ? curveIssues.join("; ") : "curvas em queda em todos os clubes",
      pass: curveIssues.length === 0,
    },
    {
      id: "tecnico-mbappe",
      label: "Mbappé no Flamengo: quase impossível, não impossível",
      target: "entre 0,001% e 0,1%",
      measured: mbappe ? pct(mbappe.chance, 4) : "jogador não encontrado",
      pass: Boolean(mbappe && mbappe.chance > 0.00001 && mbappe.chance < 0.001),
    },
    {
      id: "tecnico-develop-young",
      label: "Desenvolver em jovens: ganho a mais na próxima atualização",
      target: "pelo menos +1 de nível até 21 e de 22 a 25 anos",
      measured: young && mid ? `até 21: +${fixed(young.gainTreated - young.gainControl)}; 22 a 25: +${fixed(mid.gainTreated - mid.gainControl)}` : "n/d",
      pass: Boolean(young && mid && young.gainTreated - young.gainControl >= 1 && mid.gainTreated - mid.gainControl >= 1),
    },
    {
      id: "tecnico-develop-chance",
      label: "Desenvolver perto do auge (26 a 29 anos, com folga): chance de o OVR subir",
      target: "pelo menos 90% e 15 pontos acima de não desenvolver",
      measured: prime ? `${pct(prime.treated)} contra ${pct(prime.control)}` : "n/d",
      pass: Boolean(prime && prime.treated >= 0.9 && prime.treated - prime.control >= 0.15),
    },
    {
      id: "tecnico-pace",
      label: "Rápido = lento: evolução média numa temporada sem ações",
      target: "diferença de no máximo 0,15 de nível",
      measured: `rápido ${fixed(probes.pace.fast)}, lento ${fixed(probes.pace.slow)}`,
      pass: Math.abs(probes.pace.fast - probes.pace.slow) <= 0.15,
    },
    {
      id: "tecnico-budget",
      label: "Verba de início dá para contratar sem pedir dinheiro (clubes de 2ª divisão)",
      target: "pelo menos 90% com 3 alvos do nível ao alcance",
      measured: second ? `${pct(second.withThree / Math.max(1, second.clubs))} (sem: ${second.tight.join(", ") || "nenhum"})` : "n/d",
      pass: Boolean(second && second.withThree / Math.max(1, second.clubs) >= 0.9),
    },
  ];
}

export function careerTargets(metrics: CareerMetrics): TargetResult[] {
  const balanced = metrics.byPolicy.find((row) => row.policy === "balanced");
  const passive = metrics.byPolicy.find((row) => row.policy === "passive");
  const spender = metrics.byPolicy.find((row) => row.policy === "spender");
  const firstDivisions = metrics.leagues.filter((league) => league.division === 1);
  const drift = firstDivisions.map((league) => ({ id: league.id, delta: league.strengthEnd - league.strengthStart }));
  const worstDrift = drift.reduce((worst, entry) => (Math.abs(entry.delta) > Math.abs(worst.delta) ? entry : worst), { id: "", delta: 0 });
  const activeDelta = (metrics.activeEnd - metrics.activeStart) / metrics.activeStart;
  const targets: TargetResult[] = [
    {
      id: "tecnico-errors",
      label: "Comandos válidos da política nunca são recusados pelo motor",
      target: "nenhum",
      measured: metrics.errors.length ? `${metrics.errors.length}: ${metrics.errors.slice(0, 5).join("; ")}` : "nenhum",
      pass: metrics.errors.length === 0,
    },
    {
      id: "tecnico-strongest",
      label: "Campeão da primeira divisão é o clube mais forte do começo da temporada",
      target: "entre 35% e 60%",
      measured: pct(metrics.strongestShare),
      pass: metrics.strongestShare >= 0.35 && metrics.strongestShare <= 0.6,
    },
    {
      id: "tecnico-cwc",
      label: "Mundial de Clubes ganho por europeu nas carreiras (só pelo elenco, como os 17 dos últimos 18 da vida real)",
      target: "pelo menos 85% (a chance exata de quem não é europeu está na sonda)",
      measured: `${pct(metrics.clubWorldCupEurope)} em ${metrics.clubWorldCups} edições; final com sul-americano em ${pct(metrics.clubWorldCupFinalsWithSouth)}`,
      pass: metrics.clubWorldCups === 0 || metrics.clubWorldCupEurope >= 0.85,
    },
    {
      id: "tecnico-intercontinental",
      label: "Intercontinental ganho pelo campeão europeu",
      target: "entre 60% e 95%",
      measured: `${pct(metrics.intercontinentalEurope)} em ${metrics.intercontinentals} edições`,
      pass: metrics.intercontinentals === 0 || (metrics.intercontinentalEurope >= 0.6 && metrics.intercontinentalEurope <= 0.95),
    },
    {
      id: "tecnico-squads",
      label: "Elencos da IA estáveis: tamanho entre 22 e 34",
      target: "pelo menos 95% dos clubes em todas as temporadas",
      measured: `${pct(metrics.squadInRange)} (menor ${metrics.squadMin}, maior ${metrics.squadMax})`,
      pass: metrics.squadInRange >= 0.95,
    },
    {
      id: "tecnico-population",
      label: "Jogadores ativos no mundo depois de todas as temporadas",
      target: "a no máximo 10% do começo",
      measured: `${Math.round(metrics.activeStart)} → ${Math.round(metrics.activeEnd)} (${activeDelta >= 0 ? "+" : ""}${pct(activeDelta)})`,
      pass: Math.abs(activeDelta) <= 0.1,
    },
    {
      id: "tecnico-league-strength",
      label: "Força média das primeiras divisões no fim, contra o começo",
      target: "todas a no máximo 3 pontos",
      measured: worstDrift.id ? `pior: ${worstDrift.id} ${worstDrift.delta >= 0 ? "+" : ""}${fixed(worstDrift.delta, 1)}` : "n/d",
      pass: drift.every((entry) => Math.abs(entry.delta) <= 3),
    },
    {
      id: "tecnico-injuries",
      label: "Lesões de 10 dias ou mais no elenco do treinador, por temporada",
      target: "entre 4 e 15, no máximo 10% graves",
      measured: `${fixed(metrics.injuriesPerSeason, 1)} por temporada, ${pct(metrics.seriousShare)} graves, ${Math.round(metrics.injuryDaysPerSeason)} dias`,
      pass: metrics.injuriesPerSeason >= 4 && metrics.injuriesPerSeason <= 15 && metrics.seriousShare <= 0.1,
    },
  ];
  if (balanced) {
    targets.push({
      id: "tecnico-dismissals",
      label: "Demissões por temporada com a política equilibrada",
      target: "entre 8% e 15%",
      measured: `${pct(balanced.dismissals)} em ${balanced.seasons} temporadas (na primeira: ${pct(balanced.firstSeasonDismissals)})`,
      pass: balanced.dismissals >= 0.08 && balanced.dismissals <= 0.15,
    });
  }
  if (balanced && passive) {
    targets.push({
      id: "tecnico-actions-help",
      label: "Usar as ações vale a pena: objetivo cumprido, equilibrada contra passiva",
      target: "equilibrada à frente",
      measured: `${pct(balanced.objectiveMet)} contra ${pct(passive.objectiveMet)}`,
      pass: balanced.objectiveMet > passive.objectiveMet,
    });
  }
  if (spender) {
    // Quando o jogador quer vir e o clube libera, a verba de início (sem pedir
    // dinheiro) precisa dar conta na maioria das vezes, com a primeira
    // contratação da etapa já descontada.
    const affordable = spender.purchases / Math.max(1, spender.available);
    targets.push({
      id: "tecnico-spender",
      label: "Negócio disponível cabe na verba e na folha (contratando em toda etapa, sem pedir verba)",
      target: "pelo menos 70% das respostas positivas",
      measured: `${pct(affordable)} (${spender.purchases} de ${spender.available}; ${spender.purchaseTries} alvos procurados)`,
      pass: affordable >= 0.7,
    });
  }
  return targets;
}
