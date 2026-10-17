import { getClub, getCountry, type CountryCode } from "@craque/world";

export type ContinentalRanking = readonly Readonly<Record<string, number>>[];

/** Quatro campanhas continentais, nunca força do elenco ou títulos de segunda divisão. */
export function rememberContinentalRanking(previous: ContinentalRanking = [], current: Readonly<Record<string, number>>): ContinentalRanking {
  return [current, ...previous].slice(0, 4);
}

/** Campeões têm vaga; ranking completa, com no máximo dois por país fora das vagas de campeão. */
export function rankedWorldCupClubs(champions: readonly string[], ranking: ContinentalRanking, quota: number, countryOf: (id: string) => string | undefined): string[] {
  const chosen = [...new Set(champions.slice(0, 4))].filter(id => countryOf(id)).slice(0, quota);
  const points = new Map<string, number>();
  for (const season of ranking.slice(0, 4)) for (const [id, value] of Object.entries(season)) {
    if (value > 0 && countryOf(id)) points.set(id, (points.get(id) ?? 0) + value);
  }
  for (const [id] of [...points].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    if (chosen.length >= quota) break;
    const country = countryOf(id);
    if (!chosen.includes(id) && chosen.filter(club => countryOf(club) === country).length < 2) chosen.push(id);
  }
  return chosen;
}

/** Duas vagas extras da UEFA, pela campanha média dos representantes no mundo
 * simulado. É a adaptação por fases do coeficiente anual, sem copiar coeficientes
 * reais para as décadas futuras da carreira. */
export function performanceSpots(orders: Readonly<Record<string, readonly string[]>>): CountryCode[] {
  const countries=new Map<CountryCode,{points:number;clubs:Set<string>}>();
  for(const [competition,order] of Object.entries(orders)) {
    if(!competition.endsWith(":UEFA"))continue;
    order.forEach((id,index)=>{
      const country=getClub(id)?.country;
      if(!country||getCountry(country)?.confederation!=="UEFA")return;
      const row=countries.get(country) ?? {points:0,clubs:new Set<string>()};
      const progress=Math.max(0,10-2*Math.ceil(Math.log2(index+1)));
      row.points+=progress+(competition.startsWith("cont1:")?2:competition.startsWith("cont2:")?1:0);
      row.clubs.add(id);countries.set(country,row);
    });
  }
  return [...countries].sort((a,b)=>b[1].points/b[1].clubs.size-a[1].points/a[1].clubs.size || a[0].localeCompare(b[0])).slice(0,2).map(([country])=>country);
}
