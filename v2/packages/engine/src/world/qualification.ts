import { getClub, getCountry, type CountryCode } from "@craque/world";

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
