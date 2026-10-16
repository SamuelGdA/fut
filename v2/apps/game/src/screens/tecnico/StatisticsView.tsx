import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { coachPlayerName } from "@craque/content/coach";
import type { CoachCareer, CoachPlayer, CompetitionStats } from "@craque/engine/coach";
import { POSITIONS, type Position } from "@craque/engine/positions";
import { foldText } from "../../i18n/format";
import { d66 } from "../../i18n/tecnico/d66";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { SectionRule } from "../../ui/Panel";
import { Sheet } from "../../ui/Overlays";
import { ClubTag, NationFlag } from "./shared";
import { competitionName, clubName } from "./text";
import { EMPTY_STATS, playerCompetitionStats, totalStats } from "../../features/tecnico/statistics";

type StatKey="apps"|"goals"|"assists"|"cleanSheets"|"goalsConceded"|"rating"|"minutes"|"starts"|"contribution";
const MAIN:readonly StatKey[]=["apps","goals","assists","cleanSheets","rating"];
const ALL:readonly StatKey[]=["apps","starts","minutes","goals","assists","contribution","cleanSheets","goalsConceded","rating"];
const metric=(stats:CompetitionStats,key:StatKey)=>key==="rating" ? stats.apps ? stats.ratingSum/stats.apps : 0 : key==="contribution" ? stats.goals+stats.assists : stats[key] ?? 0;
export function StatisticsView({career}:{career:CoachCareer}) {
  const t=useTecnicoT();
  const [query,setQuery]=useState(""),[position,setPosition]=useState<Position|"any">("any"),[competition,setCompetition]=useState("all"),[mine,setMine]=useState(true),[selected,setSelected]=useState<string|null>(null),[limit,setLimit]=useState(60),[sort,setSort]=useState<{key:StatKey|"name";descending:boolean}>({key:"goals",descending:true});
  const [columns,setColumns]=useState<"attack"|"defense">("attack");
  const keys=columns==="attack" ? MAIN : ["apps","starts","minutes","cleanSheets","goalsConceded","rating"] as const;
  const label=(key:StatKey)=>key==="apps" || key==="goals" || key==="assists" ? t.tt(`squad.stats.${key}`) : key==="minutes" ? d66(t.locale,"minutes") : d66(t.locale,key==="goalsConceded"?"goalsAgainst":key);
  const competitions=Object.keys(career.competitionStats);
  const rows=useMemo(()=>{
    const totals=new Map<string,Required<CompetitionStats>>();
    for(const [id,stats] of Object.entries(career.competitionStats)) {
      if(competition!=="all" && competition!==id)continue;
      for(const [player,row] of Object.entries(stats))totals.set(player,totalStats([totals.get(player) ?? EMPTY_STATS,row]));
    }
    return Object.values(career.players).filter(player=>(!mine || player.club===career.coach?.club) && (position==="any" || player.position===position || player.alternates.includes(position)))
      .map(player=>({player,name:coachPlayerName(career.setup.seed,player),stats:totals.get(player.id) ?? EMPTY_STATS}))
      .filter(row=>!query || foldText(`${row.name} ${clubName(row.player.club,t.locale)}`).includes(foldText(query)))
      .sort((a,b)=>{const delta=sort.key==="name" ? a.name.localeCompare(b.name) : metric(a.stats,sort.key)-metric(b.stats,sort.key);return (sort.descending?-delta:delta)||b.stats.apps-a.stats.apps||a.name.localeCompare(b.name);});
  },[career,competition,mine,position,query,sort,t.locale]);
  const player=selected ? career.players[selected] : null;
  return <section className="tec-statistics"><SectionRule>{d66(t.locale,"statistics")} · {career.year}</SectionRule><input type="search" className="search-input" placeholder={t.tt("process.search")} aria-label={t.tt("process.search")} value={query} onChange={e=>{setQuery(e.target.value);setLimit(60);}} />
    <div className="tec-stat-filters"><select aria-label={t.tt("buy.filters.position")} value={position} onChange={e=>setPosition(e.target.value as Position|"any")}><option value="any">{t.tt("buy.filters.any")}</option>{POSITIONS.map(pos=><option key={pos} value={pos}>{t.c(`positionAbbr.${pos}`)}</option>)}</select><select aria-label={t.tt("competitions.title")} value={competition} onChange={e=>setCompetition(e.target.value)}><option value="all">{d66(t.locale,"allCompetitions")}</option>{competitions.map(id=><option key={id} value={id}>{competitionName(id,t.locale)}</option>)}</select><label><input type="checkbox" checked={mine} onChange={e=>setMine(e.target.checked)} />{d66(t.locale,"mySquad")}</label><button type="button" className="tec-toggle" aria-pressed={columns==="defense"} onClick={()=>setColumns(columns==="attack"?"defense":"attack")}>{d66(t.locale,"defensiveStats")}</button></div>
    <div className="tec-stat-scroll"><table className="tec-table tec-stat-table"><thead><tr>{(["name",...keys] as const).map(key=>{const active=sort.key===key,Icon=active?(sort.descending?ArrowDown:ArrowUp):ArrowUpDown;return <th key={key} scope="col" aria-sort={active?(sort.descending?"descending":"ascending"):"none"}><button type="button" title={key==="name"?d66(t.locale,"player"):label(key)} onClick={()=>setSort({key,descending:active?!sort.descending:key!=="name"})}><Icon size={12} aria-hidden="true" />{key==="name"?d66(t.locale,"player"):key==="rating"?"★":key==="cleanSheets"?"CS":key==="goalsConceded"?"GC":key==="minutes"?"MIN":key==="starts"?"XI":label(key)}</button></th>;})}</tr></thead><tbody>{rows.slice(0,limit).map(({player,name,stats})=><tr key={player.id}><th scope="row"><button type="button" className="tec-stat-player" onClick={()=>setSelected(player.id)}><span>{name}</span><small>{t.c(`positionAbbr.${player.position}`)} · {player.ovr} OVR</small></button></th>{keys.map(key=><td className="numeric" key={key}>{key==="rating"?(stats.apps?metric(stats,key).toFixed(1):"-"):metric(stats,key)}</td>)}</tr>)}</tbody></table></div>
    {rows.length>limit?<button type="button" className="tec-toggle" onClick={()=>setLimit(limit+60)}>{d66(t.locale,"showMore")}</button>:null}
    <Sheet open={player!==null} onOpenChange={open=>{if(!open)setSelected(null);}} title={player?coachPlayerName(career.setup.seed,player):d66(t.locale,"playerStatistics")} closeLabel={t.tt("common.close")}>{player?<PlayerStatistics player={player} career={career} label={label} />:null}</Sheet>
  </section>;
}
function PlayerStatistics({player,career,label}:{player:CoachPlayer;career:CoachCareer;label(key:StatKey):string}) {
  const t=useTecnicoT(),rows=playerCompetitionStats(career,player.id),total=totalStats(rows.map(row=>row.stats));
  const stats=(row:CompetitionStats)=><dl className="tec-stat-numbers">{ALL.map(key=><div key={key}><dt>{label(key)}</dt><dd className="numeric">{key==="rating"?(row.apps?metric(row,key).toFixed(2):"-"):metric(row,key)}</dd></div>)}</dl>;
  return <div className="tec-player-statistics"><p><NationFlag code={player.nationality} locale={t.locale} /> {t.c(`positionAbbr.${player.position}`)} · {player.ovr} OVR</p><ClubTag club={player.club} /><SectionRule>{d66(t.locale,"allCompetitions")}</SectionRule>{stats(total)}{rows.map(row=><section key={row.competition}><SectionRule>{competitionName(row.competition,t.locale)}</SectionRule>{stats(row.stats)}</section>)}</div>;
}
