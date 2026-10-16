import { getLeague } from "@craque/world";
import { mkdirSync,writeFileSync } from "node:fs";
import { runParallel } from "./pool";
import type { RunOptions } from "./run";
import { COACH_VERSION } from "@craque/engine/coach";

/** Regressão da dinastia relatada: as três políticas recebem o mesmo Barcelona com onze de OVR 92. */
const jobs:RunOptions[]=Array.from({length:4},(_,i)=>(["passive","trainBuy","balanced"] as const).map(policy=>({seed:`elite-d66:${i}`,mode:"fast" as const,policy,nationality:"ESP",seasons:24,startClub:"barcelona",initialOvr:92}))).flat();
const summaries=await runParallel(jobs,summary=>process.stderr.write(`${summary.options.seed} ${summary.options.policy}: ${summary.seasons.length} temporadas
`));
const lines=[`# Técnico ${COACH_VERSION}: regressão de clube rico`,"","Quatro sementes pareadas. Barcelona com onze de OVR 92, salários compatíveis e receita proporcional ao elenco. A política passiva não usa ações. Treinar+comprar treina ataque e defesa e só procura contratações acima da força do clube. Passiva e treinar+comprar conservam o plano. A política equilibrada reage à pista de leitura tática alternando filosofia e administra treino, jovens e contratações.","","| Semente | Política | Anos no Barcelona | Títulos no Barcelona | Champions | Ligas | Temporadas com derrota na liga | Demissões na carreira | Erros |","|---|---|---:|---:|---:|---:|---:|---:|---:|"];
for(const summary of summaries){
 const seasons=summary.seasons.flatMap(season=>season.coach ? [season.coach] : []),own=seasons.filter(season=>season.club==="barcelona");
 lines.push(`| ${summary.options.seed} | ${summary.options.policy} | ${own.length} | ${own.reduce((s,row)=>s+row.titles,0)} | ${own.filter(row=>row.titlesList?.includes("cont1:UEFA")).length} | ${own.filter(row=>row.titlesList?.some(id=>id.startsWith("league:") && getLeague(id.slice(7))?.division===1)).length} | ${own.filter(row=>(row.leagueRecord?.[2] ?? 0)>0).length} | ${seasons.filter(row=>row.dismissed).length} | ${summary.errors.length} |`);
}
lines.push("","Os resultados medem este cenário e estas políticas; não são uma garantia de dificuldade idêntica para qualquer estratégia humana.");
const dir=new URL("../../relatorios/",import.meta.url);mkdirSync(dir,{recursive:true});writeFileSync(new URL("tecnico-elite.md",dir),lines.join("\n")+"\n");
console.log(lines.join("\n"));if(summaries.some(summary=>summary.errors.length || summary.seasons.length!==24))process.exitCode=1;
