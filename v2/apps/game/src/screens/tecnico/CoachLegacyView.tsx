import { useReducedMotion } from "../../lib/useReducedMotion";
import { HonourGroups } from "../../ui/HonourGroups";
import { compareCoachHonours,coachAwardArt } from "../../features/tecnico/honours";
import { coachPlayerName } from "@craque/content/coach";
import { getClub, getCountry } from "@craque/world";
import type { PlayerLegacy, SeasonHistory, CoachAward } from "@craque/engine/coach";
import { Hash, History, Home, Image, RotateCcw, Trophy, Users } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { m } from "motion/react";
import { useNavigation } from "../../app/navigation";
import { clubStyle } from "../../features/career/clubColors";
import { useTecnico } from "../../features/tecnico/store";
import { coachTotals, coachPeak } from "../../features/tecnico/legacy";
import { playerRow } from "../../features/tecnico/view";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { revisionText } from "../../i18n/tecnico/revision";
import { d64 } from "../../i18n/tecnico/d64";
import { Button } from "../../ui/Button";
import { CareerCurve } from "../../ui/CareerCurve";
import { Loading } from "../../ui/Loading";
import { Panel } from "../../ui/Panel";
import { Chip } from "../../ui/Signals";
import { Crest, Flag } from "../../ui/Media";
import { PlayerPeek } from "./PlayerPeek";
import { CoachTrophies } from "./CoachTrophies";
import { CoachPosterSheet } from "./CoachPoster";
import { CoachCard } from "./CoachCard";
import { awardName } from "./awardText";
import { feedback } from "../../services/feedback";

const CHAPTERS = ["numbers", "timeline", "trophies", "players"] as const;
const ICONS = { numbers: Hash, timeline: History, trophies: Trophy, players: Users };
function Chapter({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={`tec-chapter-${id}`} className="summary-chapter" aria-labelledby={`tec-${id}-title`}><h2 id={`tec-${id}-title`} className="summary-chapter-title">{title}</h2>{children}</section>;
}

/** O mesmo resumo do Craque: carta do auge, capítulos e passagens por clube. */
export function CoachLegacyView() {
  const t = useTecnicoT(), { tt, number } = t, reduced = useReducedMotion() === true;
  const go = useNavigation((state) => state.go);
  const career = useTecnico((state) => state.career), avatar = useTecnico((state) => state.avatar);
  const [active, setActive] = useState<typeof CHAPTERS[number]>("numbers"), [poster, setPoster] = useState(false), [flipped, setFlipped] = useState(false);
  useEffect(() => { if (!career || career.phase !== "ended") go("hub", { replace: true, force: true }); }, [career, go]);
  useEffect(() => {
    const visible = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) { if (entry.isIntersecting) visible.add(entry.target.id); else visible.delete(entry.target.id); }
      const first = CHAPTERS.find((key) => visible.has(`tec-chapter-${key}`)); if (first) setActive(first);
    }, { rootMargin: "-130px 0px -55% 0px" });
    for (const key of CHAPTERS) { const section = document.getElementById(`tec-chapter-${key}`); if (section) observer.observe(section); }
    return () => observer.disconnect();
  }, [career]);
  if (!career || career.phase !== "ended") return <Loading label={tt("common.loading")} />;
  const totals = coachTotals(career), history = career.history, peak = coachPeak(career), country = getCountry(career.setup.identity.nationality);
  const titles = history.flatMap((entry) => entry.titles.map((id) => ({ id, year: entry.year })));
  const awards = history.flatMap((entry) => entry.awards ?? []).filter((award) => award.player === null);
  const players = Object.values(career.legacy), stints: SeasonHistory[][] = [];
  for (const season of history) { const last = stints.at(-1); if (last?.[0]?.club === season.club) last.push(season); else stints.push([season]); }
  const person = (legacy: PlayerLegacy) => {
    const name = coachPlayerName(career.setup.seed, { id: legacy.player, name: legacy.name, nationality: legacy.nationality });
    const trigger = <button type="button" className="tec-legacy-person"><strong>{name}</strong><span className="numeric">{legacy.apps} {revisionText(t.locale,"games")} · {legacy.goals} {tt("squad.stats.goals")}</span><small>{revisionText(t.locale,"peak",{year:legacy.peakYear ?? ""})} · OVR {legacy.bestOvr}</small></button>;
    return legacy.peak ? <PlayerPeek row={playerRow({...career,year:legacy.peakYear ?? career.year},{...legacy.peak,injury:null})} trigger={trigger} /> : trigger;
  };
  const numbers = [
    [tt("legacy.seasons"),number(totals.seasons)], [tt("legacy.clubs"),number(totals.clubs)], [tt("legacy.titles"),number(totals.titles)], [d64(t.locale,"peakReputation"),number(Math.round(peak?.reputationAfter ?? career.reputation))],
    ...([["games",totals.games],["wins",totals.won],["draws",totals.drawn],["losses",totals.lost],["scored",totals.goalsFor],["conceded",totals.goalsAgainst]] as const).map(([key,value]) => [revisionText(t.locale,key),number(value)]),
    [revisionText(t.locale,"winRate"),t.percent(totals.rate)], [tt("legacy.promotions"),number(history.filter((entry)=>entry.promoted).length)], [tt("legacy.relegations"),number(history.filter((entry)=>entry.relegated).length)], [tt("legacy.dismissals"),number(history.filter((entry)=>entry.dismissed).length)],
  ];
  return <div className="summary club-scope tec-summary" style={clubStyle(peak?.club ?? null) as CSSProperties}>
    <section className="summary-hero home-hero pitch-stripes"><div className="relative mx-auto grid max-w-6xl items-center justify-center gap-8 px-4 pt-8 pb-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12">
      <div className="flex flex-col items-center gap-2"><button type="button" className="peak-flip" aria-label={d64(t.locale,"flipCard")} aria-pressed={flipped} onClick={()=>{feedback("tick");setFlipped(!flipped);}}><m.span className="pcard-flip-inner" initial={false} animate={{rotateY:flipped?180:0}} transition={{duration:reduced?0:0.6}}><span className="pcard-flip-face"><CoachCard career={career} avatar={avatar} /></span><span className="pcard-flip-face pcard-flip-back"><span className="peak-back"><span className="peak-back-title">{tt("legacy.eyebrow")}</span><span className="peak-back-grid">{numbers.slice(0,6).map(([label,value])=><span key={label}><strong className="numeric">{value}</strong><small>{label}</small></span>)}</span><span className="peak-back-peak">{d64(t.locale,"peakReputation")} {Math.round(peak?.reputationAfter ?? career.reputation)}</span></span></span></m.span></button><p className="eyebrow">{d64(t.locale,"peakCard")}</p><p className="text-xs text-muted">{d64(t.locale,"season")} {peak?.year}</p><p className="text-2xs text-faint">{d64(t.locale,"flipHint")}</p></div>
      <div><p className="eyebrow text-glory">{tt("legacy.eyebrow")}</p><h1 className="home-title mt-3 break-words">{career.setup.identity.name}</h1><p className="mt-4 flex items-center gap-2 text-lg text-muted">{country?<Flag country={country} size={24} language={t.locale} decorative />:null}{country?.names[t.locale]} · {d64(t.locale,"coach")}</p><p className="mt-3 text-lg">{career.ended?.partial?tt("legacy.partial"):career.ended?.reason==="completed"?tt("legacy.completed"):revisionText(t.locale,"retiredAfter",{count:totals.seasons})}</p><div className="mt-6 flex flex-col gap-3"><div className="flex flex-wrap gap-2.5"><Button size="lg" onClick={()=>setPoster(true)}><Image size={18} aria-hidden="true" />{revisionText(t.locale,"poster")}</Button></div><div className="flex flex-wrap gap-2.5"><Button variant="alert" onClick={()=>{useTecnico.getState().abandon();go("tecnicoIdentity",{force:true});}}><RotateCcw size={17} aria-hidden="true" />{tt("legacy.newCareer")}</Button><Button variant="ghost" onClick={()=>go("hub")}><Home size={17} aria-hidden="true" />{tt("legacy.backHub")}</Button></div></div></div>
    </div></section>
    <nav className="chapter-nav" aria-label={d64(t.locale,"chapters")}><ul className="mx-auto grid max-w-4xl grid-cols-4">{CHAPTERS.map((key)=>{const Icon=ICONS[key];return <li key={key}><a href={`#tec-chapter-${key}`} className="chapter-link" aria-current={active===key?"true":undefined} onClick={(event)=>{event.preventDefault();feedback("tick");setActive(key);document.getElementById(`tec-chapter-${key}`)?.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});}}><Icon size={18} aria-hidden="true" /><span>{revisionText(t.locale,key)}</span></a></li>;})}</ul></nav>
    <div className="mx-auto flex max-w-4xl flex-col gap-14 px-4 pt-8 pb-20">
      <Chapter id="numbers" title={revisionText(t.locale,"numbers")}><dl className="summary-numbers">{numbers.map(([label,value])=><div key={label}><dt>{label}</dt><dd className="numeric">{value}</dd></div>)}</dl><h3 className="eyebrow mt-8 mb-3">{d64(t.locale,"curve")}</h3><CareerCurve points={history.map((entry)=>Math.round(entry.reputationAfter))} peak={Math.round(peak?.reputationAfter ?? 0)} width={700} height={130} /></Chapter>
      <Chapter id="timeline" title={revisionText(t.locale,"timeline")}><ol className="timeline">{stints.map((stint,index)=>{
        const first=stint[0]!,last=stint.at(-1)!,honours=stint.flatMap((season)=>season.titles.map((id)=>({id,year:season.year,award:undefined as CoachAward|undefined}))),recognitions=stint.flatMap((season)=>season.awards ?? []).filter((award)=>award.player===null);
        return <m.li key={`${first.club}:${first.year}`} className="timeline-item" data-marker={honours.length?"legend":"plain"} initial={reduced?false:{opacity:0,x:-12}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.3,delay:Math.min(index,6)*0.05}}><div className="timeline-card"><Crest club={first.club} size={40} decorative /><div className="min-w-0 flex-1"><p className="display text-xl font-extrabold uppercase">{getClub(first.club)?.name ?? first.club}</p><p className="numeric text-xs text-muted">{first.year===last.year?first.year:`${first.year} · ${last.year}`} · {t.ttp("player.seasons",stint.length)}</p><p className="mt-1.5 flex flex-wrap gap-1">{stint.some((season)=>season.promoted)?<Chip tone="good" size="sm">{tt("review.promoted")}</Chip>:null}{stint.some((season)=>season.relegated)?<Chip tone="bad" size="sm">{tt("review.relegated")}</Chip>:null}{stint.some((season)=>season.dismissed)?<Chip tone="bad" size="sm">{tt("history.dismissed")}</Chip>:null}</p><div className="timeline-honours"><HonourGroups language={t.locale} size={28} items={[...honours,...recognitions.map(award=>({id:award.competition ?? award.kind,year:award.year,award}))].sort(compareCoachHonours).map(honour=>({id:honour.id,year:honour.year,award:honour.award?coachAwardArt(honour.award):undefined,label:honour.award?awardName(honour.award,t.locale):undefined}))} /></div><details className="tec-stint-seasons"><summary>{d64(t.locale,"season")} {first.year===last.year?first.year:`${first.year} · ${last.year}`}</summary>{stint.map((season)=><p key={season.year}><strong className="numeric">{season.year}</strong><span>{season.position?`${t.ordinal(season.position)} / ${season.tableSize}`:tt("legacy.partial")} · {season.objectiveMet===true?tt("review.met"):tt("review.missed")}</span><span className="numeric">{Math.round(season.reputationAfter)} {tt("header.reputation")}</span></p>)}</details></div></div></m.li>;
      })}</ol></Chapter>
      <Chapter id="trophies" title={revisionText(t.locale,"trophies")}><CoachTrophies titles={titles} awards={awards} />{!titles.length&&!awards.length?<p className="text-muted">{revisionText(t.locale,"noAward")}</p>:null}</Chapter>
      <Chapter id="players" title={revisionText(t.locale,"players")}><div className="tec-legacy-player-groups">{[[tt("legacy.trusted"),[...players].sort((a,b)=>b.apps-a.apps)],[tt("legacy.revealed"),players.filter((entry)=>entry.revealed).sort((a,b)=>b.bestOvr-a.bestOvr)],[tt("legacy.signings"),players.filter((entry)=>entry.signed).sort((a,b)=>b.apps-a.apps)]].map(([label,list])=><Panel key={label as string} title={label as string}><ul>{(list as PlayerLegacy[]).slice(0,6).map((legacy)=><li key={legacy.player}>{person(legacy)}</li>)}</ul></Panel>)}</div></Chapter>
    </div><CoachPosterSheet career={career} avatar={avatar} open={poster} onOpenChange={setPoster} />
  </div>;
}
