import { compareCoachHonours } from "../../features/tecnico/honours";
import type { AvatarConfig } from "@craque/art";
import type { CoachCareer, CoachAward } from "@craque/engine/coach";
import { AWARDS, getClub, getCompetition, getCountry } from "@craque/world";
import type { CSSProperties, Ref } from "react";
import { clubStyle } from "../../features/career/clubColors";
import { coachTotals, coachPeak } from "../../features/tecnico/legacy";
import { d64 } from "../../i18n/tecnico/d64";
import { revisionText } from "../../i18n/tecnico/revision";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { siteLabel } from "../../lib/env";
import { CareerCurve } from "../../ui/CareerCurve";
import { AwardArt, Crest, Flag, TrophyArt } from "../../ui/Media";
import { PitchMark } from "../../ui/PitchMark";
import { CoachCard } from "./CoachCard";
import { awardName } from "./awardText";

/** Mesma composição 1080 × 1350 do Craque, com os números do treinador. */
export function CoachPosterArt({ career, avatar, ref }: { career: CoachCareer; avatar: AvatarConfig | null; ref?: Ref<HTMLDivElement> }) {
  const t=useTecnicoT(),totals=coachTotals(career),peak=coachPeak(career),country=getCountry(career.setup.identity.nationality),name=career.setup.identity.name;
  const honours=new Map<string,{id:string;count:number;award?:CoachAward}>();
  for(const season of career.history) {
    for(const id of season.titles) {const old=honours.get(id);honours.set(id,{id,count:(old?.count ?? 0)+1});}
    for(const award of season.awards ?? []) if(award.player===null) {const id=`${award.kind}:${award.competition ?? ""}`,old=honours.get(id);honours.set(id,{id,award,count:(old?.count ?? 0)+1});}
  }
  const items=[...honours.values()].sort(compareCoachHonours),awards=career.history.flatMap((season)=>season.awards ?? []).filter((award)=>award.player===null);
  const clubs=[...new Set(career.history.map((season)=>season.club))].map((id)=>({id,years:career.history.filter((season)=>season.club===id).map((season)=>season.year)})).sort((a,b)=>b.years.length-a.years.length || a.years[0]!-b.years[0]!).slice(0,3);
  const numbers=[[revisionText(t.locale,"games"),totals.games],[revisionText(t.locale,"wins"),totals.won],[revisionText(t.locale,"losses"),totals.lost],[t.tt("legacy.titles"),totals.titles],[revisionText(t.locale,"awards"),awards.length],[t.tt("legacy.clubs"),totals.clubs]] as const;
  return <div ref={ref} className="poster coach-poster" data-theme="dark" style={clubStyle(peak?.club ?? null) as CSSProperties}>
    <header className="poster-top"><span className="poster-brand"><PitchMark className="poster-brand-mark" /><span className="poster-wordmark">{t.t("brand.games.tecnico")}</span><span className="poster-tagline">{d64(t.locale,"career")}</span></span></header>
    <section className="poster-hero"><CoachCard career={career} avatar={avatar} width={380} /><div className="poster-identity"><p className="poster-eyebrow">{career.history[0]?.year} · {career.history.at(-1)?.year}</p><p className="poster-surname" style={{fontSize:name.length<=8?128:name.length<=11?100:78}}>{name}</p><p className="poster-origin">{country?<Flag country={country} size={44} language={t.locale} decorative />:null}<span>{country?.names[t.locale]}</span><span aria-hidden="true">·</span><span>{d64(t.locale,"coach")}</span></p><dl className="poster-numbers">{numbers.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{t.number(value)}</dd></div>)}</dl><p className="poster-value"><span>{d64(t.locale,"peakReputation")}</span><strong>{Math.round(peak?.reputationAfter ?? career.reputation)}</strong></p></div></section>
    <section className="poster-block"><p className="poster-label">{d64(t.locale,"showcase")}</p>{items.length?<ul className="poster-showcase">{items.map((item)=>{const competition=getCompetition(item.id);return <li key={item.id}>{item.award?<AwardArt award={AWARDS[item.award.kind==="coachWorld"?"ballonDor":"bestPlayer"]} size={104} language={t.locale} decorative />:competition?<TrophyArt competition={competition} size={104} language={t.locale} decorative />:null}{item.count>1?<span className="poster-count">×{item.count}</span>:null}<span className="poster-trophy-name">{item.award?awardName(item.award,t.locale):competition?.names[t.locale] ?? item.id}</span></li>;})}</ul>:<p className="poster-empty">{revisionText(t.locale,"noAward")}</p>}</section>
    <section className="poster-block"><p className="poster-label">{d64(t.locale,"mainClubs")}</p><ul className="poster-clubs">{clubs.map((club)=><li key={club.id}><Crest club={club.id} size={68} decorative /><span><strong>{getClub(club.id)?.name ?? club.id}</strong><small>{club.years[0]} · {club.years.at(-1)}</small></span></li>)}</ul></section>
    <section className="poster-block"><p className="poster-label">{d64(t.locale,"curve")}</p><CareerCurve points={career.history.map((season)=>Math.round(season.reputationAfter))} peak={Math.round(peak?.reputationAfter ?? 0)} width={960} height={104} /></section>
    <footer className="poster-foot"><span>FUTEIROS{siteLabel()?` · ${siteLabel()}`:""}</span><span>{d64(t.locale,"season")} {peak?.year} · {t.tt("header.reputation")} {Math.round(peak?.reputationAfter ?? career.reputation)}</span></footer>
  </div>;
}
