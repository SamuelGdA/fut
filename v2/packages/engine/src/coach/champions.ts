import type { Rng } from "../rng";
import { coachRng } from "./util";
import type { CompetitionState, Fixture, KnockoutRound, TableRow } from "./types";

export const CHAMPIONS_DAYS = [31,52,73,94,115,136,157,169] as const;
export const CHAMPIONS_KNOCKOUT = [
  {label:"PO",days:[183,190]}, {label:"R16",days:[206,213]},
  {label:"QF",days:[234,241]}, {label:"SF",days:[255,262]}, {label:"F",days:[283]},
] as const;
interface DrawRow { home:number; away:number; day:number; columns:readonly number[]; pair:number }
/** Cobertura exata: cada clube ocupa uma vaga de mando e uma de visitante por pote e quatro datas de cada lado. */
export function championsLeagueDraw(entrants:readonly string[],coefficient:(id:string)=>number,country:(id:string)=>string,rng:Rng):Array<Array<readonly [string,string]>> {
  if(entrants.length!==36)throw new Error("coach: Champions exige 36 participantes");
  const ranked=[...entrants].sort((a,b)=>coefficient(b)-coefficient(a)||a.localeCompare(b)),countries=ranked.map(country);
  const nations=[...new Set(countries)],nationality=countries.map(c=>nations.indexOf(c));
  const total=nations.map(c=>countries.filter(value=>value===c).length);
  const potCount=Array.from({length:4},(_,pot)=>nations.map(c=>countries.slice(pot*9,pot*9+9).filter(value=>value===c).length));
  const patterns:number[][]=[];
  for(let mask=0;mask<256;mask++){
    const bits=Array.from({length:8},(_,day)=>(mask>>day)&1);
    if(bits.reduce((a,b)=>a+b,0)!==4 || bits[0]===bits[1] || bits[6]===bits[7])continue;
    if(bits.some((value,i)=>i>=2 && value===bits[i-1] && value===bits[i-2]))continue;
    patterns.push(bits);
  }
  for(let attempt=0;attempt<32;attempt++) {
    const venues:number[][]=[];
    for(const pot of [0,2]) {
      const half=rng.shuffle(patterns.filter(pattern=>pattern[0]===1)).slice(0,4);
      const extra=rng.pick(patterns),base=[...half.flatMap(pattern=>[pattern,pattern.map(value=>1-value)]),extra];
      const left=rng.shuffle(base),right=rng.shuffle(base.map(pattern=>pattern.map(value=>1-value)));
      for(let i=0;i<9;i++){venues[pot*9+i]=left[i]!;venues[(pot+1)*9+i]=right[i]!;}
    }
    const homes=venues.map(days=>days.flatMap((value,day)=>value?[day]:[])),aways=venues.map(days=>days.flatMap((value,day)=>value?[]:[day]));
    const rows:DrawRow[]=[],byColumn=Array.from({length:576},()=>[] as number[]);
    for(let home=0;home<36;home++)for(let away=0;away<36;away++) {
      if(home===away)continue;
      const hp=Math.floor(home/9),ap=Math.floor(away/9),same=nationality[home]===nationality[away],nation=nationality[home]!;
      // Exceção de associação somente se a composição dos potes torna a regra incompatível.
      const exception=hp===ap && (potCount[hp]![nation]!>4 || total[nation]!+potCount[hp]![nation]!>9);
      if(same && !exception)continue;
      for(const day of homes[home]!) {
        if(venues[away]![day])continue;
        const columns=[home*4+ap,144+away*4+hp,288+home*4+homes[home]!.indexOf(day),432+away*4+aways[away]!.indexOf(day)];
        const index=rows.length;rows.push({home,away,day,columns,pair:Math.min(home,away)*36+Math.max(home,away)});
        for(const column of columns)byColumn[column]!.push(index);
      }
    }
    const order=rng.shuffle(Array.from({length:576},(_,i)=>i));
    for(let i=0;i<byColumn.length;i++)byColumn[i]=rng.shuffle(byColumn[i]!);
    const covered=new Uint8Array(576),pairs=new Uint8Array(1296),counts=Array.from({length:36},()=>new Uint8Array(nations.length)),chosen:DrawRow[]=[];
    let nodes=0;
    const valid=(row:DrawRow)=>!pairs[row.pair] && !covered[row.columns[0]!] && !covered[row.columns[1]!] && !covered[row.columns[2]!] && !covered[row.columns[3]!] && (nationality[row.home]===nationality[row.away] || (counts[row.home]![nationality[row.away]!]!<2 && counts[row.away]![nationality[row.home]!]!<2));
    const visit=():boolean=>{
      if(chosen.length===144)return true;
      if(++nodes>6000)return false;
      let candidates:number[]|null=null;
      for(const column of order) {
        if(covered[column])continue;
        const available:number[]=[];
        // Só interessa uma coluna mais restrita que a melhor já encontrada.
        for(const index of byColumn[column]!)if(valid(rows[index]!)) {
          available.push(index);
          if(candidates && available.length>=candidates.length)break;
        }
        if(!available.length)return false;
        if(!candidates || available.length<candidates.length)candidates=available;
        if(candidates.length===1)break;
      }
      for(const index of candidates ?? []) {
        const row=rows[index]!,h=nationality[row.home]!,a=nationality[row.away]!;
        for(const column of row.columns)covered[column]=1;
        pairs[row.pair]=1;counts[row.home]![a]!++;counts[row.away]![h]!++;chosen.push(row);
        if(visit())return true;
        chosen.pop();for(const column of row.columns)covered[column]=0;
        pairs[row.pair]=0;counts[row.home]![a]!--;counts[row.away]![h]!--;
      }
      return false;
    };
    if(visit()) {
      const rounds=Array.from({length:8},()=>[] as Array<readonly [string,string]>);
      for(const row of chosen)rounds[row.day]!.push([ranked[row.home]!,ranked[row.away]!]);
      return rounds;
    }
  }
  throw new Error("coach: sorteio Champions sem solução válida");
}

/** Critérios UEFA da fase de liga; disciplina fica neutra enquanto cartões não são simulados. */
export function championsTable(rows:readonly TableRow[],fixtures:readonly Fixture[],coefficient:(club:string)=>number):TableRow[] {
  const byId=new Map(rows.map(row=>[row.club,row]));
  const extra=(club:string)=>{
    const own=fixtures.filter(f=>f.roundKind==="league" && (f.home===club||f.away===club));
    const away=own.filter(f=>f.away===club && f.result);
    const opponents=own.map(f=>byId.get(f.home===club?f.away:f.home)).filter((row):row is TableRow=>Boolean(row));
    return [away.reduce((sum,f)=>sum+f.result!.away,0),away.filter(f=>f.result!.away>f.result!.home).length,opponents.reduce((s,r)=>s+r.points,0),opponents.reduce((s,r)=>s+r.goalsFor-r.goalsAgainst,0),opponents.reduce((s,r)=>s+r.goalsFor,0)];
  };
  const facts=new Map(rows.map(row=>[row.club,extra(row.club)]));
  return [...rows].sort((a,b)=>{
    const x=facts.get(a.club)!,y=facts.get(b.club)!;
    return b.points-a.points || (b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst) || b.goalsFor-a.goalsFor || y[0]!-x[0]! || b.won-a.won || y[1]!-x[1]! || y[2]!-x[2]! || y[3]!-x[3]! || y[4]!-x[4]! || coefficient(b.club)-coefficient(a.club) || a.club.localeCompare(b.club);
  });
}
/** Chave fixa. Cada vencedor herda o caminho e o mando protegido do cabeça eliminado. */
export function championsPairs(state:CompetitionState,stage:KnockoutRound,previous:readonly Fixture[],seed:string,year:number):Array<readonly [string,string]> {
  const ranking=state.leagueRanking ?? [],rng=coachRng(seed,"championsBracket",year,stage.label);
  if(stage.label==="PO") {
    const pairs:Array<readonly [string,string]>=[];
    for(let g=0;g<4;g++){
      const heads=rng.shuffle(ranking.slice(8+g*2,10+g*2)),opponents=rng.shuffle(ranking.slice(22-g*2,24-g*2));
      for(let i=0;i<2;i++)pairs.push([heads[i]!,opponents[i]!]);
    }
    return pairs;
  }
  const decisive=previous.filter(f=>f.decisive).sort((a,b)=>Number(a.id.split("|")[2])-Number(b.id.split("|")[2]));
  const winners=decisive.map(f=>f.result?.winner).filter((id):id is string=>Boolean(id));
  const seeds=state.knockoutSeeds ??= {};
  if(stage.label==="R16") {
    const pairs:Array<readonly [string,string]>=Array(8);
    const positions=[[0,4],[2,6],[3,7],[1,5]];
    for(let g=0;g<4;g++){
      const heads=rng.shuffle(ranking.slice(g*2,g*2+2));
      for(let side=0;side<2;side++){
        const head=heads[side]!,opponent=winners[6-g*2+side]!;
        seeds[head]=ranking.indexOf(head)+1;
        pairs[positions[g]![side]!]=[head,opponent];
      }
    }
    return pairs;
  }
  for(const fixture of decisive) {
    const winner=fixture.result?.winner;if(!winner)continue;
    seeds[winner]=Math.min(seeds[fixture.home] ?? 36,seeds[fixture.away] ?? 36);
  }
  const pairs:Array<readonly [string,string]>=[];
  for(let i=0;i<winners.length;i+=2){
    const a=winners[i]!,b=winners[i+1]!;
    pairs.push((seeds[a] ?? 36)<=(seeds[b] ?? 36)?[a,b]:[b,a]);
  }
  return pairs;
}
