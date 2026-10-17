import { writeFileSync } from "node:fs";
import { COACH_VERSION } from "@craque/engine/coach";
import { runCareer } from "./run";

/** Comparação reproduzível de economia e investimento, com elenco inicial real. */
const lines=[`# Economia do Técnico ${COACH_VERSION}`,"","Semente pareada d71-economia, Barcelona com elenco inicial real, dez temporadas por política. Passiva conserva a verba de transferências; treinar+comprar e gastadora tentam investir com as mesmas restrições do jogo. Demissões e mudança de clube não são impedidas. Valores em milhões de euros. Caixa também depende de salários, decisões, vendas e premiações: as campanhas não são idênticas.","","| Política | Ano | Clube | Receita | Verba inicial | Verba restante | Investimento líquido | Compras | Caixa final |","|---|---:|---|---:|---:|---:|---:|---:|---:|"];
const million=(value:number)=>(value/1e6).toFixed(1);
for(const policy of ["passive","trainBuy","spender"] as const) {
  let budget=0;
  const log=runCareer({seed:"d71-economia",mode:"fast",nationality:"ESP",policy,seasons:10,startClub:"barcelona"},{
    seasonStart:career=>{budget=career.coach?.budget ?? 0;},
    seasonEnd:(career,counters)=>{
      const coach=career.coach,club=career.clubs[coach?.club ?? ""];
      if(coach&&club)lines.push(`| ${policy} | ${career.year} | ${club.id} | ${million(club.revenue)} | ${million(budget)} | ${million(coach.budget)} | ${million(club.investment ?? 0)} | ${counters.purchases} | ${million(club.cash)} |`);
    },
  });
  if(log.errors.length)throw new Error(log.errors.join(","));
  process.stderr.write(`${policy}: ${log.ms.toFixed(0)} ms\n`);
}
writeFileSync(new URL("../../relatorios/tecnico-economia.md",import.meta.url),lines.join("\n")+"\n");
console.log(lines.join("\n"));
