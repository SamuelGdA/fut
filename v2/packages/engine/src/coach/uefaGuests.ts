import type { CountryCode } from "@craque/world";
import { createPlayer } from "./players";
import { coachRng } from "./util";
import type { CoachClub, CoachPlayer } from "./types";
import type { Position } from "../player/positions";

export const UEFA_GUESTS: readonly {id:string;country:CountryCode;strength:number}[] = [
  ["POR",81],["POR",80],["NED",80],["NED",78],["BEL",77],["BEL",75],["TUR",78],["GRE",76],["CZE",75],["NOR",74],["DEN",75],["AZE",71],["CYP",70],["KAZ",68],["SCO",74],["AUT",74],["SUI",73],["SRB",72],["CRO",73],["SWE",71],
].map(([country,strength],i)=>({id:`guest:UEFA:${country}:${i}`,country:String(country),strength:Number(strength)}));
const POSITIONS:readonly Position[]=["gk","gk","rb","rb","cb","cb","cb","cb","lb","lb","cdm","cdm","cm","cm","cm","cam","rm","lm","rw","lw","st","st","st","gk"];
/** Sem fingir elencos reais de ligas não jogáveis. Os representantes têm atletas gerados e jogam normalmente. */
export function addUefaGuests(seed:string,year:number,clubs:Record<string,CoachClub>,players:Record<string,CoachPlayer>):void {
  for(const guest of UEFA_GUESTS) {
    clubs[guest.id]={id:guest.id,country:guest.country,division:1,anchor:guest.strength,baseAnchor:guest.strength,strength:guest.strength,revenue:50_000_000,cash:10_000_000,prestige:3,continentalGuest:true};
    const rng=coachRng(seed,"uefaGuest",guest.id);
    POSITIONS.forEach((position,i)=>{
      const id=`g:${guest.id}:${i}`,ovr=Math.round(guest.strength+rng.real(-7,2));
      players[id]=createPlayer(seed,{id,club:guest.id,name:"",position,alternates:[],ovr,birthYear:year-rng.int(20,30),nationality:guest.country,origin:"g",traits:[]},year);
    });
  }
}
